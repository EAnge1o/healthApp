import { Router } from 'express';
import * as articleCtrl from '../controllers/article.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 文章列表和详情可公开查看
router.get('/', articleCtrl.getArticles);
router.get('/:id', articleCtrl.getArticleDetail);

// 创建和删除需要认证
router.post('/', authMiddleware, articleCtrl.createArticle);
router.delete('/:id', authMiddleware, articleCtrl.deleteArticle);

export default router;
