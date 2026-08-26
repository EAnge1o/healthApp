import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as metricService from '../services/metric.service';

export async function getLatest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await metricService.getLatest(req.userId!);
    res.json({ code: 200, message: 'ok', data });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}

export async function getMetrics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const type = req.params.type as 'height' | 'weight';
    const data = await metricService.getMetrics(req.userId!, type);
    res.json({ code: 200, message: 'ok', data });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}

export async function addMetric(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, value, date } = req.body;
    if (!type || !value || !date) { res.status(400).json({ code: 400, message: '缺少参数' }); return; }
    const result = await metricService.addMetric(req.userId!, type, Number(value), date);
    res.json({ code: 200, message: '添加成功', data: result });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}

export async function deleteMetric(req: AuthRequest, res: Response): Promise<void> {
  try {
    await metricService.deleteMetric(Number(req.params.id), req.userId!);
    res.json({ code: 200, message: '已删除' });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}
