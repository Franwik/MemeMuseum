import jwt from 'jsonwebtoken';
import { Utente } from '../data/remote/Database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies.authToken;

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Utente.findByPk(decoded.id);

    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
    }
  } catch (error) {
    // Token invalido o scaduto → ignora silenziosamente
  }

  next();
}