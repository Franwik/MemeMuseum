import express, { json } from 'express';
import { initDatabase } from './data/remote/Database.js';
import authRoutes from './routes/authRoutes.js'
import memeRoutes from './routes/memeRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

await initDatabase();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/meme', memeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});