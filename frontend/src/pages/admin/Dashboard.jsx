import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Utensils, 
  ArrowUpRight, 
  Plus, 
  Download,
  MoreVertical,
  CreditCard,
  Package,
  Trello,
  Loader2
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.fetchOrders()
      ]);
      setData(statsRes.data);
      setRecentOrders(ordersRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const stats = [
    { name: "Today's Revenue", value: `₹${data?.todayRevenue || 0}`, icon: TrendingUp, change: `Total: ₹${data?.totalRevenue || 0}`, color: 'text-green-500' },
    { name: "Orders (Today)", value: data?.todayOrders || 0, icon: ShoppingBag, change: `Total: ${data?.totalOrders || 0}`, color: 'text-primary' },
    { name: 'Active Orders', value: data?.activeOrders || 0, icon: Trello, change: 'In Progress', color: 'text-blue-500' },
    { name: 'Table Status', value: `${data?.occupiedTables || 0}/${data?.totalTables || 0}`, icon: Utensils, change: 'Occupied', color: 'text-purple-500' },
  ];

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Gathering Culinary Data...</p>
      </div>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="space-y-10 pb-10">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.name}
            className="glass p-6 rounded-3xl relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/20 transition-all">
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded bg-white/5 ${stat.color} flex items-center gap-1 uppercase tracking-widest`}>
                 {stat.change}
              </span>
            </div>
            
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</h3>
            <p className="text-3xl font-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Table */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] shadow-2xl border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-playfair font-bold">Recent Gastronomic Activity</h2>
            <Link to="/admin/order-mgmt" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="space-y-4">
            {data?.recentActivity?.map((activity, idx) => (
              <motion.div 
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {activity.userId?.image ? (
                      <img src={`${API_URL.split('/api')[0]}${activity.userId.image}`} className="w-full h-full object-cover" />
                    ) : (
                      activity.userId?.name?.charAt(0) || activity.guestName?.charAt(0) || 'G'
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">#{activity.orderNumber.slice(-6)} <span className="text-text-muted font-normal">placed by</span> {activity.userId?.name || activity.guestName || 'Guest'}</h4>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">{new Date(activity.createdAt).toLocaleTimeString()} • {activity.items?.length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-black">₹{activity.totalAmount}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                        activity.orderStatus === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
                    }`}>
                        {activity.orderStatus}
                    </span>
                </div>
              </motion.div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <div className="py-10 text-center text-text-muted text-xs uppercase tracking-widest">
                Waiting for the next order...
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Insights */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-lg font-bold mb-6 font-playfair tracking-wide">Table Capacity</h2>
            <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(data?.occupiedTables / data?.totalTables) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-primary/40 shadow-[0_0_15px_rgba(201,162,39,0.8)]" 
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] font-black uppercase text-text-muted tracking-widest">
                {data?.occupiedTables} of {data?.totalTables} tables filled
              </span>
              <span className="text-[9px] font-black uppercase text-primary">
                {Math.round((data?.occupiedTables / data?.totalTables) * 100 || 0)}%
              </span>
            </div>
          </div>

          <div className="glass p-8 rounded-[2rem] bg-primary/5 border border-primary/10 shadow-2xl">
            <h2 className="text-lg font-bold mb-6 font-playfair flex items-center gap-2">
               <TrendingUp className="text-primary" size={20} />
               Trending Now
            </h2>
            <div className="space-y-5">
                {data?.trendingProducts?.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-black text-primary">
                                #{idx + 1}
                            </div>
                            <span className="text-xs font-bold text-white/80">{product._id}</span>
                        </div>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{product.count} Sold</span>
                    </div>
                ))}
                {(!data?.trendingProducts || data.trendingProducts.length === 0) && (
                    <p className="text-xs text-text-muted italic">Orders will define trends.</p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/product-mgmt" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-primary/40 transition-all group">
                <Plus size={24} className="text-text-muted group-hover:text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-center">Add Menu Item</span>
              </Link>
              <Link to="/admin/table-mgmt" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-primary/40 transition-all group">
                <Utensils size={24} className="text-text-muted group-hover:text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-center">Manage Tables</span>
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
