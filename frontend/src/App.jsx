import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Config
import { ROUTES } from './config/routes.config';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

// Tenant
import { TenantProvider } from './context/TenantContext';
import TenantRouter from './pages/tenant/TenantRouter';

// Super Admin (lazy)
const SuperAdminLogin     = lazy(() => import('./pages/super-admin/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard'));

// Landing
const TenantLanding = lazy(() => import('./pages/public/TenantLanding'));

// Reserved slugs that must NOT be treated as tenant slugs
const RESERVED_SLUGS = new Set([
  'super-admin', 'admin', 'login', 'register', 'menu', 'cart',
  'checkout', 'orders', 'profile', 'about', 'unauthorized', 'health', 'reset-password',
]);

// Guard: only render TenantProvider for non-reserved slugs
const TenantSlugGuard = () => {
  const { slug } = useParams();
  if (RESERVED_SLUGS.has(slug)) {
    return <Navigate to="/" replace />;
  }
  return (
    <TenantProvider>
      <TenantRouter />
    </TenantProvider>
  );
};

function App() {
  const renderRoutes = () => {
    const publicRoutes    = ROUTES.filter(r => !r.isProtected);
    const protectedRoutes = ROUTES.filter(r => r.isProtected);

    return (
      <>
        {/* PUBLIC ROUTES (existing restaurant at root) */}
        <Route element={<MainLayout />}>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Route>

        {/* PROTECTED ROUTES */}
        {protectedRoutes.map((route) => (
          <Route key={route.path} element={<ProtectedRoute allowedRoles={route.roles} />}>
            <Route element={route.layout === 'admin' ? <AdminLayout /> : <MainLayout />}>
              <Route path={route.path} element={<route.component />} />
            </Route>
          </Route>
        ))}

        {/* Admin redirect */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Tenant storefront — /:slug/* */}
        <Route path="/:slug/*" element={<TenantSlugGuard />} />
      </>
    );
  };

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Super Admin — registered FIRST, before any wildcard routes */}
            <Route path="/super-admin/login"     element={<SuperAdminLogin />} />
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/*"         element={<Navigate to="/super-admin/login" replace />} />

            {renderRoutes()}

            <Route path="/unauthorized" element={<div className="p-20 text-white">403 - Unauthorized</div>} />
            <Route path="*" element={<div className="p-20 text-white text-center h-screen flex items-center justify-center">404 - Page Not Found</div>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Router>
  );
}

export default App;
