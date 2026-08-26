import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as authCtrl from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// 公开接口
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// 需要认证的接口
router.get('/profile', authMiddleware, authCtrl.getProfile);
router.put('/profile', authMiddleware, authCtrl.updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), authCtrl.uploadAvatar);

export default router;
