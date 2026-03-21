/**
 * Frontend Authentication Module
 * Handles login, registration, and OTP-based password reset
 * Integrates with Express.js backend API
 */

const AuthService = (() => {
  const INSTITUTION_EMAIL_REGEX = /^[^\s@]+@sasi\.ac\.in$/i;

  const getApiBase = () => {
    return ((window.AppConfig && typeof window.AppConfig.getApiBase === 'function')
      ? window.AppConfig.getApiBase()
      : `${window.location.protocol}//${window.location.hostname}:3000/api`);
  };

  const wakeBackend = async () => {
    if (window.AppConfig && typeof window.AppConfig.wakeBackendOnVisit === 'function') {
      try {
        await window.AppConfig.wakeBackendOnVisit();
      } catch (_error) {
        // Ignore wake-up errors; request flow below still handles failures.
      }
    }
  };

  const isInstitutionEmail = (email) => {
    return INSTITUTION_EMAIL_REGEX.test((email || '').trim());
  };
  
  // Get JWT token from localStorage
  const getToken = () => localStorage.getItem('auth_token');
  
  // Set JWT token
  const setToken = (token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('loggedIn', 'true');
  };
  
  // Clear token
  const clearToken = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
  };
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return !!getToken();
  };
  
  // Get current user
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      // If it's just a string (old format), return it
      return userStr;
    }
  };
  
  // Make authenticated API request
  const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const requestUrl = () => `${getApiBase()}${endpoint}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const token = getToken();
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      options.body = JSON.stringify(data);
    }

    const runRequest = async () => {
      const targetUrl = requestUrl();
      console.log(`[AuthService] ${method} ${targetUrl}`, data || '');
      const response = await fetch(targetUrl, options);
      const result = await response.json();
      console.log(`[AuthService] Response (${response.status}):`, result);
      
      if (!response.ok && response.status === 401) {
        clearToken();
      }

      return { status: response.status, ...result };
    };

    try {
      return await runRequest();
    } catch (error) {
      console.error('API request error:', error);

      // Backends on free tiers may sleep; wake once and retry.
      try {
        await wakeBackend();
        return await runRequest();
      } catch (retryError) {
        console.error('API retry after wake-up failed:', retryError);
        return { ok: false, error: 'Failed to connect to server. Backend may be starting. Please wait a few seconds and try again.' };
      }
    }
  };
  
  // Login - backend only (single source of truth)
  const login = async (email, password) => {
    console.log('[AuthService] Login attempt for:', email);

    if (!isInstitutionEmail(email)) {
      return { ok: false, error: 'Only @sasi.ac.in email accounts can access this library.' };
    }
    
    const apiResult = await apiRequest('/auth/login', 'POST', { email, password });
    if (apiResult && apiResult.ok && apiResult.token) {
      console.log('[AuthService] API login successful');
      setToken(apiResult.token);
      if (apiResult.user) {
        localStorage.setItem('currentUser', JSON.stringify(apiResult.user));
      } else {
        localStorage.setItem('currentUser', email);
      }
      return apiResult;
    }

    return {
      ok: false,
      error: apiResult?.error || 'Login failed. Please try again.'
    };
  };
  
  // Register - backend only (prevents duplicate accounts across devices)
  const register = async (email, password, name = null) => {
    console.log('[AuthService] Register attempt for:', email);

    if (!isInstitutionEmail(email)) {
      return { ok: false, error: 'Only @sasi.ac.in email accounts can access this library.' };
    }
    
    const apiResult = await apiRequest('/auth/register', 'POST', { email, password, name });
    if (apiResult && apiResult.ok && apiResult.token) {
      console.log('[AuthService] API registration successful');
      setToken(apiResult.token);
      if (apiResult.user) {
        localStorage.setItem('currentUser', JSON.stringify(apiResult.user));
      } else {
        localStorage.setItem('currentUser', email);
      }
      return apiResult;
    }

    return {
      ok: false,
      error: apiResult?.error || 'Registration failed. If you already registered, please login.'
    };
  };
  
  // Send OTP
  const sendOTP = async (email) => {
    if (!isInstitutionEmail(email)) {
      return { ok: false, error: 'Only @sasi.ac.in email accounts can access this library.' };
    }
    return await apiRequest('/auth/send-otp', 'POST', { email });
  };
  
  // Verify OTP and reset password
  const verifyOTP = async (email, code, newPassword) => {
    if (!isInstitutionEmail(email)) {
      return { ok: false, error: 'Only @sasi.ac.in email accounts can access this library.' };
    }

    const result = await apiRequest('/auth/verify-otp', 'POST', {
      email,
      code,
      newPassword
    });
    
    if (result.ok && result.token) {
      setToken(result.token);
      // Store full user object
      if (result.user) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
      } else {
        localStorage.setItem('currentUser', email);
      }
    }
    
    return result;
  };
  
  // Get user profile
  const getProfile = async () => {
    return await apiRequest('/users/profile');
  };
  
  // Update user profile
  const updateProfile = async (name) => {
    return await apiRequest('/users/profile', 'PUT', { name });
  };
  
  // Get saved books
  const getSavedBooks = async () => {
    return await apiRequest('/saved');
  };
  
  // Save book
  const saveBook = async (book) => {
    return await apiRequest('/saved', 'POST', { book });
  };
  
  // Remove saved book
  const removeBook = async (bookId) => {
    return await apiRequest(`/saved/${bookId}`, 'DELETE');
  };
  
  // Logout
  const logout = () => {
    clearToken();
  };
  
  return {
    getToken,
    setToken,
    clearToken,
    isLoggedIn,
    getCurrentUser,
    login,
    register,
    sendOTP,
    verifyOTP,
    getProfile,
    updateProfile,
    getSavedBooks,
    saveBook,
    removeBook,
    logout,
    apiRequest
  };
})();
