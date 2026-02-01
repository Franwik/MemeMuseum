import { Router } from 'express';
import { uploadMeme, getDailyMeme, searchMemes, voteMeme } from '../controllers/memeController.js'
import { uploader } from '../data/local/multerStorage/uploader.js';

const router = Router();

router.post('/upload', uploader.single('immagine'), uploadMeme);
router.get('/daily', getDailyMeme);
router.get('/search', searchMemes);
router.post('/vote', voteMeme);

export default router;