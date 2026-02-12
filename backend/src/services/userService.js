/**
 * User Service
 * Handles user profile business logic
 */

const fileStore = require('../utils/fileStore');
const { User } = require('../models');

class UserService {
  /**
   * Get user profile by email
   */
  static getProfile(email) {
    try {
      const user = fileStore.findUserByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found'
        };
      }

      const userInstance = user instanceof User ? user : User.fromJSON(user);
      return {
        ok: true,
        user: userInstance.toJSON()
      };
    } catch (err) {
      console.error('Get profile error:', err);
      return {
        ok: false,
        error: 'Failed to fetch profile'
      };
    }
  }

  /**
   * Update user profile
   */
  static updateProfile(email, updates) {
    try {
      const user = fileStore.findUserByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found'
        };
      }

      const userInstance = user instanceof User ? user : User.fromJSON(user);

      // Update allowed fields
      if (updates.name !== undefined) {
        userInstance.name = updates.name;
      }
      if (updates.avatarUrl !== undefined) {
        userInstance.avatarUrl = updates.avatarUrl;
      }

      userInstance.updatedAt = new Date().toISOString();

      // Save updated user
      fileStore.saveUser(userInstance);

      return {
        ok: true,
        message: 'Profile updated',
        data: {
          user: userInstance.toJSON()
        }
      };
    } catch (err) {
      console.error('Update profile error:', err);
      return {
        ok: false,
        error: 'Failed to update profile'
      };
    }
  }

  /**
   * Get all users (admin only - use with caution)
   */
  static getAllUsers() {
    try {
      const users = fileStore.readUsers();
      const userInstances = users.map(u => 
        u instanceof User ? u : User.fromJSON(u)
      );
      return {
        ok: true,
        users: userInstances.map(u => u.toJSON()),
        count: userInstances.length
      };
    } catch (err) {
      console.error('Get all users error:', err);
      return {
        ok: false,
        error: 'Failed to fetch users'
      };
    }
  }

  /**
   * Delete user account
   */
  static deleteAccount(email) {
    return this.deleteUser(email);
  }

  /**
   * Delete user
   */
  static deleteUser(email) {
    try {
      const users = fileStore.readUsers();
      const filteredUsers = users.filter(u => {
        const userInstance = u instanceof User ? u : User.fromJSON(u);
        return userInstance.email.toLowerCase() !== email.toLowerCase();
      });

      fileStore.writeUsers(filteredUsers);

      // Also remove saved books
      fileStore.removeSavedBooksForUser(email);

      return {
        ok: true,
        message: 'User deleted'
      };
    } catch (err) {
      console.error('Delete user error:', err);
      return {
        ok: false,
        error: 'Failed to delete user'
      };
    }
  }

  /**
   * Deactivate user
   */
  static deactivateUser(email) {
    try {
      const user = fileStore.findUserByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found'
        };
      }

      const userInstance = user instanceof User ? user : User.fromJSON(user);
      userInstance.isActive = false;
      userInstance.updatedAt = new Date().toISOString();

      fileStore.saveUser(userInstance);

      return {
        ok: true,
        message: 'User deactivated'
      };
    } catch (err) {
      console.error('Deactivate user error:', err);
      return {
        ok: false,
        error: 'Failed to deactivate user'
      };
    }
  }

  /**
   * Activate user
   */
  static activateUser(email) {
    try {
      const user = fileStore.findUserByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found'
        };
      }

      const userInstance = user instanceof User ? user : User.fromJSON(user);
      userInstance.isActive = true;
      userInstance.updatedAt = new Date().toISOString();

      fileStore.saveUser(userInstance);

      return {
        ok: true,
        message: 'User activated'
      };
    } catch (err) {
      console.error('Activate user error:', err);
      return {
        ok: false,
        error: 'Failed to activate user'
      };
    }
  }
}

module.exports = UserService;
