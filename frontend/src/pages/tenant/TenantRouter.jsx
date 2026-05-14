/**
 * TenantRouter — slug-based routing for all tenant storefronts.
 * Uses ONE TenantStorefront component for all business types.
 * Business-specific rendering is handled inside TenantStorefront.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import Loader from '../../components/common/Loader';
import GuestGuard from '../../components/tenant/GuestGuard';
import TenantLayout from '../../components/tenant/TenantLayout';

const TenantStorefront = lazy(() => import('./TenantStorefront'));
const About            = lazy(() => import('../public/About'));
const Cart             = lazy(() => import('../consumer/Cart'));
const Checkout         = lazy(() => import('../consumer/Checkout'));
const Orders           = lazy(() => import('../consumer/Orders'));
const Login            = lazy(() => import('../auth/Login'));
const Register         = lazy(() => import('../auth/Register'));

const TenantRouter = () => {
  const { tenant } = useTenant();
  const { slug }   = useParams();

  if (!tenant) return null;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<TenantLayout />}>
          {/* Storefront — same component, different rendering per businessType */}
          <Route index          element={<TenantStorefront />} />
          <Route path="menu"    element={<TenantStorefront />} />
          <Route path="about"   element={<About />} />

          {/* Auth */}
          <Route path="login"    element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Protected by GuestGuard */}
          <Route path="cart"     element={<GuestGuard><Cart /></GuestGuard>} />
          <Route path="checkout" element={<GuestGuard><Checkout /></GuestGuard>} />
          <Route path="orders"   element={<GuestGuard><Orders /></GuestGuard>} />
        </Route>
        <Route path="*" element={<Navigate to={`/${slug}`} replace />} />
      </Routes>
    </Suspense>
  );
};

export default TenantRouter;
