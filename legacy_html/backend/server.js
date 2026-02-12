// Bootstrapper for structured backend
require('./src/server');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5050;

app.use(express.json());

// Simple CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve frontend static files (parent directory of backend is the frontend folder)
const frontendRoot = path.join(__dirname, '..');
app.use(express.static(frontendRoot));

// Helper to read/write JSON data
function readJson(file) {
  try {
    const raw = fs.readFileSync(path.join(__dirname, file), 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2), 'utf8');
}

// API: list books
app.get('/api/books', (req, res) => {
  const books = readJson('data/books.json');
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const books = readJson('data/books.json');
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (!book) return res.status(404).json({ error: 'Not found' });
  res.json(book);
});

// Simple user management (file-based) - not for production
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = readJson('data/users.json');
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'User exists' });
  const user = { email, password };
  users.push(user);
  writeJson('data/users.json', users);
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = readJson('data/users.json');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ ok: true, email });
});

// Saved (bookmark) endpoints
app.get('/api/users/:email/saved', (req, res) => {
  const email = req.params.email;
  const saved = readJson('data/saved.json');
  res.json(saved[email] || []);
});

app.post('/api/users/:email/saved', (req, res) => {
  const email = req.params.email;
  const item = req.body; // expecting { id: ..., title: ... }
  if (!item || !item.id) return res.status(400).json({ error: 'Invalid item' });
  const saved = readJson('data/saved.json');
  saved[email] = saved[email] || [];
  if (!saved[email].find(i => String(i.id) === String(item.id))) saved[email].push(item);
  writeJson('data/saved.json', saved);
  res.json(saved[email]);
});

// Fallback: serve index (allow client-side routing if any)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'main.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
