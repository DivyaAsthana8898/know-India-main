import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, MapPin, Trash2, Camera, ArrowRight, 
  Heart, Sparkles, AlertCircle, LogIn, Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
// SECURITY: Removed isAuthenticated import - use AuthContext as single source of truth
import { getBookmarks, getBookmarksSync, removeBookmark, clearAllBookmarks, onBookmarksChange } from '../utils/bookmarks';
import { updateSEO, SEO_CONFIG } from '../utils/seo';
import useGoogleLogin from '../hooks/useGoogleLogin';

const SavedPlaces = () => {
  const { theme } = useTheme();
  // SECURITY: Use AuthContext as single source of truth for authentication
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isDark = theme === 'dark';
  // Use shared login hook for Google OAuth
  const { openGoogleLogin } = useGoogleLogin();
  
  const [bookmarks, setBookmarks] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);

  // SEO: Set page meta tags on mount
  useEffect(() => {
    updateSEO(SEO_CONFIG.saved);
  }, []);

  // Load bookmarks on mount - only after auth state is resolved
  useEffect(() => {
    // SECURITY: Wait for auth state to resolve before loading bookmarks
    if (authLoading) return;
    
    const loadBookmarks = async () => {
      setIsLoading(true);
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        // Fallback to sync version
        setBookmarks(getBookmarksSync());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookmarks();
  }, [isAuthenticated, authLoading]); // FIXED: Use AuthContext as single source

  // Listen for bookmark changes
  useEffect(() => {
    const unsubscribe = onBookmarksChange(async () => {
      const data = await getBookmarks();
      setBookmarks(data);
    });
    return unsubscribe;
  }, []);

  const handleRemove = async (placeId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRemoving(placeId);
    try {
      await removeBookmark(placeId);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await clearAllBookmarks();
      setBookmarks([]);
    } finally {
      setIsLoading(false);
      setShowClearConfirm(false);
    }
  };

  // Use shared login hook - handleGoogleLogin is now openGoogleLogin
  const handleGoogleLogin = openGoogleLogin;

  // SECURITY: Use AuthContext as single source of truth (removed dual check)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-orange-600" />
            <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-amber-600" />
          </>
        ) : (
          <>
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/60 to-amber-200/50 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-200/50 to-orange-200/40 blur-3xl"
            />
          </>
        )}
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-2xl ${
                  isDark ? 'bg-orange-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'
                }`}>
                  <Heart className={isDark ? 'text-orange-400' : 'text-orange-600'} size={28} />
                </div>
                <div>
                  <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Saved Places
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {bookmarks.length} {bookmarks.length === 1 ? 'place' : 'places'} saved
                  </p>
                </div>
              </div>
            </div>

            {bookmarks.length > 0 && isAuthenticated && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setShowClearConfirm(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                }`}
              >
                <Trash2 size={16} />
                Clear All
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Loading State - includes auth loading */}
          {(isLoading || authLoading) ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className={`animate-spin ${isDark ? 'text-orange-400' : 'text-orange-500'}`} size={40} />
            </div>
          ) : !isAuthenticated ? (
            // Not Logged In State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-20 px-4 rounded-3xl ${
                isDark ? 'bg-gray-800/50' : 'bg-white/80 shadow-lg'
              }`}
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <LogIn className={isDark ? 'text-orange-400' : 'text-orange-500'} size={36} />
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sign in to save places
              </h2>
              <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to save your favorite destinations and access them from any device. Your saved places will sync across all your devices.
              </p>
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
              >
                <LogIn size={18} />
                Sign in with Google
              </button>
            </motion.div>
          ) : bookmarks.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {bookmarks.map((place, index) => (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/places/${place.stateSlug}/${place.id}`}
                      className={`group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                        isDark 
                          ? 'bg-gray-800/80 ring-1 ring-gray-700/50 hover:ring-orange-500/30' 
                          : 'bg-white ring-1 ring-gray-200 shadow-lg hover:shadow-xl hover:ring-orange-300'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden">
                        {place.image ? (
                          <img
                            src={place.image}
                            alt={`${place.name} - Tourist destination in ${place.state}, India`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-orange-100 to-amber-100'
                          }`}>
                            <Camera className={isDark ? 'text-gray-600' : 'text-orange-300'} size={40} />
                          </div>
                        )}
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            isDark 
                              ? 'bg-black/60 text-white backdrop-blur-sm' 
                              : 'bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm'
                          }`}>
                            {place.category}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => handleRemove(place.id, e)}
                          disabled={isRemoving === place.id}
                          className={`absolute top-3 right-3 p-2 rounded-xl transition-all ${
                            isDark 
                              ? 'bg-black/50 text-red-400 hover:bg-red-500 hover:text-white backdrop-blur-sm' 
                              : 'bg-white/90 text-red-500 hover:bg-red-500 hover:text-white backdrop-blur-sm shadow-sm'
                          } ${isRemoving === place.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Remove from saved"
                        >
                          {isRemoving === place.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>

                        {/* State name on image */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-sm">
                          <MapPin size={14} />
                          {place.state}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className={`font-bold text-lg mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {place.name}
                        </h3>
                        
                        {place.description && (
                          <p className={`text-sm line-clamp-2 mb-3 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {place.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Saved {new Date(place.addedAt).toLocaleDateString()}
                          </span>
                          <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                            isDark ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-400 group-hover:text-orange-500'
                          }`} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Empty State (logged in but no bookmarks)
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-20 px-4 rounded-3xl ${
                isDark ? 'bg-gray-800/50' : 'bg-white/80 shadow-lg'
              }`}
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-orange-100'
              }`}>
                <Bookmark className={isDark ? 'text-gray-500' : 'text-orange-400'} size={36} />
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No saved places yet
              </h2>
              <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Start exploring India's beautiful destinations and save your favorites for quick access later.
              </p>
              <Link
                to="/places"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
              >
                <Sparkles size={18} />
                Explore Places
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative max-w-sm w-full p-6 rounded-2xl ${
                isDark ? 'bg-gray-900' : 'bg-white'
              } shadow-2xl`}
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <AlertCircle className="text-red-500" size={28} />
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Clear All Saved Places?
              </h3>
              <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                This will remove all {bookmarks.length} saved places. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    'Clear All'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedPlaces;
