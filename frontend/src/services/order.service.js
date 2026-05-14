import api from './api';

/**
 * Service for Consumer Order operations
 */
export const orderService = {
  /**
   * Place a new order
   */
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Fetch current user's orders
   */
  async fetchMyOrders() {
    const response = await api.get('/orders/me');
    return response.data;
  },

  /**
   * Get specific order details
   */
  async getOrderDetails(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};
