import api from './api';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  /**
   * Update current user profile (handles FormData for images)
   */
  async updateProfile(formData) {
    const response = await api.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
