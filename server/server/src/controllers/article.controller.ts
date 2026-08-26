import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as articleService from '../services/article.service';

export async function createArticle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ code: 400, message: '标题和内容不能为空' });
      return;
    }
    const result = await articleService.createArticle(req.userId!, title, content);
    res.json({ code: 200, message: '发布成功', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getArticles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const result = await articleService.getArticles(page, pageSize);
    res.json({ code: 200, message: 'ok', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getArticleDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const article = await articleService.getArticleDetail(id);
    if (!article) {
      res.status(404).json({ code: 404, message: '文章不存在' });
      return;
    }
    res.json({ code: 200, message: 'ok', data: article });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function deleteArticle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ok = await articleService.deleteArticle(id, req.userId!);
    if (!ok) {
      res.status(404).json({ code: 404, message: '文章不存在或无权删除' });
      return;
    }
    res.json({ code: 200, message: '删除成功' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}
