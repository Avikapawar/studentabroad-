import api from './api';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
        user: response.data.user,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
        code: error.response?.data?.code || 'REGISTRATION_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data,
        user: response.data.user,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
        code: error.response?.data?.code || 'LOGIN_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Refresh response
   */
  async refreshToken(refreshToken) {
    try {
      // Temporarily set the refresh token for this request
      const originalAuth = api.defaults.headers.Authorization;
      api.defaults.headers.Authorization = `Bearer ${refreshToken}`;
      
      const response = await api.post('/auth/refresh');
      
      // Restore original auth header
      api.defaults.headers.Authorization = originalAuth;
      
      return {
        success: true,
        accessToken: response.data.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Token refresh failed',
        code: error.response?.data?.code || 'REFRESH_ERROR'
      };
    }
  }

  /**
   * Get current user information
   * @returns {Promise<Object>} User information response
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user information',
        code: error.response?.data?.code || 'USER_FETCH_ERROR'
      };
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed',
        code: error.response?.data?.code || 'PASSWORD_CHANGE_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Get stored access token
   * @returns {string|null} Access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Store authentication tokens
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear stored authentication data
   */
  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }

  /**
   * Store user data
   * @param {Object} userData - User data to store
   */
  storeUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUserData() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;