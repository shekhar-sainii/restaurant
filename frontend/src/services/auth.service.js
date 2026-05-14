import api from './api';

/**
 * Service for Authentication and User sessions
 */
export const authService = {
  /**
   * Log in a user and obtain tokens
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async googleLogin(credential) {
    const response = await api.post('/auth/google-login', { credential });
    return response.data;
  },

  /**
   * Register a new user account
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Log out current user
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * (Placeholder) Request password reset
   */
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Set Authorization header for all future requests
   */
  setToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};
