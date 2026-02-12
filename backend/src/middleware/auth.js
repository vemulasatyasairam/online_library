const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'No token provided'
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production');
  if (!decoded) {
    return res.status(401).json({
      ok: false,
      error: 'Invalid token'
    });
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;
