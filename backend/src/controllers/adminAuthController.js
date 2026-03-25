const AdminAuthService = require('../services/adminAuthService');

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await AdminAuthService.login(email, password);

    if (!result.ok) {
      return res.status(result.statusCode || 401).json({
        ok: false,
        error: result.error
      });
    }

    return res.json(result.toJSON());
  } catch (error) {
    console.error('Admin login controller error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  login
};
