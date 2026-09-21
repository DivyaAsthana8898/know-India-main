import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../config';
import useGoogleLogin from '../hooks/useGoogleLogin';
import { 
  User, 
  Star, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  X,
  Camera,
  MapPin,
  AlertCircle,
  Edit2,
  Trash2,
  Clock
} from 'lucide-react';

// Indian states list for dropdown
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ProfileAbout = () => {
  // SECURITY: Use getAuthHeaders for API calls - JWT is now in HttpOnly cookie
  const { user, isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Use shared login hook for Google OAuth
  const { openGoogleLogin } = useGoogleLogin();
  
  // Track component mount state for cleanup
  const isMounted = useRef(true);
  
  // Store getAuthHeaders ref to avoid dependency issues
  const getAuthHeadersRef = useRef(getAuthHeaders);
  useEffect(() => {
    getAuthHeadersRef.current = getAuthHeaders;
  }, [getAuthHeaders]);
  
  // Form state
  const [formData, setFormData] = useState({
    place_name: '',
    state: '',
    content: '',
    rating: 0,
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Posts state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [votingInProgress, setVotingInProgress] = useState({});
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null, isDeleting: false });

  // Edit modal state
  const [editModal, setEditModal] = useState({
    isOpen: false,
    post: null,
    formData: { place_name: '', state: '', content: '', rating: 0 },
    editImages: [],
    isSubmitting: false,
    error: '',
  });

  // Validation errors
  const errors = useMemo(() => {
    const errs = {};
    
    if (!formData.place_name.trim()) {
      errs.place_name = 'Place name is required';
    }
    
    if (!formData.state) {
      errs.state = 'State is required';
    }
    
    if (!formData.content.trim()) {
      errs.content = 'Travel experience is required';
    } else if (formData.content.trim().length < 10) {
      errs.content = 'Experience must be at least 10 characters';
    }
    
    if (formData.rating === 0) {
      errs.rating = 'Rating is required';
    }
    
    return errs;
  }, [formData]);

  // Check if form is valid
  const isFormValid = Object.keys(errors).length === 0;

  // SECURITY: Fetch posts only after auth state is resolved
  useEffect(() => {
    isMounted.current = true;
    
    // Wait for auth state to resolve
    if (authLoading) return;

    // PERFORMANCE: Fetch user votes in parallel using Promise.all
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
          
          if (response.ok) {
            const data = await response.json();
            if (data.userVote) {
              return { postId: post.id, vote: data.userVote };
            }
          }
          return null;
        } catch (err) {
          console.error('Error fetching vote:', err);
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
      try {
        // If authenticated, fetch user's own posts (including pending) via /me endpoint
        // Otherwise, fetch public approved posts
        const endpoint = isAuthenticated 
          ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/me`
          : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: isAuthenticated ? getAuthHeadersRef.current() : { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        
        if (response.ok && isMounted.current) {
          setPosts(data.posts || []);
          
          // SECURITY: Fetch user votes only if authenticated
          if (isAuthenticated && data.posts?.length > 0) {
            const votes = await fetchUserVotes(data.posts, getAuthHeadersRef.current());
            if (isMounted.current) {
              setUserVotes(votes);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
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
  }, [isAuthenticated, authLoading, postsRefreshKey]); // Refetch when auth changes or after new post submission


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev.slice(0, 4), reader.result]); // Max 5 images
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      place_name: '',
      state: '',
      content: '',
      rating: 0,
    });
    setImages([]);
    setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Mark all fields as touched
    setTouched({
      place_name: true,
      state: true,
      content: true,
      rating: true,
    });
    
    if (!isFormValid) {
      return;
    }
    
    if (!isAuthenticated) {
      setSubmitError('Please sign in to share your experience');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          place_name: formData.place_name.trim(),
          state: formData.state,
          content: formData.content.trim(),
          rating: formData.rating,
          images: images.length > 0 ? images : null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Reset form
        resetForm();
        setSubmitSuccess(true);
        
        // Refetch posts to show the new pending post
        setPostsRefreshKey(prev => prev + 1);
      } else {
        setSubmitError(data.message || data.messages?.join(', ') || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setSubmitError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated) {
      return;
    }
    
    // Prevent rapid clicks - if already voting on this post, ignore
    if (votingInProgress[postId]) {
      return;
    }
    
    // Mark voting in progress
    setVotingInProgress(prev => ({ ...prev, [postId]: true }));
    
    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
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
        // Update post vote counts
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
            };
          }
          return post;
        }));
        
        // Update user votes
        setUserVotes(prev => {
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
      // Clear voting in progress
      setVotingInProgress(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Check if current user owns the post
  const isPostOwner = (post) => {
    return isAuthenticated && user && post.user_id === user.id;
  };

  // Open delete confirmation modal
  const openDeleteModal = (postId) => {
    setDeleteModal({ isOpen: true, postId, isDeleting: false });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, postId: null, isDeleting: false });
  };

  // Handle delete post
  const handleDelete = async () => {
    const postId = deleteModal.postId;
    if (!postId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/${postId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
        }
      );

      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        closeDeleteModal();
      } else {
        const data = await response.json();
        console.error('Delete failed:', data.message);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Open edit modal
  const openEditModal = (post) => {
    setEditModal({
      isOpen: true,
      post,
      formData: {
        place_name: post.place_name,
        state: post.state,
        content: post.content,
        rating: post.rating,
      },
      editImages: post.images || [],
      isSubmitting: false,
      error: '',
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      post: null,
      formData: { place_name: '', state: '', content: '', rating: 0 },
      editImages: [],
      isSubmitting: false,
      error: '',
    });
  };

  // Handle edit form changes
  const handleEditFormChange = (field, value) => {
    setEditModal(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      error: '',
    }));
  };

  // Handle image upload in edit modal
  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxSize) {
        setEditModal(prev => ({ ...prev, error: 'Each image must be 5 MB or less' }));
        return;
      }
    }

    if (editModal.editImages.length + files.length > 5) {
      setEditModal(prev => ({ ...prev, error: 'Maximum 5 images allowed' }));
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditModal(prev => ({
          ...prev,
          editImages: [...prev.editImages, event.target.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image in edit modal
  const removeEditImage = (index) => {
    setEditModal(prev => ({
      ...prev,
      editImages: prev.editImages.filter((_, i) => i !== index),
    }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const { formData: editFormData, post, editImages } = editModal;

    if (!editFormData.place_name.trim()) {
      setEditModal(prev => ({ ...prev, error: 'Place name is required' }));
      return;
    }
    if (!editFormData.state) {
      setEditModal(prev => ({ ...prev, error: 'State is required' }));
      return;
    }
    if (!editFormData.content.trim()) {
      setEditModal(prev => ({ ...prev, error: 'Content is required' }));
      return;
    }
    if (editFormData.rating < 1 || editFormData.rating > 5) {
      setEditModal(prev => ({ ...prev, error: 'Rating is required (1-5)' }));
      return;
    }

    setEditModal(prev => ({ ...prev, isSubmitting: true, error: '' }));

    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/${post.id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            place_name: editFormData.place_name.trim(),
            state: editFormData.state,
            content: editFormData.content.trim(),
            rating: editFormData.rating,
            images: editImages.length > 0 ? editImages : null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === post.id) {
            return data.post;
          }
          return p;
        }));
        closeEditModal();
      } else {
        const errorMsg = data.details ? `${data.message}: ${data.details}` : (data.message || 'Failed to update post');
        setEditModal(prev => ({ ...prev, error: errorMsg }));
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setEditModal(prev => ({ ...prev, error: `Network error: ${err.message}` }));
    } finally {
      setEditModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Star rating component
  const StarRating = ({ value, onChange, error, touched: isTouched }) => {
    const [hover, setHover] = useState(0);
    
    return (
      <div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hover || value)
                    ? 'text-yellow-400 fill-yellow-400'
                    : isDark ? 'text-gray-600' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {value > 0 && (
            <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {value}/5
            </span>
          )}
        </div>
        {isTouched && error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    );
  };

  // SECURITY: Show loading state while auth is resolving to prevent flash
  if (authLoading) {
    return (
      <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Travel Experiences
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your journey and discover stories from fellow travelers
          </p>
        </motion.div>

        {/* User Profile Card & Form (if logged in) */}
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            {/* User Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center ${
                isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
              }`}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || user?.email?.split('@')[0]}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Success Message - Pending Approval Notice */}
            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`mb-4 p-5 rounded-2xl border ${
                    isDark 
                      ? 'bg-amber-500/10 border-amber-500/20' 
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                    }`}>
                      <Clock size={24} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        Experience Submitted for Review
                      </h4>
                      <p className={`text-sm mb-2 ${isDark ? 'text-amber-300/80' : 'text-amber-600'}`}>
                        Thank you for sharing! Your experience has been submitted successfully and is now pending admin approval.
                      </p>
                      <ul className={`text-xs space-y-1 ${isDark ? 'text-amber-300/60' : 'text-amber-500'}`}>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                          Your post will appear once approved by our team
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                          This usually takes 24-48 hours
                        </li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-amber-500/20 text-amber-400' : 'hover:bg-amber-100 text-amber-600'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Post Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Place Name & State Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Place Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Place Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={formData.place_name}
                      onChange={(e) => handleInputChange('place_name', e.target.value)}
                      onBlur={() => handleBlur('place_name')}
                      placeholder="e.g., Taj Mahal"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
                        touched.place_name && errors.place_name
                          ? 'border-red-500 focus:border-red-500'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                      } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                    />
                  </div>
                  {touched.place_name && errors.place_name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.place_name}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    onBlur={() => handleBlur('state')}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      touched.state && errors.state
                        ? 'border-red-500 focus:border-red-500'
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  >
                    <option value="">Select a state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {touched.state && errors.state && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Travel Experience */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Travel Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  onBlur={() => handleBlur('content')}
                  placeholder="Share your travel experience, tips, and memorable moments..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border resize-none transition-colors ${
                    touched.content && errors.content
                      ? 'border-red-500 focus:border-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                />
                <div className="flex justify-between mt-1">
                  {touched.content && errors.content ? (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.content}
                    </p>
                  ) : <span />}
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formData.content.length} characters
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rating <span className="text-red-500">*</span>
                </label>
                <StarRating
                  value={formData.rating}
                  onChange={(value) => {
                    handleInputChange('rating', value);
                    setTouched(prev => ({ ...prev, rating: true }));
                  }}
                  error={errors.rating}
                  touched={touched.rating}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Photos (optional)
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                    <Camera size={18} />
                    <span className="text-sm">Add Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Max 5 images, 5MB each
                  </span>
                </div>
                
                {/* Image Previews */}
                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 flex-wrap mt-3"
                    >
                      {images.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group"
                        >
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Message */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2"
                >
                  <AlertCircle size={18} />
                  {submitError}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-xl font-medium transition-all ${
                  isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                    : isDark
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isSubmitting ? 'Sharing...' : 'Share Experience'}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Sign in prompt for non-authenticated users */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-8 rounded-2xl mb-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <User size={40} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sign in to share your experience
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Join our community of travelers and share your adventures across India
            </p>
            <button
              onClick={openGoogleLogin}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Sign in with Google
            </button>
          </motion.div>
        )}

        {/* My Posts Section */}
        <div className="space-y-6">
          {(() => {
            // When authenticated, posts are already filtered by /me endpoint
            // When not authenticated, show all public approved posts
            const filteredPosts = posts;
            
            // Count pending posts for the user
            const pendingCount = isAuthenticated ? posts.filter(p => p.status === 'pending').length : 0;
            
            return (
              <>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isAuthenticated ? 'My Experiences' : 'Recent Experiences'} ({filteredPosts.length})
                  {pendingCount > 0 && (
                    <span className={`ml-2 text-sm font-normal ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      ({pendingCount} pending approval)
                    </span>
                  )}
                </h2>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading experiences...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <MapPin size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      No experiences shared yet
                    </h3>
                    <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                      {isAuthenticated ? 'Share your first travel experience above!' : 'Be the first to share your travel story!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${
                        isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {post.user_avatar ? (
                          <img src={post.user_avatar} alt={post.user_name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {post.user_name || post.user_email?.split('@')[0]}
                          </p>
                          {/* Status Badge for pending posts */}
                          {post.status === 'pending' && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                            }`}>
                              <Clock size={10} />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Rating */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= post.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : isDark ? 'text-gray-700' : 'text-gray-200'
                            }
                          />
                        ))}
                      </div>
                      
                      {/* Edit/Delete buttons (only for post owner) */}
                      {isPostOwner(post) && (
                        <div className="flex items-center gap-1 ml-3">
                          <button
                            onClick={() => openEditModal(post)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }`}
                            title="Edit post"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(post.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                                : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                            }`}
                            title="Delete post"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Place & State */}
                  <div className={`flex items-center gap-2 mb-3 text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    <MapPin size={16} />
                    <span className="font-medium">{post.place_name}</span>
                    <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>•</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{post.state}</span>
                  </div>

                  {/* Post Content */}
                  <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {post.content}
                  </p>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {post.images.map((img, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`${post.place_name} ${imgIndex + 1}`}
                          className="w-28 h-28 rounded-xl object-cover hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      ))}
                    </div>
                  )}

                  {/* Vote Buttons */}
                  <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button
                      onClick={() => handleVote(post.id, 'upvote')}
                      disabled={!isAuthenticated || votingInProgress[post.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        userVotes[post.id] === 'upvote'
                          ? 'bg-green-500/20 text-green-500'
                          : isDark 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      } ${!isAuthenticated || votingInProgress[post.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <ThumbsUp size={18} className={userVotes[post.id] === 'upvote' ? 'fill-current' : ''} />
                      <span className="text-sm font-medium">{post.upvotes || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleVote(post.id, 'downvote')}
                      disabled={!isAuthenticated || votingInProgress[post.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        userVotes[post.id] === 'downvote'
                          ? 'bg-red-500/20 text-red-500'
                          : isDark 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      } ${!isAuthenticated || votingInProgress[post.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <ThumbsDown size={18} className={userVotes[post.id] === 'downvote' ? 'fill-current' : ''} />
                      <span className="text-sm font-medium">{post.downvotes || 0}</span>
                    </button>
                    
                    {!isAuthenticated && (
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Sign in to vote
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Delete Experience?
                </h3>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This action cannot be undone. Your experience will be permanently deleted.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleteModal.isDeleting}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteModal.isDeleting}
                    className="px-6 py-2.5 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    {deleteModal.isDeleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg my-8 p-6 rounded-2xl shadow-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Edit Experience
                </h3>
                <button
                  onClick={closeEditModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Error Message */}
              {editModal.error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  <span className="text-red-500 text-sm">{editModal.error}</span>
                </div>
              )}

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Place Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Place Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editModal.formData.place_name}
                    onChange={(e) => handleEditFormChange('place_name', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  />
                </div>

                {/* State */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editModal.formData.state}
                    onChange={(e) => handleEditFormChange('state', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  >
                    <option value="">Select a state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editModal.formData.content}
                    onChange={(e) => handleEditFormChange('content', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-xl border resize-none transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleEditFormChange('rating', star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={star <= editModal.formData.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : isDark ? 'text-gray-600' : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Photos
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}>
                      <Camera size={18} />
                      <span className="text-sm">Add Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Max 5 images, 5MB each
                    </span>
                  </div>

                  {editModal.editImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {editModal.editImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={editModal.isSubmitting}
                    className={`flex-1 px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editModal.isSubmitting}
                    className="flex-1 px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {editModal.isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileAbout;
