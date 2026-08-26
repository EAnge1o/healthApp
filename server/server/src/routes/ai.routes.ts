import { Router } from 'express';
import * as aiCtrl from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/analyze', aiCtrl.generateAnalysis);
router.get('/history', aiCtrl.getAiHistory);
router.delete('/:id', aiCtrl.deleteHistory);

export default router;
