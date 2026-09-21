import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getApiUrl } from "../config";

const FestivalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [festival, setFestival] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFestival = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(getApiUrl(`/api/festivals/${id}`));
        const data = await response.json();
        
        if (data.success) {
          setFestival(data.data);
        } else {
          setError(data.message || 'Festival not found');
        }
      } catch (err) {
        console.error('Error fetching festival:', err);
        setError('Failed to load festival');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFestival();
    }
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && festival) {
      try {
        await navigator.share({
          title: festival.name,
          text: `Discover ${festival.name} - a beautiful Indian festival celebrated in ${festival.main_states}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading festival...</p>
        </div>
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="text-center px-4">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
            <Calendar size={40} className={isDark ? 'text-gray-600' : 'text-orange-300'} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Festival Not Found
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {error || "The festival you're looking for doesn't exist."}
          </p>
          <Link
            to="/festivals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Festivals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      
      {/* Hero Section with Image */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={festival.image_url}
            alt={festival.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 pt-24 px-4 md:px-8 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/festivals')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Festivals</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              <Share2 size={20} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 md:pb-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Month Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full mb-4">
                <Calendar size={18} />
                <span className="font-medium">{festival.month}</span>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {festival.name}
              </h1>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-400" />
                  <span>{festival.main_states}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className={`py-12 md:py-16 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              About {festival.name}
            </h2>
            <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.description}
              </p>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            {/* Main States Card */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-orange-50 border border-orange-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                  <MapPin size={24} className="text-orange-500" />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Celebrated In
                </h3>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.main_states}
              </p>
            </div>

            {/* Best Places Card */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-amber-50 border border-amber-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  <Sparkles size={24} className="text-amber-500" />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Best Places to Experience
                </h3>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.best_places}
              </p>
            </div>
          </motion.div>

          {/* When to Visit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30' : 'bg-gradient-to-r from-orange-100 to-amber-100'}`}
          >
            <Calendar size={32} className={`mx-auto mb-3 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Best Time to Visit
            </h3>
            <p className={`text-lg ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
              {festival.month}
            </p>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Plan your trip to experience this beautiful festival
            </p>
          </motion.div>

          {/* Data correction / contribution note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={`mt-8 p-4 rounded-2xl text-center text-sm ${isDark ? 'bg-gray-800/50 border border-gray-700 text-gray-300' : 'bg-orange-50 border border-orange-100 text-orange-800'}`}
          >
            If you find any incorrect information or would like to suggest additions, please email us or share your feedback through the feedback form.
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              to="/festivals"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft size={20} />
              Explore More Festivals
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default FestivalDetailPage;
