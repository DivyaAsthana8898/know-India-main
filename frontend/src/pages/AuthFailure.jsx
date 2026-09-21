import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * SECURITY: Predefined safe error messages to prevent XSS attacks
 * Only display known error messages, never raw user input from URL
 */
const SAFE_ERROR_MESSAGES = {
  'auth_failed': 'Authentication failed. Please try again.',
  'access_denied': 'Access was denied. Please try again.',
  'token_expired': 'Your session has expired. Please sign in again.',
  'invalid_token': 'Invalid authentication token.',
  'server_error': 'A server error occurred. Please try again later.',
  'network_error': 'Network error. Please check your connection.',
  'popup_blocked': 'Pop-up was blocked. Please allow pop-ups and try again.',
  'default': 'Authentication failed. Please try again.',
};

const AuthFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  /**
   * SECURITY: Sanitize error parameter to prevent XSS
   * Only allow predefined safe error messages
   */
  const error = useMemo(() => {
    const errorParam = searchParams.get('error');
    
    // If no error param or empty, return default message
    if (!errorParam) {
      return SAFE_ERROR_MESSAGES.default;
    }
    
    // SECURITY: Map to safe predefined messages only
    // Convert to lowercase and remove special characters for matching
    const sanitizedKey = errorParam.toLowerCase().replace(/[^a-z_]/g, '');
    
    // Return safe message or default
    return SAFE_ERROR_MESSAGES[sanitizedKey] || SAFE_ERROR_MESSAGES.default;
  }, [searchParams]);

  useEffect(() => {
    // Redirect to homepage after 4 seconds
    const timer = setTimeout(() => navigate('/'), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Authentication Failed
          </h2>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {/* SECURITY: Display sanitized error message as plain text */}
            {error}
          </p>
          <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Redirecting to homepage...
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthFailure;

