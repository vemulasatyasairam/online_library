const store = require('../utils/fileStore');
const FILE = 'saved.json';

function _read() { return store.read(FILE, {}); }

function _write(obj) { return store.write(FILE, obj); }

function getSavedFor(email) {
  const all = _read();
  return all[email] || [];
}

function addSavedFor(email, item) {
  const all = _read();
  all[email] = all[email] || [];
  if (!all[email].find(i => String(i.id) === String(item.id))) all[email].push(item);
  _write(all);
  return all[email];
}

module.exports = { getSavedFor, addSavedFor };
