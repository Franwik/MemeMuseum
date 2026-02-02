import { Router } from 'express';
import { login, register, logout, verifyToken, refreshToken } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authMiddleware, logout);
router.get('/verify', verifyToken);
router.post('/refresh', refreshToken);

export default router;