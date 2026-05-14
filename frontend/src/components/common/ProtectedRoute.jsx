import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { selectAuth } from '../../redux/slices/authSlice';
import Loader from './Loader';

/**
 * ProtectedRoute Component
 * Guards routes based on authentication and user roles.
 * Supports both wrapper usage and Route element usage via Outlet.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector(selectAuth);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const roles = allowedRoles; // Aligned with App.jsx prop name
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
