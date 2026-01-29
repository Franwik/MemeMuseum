import { Router } from 'express';
import { uploadMeme, getAllMemes, getDailyMeme } from '../controllers/memeController.js'

const router = Router();

router.post('/upload', uploadMeme);
router.get('/getall', getAllMemes);
router.get('/daily', getDailyMeme);

export default router;