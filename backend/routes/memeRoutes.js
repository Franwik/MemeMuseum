import { Router } from 'express';
import { uploadMeme, getAllMemes, getDailyMeme } from '../controllers/memeController.js'
import { uploader } from '../data/local/multerStorage/uploader.js';

const router = Router();

router.post('/upload', uploader.single('immagine'), uploadMeme);
router.get('/getall', getAllMemes);
router.get('/daily', getDailyMeme);

export default router;