import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, TrendingUp, ShoppingBag, LayoutDashboard, Loader2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/v1/super-admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch platform stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading Root Metrics</p>
      </div>
    );
  }

  const kpis = [
    { name: "Total Tenants", value: stats?.totalTenants || 0, icon: Store, change: `${stats?.activeTenants || 0} Active`, color: "text-blue-500" },
    { name: "Global Revenue", value: `₹${stats?.totalRevenue || 0}`, icon: TrendingUp, change: "All Time", color: "text-green-500" },
    { name: "Global Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, change: "All Time", color: "text-primary" }
  ];

  return (
    <div className="space-y-10 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-white mb-2">Platform Control Hub</h1>
          <p className="text-text-muted text-xs uppercase tracking-widest font-black">Super Admin Metrics Overview</p>
        </div>
        <Link to="/super-admin/tenants" className="bg-primary text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl">
          Manage Tenants
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.name}
            className="glass p-6 rounded-[2rem] relative overflow-hidden group shadow-2xl border border-white/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/20 transition-all">
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded bg-white/5 ${stat.color} uppercase tracking-widest`}>
                {stat.change}
              </span>
            </div>

            <h3 className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-2">{stat.name}</h3>
            <p className="text-4xl font-black text-white font-playfair">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tenant Standings */}
      <div className="glass p-8 rounded-[2.5rem] shadow-2xl border border-white/5">
        <h2 className="text-xl font-playfair font-bold mb-8">Top Performing Tenants</h2>
        <div className="space-y-4">
          {stats?.tenantStats?.map((tenant, idx) => (
            <motion.div
              key={tenant._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider">{tenant._id}</h4>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{tenant.orders} Total Orders Processed</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white font-playfair flex items-center gap-2">
                  ₹{tenant.revenue} <ArrowUpRight size={16} className="text-green-500" />
                </span>
              </div>
            </motion.div>
          ))}
          {(!stats?.tenantStats || stats.tenantStats.length === 0) && (
            <div className="py-10 text-center text-text-muted text-xs uppercase font-black tracking-widest">
              No active tenants generating revenue yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
