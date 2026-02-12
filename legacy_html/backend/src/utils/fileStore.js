const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function read(fileName, defaultValue) {
  ensureDataDir();
  const full = path.join(dataDir, fileName);
  try {
    if (!fs.existsSync(full)) {
      fs.writeFileSync(full, JSON.stringify(defaultValue || [], null, 2), 'utf8');
      return defaultValue || [];
    }
    const raw = fs.readFileSync(full, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return defaultValue || [];
  }
}

function write(fileName, data) {
  ensureDataDir();
  const full = path.join(dataDir, fileName);
  fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { read, write, dataDir };
