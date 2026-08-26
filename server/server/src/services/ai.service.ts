import axios from 'axios';
import pool from '../config/database';
import config from '../config';

export async function generateAnalysis(userId: number): Promise<{
  dietAdvice: string;
  sportAdvice: string;
}> {
  // 收集饮食数据
  const [cardRows] = await pool.execute(
    `SELECT result, type, created_at FROM card_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
  // 收集运动数据
  const [sportRows] = await pool.execute(
    `SELECT duration, distance, mode, start_time FROM sport_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    [userId]
  );
  const [stats] = await pool.execute(
    `SELECT COUNT(*) as times, COALESCE(SUM(duration),0) as total_dur, COALESCE(SUM(distance),0) as total_dist,
            COUNT(DISTINCT DATE(start_time)) as days
     FROM sport_records WHERE user_id = ?`,
    [userId]
  );
  const s = (stats as any[])[0];

  // 提取饮食数据摘要
  const cards = cardRows as any[];
  let dietSummary = '';
  if (cards.length > 0) {
    const photoCount = cards.filter(c => c.type === 'photo').length;
    const barcodeCount = cards.filter(c => c.type === 'barcode').length;
    // 尝试提取卡路里信息
    const calorieMatches = cards
      .map(c => c.result || '')
      .join(' ')
      .match(/(\d+\.?\d*)\s*千卡/g);
    const calories: number[] = calorieMatches
      ? calorieMatches.map(m => parseFloat(m))
      : [];

    dietSummary = `共 ${cards.length} 条饮食记录（拍照 ${photoCount} 次，条形码 ${barcodeCount} 次）`;
    if (calories.length > 0) {
      const avgCal = (calories.reduce((a, b) => a + b, 0) / calories.length).toFixed(0);
      dietSummary += `，平均每 100g 约 ${avgCal} 千卡`;
    }
    dietSummary += '\n最近记录：\n' + cards.slice(0, 10).map(c =>
      `${String(c.created_at||'').slice(0, 10)} ${c.result || ''}`
    ).join('\n');
  } else {
    dietSummary = '暂无饮食记录';
  }

  // 提取运动数据摘要
  let sportSummary = '';
  if (s.times > 0) {
    sportSummary = `共运动 ${s.times} 次，总计 ${Math.floor(s.total_dur / 60)} 分钟，${(s.total_dist / 1000).toFixed(1)} 公里，活跃 ${s.days} 天`;
    const modeDist: Record<string, number> = {};
    (sportRows as any[]).forEach((r: any) => {
      const m = r.mode || '跑步';
      modeDist[m] = (modeDist[m] || 0) + Number(r.distance || 0);
    });
    sportSummary += '\n各模式距离：' + Object.entries(modeDist).map(([k, v]) => `${k} ${(v / 1000).toFixed(1)}km`).join('，');

    const dates = (sportRows as any[]).map((r: any) => String(r.start_time || '').slice(0, 10));
    const uniqueDates = [...new Set(dates)];
    sportSummary += `\n最近运动日：${uniqueDates.slice(0, 7).join('、')}`;
  } else {
    sportSummary = '暂无运动记录';
  }

  const prompt = `你是专业健康管理顾问。请根据以下用户饮食和运动数据摘要，给出针对性分析。

【饮食数据摘要】
${dietSummary}

【运动数据摘要】
${sportSummary}

请严格输出以下 JSON（不要额外文字）：
{
  "diet_advice": "饮食分析（引用数据中的具体食物名称和热量，指出饮食结构问题，给出1-2条改善建议）",
  "sport_advice": "运动分析（引用运动次数、时长、距离、各模式数据，评估运动量是否达标，给出1-2条建议）"
}
结尾标注：以上建议仅为健康管理参考，不作为医疗诊断结论。`;

  const response = await axios.post(
    config.doubao.apiUrl,
    {
      model: config.doubao.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.doubao.apiKey}`,
      },
    }
  );

  const data = response.data;
  if (data.error) {
    throw new Error(`AI分析失败: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const reply = data.choices?.[0]?.message?.content || '';

  let result;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    result = null;
  }

  if (!result) {
    result = { diet_advice: reply.slice(0, 300) || '分析中...', sport_advice: '分析中...' };
  }

  await pool.execute(
    'INSERT INTO ai_results (user_id, diet_advice, sport_advice, comprehensive_advice) VALUES (?, ?, ?, ?)',
    [userId, result.diet_advice || '', result.sport_advice || '', '']
  );

  return {
    dietAdvice: result.diet_advice || '暂无饮食建议',
    sportAdvice: result.sport_advice || '暂无运动建议',
  };
}

export async function deleteAiResult(id: number, userId: number) {
  const [res] = await pool.execute('DELETE FROM ai_results WHERE id = ? AND user_id = ?', [id, userId]);
  return (res as any).affectedRows > 0;
}

export async function getAiHistory(userId: number, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.execute(
    `SELECT * FROM ai_results WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId.toString(), pageSize.toString(), offset.toString()]
  );
  return rows;
}
