import axios from 'axios';
import pool from '../config/database';
import config from '../config';
import { getAccessToken } from './baiduAuth';

export async function savePhotoCard(userId: number, imageUrl: string, result: string) {
  const [res] = await pool.execute(
    'INSERT INTO card_records (user_id, type, image_url, result) VALUES (?, "photo", ?, ?)',
    [userId, imageUrl, result]
  );
  return { id: (res as any).insertId };
}

export async function saveBarcodeCard(userId: number, barcode: string, result: string, imageUrl = '') {
  const [res] = await pool.execute(
    'INSERT INTO card_records (user_id, type, image_url, barcode, result) VALUES (?, "barcode", ?, ?, ?)',
    [userId, imageUrl, barcode, result]
  );
  return { id: (res as any).insertId };
}

export async function updateCardRecord(id: number, userId: number, result: string) {
  await pool.execute('UPDATE card_records SET result = ? WHERE id = ? AND user_id = ?', [result, id, userId]);
}

export async function deleteCardRecord(id: number, userId: number) {
  const [res] = await pool.execute('DELETE FROM card_records WHERE id = ? AND user_id = ?', [id, userId]);
  return (res as any).affectedRows > 0;
}

export async function getCardRecords(userId: number, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const [records] = await pool.execute(
    `SELECT * FROM card_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId.toString(), pageSize.toString(), offset.toString()]
  );
  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM card_records WHERE user_id = ?',
    [userId]
  );
  return {
    list: records,
    total: (countRows as any[])[0].total,
    page,
    pageSize,
  };
}

/**
 * 百度 AI 菜品识别。
 * 接口文档: https://cloud.baidu.com/doc/IMAGERECOGNITION/s/nk3bclygd
 */
export async function recognizeImage(imageBase64: string): Promise<string> {
  const token = await getAccessToken();
  const response = await axios.post(
    `${config.baidu.dishApiUrl}?access_token=${token}`,
    { image: imageBase64, top_num: 3 },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const data = response.data;
  console.log('菜品识别API响应:', JSON.stringify(data).slice(0, 500));
  if (data.error_code) {
    throw new Error(`菜品识别失败: ${data.error_msg} (code: ${data.error_code})`);
  }

  // 解析返回结果，取识别到的菜品名称和卡路里
  const results = data.result || [];
  if (results.length === 0) return '未能识别到食物信息，请手动记录';

  const items = results.map((r: any) => {
    const name = r.name || '未知食物';
    const cal = r.calorie || '未知';
    return `${name}（约${cal}千卡/100g）`;
  });

  return `识别到以下食物：\n${items.join('\n')}`;
}

/**
 * 通过 Open Food Facts 免费 API 查询条形码对应的商品信息。
 * 无需 API Key，全球食品数据库。
 */
export async function queryBarcode(barcode: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`,
      { timeout: 8000 }
    );

    const product = response.data?.product;
    if (!product) {
      return `条形码 ${barcode} 未在数据库中查到，已记录该条码。`;
    }

    const name = product.product_name || product.generic_name || '未知商品';
    const brand = product.brands || '';
    const calories = product.nutriments?.['energy-kcal_100g']
      ? `${product.nutriments['energy-kcal_100g']}千卡/100g`
      : '热量未知';
    const quantity = product.quantity || '';

    const parts = [name];
    if (brand) parts.push(`品牌: ${brand}`);
    parts.push(`热量: ${calories}`);
    if (quantity) parts.push(`规格: ${quantity}`);

    return parts.join('\n');
  } catch {
    return `条形码 ${barcode} 查询失败，已记录该条码。`;
  }
}
