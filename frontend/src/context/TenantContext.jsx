import { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resolveTheme, applyThemeToDom } from '../config/themes.config';

const TenantContext = createContext(null);

export const useTenant = () => useContext(TenantContext) || { tenant: null, slug: localStorage.getItem('tenant_slug') || '', theme: null };

export const TenantProvider = ({ children }) => {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const [tenant, setTenant]   = useState(null);
  const [theme, setTheme]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!slug) return;

    localStorage.setItem('tenant_slug', slug);

    axios.get(`/api/v1/public/tenants/${slug}/config`)
      .then(r => {
        const tenantData = r.data.data;
        setTenant(tenantData);

        // Resolve full theme (business defaults + tenant overrides)
        const resolvedTheme = resolveTheme(tenantData);
        setTheme(resolvedTheme);

        // Apply to DOM
        applyThemeToDom(resolvedTheme);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setError('Store not found');
          navigate('/');
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm font-black uppercase tracking-widest">Entering Ritual...</p>
        </div>
      </div>
    );
  }

  if (error) return null;

  return (
    <TenantContext.Provider value={{ tenant, slug, theme }}>
      {children}
    </TenantContext.Provider>
  );
};
