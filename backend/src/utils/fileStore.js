const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const usersFile = path.join(dataDir, 'users.json');
const savedFile = path.join(dataDir, 'saved.json');
const otpFile = path.join(dataDir, 'otp.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(savedFile)) {
  fs.writeFileSync(savedFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(otpFile)) {
  fs.writeFileSync(otpFile, JSON.stringify({}, null, 2));
}

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing users:', err);
    return false;
  }
};

const readSaved = () => {
  try {
    const data = fs.readFileSync(savedFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading saved:', err);
    return [];
  }
};

const writeSaved = (saved) => {
  try {
    fs.writeFileSync(savedFile, JSON.stringify(saved, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing saved:', err);
    return false;
  }
};

const findUserByEmail = (email) => {
  const users = readUsers();
  return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
};

const saveUser = (user) => {
  const users = readUsers();
  const existingIndex = users.findIndex(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
  
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }
  
  return writeUsers(users) ? user : null;
};

const addSavedBook = (email, book) => {
  const saved = readSaved();
  const record = saved.find(s => s.email && s.email.toLowerCase() === email.toLowerCase());
  
  if (record) {
    if (!record.books.find(b => b.id === book.id)) {
      record.books.push(book);
    }
  } else {
    saved.push({ email, books: [book] });
  }
  
  return writeSaved(saved) ? true : false;
};

const getSavedBooks = (email) => {
  const saved = readSaved();
  const record = saved.find(s => s.email && s.email.toLowerCase() === email.toLowerCase());
  return record ? record.books : [];
};

const removeSavedBook = (email, bookId) => {
  const saved = readSaved();
  const record = saved.find(s => s.email && s.email.toLowerCase() === email.toLowerCase());
  
  if (record) {
    record.books = record.books.filter(b => b.id !== bookId);
  }
  
  return writeSaved(saved) ? true : false;
};

const removeSavedBooksForUser = (email) => {
  const saved = readSaved();
  const filtered = saved.filter(s => s.email && s.email.toLowerCase() !== email.toLowerCase());
  return writeSaved(filtered) ? true : false;
};

// OTP Management
const readOTP = () => {
  try {
    const data = fs.readFileSync(otpFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading OTP:', err);
    return {};
  }
};

const writeOTP = (otpData) => {
  try {
    fs.writeFileSync(otpFile, JSON.stringify(otpData, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing OTP:', err);
    return false;
  }
};

const saveOTP = (otp) => {
  const allOTPs = readOTP();
  allOTPs[otp.email] = {
    code: otp.code,
    createdAt: otp.createdAt,
    expiresAt: otp.expiresAt,
    attempts: otp.attempts,
    maxAttempts: otp.maxAttempts,
    isUsed: otp.isUsed
  };
  return writeOTP(allOTPs) ? otp : null;
};

const getOTP = (email) => {
  const allOTPs = readOTP();
  return allOTPs[email] || null;
};

const deleteOTP = (email) => {
  const allOTPs = readOTP();
  delete allOTPs[email];
  return writeOTP(allOTPs) ? true : false;
};

module.exports = {
  readUsers,
  writeUsers,
  readSaved,
  writeSaved,
  findUserByEmail,
  saveUser,
  addSavedBook,
  getSavedBooks,
  removeSavedBook,
  removeSavedBooksForUser,
  readOTP,
  writeOTP,
  saveOTP,
  getOTP,
  deleteOTP
};
