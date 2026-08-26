import { Router } from 'express';
import * as gc from '../controllers/goal.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', gc.getGoals);
router.post('/', gc.createGoal);
router.delete('/:id', gc.deleteGoal);
router.post('/:id/checkin', gc.checkin);
export default router;
