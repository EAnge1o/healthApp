import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) {
      res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
      return;
    }
    const result = await authService.register(username, password, nickname || '');
    res.json({ code: 200, message: '注册成功', data: result });
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
      return;
    }
    const result = await authService.login(username, password);
    res.json({ code: 200, message: '登录成功', data: result });
  } catch (err: any) {
    res.status(401).json({ code: 401, message: err.message });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await authService.getProfile(req.userId!);
    res.json({ code: 200, message: 'ok', data: user });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nickname, avatar } = req.body;
    const user = await authService.updateProfile(req.userId!, nickname || '', avatar || '');
    res.json({ code: 200, message: '更新成功', data: user });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) { res.status(400).json({ code: 400, message: '请选择图片' }); return; }
    const url = '/uploads/' + req.file.filename;
    await authService.updateProfile(req.userId!, '', url);
    res.json({ code: 200, message: '上传成功', data: { url } });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}
