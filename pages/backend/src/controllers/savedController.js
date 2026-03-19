const savedService = require('../services/savedService');

async function getSaved(req, res) {
  const email = req.params.email;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const list = savedService.getSavedFor(email);
  res.json(list);
}

async function addSaved(req, res) {
  const email = req.params.email;
  const item = req.body;
  if (!email || !item || !item.id) return res.status(400).json({ error: 'Invalid request' });
  const updated = savedService.addSavedFor(email, item);
  res.json(updated);
}

module.exports = { getSaved, addSaved };
