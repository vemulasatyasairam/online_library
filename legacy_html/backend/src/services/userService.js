const store = require('../utils/fileStore');
const FILE = 'users.json';

function getAll() { return store.read(FILE, []); }

function findByEmail(email) {
  if (!email) return null;
  const users = getAll();
  return users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase()) || null;
}

function register(email, password) {
  const users = getAll();
  if (findByEmail(email)) return null;
  const user = { email, password };
  users.push(user);
  store.write(FILE, users);
  return user;
}

function authenticate(email, password) {
  const u = findByEmail(email);
  if (!u) return null;
  if (u.password !== password) return null;
  return { email: u.email };
}

module.exports = { getAll, findByEmail, register, authenticate };
