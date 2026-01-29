import express, { json } from 'express';
import { initDatabase } from './data/remote/Database.js';
import authRoutes from './routes/authRoutes.js'
import memeRoutes from './routes/memeRoutes.js';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS PRIMA DELLE ROUTES!
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

await initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meme', memeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});