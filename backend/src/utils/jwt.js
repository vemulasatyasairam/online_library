const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const TOKEN_EXPIRY = '24h';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.email, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateOTP,
  JWT_SECRET
};
