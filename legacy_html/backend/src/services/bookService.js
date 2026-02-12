const store = require('../utils/fileStore');
const FILE = 'books.json';

function getAll() {
  return store.read(FILE, []);
}

function getById(id) {
  const books = getAll();
  return books.find(b => String(b.id) === String(id)) || null;
}

module.exports = { getAll, getById };
