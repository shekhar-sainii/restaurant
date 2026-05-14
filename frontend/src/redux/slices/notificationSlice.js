import { createSlice } from '@reduxjs/toolkit';

const MAX = 50; // keep last 50 notifications

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('pk_notifications') || '[]'); } catch { return []; }
})();

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: saved,          // { id, title, body, type, orderId, createdAt, read }
    unreadCount: saved.filter(n => !n.read).length,
  },
  reducers: {
    addNotification: (state, action) => {
      const notif = {
        id: `${Date.now()}-${Math.random()}`,
        read: false,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      state.items.unshift(notif);
      if (state.items.length > MAX) state.items = state.items.slice(0, MAX);
      state.unreadCount = state.items.filter(n => !n.read).length;
      localStorage.setItem('pk_notifications', JSON.stringify(state.items));
    },
    markAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
      localStorage.setItem('pk_notifications', JSON.stringify(state.items));
    },
    markRead: (state, action) => {
      const item = state.items.find(n => n.id === action.payload);
      if (item) item.read = true;
      state.unreadCount = state.items.filter(n => !n.read).length;
      localStorage.setItem('pk_notifications', JSON.stringify(state.items));
    },
    clearAll: (state) => {
      state.items = [];
      state.unreadCount = 0;
      localStorage.removeItem('pk_notifications');
    },
  },
});

export const { addNotification, markAllRead, markRead, clearAll } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount   = (state) => state.notifications.unreadCount;
export default notificationSlice.reducer;
