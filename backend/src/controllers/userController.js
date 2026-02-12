const UserService = require('../services/userService');

/**
 * Get user profile
 */
const getProfile = (req, res) => {
  try {
    const email = req.user.email;
    const result = UserService.getProfile(email);

    if (!result.ok) {
      return res.status(404).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = (req, res) => {
  try {
    const email = req.user.email;
    const { name, avatarUrl } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const result = UserService.updateProfile(email, updates);

    if (!result.ok) {
      return res.status(404).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Upload avatar
 */
const uploadAvatar = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'No file uploaded'
      });
    }

    const email = req.user.email;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const result = UserService.updateProfile(email, { avatarUrl });

    if (!result.ok) {
      return res.status(404).json({
        ok: false,
        error: result.error
      });
    }

    res.json({
      ok: true,
      data: {
        avatarUrl,
        user: result.data.user
      }
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete account
 */
const deleteAccount = (req, res) => {
  try {
    const email = req.user.email;

    const result = UserService.deleteAccount(email);

    if (!result.ok) {
      return res.status(404).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount
};
