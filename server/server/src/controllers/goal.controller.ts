import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as gs from '../services/goal.service';

export async function getGoals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const goals = await gs.getGoals(req.userId!);
    const checkins = await gs.getTodayCheckins(req.userId!);
    const streaks = await gs.getStreak(req.userId!);
    res.json({ code: 200, message: 'ok', data: { goals, checkins, streaks } });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}

export async function createGoal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, target } = req.body;
    const result = await gs.createGoal(req.userId!, type, Number(target));
    res.json({ code: 200, message: '目标已创建', data: result });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}

export async function deleteGoal(req: AuthRequest, res: Response): Promise<void> {
  try {
    await gs.deleteGoal(Number(req.params.id), req.userId!);
    res.json({ code: 200, message: '已删除' });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}

export async function checkin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await gs.checkin(req.userId!, Number(req.params.id));
    res.json({ code: 200, message: result.checked ? '已打卡' : '已取消', data: result });
  } catch (err: any) { res.status(500).json({ code: 500, message: err.message }); }
}
