import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Check, LogIn } from 'lucide-react';
import { isBookmarked, toggleBookmark, onBookmarksChange } from '../utils/bookmarks';
import { useTheme } from '../context/ThemeContext';
import useGoogleLogin from '../hooks/useGoogleLogin';

/**
 * BookmarkButton Component
 * A reusable button to bookmark/unbookmark places
 * Requires user to be logged in to save places
 * 
 * @param {Object} props
 * @param {Object} props.place - The place object to bookmark
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.variant - Style variant: 'icon' | 'button' | 'card'
 * @param {string} props.className - Additional CSS classes
 */
const BookmarkButton = ({ 
  place, 
  size = 'md', 
  variant = 'icon',
  className = '' 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // SECURITY: Use shared login hook for consistent OAuth flow
  const { openGoogleLogin } = useGoogleLogin();
  const [bookmarked, setBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'login'
  const [isLoading, setIsLoading] = useState(false);

  // Check initial bookmark status
  useEffect(() => {
    if (place?.id) {
      setBookmarked(isBookmarked(place.id));
    }
  }, [place?.id]);

  // Listen for bookmark changes from other components
  useEffect(() => {
    const unsubscribe = onBookmarksChange((detail) => {
      if (detail.action === 'add' && detail.place?.id === place?.id) {
        setBookmarked(true);
      } else if (detail.action === 'remove' && detail.placeId === place?.id) {
        setBookmarked(false);
      } else if (detail.action === 'clear') {
        setBookmarked(false);
      }
    });
    return unsubscribe;
  }, [place?.id]);

  // SECURITY: Use shared hook instead of duplicate login logic
  const handleGoogleLogin = openGoogleLogin;

  const handleClick = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!place?.id || isLoading) return;

    setIsLoading(true);
    
    try {
      const result = await toggleBookmark(place);
      
      if (result.requiresLogin) {
        // User needs to login
        setToastType('login');
        setToastMessage('Sign in to save places');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setBookmarked(result.newStatus);
        setToastType('success');
        setToastMessage(result.newStatus ? 'Added to saved places!' : 'Removed from saved');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setToastType('success');
      setToastMessage('Something went wrong');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [place, isLoading]);

  // Size configurations
  const sizeConfig = {
    sm: { icon: 14, padding: 'p-1.5', text: 'text-xs' },
    md: { icon: 18, padding: 'p-2', text: 'text-sm' },
    lg: { icon: 22, padding: 'p-3', text: 'text-base' },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Variant styles
  const getVariantStyles = () => {
    if (variant === 'card') {
      // For use on place cards - subtle overlay style
      return bookmarked
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
        : isDark
          ? 'bg-black/50 text-white hover:bg-orange-500 backdrop-blur-sm'
          : 'bg-white/90 text-gray-700 hover:bg-orange-500 hover:text-white backdrop-blur-sm shadow-sm';
    }
    
    if (variant === 'button') {
      // For use as a full button with text
      return bookmarked
        ? isDark
          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          : 'bg-orange-100 text-orange-600 border border-orange-200'
        : isDark
          ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-orange-500/50 hover:text-orange-400'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500';
    }
    
    // Default icon variant
    return bookmarked
      ? isDark
        ? 'text-orange-400 hover:text-orange-300'
        : 'text-orange-500 hover:text-orange-600'
      : isDark
        ? 'text-gray-400 hover:text-orange-400'
        : 'text-gray-500 hover:text-orange-500';
  };

  // Toast component for login prompt
  const renderToast = () => (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className={`absolute ${variant === 'button' ? 'top-full left-1/2 -translate-x-1/2' : 'top-full right-0'} mt-2 rounded-lg text-xs font-medium whitespace-nowrap z-50 ${
            isDark ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
          } shadow-lg overflow-hidden`}
        >
          {toastType === 'login' ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <LogIn size={12} />
                {toastMessage}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoogleLogin();
                  setShowToast(false);
                }}
                className="w-full px-3 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Check size={12} />
              {toastMessage}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (variant === 'button') {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          disabled={isLoading}
          className={`flex items-center gap-2 ${config.padding} px-4 rounded-xl font-medium transition-all duration-200 ${getVariantStyles()} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={bookmarked ? 'Remove from saved places' : 'Save this place'}
        >
          <motion.div
            initial={false}
            animate={{ 
              scale: bookmarked ? [1, 1.3, 1] : 1,
              rotate: bookmarked ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <Bookmark 
              size={config.icon} 
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </motion.div>
          <span className={config.text}>
            {bookmarked ? 'Saved' : 'Save'}
          </span>
        </motion.button>
        
        {renderToast()}
      </div>
    );
  }

  // Icon or Card variant
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={isLoading}
        className={`${config.padding} rounded-xl transition-all duration-200 ${getVariantStyles()} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={bookmarked ? 'Remove from saved places' : 'Save this place'}
      >
        <motion.div
          initial={false}
          animate={{ 
            scale: bookmarked ? [1, 1.4, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark 
            size={config.icon} 
            fill={bookmarked ? 'currentColor' : 'none'}
            strokeWidth={bookmarked ? 2.5 : 2}
          />
        </motion.div>
      </motion.button>
      
      {renderToast()}
    </div>
  );
};

export default BookmarkButton;
