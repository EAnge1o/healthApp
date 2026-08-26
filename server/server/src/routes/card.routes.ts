import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as cardCtrl from '../controllers/card.controller';
import { authMiddleware } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.use(authMiddleware);

router.post('/photo', upload.single('image'), cardCtrl.photoCard);
router.post('/barcode', cardCtrl.barcodeCard);
router.get('/records', cardCtrl.getCardRecords);
router.put('/:id', cardCtrl.updateCard);
router.delete('/:id', cardCtrl.deleteCard);

export default router;
