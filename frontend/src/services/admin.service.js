import api from './api';

/**
 * Service for Admin-only API operations
 */
export const adminService = {
  // Product Operations
  async fetchProducts() {
    const response = await api.get('/admin/product-mgmt');
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getProduct(id) {
    const response = await api.get(`/admin/product-mgmt/${id}`);
    return response.data;
  },

  async createProduct(data) {
    const response = await api.post('/admin/product-mgmt', data);
    return response.data;
  },

  async updateProduct(id, data) {
    const response = await api.put(`/admin/product-mgmt/${id}`, data);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/admin/product-mgmt/${id}`);
    return response.data;
  },

  // Category Operations
  async fetchCategories() {
    const response = await api.get('/admin/category-mgmt');
    return response.data;
  },

  async getCategory(id) {
    const response = await api.get(`/admin/category-mgmt/${id}`);
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/admin/category-mgmt', data);
    return response.data;
  },

  async updateCategory(id, data) {
    const response = await api.put(`/admin/category-mgmt/${id}`, data);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/admin/category-mgmt/${id}`);
    return response.data;
  },

  // User Operations
  async fetchUsers() {
    const response = await api.get('/admin/user-mgmt');
    return response.data;
  },

  async updateUser(id, data) {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/admin/user-mgmt/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await api.patch(`/admin/user-mgmt/${id}/role`, { role });
    return response.data;
  },

  async toggleUserStatus(id) {
    const response = await api.patch(`/admin/user-mgmt/${id}/status`);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/admin/user-mgmt/${id}`);
    return response.data;
  },

  // Table Operations
  async fetchTables() {
    const response = await api.get('/admin/table-mgmt');
    return response.data;
  },

  async createTable(data) {
    const response = await api.post('/admin/table-mgmt', data);
    return response.data;
  },

  async updateTable(id, data) {
    const response = await api.put(`/admin/table-mgmt/${id}`, data);
    return response.data;
  },

  async deleteTable(id) {
    const response = await api.delete(`/admin/table-mgmt/${id}`);
    return response.data;
  },

  async releaseTable(id) {
    const response = await api.patch(`/admin/table-mgmt/${id}/release`);
    return response.data;
  },

  // Order Operations
  async fetchOrders() {
    const response = await api.get('/admin/order-mgmt');
    return response.data;
  },

  async updateOrderStatus(id, status) {
    const response = await api.patch(`/admin/order-mgmt/${id}/status`, { status });
    return response.data;
  },

  async updatePaymentStatus(orderId, paymentStatus) {
    const response = await api.patch(`/admin/order-mgmt/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  },

  // Payment Management (admin only)
  async fetchPayments() {
    const response = await api.get('/admin/payment-mgmt');
    return response.data;
  },

  async updatePaymentStatusAdmin(orderId, paymentStatus) {
    const response = await api.patch(`/admin/payment-mgmt/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  },

  // Staff Management
  async fetchStaff() {
    const response = await api.get('/admin/staff-mgmt');
    return response.data;
  },
  async createStaff(data) {
    const response = await api.post('/admin/staff-mgmt', data);
    return response.data;
  },
  async toggleStaffStatus(id) {
    const response = await api.patch(`/admin/staff-mgmt/${id}/status`);
    return response.data;
  },
  async deleteStaff(id) {
    const response = await api.delete(`/admin/staff-mgmt/${id}`);
    return response.data;
  },
};
