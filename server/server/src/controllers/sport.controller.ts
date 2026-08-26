import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as sportService from '../services/sport.service';

export async function saveSport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { mode, duration, distance } = req.body;
    if (duration === undefined || duration === null) {
      res.status(400).json({ code: 400, message: '缺少运动时长参数' });
      return;
    }
    const result = await sportService.saveSportDirect(req.userId!, mode || '跑步', Number(duration), Number(distance) || 0);
    res.json({ code: 200, message: '运动记录已保存', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function startSport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await sportService.startSport(req.userId!);
    res.json({ code: 200, message: '运动开始', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function addGpsPoint(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { recordId, latitude, longitude } = req.body;
    await sportService.addGpsPoint(recordId, latitude, longitude);
    res.json({ code: 200, message: '定位点已记录' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function endSport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { recordId, duration, distance } = req.body;
    await sportService.endSport(recordId, duration, distance);
    res.json({ code: 200, message: '运动记录已保存' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getSportRecords(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const result = await sportService.getSportRecords(req.userId!, page, pageSize);
    res.json({ code: 200, message: 'ok', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getSportDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const recordId = Number(req.params.id);
    const result = await sportService.getSportDetail(recordId);
    res.json({ code: 200, message: 'ok', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getSportStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await sportService.getSportStats(req.userId!);
    res.json({ code: 200, message: 'ok', data: stats });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function updateSport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { mode, duration, distance } = req.body;
    await sportService.updateSportRecord(id, req.userId!, mode, Number(duration), Number(distance));
    res.json({ code: 200, message: '已更新' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function deleteSport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ok = await sportService.deleteSportRecord(id, req.userId!);
    if (!ok) { res.status(404).json({ code: 404, message: '记录不存在' }); return; }
    res.json({ code: 200, message: '已删除' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}
