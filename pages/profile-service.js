/**
 * Profile Service
 * Handles profile-related operations with backend API
 */

const ProfileService = {
  /**
   * Get current user profile with statistics
   */
  async getProfile() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Fallback to localStorage
      return this.getLocalProfile();
    }
  },

  /**
   * Get profile from localStorage (fallback)
   */
  getLocalProfile() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      return null;
    }

    const user = JSON.parse(userData);
    const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
    const userSavedBooks = savedBooks.filter(book => book.userId === user.email);

    return {
      ok: true,
      data: {
        user,
        stats: {
          savedBooks: userSavedBooks.length,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update localStorage
      if (data.data && data.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      // Fallback to localStorage
      return this.updateLocalProfile(updates);
    }
  },

  /**
   * Update profile in localStorage (fallback)
   */
  updateLocalProfile(updates) {
    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        throw new Error('User not found');
      }

      let user = JSON.parse(userData);
      user = { ...user, ...updates, updatedAt: new Date().toISOString() };

      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Update in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === user.email);
      if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
      }

      return {
        ok: true,
        data: { user }
      };
    } catch (error) {
      console.error('Local profile update error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  /**
   * Upload profile avatar
   */
  async uploadAvatar(file) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('http://localhost:3000/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Update localStorage
      if (data.data && data.data.avatarUrl) {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          user.avatarUrl = data.data.avatarUrl;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }

      return data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      // Fallback to local storage with base64
      return this.uploadAvatarLocal(file);
    }
  },

  /**
   * Upload avatar locally (base64)
   */
  async uploadAvatarLocal(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const avatarUrl = event.target.result;
          const userData = localStorage.getItem('currentUser');
          
          if (!userData) {
            throw new Error('User not found');
          }

          let user = JSON.parse(userData);
          user.avatarUrl = avatarUrl;
          user.updatedAt = new Date().toISOString();

          localStorage.setItem('currentUser', JSON.stringify(user));

          // Update in users array
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.email === user.email);
          if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
          }

          resolve({
            ok: true,
            data: {
              avatarUrl,
              user
            }
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      return data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },

  /**
   * Delete account
   */
  async deleteAccount() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:3000/api/users/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear local data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('currentUser');

      return data;
    } catch (error) {
      console.error('Account deletion error:', error);
      // Fallback to local deletion
      return this.deleteAccountLocal();
    }
  },

  /**
   * Delete account locally
   */
  deleteAccountLocal() {
    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        throw new Error('User not found');
      }

      const user = JSON.parse(userData);

      // Remove from users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const filteredUsers = users.filter(u => u.email !== user.email);
      localStorage.setItem('users', JSON.stringify(filteredUsers));

      // Remove saved books
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      const filteredBooks = savedBooks.filter(book => book.userId !== user.email);
      localStorage.setItem('savedBooks', JSON.stringify(filteredBooks));

      // Clear session
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('currentUser');

      return {
        ok: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Local account deletion error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Calculate days since date
   */
  daysSince(dateString) {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const today = new Date();
    return Math.floor((today - date) / (1000 * 60 * 60 * 24));
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileService;
}
