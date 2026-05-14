import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
});

/**
 * Persistence Middleware: Sync crucial state to localStorage
 */
store.subscribe(() => {
  const state = store.getState();

  // Persist Cart
  localStorage.setItem('gourmet_cart', JSON.stringify(state.cart.items));

  // Persist Auth
  if (state.auth.isAuthenticated) {
    localStorage.setItem('gourmet_auth', JSON.stringify(state.auth));
  } else {
    localStorage.removeItem('gourmet_auth');
  }
});

export default store;
