import { Router } from 'express';
import * as mc from '../controllers/metric.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/latest', mc.getLatest);
router.get('/:type', mc.getMetrics);
router.post('/', mc.addMetric);
router.delete('/:id', mc.deleteMetric);

export default router;
