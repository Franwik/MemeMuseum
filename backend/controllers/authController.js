import bcrypt, { hash } from 'bcrypt';
import { Utente } from '../data/remote/Database.js';

export async function login(req, res) {
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }

  try {
    const user = await Utente.findOne({ where: { email: email } });
    if (!user) {
      return res.status(401).json({ error: 'Utente non esistente' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Password errata' });
    }

  return res.status(200).json({ message: "Login effettuato" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

}

export async function register(req, res) {
  
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email e password sono obbligatori' });
  }

  const saltRounds = 10;

  try {

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await Utente.create({
      username: username,
      email: email,
      password_hash: hashedPassword
    });

    return res.status(201).json({ message: "Registrazione effettuata" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}