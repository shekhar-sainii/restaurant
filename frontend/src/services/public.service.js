import api from './api';

/**
 * Service for public/consumer API operations
 */
export const publicService = {
  // Fetch initial data (Categories + Products)
  async fetchInitialData() {
    const response = await api.get('/public/initial-data');
    return response.data;
  },

  // Fetch all categories
  async fetchCategories() {
    const response = await api.get('/public/categories');
    return response.data;
  },

  // Fetch all products
  async fetchProducts() {
    const response = await api.get('/public/products');
    return response.data;
  },

  // Table Management for Checkout
  async fetchTables() {
    const response = await api.get('/tables');
    return response.data;
  },

  // Order Placement
  async placeOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Fetch Guest Orders
  async fetchGuestOrders(orderIds) {
    const response = await api.post('/orders/guest', { orderIds });
    return response.data;
  },

  // Fetch Single Order
  async fetchOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};
