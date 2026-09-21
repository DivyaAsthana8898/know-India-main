import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../config';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState('processing');
  const hasProcessed = useRef(false);
  
  /**
   * Check if this page is opened in a popup
   * Uses multiple detection methods for reliability:
   * 1. window.opener reference (may be lost during cross-domain redirects)
   * 2. localStorage flag set by parent window before opening popup
   */
  const checkIsPopup = useCallback(() => {
    // Method 1: Check window.opener (reliable if same origin)
    if (window.opener && window.opener !== window) {
      return true;
    }
    
    // Method 2: Check localStorage flag (survives cross-domain redirects)
    const popupTimestamp = localStorage.getItem('auth_popup_active');
    if (popupTimestamp) {
      const timestamp = parseInt(popupTimestamp, 10);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      // Flag is valid if set within the last 5 minutes
      if (timestamp > fiveMinutesAgo) {
        return true;
      }
      // Flag is stale, clean it up
      localStorage.removeItem('auth_popup_active');
    }
    
    return false;
  }, []);
  
  const isPopup = checkIsPopup();
  
  /**
   * Get parent origin for postMessage (handle cross-origin OAuth flow)
   * SECURITY: Returns specific origin when possible, '*' as fallback for known safe messages
   */
  const getParentOrigin = useCallback(() => {
    try {
      // Try to get parent origin directly
      if (window.opener?.location?.origin) {
        return window.opener.location.origin;
      }
    } catch (e) {
      // Cross-origin access blocked - use current origin as fallback
    }
    // Use current origin (popup and parent should be same origin after OAuth redirect)
    return window.location.origin;
  }, []);
  
  /**
   * Notify parent window and close popup
   * Uses multiple methods for reliability
   */
  const notifyParentAndClose = useCallback((success) => {
    const messageType = success ? 'AUTH_SUCCESS' : 'AUTH_ERROR';
    
    // Method 1: Try postMessage if window.opener exists
    if (window.opener && window.opener !== window) {
      try {
        window.opener.postMessage({ type: messageType }, getParentOrigin());
      } catch (e) {
        console.error('Failed to send postMessage:', e);
      }
    }
    
    // Method 2: Use localStorage event as fallback (triggers storage event in parent)
    if (success) {
      localStorage.setItem('auth_login_complete', 'true');
    }
    
    // Clear the popup flag
    localStorage.removeItem('auth_popup_active');
    
    // Close the popup window
    setTimeout(() => {
      window.close();
      
      // If window.close() didn't work (some browsers block it),
      // show a message to the user
      setTimeout(() => {
        if (!window.closed) {
          setStatus('close_manually');
        }
      }, 500);
    }, success ? 800 : 1500);
  }, [getParentOrigin]);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return;
    
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      if (isPopup) {
        // Notify parent and close popup
        notifyParentAndClose(false);
      } else {
        setTimeout(() => navigate('/'), 3000);
      }
      return;
    }

    hasProcessed.current = true;

    // Process authentication asynchronously
    const processAuth = async () => {
      try {
        // Attempt to login with the token (await the async function)
        const success = await login(token);

        if (success) {
          setStatus('success');
          
          // Fetch user profile to get name and avatar
          try {
            const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_SETTINGS}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
            });
            const data = await res.json();
            
            if (data.user) {
              updateUser({
                name: data.user.name,
                avatar: data.user.avatar,
              });
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
          }
          
          // If in popup, notify parent and close
          if (isPopup) {
            notifyParentAndClose(true);
          } else {
            // If not in popup, redirect to places page after brief success message
            setTimeout(() => {
              navigate('/places', { replace: true });
            }, 1500);
          }
        } else {
          throw new Error('Login failed');
        }
      } catch (err) {
        console.error('Auth error:', err);
        setStatus('error');
        if (isPopup) {
          notifyParentAndClose(false);
        } else {
          setTimeout(() => navigate('/'), 3000);
        }
      }
    };

    processAuth();
  }, [searchParams, login, navigate, updateUser, isPopup, notifyParentAndClose]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Signing you in...
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we complete your authentication.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome back!
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isPopup 
                ? 'Sign in successful! This window will close automatically...'
                : 'You have been successfully signed in. Redirecting...'
              }
            </p>
          </div>
        )}

        {status === 'error' && (
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
              {isPopup 
                ? 'Something went wrong. This window will close...'
                : 'Something went wrong. Redirecting to homepage...'
              }
            </p>
          </div>
        )}

        {status === 'close_manually' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sign in Successful!
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You can now close this window and return to the main site.
            </p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess;

