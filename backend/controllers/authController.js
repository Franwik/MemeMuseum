import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Utente } from '../data/remote/Database.js';
import { Op } from "sequelize";

// Configurazione JWT - IMPORTANTE: metti questa chiave in un file .env in produzione!
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valido per 7 giorni
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 giorni in millisecondi

/**
 * Genera un JWT token per l'utente
 */
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Configurazione del cookie
 */
function getCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,        // Cookie non accessibile da JavaScript (sicurezza XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',       // Protezione CSRF
    maxAge: rememberMe ? COOKIE_MAX_AGE : undefined, // Se rememberMe, cookie persistente
    path: '/'              // Cookie disponibile su tutto il sito
  };
}

/**
 * LOGIN - Autentica l'utente e restituisce un token JWT nel cookie
 */
export async function login(req, res) {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }

  try {
    // Cerca l'utente nel database
    const user = await Utente.findOne({ where: { email: email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Utente non esistente' });
    }

    // Verifica la password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Password errata' });
    }

    // Genera il token JWT
    const token = generateToken(user);

    // Imposta il cookie con il token
    res.cookie('authToken', token, getCookieOptions(rememberMe));

    // Restituisci i dati dell'utente (senza la password!)
    return res.status(200).json({ 
      message: "Login effettuato",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Errore durante il login:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * REGISTER - Registra un nuovo utente
 */
export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email e password sono obbligatori' });
  }

  // Validazione email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  // Validazione password (minimo 6 caratteri)
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' });
  }

  try {
    // Verifica se l'utente esiste già
    const existingUser = await Utente.findOne({ 
      where: { 
        [Op.or]: [
          { email: email }, 
          { username: username }
        ]
      }
    });

    if (existingUser) {
      // Specifica quale campo è duplicato
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Email già registrata' });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Username già in uso' });
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crea il nuovo utente
    const newUser = await Utente.create({
      username: username,
      email: email,
      password_hash: hashedPassword
    });

    // Genera automaticamente il token anche per la registrazione
    const token = generateToken(newUser);

    // Imposta il cookie con il token
    res.cookie('authToken', token, getCookieOptions(false));

    // Restituisci i dati dell'utente
    return res.status(201).json({ 
      message: "Registrazione effettuata",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * LOGOUT - Rimuove il cookie di autenticazione
 */
export async function logout(req, res) {
  try {
    // Cancella il cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return res.status(200).json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    console.error('Errore durante il logout:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * VERIFY TOKEN - Verifica se il token nel cookie è valido
 * Endpoint utile per controllare se l'utente è ancora autenticato
 */
export async function verifyToken(req, res) {
  try {
    // FIX: Controlla se req.cookies esiste
    if (!req.cookies) {
      console.error('⚠️ ATTENZIONE: req.cookies è undefined. Assicurati di aver configurato cookie-parser nel server!');
      return res.status(500).json({ 
        error: 'Configurazione server non corretta. Cookie parser mancante.' 
      });
    }

    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: 'Token non presente' });
    }

    // Verifica il token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cerca l'utente nel database (per assicurarsi che esista ancora)
    const user = await Utente.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    // Restituisci i dati dell'utente
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token scaduto' });
    }
    console.error('Errore durante la verifica del token:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * REFRESH TOKEN - Rinnova il token prima della scadenza
 */
export async function refreshToken(req, res) {
  try {
    // FIX: Controlla se req.cookies esiste
    if (!req.cookies) {
      console.error('⚠️ ATTENZIONE: req.cookies è undefined. Assicurati di aver configurato cookie-parser nel server!');
      return res.status(500).json({ 
        error: 'Configurazione server non corretta. Cookie parser mancante.' 
      });
    }

    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: 'Token non presente' });
    }

    // Verifica il token corrente
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cerca l'utente
    const user = await Utente.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    // Genera un nuovo token
    const newToken = generateToken(user);

    // Imposta il nuovo cookie
    res.cookie('authToken', newToken, getCookieOptions(true));

    return res.status(200).json({ 
      message: 'Token rinnovato con successo',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Errore durante il refresh del token:', error);
    return res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}