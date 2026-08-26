import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as aiService from '../services/ai.service';

export async function generateAnalysis(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await aiService.generateAnalysis(req.userId!);
    res.json({ code: 200, message: '分析完成', data: result });
  } catch (err: any) {
    console.error('AI分析失败:', err.message);
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getAiHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await aiService.getAiHistory(req.userId!, page, pageSize);
    res.json({ code: 200, message: 'ok', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function deleteHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ok = await aiService.deleteAiResult(id, req.userId!);
    if (!ok) { res.status(404).json({ code: 404, message: '记录不存在' }); return; }
    res.json({ code: 200, message: '已删除' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}
