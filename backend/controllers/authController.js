

export async function login(req, res) {
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }

  // TODO: creare logica login

  return res.status(200).json({ message: "Login effettuato" });

}