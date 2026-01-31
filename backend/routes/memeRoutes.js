import { Router } from 'express';
import { uploadMeme, getDailyMeme } from '../controllers/memeController.js'
import { uploader } from '../data/local/multerStorage/uploader.js';

const router = Router();

router.post('/upload', uploader.single('immagine'), uploadMeme);
router.get('/daily', getDailyMeme);

export default router;