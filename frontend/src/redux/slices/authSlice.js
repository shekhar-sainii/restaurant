import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

/**
 * Async Thunk for User Login
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      const { user, accessToken } = response.data;

      authService.setToken(accessToken);

      // Set tenant slug so all subsequent API calls go to the correct tenant DB
      if (user?.tenantId) {
        localStorage.setItem('tenant_slug', user.tenantId);
      }

      return { user, token: accessToken };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Authentication failed'
      );
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(credential);
      const { user, accessToken } = response.data;
      authService.setToken(accessToken);
      if (user?.tenantId) localStorage.setItem('tenant_slug', user.tenantId);
      return { user, token: accessToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Google Authentication failed');
    }
  }
);

// Initial state - loading from localStorage if it exists
const savedAuth = localStorage.getItem('gourmet_auth');
const initialState = savedAuth ? JSON.parse(savedAuth) : {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// If there's a saved token, set it in the service headers immediately
if (initialState.token) {
  authService.setToken(initialState.token);
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    setCredentials: (state, action) => {
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.token) state.token = action.payload.token;
      
      // Update localStorage
      localStorage.setItem('gourmet_auth', JSON.stringify({
        user: state.user,
        token: state.token,
        isAuthenticated: true
      }));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.setToken(null);
      localStorage.removeItem('gourmet_auth');
      localStorage.removeItem('tenant_slug'); // clear tenant context on logout
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        // Persist to localStorage
        localStorage.setItem('gourmet_auth', JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true
        }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Google Login
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { loginSuccess, logout, clearAuthError, setCredentials } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN';

export default authSlice.reducer;
