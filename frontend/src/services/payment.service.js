import api from './api';

export const paymentService = {
  async initiateUpi(orderId, upiId = 'primary') {
    const res = await api.post('/payments/upi/initiate', { orderId, upiId });
    return res.data;
  },

  async verifyUtr(paymentId, utrNumber) {
    const res = await api.post('/payments/upi/verify', { paymentId, utrNumber });
    return res.data;
  },
};
