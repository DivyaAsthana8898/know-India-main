import { motion } from 'framer-motion';
import { User, MapPin, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import RatingStars from './RatingStars';

/**
 * ReviewCard Component
 * Displays a single review in a card format with user info, rating, and content
 */
const ReviewCard = ({
  post,
  isDark,
  userVote,
  votingInProgress,
  isAuthenticated,
  onVote,
  formatDate,
  getAuthorName,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 h-full ${
        isDark
          ? 'bg-gray-800/80 border border-gray-700/50 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'
          : 'bg-white border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10'
      }`}
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 md:p-6 flex flex-col h-full">
        {/* Header: User Info & Rating */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}
            >
              {post.user_avatar ? (
                <img
                  src={post.user_avatar}
                  alt={getAuthorName(post)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
              )}
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getAuthorName(post)}
              </p>
              <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Calendar size={12} />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          <RatingStars rating={post.rating} size={18} />
        </div>

        {/* Place & State Badge */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isDark
                ? 'bg-orange-500/15 text-orange-400'
                : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-100'
            }`}
          >
            <MapPin size={14} />
            <span>{post.place_name}</span>
            <span className={isDark ? 'text-gray-600' : 'text-orange-300'}>•</span>
            <span className={isDark ? 'text-gray-400' : 'text-orange-500/80'}>{post.state}</span>
          </div>
        </div>

        {/* Review Content -- flex-1 pushes vote buttons to the bottom */}
        <div className="flex-1">
          <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {post.content}
          </p>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {post.images.slice(0, 4).map((img, imgIndex) => (
                <div
                  key={imgIndex}
                  className="relative group/img"
                >
                  <img
                    src={img}
                    alt={`${post.place_name} ${imgIndex + 1}`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover transition-transform hover:scale-105 cursor-pointer"
                  />
                  {imgIndex === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <span className="text-white font-semibold">+{post.images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vote Buttons -- always pinned to the bottom */}
        <div className={`flex items-center gap-2 pt-4 mt-4 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <button
            onClick={() => onVote(post.id, 'upvote')}
            disabled={!isAuthenticated || votingInProgress}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              userVote === 'upvote'
                ? 'bg-green-500/20 text-green-500'
                : isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            } ${!isAuthenticated || votingInProgress ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ThumbsUp size={16} className={userVote === 'upvote' ? 'fill-current' : ''} />
            <span>{post.upvotes || 0}</span>
          </button>

          <button
            onClick={() => onVote(post.id, 'downvote')}
            disabled={!isAuthenticated || votingInProgress}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              userVote === 'downvote'
                ? 'bg-red-500/20 text-red-500'
                : isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            } ${!isAuthenticated || votingInProgress ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ThumbsDown size={16} className={userVote === 'downvote' ? 'fill-current' : ''} />
            <span>{post.downvotes || 0}</span>
          </button>

          {!isAuthenticated && (
            <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Sign in to vote
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
