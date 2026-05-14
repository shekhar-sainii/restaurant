import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ChevronRight, Pizza, Leaf, ShoppingBag, Cake } from 'lucide-react';
import axios from 'axios';

const BUSINESS_ICONS = {
  RESTAURANT:  { icon: Pizza,       color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  HONEY_STORE: { icon: Leaf,        color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20'  },
  BAKERY:      { icon: Cake,        color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/20'   },
  GROCERY:     { icon: ShoppingBag, color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20'  },
  CUSTOM:      { icon: Store,       color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
};

const TenantLanding = () => {
  const navigate  = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/public/tenants')
      .then(r => setTenants(r.data.data || []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (tenant) => {
    localStorage.setItem('tenant_slug', tenant.slug);
    navigate(`/${tenant.slug}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Store size={30} className="text-primary" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-white mb-3">Welcome</h1>
          <p className="text-text-muted">Select a store to continue</p>
        </div>

        {/* Tenant Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center text-text-muted py-12">
            <Store size={40} className="mx-auto mb-4 opacity-30" />
            <p>No stores available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenants.map((tenant, i) => {
              const cfg = BUSINESS_ICONS[tenant.businessType] || BUSINESS_ICONS.CUSTOM;
              const Icon = cfg.icon;
              return (
                <motion.button
                  key={tenant.tenantId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSelect(tenant)}
                  className={`glass p-6 rounded-3xl border ${cfg.border} hover:scale-[1.02] transition-all text-left group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon size={22} className={cfg.color} />
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-colors mt-1" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{tenant.businessName}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                    {tenant.businessType.replace('_', ' ')}
                  </p>
                  <p className="text-[11px] text-text-muted mt-2">/{tenant.slug}</p>
                </motion.button>
              );
            })}
          </div>
        )}

        <p className="text-center text-[10px] text-text-muted mt-10 uppercase tracking-widest">
          Powered by DineSync Platform
        </p>
      </motion.div>
    </div>
  );
};

export default TenantLanding;
