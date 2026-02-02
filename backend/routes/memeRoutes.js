import { Router } from 'express';
import { uploadMeme, getDailyMeme, searchMemes, voteMeme } from '../controllers/memeController.js'
import { uploader } from '../data/local/multerStorage/uploader.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/upload', uploader.single('immagine'), uploadMeme);
router.get('/daily', getDailyMeme);
router.get('/search', searchMemes);
router.post('/vote', authMiddleware, voteMeme);

export default router;