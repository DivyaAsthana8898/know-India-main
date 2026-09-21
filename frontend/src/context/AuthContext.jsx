import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { isTokenExpired, getUserFromToken } from '../utils/jwt';
import { API_CONFIG } from '../config';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';

/**
 * SECURITY: Auth provider with HttpOnly cookie support
 * - Primary auth via HttpOnly cookie (set by backend, not accessible to JS)
 * - Falls back to localStorage for backward compatibility during transition
 * - User data fetched from /auth/status which reads the cookie
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  /**
   * SECURITY: Fetch user from backend using HttpOnly cookie auth
   * Backend will read the auth_token cookie automatically
   * PERFORMANCE: Memoized with useCallback
   */
  const fetchUserFromCookie = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/auth/status`, {
        method: 'GET',
        credentials: 'include', // SECURITY: Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking auth status:', err);
      return false;
    }
  }, []);

  /**
   * SECURITY: Fetch CSRF token for state-changing operations
   * PERFORMANCE: Memoized with useCallback
   */
  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // SECURITY: First try to authenticate via HttpOnly cookie
      const cookieAuth = await fetchUserFromCookie();
      
      if (cookieAuth) {
        // Fetch CSRF token for protected operations
        await fetchCsrfToken();
        setIsLoading(false);
        return;
      }
      
      // SECURITY: Fallback to localStorage for backward compatibility
      // This will be removed in future versions
      const storedToken = localStorage.getItem(TOKEN_KEY);
      
      if (storedToken && !isTokenExpired(storedToken)) {
        const userInfo = getUserFromToken(storedToken);
        
        if (userInfo) {
          setUser(userInfo);
          await fetchCsrfToken();
        }
      } else if (storedToken) {
        // Token exists but is expired, clean up
        localStorage.removeItem(TOKEN_KEY);
      }
      
      setIsLoading(false);
    };
    
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Login user with JWT token (from OAuth callback)
   * SECURITY: Token is also set as HttpOnly cookie by backend
   * PERFORMANCE: Memoized with useCallback
   * @param {string} newToken - JWT token from OAuth redirect
   */
  const login = useCallback(async (newToken) => {
    if (!newToken || isTokenExpired(newToken)) {
      console.error('Invalid or expired token');
      return false;
    }

    // SECURITY: Store in localStorage only as fallback
    // Primary auth is via HttpOnly cookie set by backend
    localStorage.setItem(TOKEN_KEY, newToken);
    
    // Fetch full user data from backend (uses cookie auth)
    const success = await fetchUserFromCookie();
    
    if (success) {
      await fetchCsrfToken();
      return true;
    }
    
    // Fallback: decode token if cookie auth fails
    const userInfo = getUserFromToken(newToken);
    if (userInfo) {
      setUser(userInfo);
      return true;
    }
    
    return false;
  }, [fetchUserFromCookie, fetchCsrfToken]);

  /**
   * Logout user and clear auth state
   * SECURITY: Calls backend to clear HttpOnly cookie
   * SECURITY: Clears ALL auth-related storage to prevent stale state
   * PERFORMANCE: Memoized with useCallback
   */
  const logout = useCallback(async () => {
    try {
      // SECURITY: Call backend to clear HttpOnly cookie and blacklist token
      await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // SECURITY: Include cookies
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // SECURITY: Clear ALL auth-related storage to prevent stale state
    // This prevents "Too many auth attempts" errors on quick re-login
    
    // Clear localStorage items
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('auth_popup_active');
    localStorage.removeItem('auth_login_complete');
    
    // Clear sessionStorage items (login cooldown, etc.)
    sessionStorage.removeItem('auth_last_login_attempt');
    
    // Reset React state
    setUser(null);
    setCsrfToken(null);
  }, [csrfToken]);

  /**
   * Update user data (e.g., after profile settings change)
   * PERFORMANCE: Memoized with useCallback
   * @param {Object} updatedUser - Updated user data from API
   */
  const updateUser = useCallback((updatedUser) => {
    if (updatedUser) {
      setUser(prev => ({
        ...prev,
        ...updatedUser,
      }));
    }
  }, []);

  /**
   * SECURITY: Get headers for API requests including CSRF token
   * Memoized with useCallback to prevent infinite re-renders when used in dependency arrays
   */
  const getAuthHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // SECURITY: Include Authorization header as fallback
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    
    return headers;
  }, [csrfToken]);

  // PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    csrfToken,
    login,
    logout,
    updateUser,
    getAuthHeaders,
    refetchUser: fetchUserFromCookie,
  }), [user, isLoading, csrfToken, login, logout, updateUser, getAuthHeaders, fetchUserFromCookie]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;

