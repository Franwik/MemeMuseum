import express, { json } from 'express';
import authRoutes from './routes/authRoutes.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(3000, '0.0.0.0', () => {
  console.log(`Server in ascolto sulla porta 3000`);
});

app.use('/api/auth', authRoutes);