import { Router } from 'express';
import { uploadMeme, getDailyMeme, searchMemes, voteMeme, getMemeById, commentMeme, getMemeComments, getAllMemes, getAllTags } from '../controllers/memeController.js'
import { uploader } from '../data/local/multerStorage/uploader.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/upload', uploader.single('immagine'), uploadMeme);
router.get('/getall', getAllMemes);
router.get('/tags', getAllTags);
router.get('/daily', getDailyMeme);
router.get('/search', searchMemes);
router.post('/vote', authMiddleware, voteMeme);
router.get('/:id', getMemeById);
router.post('/comment', authMiddleware, commentMeme);
router.get('/comment/:id_meme', getMemeComments);

export default router;