import jwt from 'jsonwebtoken';
import { Utente } from '../data/remote/Database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Middleware per verificare il token JWT nei cookies
 * Protegge le route che richiedono autenticazione
 * 
 * Uso:
 * router.get('/protected-route', authMiddleware, yourController);
 */
export async function authMiddleware(req, res, next) {
  try {
    // Ottieni il token dal cookie
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ 
        error: 'Accesso non autorizzato. Token mancante.' 
      });
    }

    // Verifica il token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cerca l'utente nel database
    const user = await Utente.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        error: 'Utente non trovato' 
      });
    }

    // Aggiungi l'utente alla request per utilizzarlo nei controller
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // Prosegui con la richiesta
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token scaduto' });
    }
    
    console.error('Errore nel middleware di autenticazione:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}