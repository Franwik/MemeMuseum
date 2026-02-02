import { Router } from 'express';
import { login, register, logout, verifyToken, refreshToken } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/verify', verifyToken);
router.post('/refresh', refreshToken);

export default router;