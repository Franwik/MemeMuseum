import { Router } from 'express';
import { uploadMeme, getAllMemes } from '../controllers/memeController.js'

const router = Router();

router.post('/upload', uploadMeme);
router.get('/getall', getAllMemes);

export default router;