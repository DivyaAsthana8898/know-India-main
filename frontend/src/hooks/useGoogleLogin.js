/**
 * useGoogleLogin Hook
 * 
 * Shared hook for Google OAuth login functionality
 * Consolidates duplicated login logic across components
 * 
 * SECURITY:
 * - Uses popup window for OAuth flow
 * - Sets flag for popup detection during cross-domain redirects
 * - Uses centralized API configuration
 * - Prevents duplicate login requests with guards and cooldowns
 * - Rate limit protection on frontend
 */

import { useCallback, useState, useRef } from 'react';
import { API_CONFIG } from '../config';

/**
 * Default popup window dimensions
 */
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;

/**
 * Cooldown period after login attempt (in milliseconds)
 * Prevents rapid re-login attempts that trigger rate limiting
 */
const LOGIN_COOLDOWN_MS = 3000; // 3 seconds

/**
 * Storage keys for login state management
 */
const STORAGE_KEYS = {
  POPUP_ACTIVE: 'auth_popup_active',
  LAST_LOGIN_ATTEMPT: 'auth_last_login_attempt',
  LOGIN_COMPLETE: 'auth_login_complete',
};

/**
 * Hook for initiating Google OAuth login
 * @returns {Object} Login utilities
 */
const useGoogleLogin = () => {
  // SECURITY: Track if login is in progress to prevent duplicate requests
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const popupRef = useRef(null);

  /**
   * Check if we're within the cooldown period
   * @returns {boolean}
   */
  const isInCooldown = useCallback(() => {
    const lastAttempt = sessionStorage.getItem(STORAGE_KEYS.LAST_LOGIN_ATTEMPT);
    if (!lastAttempt) return false;
    
    const elapsed = Date.now() - parseInt(lastAttempt, 10);
    return elapsed < LOGIN_COOLDOWN_MS;
  }, []);

  /**
   * Get remaining cooldown time in seconds
   * @returns {number}
   */
  const getCooldownRemaining = useCallback(() => {
    const lastAttempt = sessionStorage.getItem(STORAGE_KEYS.LAST_LOGIN_ATTEMPT);
    if (!lastAttempt) return 0;
    
    const elapsed = Date.now() - parseInt(lastAttempt, 10);
    const remaining = LOGIN_COOLDOWN_MS - elapsed;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, []);

  /**
   * Open Google OAuth popup window
   * SECURITY: Includes guards against duplicate requests
   * @param {Object} options - Optional configuration
   * @param {number} [options.width] - Popup width
   * @param {number} [options.height] - Popup height
   * @returns {Window|null} Popup window or null if blocked
   */
  const openGoogleLogin = useCallback((options = {}) => {
    // SECURITY: Prevent duplicate login attempts
    if (isLoggingIn) {
      console.warn('Login already in progress');
      return null;
    }

    // SECURITY: Check cooldown to prevent rate limit hits
    if (isInCooldown()) {
      console.warn(`Login cooldown active. Please wait ${getCooldownRemaining()} seconds.`);
      return null;
    }

    // SECURITY: Check if popup is already open
    if (popupRef.current && !popupRef.current.closed) {
      console.warn('Login popup already open');
      popupRef.current.focus();
      return popupRef.current;
    }

    const width = options.width || POPUP_WIDTH;
    const height = options.height || POPUP_HEIGHT;
    
    // Calculate center position
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    // Mark login as in progress
    setIsLoggingIn(true);
    
    // Record login attempt timestamp for cooldown
    sessionStorage.setItem(STORAGE_KEYS.LAST_LOGIN_ATTEMPT, Date.now().toString());
    
    // SECURITY: Set flag to indicate a popup login is in progress
    // This helps AuthSuccess detect it's in a popup even if window.opener is lost
    // during cross-domain OAuth redirects
    localStorage.setItem(STORAGE_KEYS.POPUP_ACTIVE, Date.now().toString());
    
    // Open Google OAuth in a popup window
    const popup = window.open(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_GOOGLE}`,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    popupRef.current = popup;

    // Monitor popup closure to reset state
    if (popup) {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoggingIn(false);
          popupRef.current = null;
        }
      }, 500);

      // Cleanup interval after 5 minutes (max login time)
      setTimeout(() => {
        clearInterval(checkClosed);
        setIsLoggingIn(false);
      }, 5 * 60 * 1000);
    } else {
      // Popup was blocked
      setIsLoggingIn(false);
      localStorage.removeItem(STORAGE_KEYS.POPUP_ACTIVE);
    }
    
    return popup;
  }, [isLoggingIn, isInCooldown, getCooldownRemaining]);

  /**
   * Clear any stale popup flags and reset login state
   * Call this on component cleanup or when popup closes unexpectedly
   */
  const clearPopupFlag = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.POPUP_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.LOGIN_COMPLETE);
    setIsLoggingIn(false);
    popupRef.current = null;
  }, []);

  /**
   * Clear all auth-related storage (call on logout)
   */
  const clearAllAuthStorage = useCallback(() => {
    // Clear localStorage items
    localStorage.removeItem(STORAGE_KEYS.POPUP_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.LOGIN_COMPLETE);
    localStorage.removeItem('auth_token');
    
    // Clear sessionStorage items
    sessionStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_ATTEMPT);
    
    // Reset state
    setIsLoggingIn(false);
    popupRef.current = null;
  }, []);

  /**
   * Check if a popup login is in progress
   * @returns {boolean}
   */
  const isPopupActive = useCallback(() => {
    const timestamp = localStorage.getItem(STORAGE_KEYS.POPUP_ACTIVE);
    if (!timestamp) return false;
    
    // Consider popup stale after 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const popupTimestamp = parseInt(timestamp, 10);
    
    if (popupTimestamp < fiveMinutesAgo) {
      // Clean up stale flag
      localStorage.removeItem(STORAGE_KEYS.POPUP_ACTIVE);
      return false;
    }
    
    return true;
  }, []);

  /**
   * Mark login as complete (call from AuthSuccess)
   */
  const markLoginComplete = useCallback(() => {
    setIsLoggingIn(false);
    localStorage.removeItem(STORAGE_KEYS.POPUP_ACTIVE);
    sessionStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_ATTEMPT);
  }, []);

  return {
    openGoogleLogin,
    clearPopupFlag,
    clearAllAuthStorage,
    isPopupActive,
    isLoggingIn,
    isInCooldown,
    getCooldownRemaining,
    markLoginComplete,
  };
};

export default useGoogleLogin;
