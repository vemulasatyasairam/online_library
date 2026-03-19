const bookService = require('../services/bookService');

async function list(req, res) {
  const books = bookService.getAll();
  res.json(books);
}

async function getById(req, res) {
  const id = req.params.id;
  const book = bookService.getById(id);
  if (!book) return res.status(404).json({ error: 'Not found' });
  res.json(book);
}

module.exports = { list, getById };
