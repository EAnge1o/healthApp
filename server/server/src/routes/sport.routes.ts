import { Router } from 'express';
import * as sportCtrl from '../controllers/sport.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/save', sportCtrl.saveSport);
router.post('/start', sportCtrl.startSport);
router.post('/gps', sportCtrl.addGpsPoint);
router.post('/end', sportCtrl.endSport);
router.get('/records', sportCtrl.getSportRecords);
router.get('/stats', sportCtrl.getSportStats);
router.put('/:id', sportCtrl.updateSport);
router.delete('/:id', sportCtrl.deleteSport);
router.get('/:id', sportCtrl.getSportDetail);

export default router;
