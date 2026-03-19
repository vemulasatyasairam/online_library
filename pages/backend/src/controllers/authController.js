const userService = require('../services/userService');

async function register(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = userService.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'User exists' });
  const u = userService.register(email, password);
  res.json({ ok: true, user: { email: u.email } });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = userService.authenticate(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ ok: true, user });
}

module.exports = { register, login };
