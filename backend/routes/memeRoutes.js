import { Router } from 'express';
import { uploadMeme, getDailyMeme, searchMemes } from '../controllers/memeController.js'
import { uploader } from '../data/local/multerStorage/uploader.js';

const router = Router();

router.post('/upload', uploader.single('immagine'), uploadMeme);
router.get('/daily', getDailyMeme);
router.get('/search', searchMemes);

export default router;