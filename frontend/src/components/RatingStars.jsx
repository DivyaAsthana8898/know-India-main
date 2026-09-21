import { Star } from 'lucide-react';

/**
 * RatingStars Component
 * Displays star rating UI with filled/empty stars based on rating value
 * 
 * @param {number} rating - Rating value (1-5)
 * @param {number} size - Icon size in pixels (default: 16)
 * @param {boolean} showLabel - Whether to show numeric label (default: false)
 * @param {string} className - Additional CSS classes
 */
const RatingStars = ({ rating = 0, size = 16, showLabel = false, className = '' }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          } transition-colors`}
        />
      ))}
      {showLabel && (
        <span className="ml-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
          {rating}/5
        </span>
      )}
    </div>
  );
};

export default RatingStars;
