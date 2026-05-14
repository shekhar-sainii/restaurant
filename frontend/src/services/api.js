import axios from 'axios';

/**
 * Global Axios Instance for API communication
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token + tenant slug on every request
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem('gourmet_auth');
  if (saved) {
    try {
      const { token } = JSON.parse(saved);
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    } catch (_) {}
  }

  // Inject tenant slug so backend can resolve tenant context
  const tenantSlug = localStorage.getItem('tenant_slug') || 'pizzakings';
  if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug;

  return config;
});

// On 401, clear stale auth from localStorage AND Redux store
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gourmet_auth');
      delete api.defaults.headers.common['Authorization'];
      // Dispatch logout to Redux so UI reflects logged-out state
      // Lazy import to avoid circular dependency
      import('../redux/store').then(({ default: store }) => {
        import('../redux/slices/authSlice').then(({ logout }) => {
          store.dispatch(logout());
        });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
