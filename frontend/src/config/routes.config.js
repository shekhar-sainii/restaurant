import { lazy } from 'react';

/**
 * Route Configuration Object
 * Each route has:
 * - path: URL path
 * - component: Lazy loaded component
 * - layout: 'main' (Navbar only) or 'admin' (Sidebar + Navbar)
 * - isProtected: Boolean
 * - roles: Array of allowed roles
 */
export const ROUTES = [
  // Public Routes
  {
    path: '/',
    component: lazy(() => import('../pages/public/RestaurantList')),
    layout: 'main',
    isProtected: false,
  },
  {
    path: '/login',
    component: lazy(() => import('../pages/auth/Login')),
    layout: 'main',
    isProtected: false,
  },
  {
    path: '/register',
    component: lazy(() => import('../pages/auth/Register')),
    layout: 'main',
    isProtected: false,
  },
  {
    path: '/reset-password',
    component: lazy(() => import('../pages/auth/ResetPassword')),
    layout: 'main',
    isProtected: false,
  },

  // User Protected Routes (Shared across auth)
  {
    path: '/profile',
    component: lazy(() => import('../pages/consumer/Profile')),
    layout: 'main',
    isProtected: true,
    roles: ['USER', 'ADMIN'],
  },
  {
    path: '/orders',
    component: lazy(() => import('../pages/consumer/Orders')),
    layout: 'main',
    isProtected: true,
    roles: ['USER', 'ADMIN'],
  },

  // Admin Protected Routes
  {
    path: '/admin/dashboard',
    component: lazy(() => import('../pages/admin/Dashboard')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN', 'KITCHEN', 'DELIVERY'],
  },
  {
    path: '/admin/order-mgmt',
    component: lazy(() => import('../pages/admin/OrderMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN', 'KITCHEN', 'DELIVERY'],
  },
  {
    path: '/admin/terminal',
    component: lazy(() => import('../pages/admin/KitchenDelivery')),
    layout: 'admin',
    isProtected: true,
    roles: ['KITCHEN', 'DELIVERY'],
  },
  {
    path: '/admin/product-mgmt',
    component: lazy(() => import('../pages/admin/ProductMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/category-mgmt',
    component: lazy(() => import('../pages/admin/CategoryMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/table-mgmt',
    component: lazy(() => import('../pages/admin/TableMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/user-mgmt',
    component: lazy(() => import('../pages/admin/UserMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/payment-mgmt',
    component: lazy(() => import('../pages/admin/PaymentMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/staff-mgmt',
    component: lazy(() => import('../pages/admin/StaffMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/branding',
    component: lazy(() => import('../pages/admin/BrandingSettings')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN'],
  },
  {
    path: '/admin/chat',
    component: lazy(() => import('../pages/admin/StaffChat')),
    layout: 'admin',
    isProtected: true,
    roles: ['ADMIN', 'KITCHEN', 'DELIVERY'],
  },
  {
    path: '/super-admin/dashboard',
    component: lazy(() => import('../pages/superadmin/SuperAdminDashboard')),
    layout: 'admin',
    isProtected: true,
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/super-admin/tenants',
    component: lazy(() => import('../pages/superadmin/TenantMgmt')),
    layout: 'admin',
    isProtected: true,
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/super-admin/branding',
    component: lazy(() => import('../pages/superadmin/PlatformBranding')),
    layout: 'admin',
    isProtected: true,
    roles: ['SUPER_ADMIN'],
  },
];
