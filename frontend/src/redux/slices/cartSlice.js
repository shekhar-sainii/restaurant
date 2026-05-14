import { createSlice } from '@reduxjs/toolkit';

/**
 * Multi-Tenant Cart Slice
 * Stores items independently for each restaurant using tenantId as the key.
 */

const savedCart = localStorage.getItem('gourmet_carts');
const initialState = {
  carts: savedCart ? JSON.parse(savedCart) : {}, // Structure: { [tenantId]: items[] }
  isDrawerOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    openDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    addItem: (state, action) => {
      const { product, variation } = action.payload;
      const tenantId = product.tenantId;

      if (!state.carts[tenantId]) {
        state.carts[tenantId] = [];
      }

      const cartKey = variation ? `${product._id}-${variation.name}` : product._id;
      const existingItem = state.carts[tenantId].find(item => item.cartKey === cartKey);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.carts[tenantId].push({
          ...product,
          quantity: 1,
          variation,
          cartKey
        });
      }
      state.isDrawerOpen = true;
      localStorage.setItem('gourmet_carts', JSON.stringify(state.carts));
    },
    removeItem: (state, action) => {
      const { cartKey, tenantId } = action.payload;
      if (state.carts[tenantId]) {
        state.carts[tenantId] = state.carts[tenantId].filter(item => item.cartKey !== cartKey);
        localStorage.setItem('gourmet_carts', JSON.stringify(state.carts));
      }
    },
    updateQuantity: (state, action) => {
      const { cartKey, delta, tenantId } = action.payload;
      const item = state.carts[tenantId]?.find(item => item.cartKey === cartKey);
      if (item) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
          item.quantity = newQty;
        }
        localStorage.setItem('gourmet_carts', JSON.stringify(state.carts));
      }
    },
    clearCart: (state, action) => {
      const tenantId = action.payload;
      if (tenantId) {
        state.carts[tenantId] = [];
        localStorage.setItem('gourmet_carts', JSON.stringify(state.carts));
      }
    }
  }
});

export const { 
  toggleDrawer, 
  openDrawer, 
  closeDrawer, 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart 
} = cartSlice.actions;

// Selectors (Pass tenantId to get specific data)
export const selectCartItems = (state, tenantId) => 
  tenantId ? (state.cart.carts[tenantId] || []) : [];

export const selectIsDrawerOpen = (state) => state.cart.isDrawerOpen;

export const selectCartCount = (state, tenantId) => 
  tenantId ? (state.cart.carts[tenantId] || []).reduce((count, item) => count + item.quantity, 0) : 0;

export const selectCartTotal = (state, tenantId) => 
  tenantId ? (state.cart.carts[tenantId] || []).reduce((total, item) => {
    const price = item.variation?.discountedPrice || item.variation?.price || item.discountedPrice || item.price;
    return total + (price * item.quantity);
  }, 0) : 0;

export default cartSlice.reducer;
