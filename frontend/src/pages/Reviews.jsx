import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../config';
import ReviewCard from '../components/ReviewCard';
import {
  Loader2,
  LogIn,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

const Reviews = () => {
  // SECURITY: Use getAuthHeaders for API calls - JWT is now in HttpOnly cookie
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Posts state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [userVotes, setUserVotes] = useState({});
  const [votingInProgress, setVotingInProgress] = useState({});

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Login prompt modal state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Track if component is mounted
  const isMounted = useRef(true);
  const getAuthHeadersRef = useRef(getAuthHeaders);

  useEffect(() => {
    getAuthHeadersRef.current = getAuthHeaders;
  }, [getAuthHeaders]);

  // Fetch posts and user votes
  useEffect(() => {
    isMounted.current = true;

    const fetchUserVotes = async (postsData, authHeaders) => {
      const votePromises = postsData.map(async (post) => {
        try {
          const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/${post.id}/vote`,
            {
              headers: authHeaders,
              credentials: 'include',
            }
          );
          const data = await response.json();
          if (response.ok && data.userVote) {
            return { postId: post.id, vote: data.userVote };
          }
          return null;
        } catch (err) {
          console.error('Error fetching vote for post:', post.id, err);
          return null;
        }
      });

      const results = await Promise.all(votePromises);
      const votes = {};
      results.forEach((result) => {
        if (result) {
          votes[result.postId] = result.vote;
        }
      });
      return votes;
    };

    const fetchPosts = async () => {
      if (isMounted.current) {
        setError(null);
      }

      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.warn('Failed to fetch reviews, status:', response.status);
          if (isMounted.current) {
            setError(`Unable to load reviews (Error ${response.status}). Please try again.`);
            setPosts([]);
          }
          return;
        }

        const data = await response.json();

        if (isMounted.current) {
          const fetchedPosts = Array.isArray(data?.posts) ? data.posts : [];
          setPosts(fetchedPosts);
          setError(null);

          if (isAuthenticated && fetchedPosts.length > 0) {
            const votes = await fetchUserVotes(fetchedPosts, getAuthHeadersRef.current());
            if (isMounted.current) {
              setUserVotes(votes);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        if (isMounted.current) {
          setError('Unable to connect to server. Please check your internet connection and try again.');
          setPosts([]);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, retryTrigger]);

  // Handle voting
  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (votingInProgress[postId]) {
      return;
    }

    setVotingInProgress((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/${postId}/vote`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ type: voteType }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
              };
            }
            return post;
          })
        );

        setUserVotes((prev) => {
          const newVotes = { ...prev };
          if (data.userVote === null) {
            delete newVotes[postId];
          } else {
            newVotes[postId] = data.userVote;
          }
          return newVotes;
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Retry handler
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setPosts([]);
    setUserVotes({});
    setRetryTrigger((prev) => prev + 1);
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get display name for post author
  const getPostAuthorName = (post) => {
    if (post.user_name && post.user_name.trim().length > 0) {
      return post.user_name.trim();
    }
    return post.user_email?.split('@')[0] || 'Anonymous';
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        post.place_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());

      // Rating filter
      const matchesRating =
        ratingFilter === 'all' || post.rating === parseInt(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [posts, searchTerm, ratingFilter]);

  // Stats
  const stats = useMemo(() => {
    if (posts.length === 0) return { total: 0, avgRating: 0, places: 0 };
    const avgRating = posts.reduce((sum, p) => sum + p.rating, 0) / posts.length;
    const uniquePlaces = new Set(posts.map((p) => p.place_name)).size;
    return {
      total: posts.length,
      avgRating: avgRating.toFixed(1),
      places: uniquePlaces,
    };
  }, [posts]);

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-b from-orange-50/50 to-white'}`}>
      {/* Hero Section */}
      <section
        className={`relative pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden ${
          isDark ? 'bg-gray-900/50' : 'bg-gradient-to-r from-orange-500 to-amber-500'
        }`}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl ${
              isDark ? 'bg-orange-500/10' : 'bg-white/20'
            }`}
          />
          <div
            className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl ${
              isDark ? 'bg-amber-500/10' : 'bg-yellow-300/20'
            }`}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'
              }`}
            >
              <Sparkles size={16} />
              <span className="text-sm font-medium">Real Experiences</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-white'
            }`}
          >
            Traveler Reviews
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg md:text-xl max-w-2xl mx-auto mb-8 ${
              isDark ? 'text-gray-400' : 'text-white/90'
            }`}
          >
            Real experiences shared by visitors across India. Discover authentic stories from fellow travelers.
          </motion.p>

          {/* Stats */}
          {!isLoading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 md:gap-12"
            >
              <div className="text-center">
                <p className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-orange-400' : 'text-white'}`}>
                  {stats.total}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-white/80'}`}>Reviews</p>
              </div>
              <div className="text-center">
                <p className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-amber-400' : 'text-white'}`}>
                  {stats.avgRating}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-white/80'}`}>Avg Rating</p>
              </div>
              <div className="text-center">
                <p className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-yellow-400' : 'text-white'}`}>
                  {stats.places}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-white/80'}`}>Places</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 md:p-5 rounded-2xl shadow-xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Search by place name, state, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <Filter
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
                size={20}
              />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className={`pl-12 pr-10 py-3 rounded-xl border appearance-none cursor-pointer transition-all min-w-[160px] ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              >
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
                size={20}
              />
            </div>
          </div>

          {/* Results count */}
          <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Showing {filteredPosts.length} of {posts.length} reviews
          </div>
        </motion.div>
      </section>

      {/* Reviews Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading reviews...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 rounded-2xl ${
              isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white'
            } shadow-lg`}
          >
            <AlertCircle
              size={64}
              className={`mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Failed to Load Reviews
            </h3>
            <p className={`mb-6 max-w-md mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {error}
            </p>
            <button
              onClick={handleRetry}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </motion.div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 rounded-2xl ${
              isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white'
            } shadow-lg`}
          >
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-orange-50'
              }`}
            >
              <MessageSquare
                size={40}
                className={isDark ? 'text-gray-500' : 'text-orange-300'}
              />
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {searchTerm || ratingFilter !== 'all' ? 'No reviews found' : 'No reviews yet'}
            </h3>
            <p className={`max-w-md mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {searchTerm || ratingFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to share your travel experience!'}
            </p>
            {(searchTerm || ratingFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRatingFilter('all');
                }}
                className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <ReviewCard
                key={post.id}
                post={post}
                isDark={isDark}
                userVote={userVotes[post.id]}
                votingInProgress={votingInProgress[post.id]}
                isAuthenticated={isAuthenticated}
                onVote={handleVote}
                formatDate={formatDate}
                getAuthorName={getPostAuthorName}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative max-w-md w-full p-6 rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginPrompt(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}
                >
                  <LogIn size={32} className="text-orange-500" />
                </div>

                <h3
                  className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Sign in to Vote
                </h3>

                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You need to be signed in to like or dislike reviews. Join our community to share
                  your travel experiences!
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <a
                    href={`${API_CONFIG.BASE_URL.replace('/api', '')}/auth/google`}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign in with Google
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reviews;
