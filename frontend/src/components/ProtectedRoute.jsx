/**
 * ProtectedRoute Component
 * 
 * SECURITY: Wraps routes that require authentication
 * - Waits for auth state to resolve before rendering
 * - Redirects unauthenticated users to homepage
 * - Shows loading state during auth resolution
 * - Prevents flash of protected content
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute wrapper component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} [props.redirectTo='/'] - Path to redirect unauthenticated users
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();

  // SECURITY: Show loading state while auth is resolving
  // This prevents flash of protected content
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // SECURITY: Redirect unauthenticated users
  if (!isAuthenticated) {
    // Store the attempted location for potential redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User is authenticated, render children
  return children;
};

export default ProtectedRoute;
