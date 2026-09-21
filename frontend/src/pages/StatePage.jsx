import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getStateBySlug } from "../lib/knowIndia";
import { useTheme } from "../context/ThemeContext";
import { API_CONFIG, getApiUrl } from '../config';
import BookmarkButton from '../components/BookmarkButton';
import { updateSEO, SEO_CONFIG } from '../utils/seo';
import { 
  MapPin, Building2, Users, BookOpen, Utensils, Calendar, 
  ArrowLeft, ArrowRight,
  Globe, Landmark, Star, Camera,
  Sparkles, Heart, TrendingUp, Map, MapPinned,
  UserCheck, Languages, Award, Building, Navigation
} from "lucide-react";

const State3DMap = lazy(() => import('../components/maps/State3DMap'));

const StatePage = () => {
  const { stateName } = useParams();
  const [stateData, setStateData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Function to truncate text by word count
  const truncateByWords = (text, wordLimit) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ');
  };

  // Get truncated (60-70 words) and full description (max 150 words)
  const getDescription = () => {
    if (!stateData?.history) return { truncated: '', full: '', needsExpand: false };
    const words = stateData.history.split(/\s+/);
    const truncatedText = truncateByWords(stateData.history, 65); // ~60-70 words
    const fullText = truncateByWords(stateData.history, 150); // max 150 words
    return {
      truncated: truncatedText,
      full: fullText,
      needsExpand: words.length > 65
    };
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the new data adapter to get state by slug
        const foundStateData = getStateBySlug(stateName);
        setStateData(foundStateData);
        
        // If state found, fetch places from database only
        if (foundStateData) {
          // Fetch places from backend API (database)
          try {
            const apiUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.PLACES}/state/${foundStateData.name}`);
            const response = await fetch(apiUrl);
            if (response.ok) {
              const apiPlaces = await response.json();
              // SECURITY: Validate API response is an array before using
              // Handle both array format and { places: [] } format
              if (Array.isArray(apiPlaces)) {
                setPlaces(apiPlaces);
              } else if (apiPlaces && Array.isArray(apiPlaces.places)) {
                setPlaces(apiPlaces.places);
              } else {
                // Fallback to empty array for unexpected response format
                setPlaces([]);
              }
            } else {
              // No fallback - if API fails, show empty places
              setPlaces([]);
            }
          } catch (error) {
            // No fallback - if API fails, show empty places
            setPlaces([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stateName]);

  const displayStateName = stateName.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  // SEO: Update meta tags when state data is loaded
  useEffect(() => {
    if (stateData) {
      const seoConfig = SEO_CONFIG.state(stateData.name || displayStateName, stateData.capital);
      updateSEO({
        ...seoConfig,
        url: window.location.href,
        image: stateData.touristAttractions?.[0]?.image
      });
    } else if (!loading) {
      updateSEO({
        title: `${displayStateName} Tourism - Places to Visit`,
        description: `Explore ${displayStateName}, India. Discover top tourist attractions, heritage sites, culture, and best places to visit.`,
        keywords: `${displayStateName} tourism, ${displayStateName} travel, places to visit in ${displayStateName}, India tourism`
      });
    }
  }, [stateData, displayStateName, loading]);

  // Loading
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white'}`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-orange-500/20 border-t-orange-500' : 'border-orange-200 border-t-orange-500'}`}
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <MapPin className="text-white" size={24} />
          </div>
        </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading {displayStateName}</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Fetching destinations...</p>
        </div>
      </div>
    );
  }

  // Not Found
  if (!stateData) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white'}`}>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-orange-100'}`}>
            <MapPin className={isDark ? 'text-gray-600' : 'text-orange-400'} size={32} />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Not Found</h1>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We couldn't find {displayStateName}</p>
          <Link to="/places" className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-colors">
            Back to Map
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-15 bg-orange-600"></div>
            <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15 bg-amber-600"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-10 bg-orange-500"></div>
          </>
        ) : (
          <>
            {/* Animated gradient blobs */}
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-200/50 to-amber-100/40 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-amber-200/40 to-orange-100/30 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-orange-100/40 to-yellow-100/30 blur-3xl"
            />
            {/* Decorative geometric shapes */}
            <div className="absolute top-32 right-16 w-32 h-32 border-2 border-orange-200/30 rounded-full"></div>
            <div className="absolute top-64 right-32 w-16 h-16 border-2 border-amber-200/25 rounded-full"></div>
            <div className="absolute bottom-40 left-12 w-20 h-20 border-2 border-orange-200/25 rotate-45"></div>
            <div className="absolute top-1/2 left-20 w-12 h-12 border-2 border-amber-300/20 rounded-full"></div>
            {/* Dot pattern */}
            <div className="absolute top-40 left-1/3 w-2 h-2 rounded-full bg-orange-300/40"></div>
            <div className="absolute top-52 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-300/30"></div>
            <div className="absolute bottom-60 right-1/4 w-2 h-2 rounded-full bg-orange-300/35"></div>
          </>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              to="/places" 
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft size={16} />
              Back to Map
            </Link>
          </motion.div>

          {/* Header with Title, Badges, and 3D State Map */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isDark ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-100 text-orange-700'
                }`}>
                  <Landmark size={12} />
                  {stateData.type === 'union_territory' ? 'Union Territory' : 'Indian State'}
                </span>
                {stateData.region && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Navigation size={12} />
                    {stateData.region}
                  </span>
                )}
              </div>
              
              <h1 className={`text-4xl md:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stateData.name}
              </h1>
              
              <div className="max-w-3xl">
                <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isDescriptionExpanded ? getDescription().full : getDescription().truncated}
                  {!isDescriptionExpanded && getDescription().needsExpand && '...'}
                </p>
                {getDescription().needsExpand && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className={`mt-2 text-sm font-medium transition-colors ${
                      isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    {isDescriptionExpanded ? 'Read less' : 'Read more'}
                  </button>
                )}
              </div>
            </motion.div>

            {/* 3D State Outline — floating in hero top-right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="hidden lg:block flex-shrink-0 w-[320px] h-[280px] -mt-4"
            >
              <Suspense fallback={null}>
                <State3DMap stateName={stateData.name} isDark={isDark} minimal />
              </Suspense>
            </motion.div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid - 4 columns on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Building2, label: 'Capital', value: stateData.capital },
                    { icon: Building, label: 'Largest City', value: stateData.largestCity },
                    { icon: Users, label: 'Population', value: stateData.population },
                    { icon: Globe, label: 'Area', value: stateData.area },
                    { icon: MapPinned, label: 'Density', value: stateData.density },
                    { icon: BookOpen, label: 'Literacy', value: stateData.literacyRate },
                    { icon: UserCheck, label: 'Sex Ratio', value: stateData.sexRatio },
                    { icon: TrendingUp, label: 'GDP', value: stateData.gdp },
                  ].filter(s => s.value).map((stat) => (
                    <div
                      key={stat.label}
                      className={`p-4 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-800/80 border-gray-700/50' 
                          : 'bg-white border-gray-200/80 shadow-sm'
                      }`}
                    >
                      <stat.icon className={`w-4 h-4 mb-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                      <p className={`text-[11px] uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
                      <p className={`font-semibold text-sm mt-0.5 leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Districts - separate row if exists */}
                {stateData.districts && (
                  <div className={`mt-3 p-4 rounded-xl border inline-flex items-center gap-3 ${
                    isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200/80 shadow-sm'
                  }`}>
                    <Map className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                    <div>
                      <p className={`text-[11px] uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Districts</p>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{stateData.districts} Districts</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Languages Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-5 rounded-xl border ${
                  isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200/80 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Languages className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stateData.officialLanguages?.map((lang, idx) => (
                    <span 
                      key={`official-${idx}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {lang}
                    </span>
                  ))}
                  {stateData.languages?.regional?.map((lang, idx) => (
                    <span 
                      key={`regional-${idx}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - State Symbols & Famous For */}
            <div className="space-y-4">
              {/* State Symbols - 2x2 Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { emoji: '🐾', label: 'Animal', value: stateData.stateAnimal || stateData.utAnimal },
                  { emoji: '🐦', label: 'Bird', value: stateData.stateBird || stateData.utBird },
                  { emoji: '🌺', label: 'Flower', value: stateData.stateFlower || stateData.utFlower },
                  { emoji: '🌲', label: 'Tree', value: stateData.stateTree || stateData.utTree },
                ].filter(s => s.value).map((symbol) => (
                  <div
                    key={symbol.label}
                    className={`p-4 rounded-xl border text-center ${
                      isDark 
                        ? 'bg-gray-800/80 border-gray-700/50' 
                        : 'bg-white border-gray-200/80 shadow-sm'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{symbol.emoji}</span>
                    <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{symbol.label}</p>
                    <p className={`text-xs font-semibold mt-0.5 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{symbol.value}</p>
                  </div>
                ))}
              </motion.div>
              
              {/* Famous For */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`p-5 rounded-xl border ${
                  isDark 
                    ? 'bg-gradient-to-br from-orange-900/30 to-amber-900/20 border-orange-800/30' 
                    : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                  <span className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Famous For</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stateData.famousFor.slice(0, 5).map((item, idx) => (
                    <span key={idx} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                      isDark ? 'bg-orange-500/25 text-orange-200' : 'bg-white/90 text-orange-700 shadow-sm'
                    }`}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className={`py-12 relative ${isDark ? 'bg-gray-900/30' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <Heart className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            Culture & Traditions
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Festivals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Festivals</h3>
              </div>
              
              {/* Major Festivals */}
              {stateData.majorFestivals?.length > 0 && (
                <div className="mb-3">
                  <p className={`text-[10px] uppercase tracking-wide font-semibold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Major Festivals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stateData.majorFestivals.slice(0, 4).map((festival, idx) => (
                      <span key={idx} className={`text-[11px] px-2 py-1 rounded-md font-medium ${
                        isDark ? 'bg-orange-500/25 text-orange-200' : 'bg-orange-100 text-orange-700'
                      }`}>
                        🎊 {festival}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                {(stateData.festivals || []).slice(0, 5).map((festival, idx) => (
                  <div key={idx} className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs ${
                    isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700'
                  }`}>
                    <span>🎉</span>
                    <span>{festival}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cuisine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  <Utensils className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cuisine</h3>
              </div>
              <div className="space-y-1.5">
                {stateData.cuisine.slice(0, 5).map((dish, idx) => (
                  <div key={idx} className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs ${
                    isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700'
                  }`}>
                    <span>🍛</span>
                    <span>{dish}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tourist Attractions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
                  <Landmark className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Attractions</h3>
              </div>
              <div className="space-y-1.5">
                {stateData.touristAttractions.slice(0, 5).map((attraction, idx) => (
                  <div key={idx} className={`py-2 px-3 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <span className={`text-xs font-medium block ${isDark ? 'text-white' : 'text-gray-900'}`}>{attraction.name}</span>
                    <span className={`text-[10px] ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{attraction.type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tourism Highlights Section */}
      {stateData.tourismHighlights?.length > 0 && (
        <section className="py-12 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <Award className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              Tourism Highlights
            </motion.h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {stateData.tourismHighlights.map((highlight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    highlight.type === 'UNESCO' 
                      ? isDark 
                        ? 'bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border-amber-700/40' 
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/80'
                      : isDark 
                        ? 'bg-gray-800/80 border-gray-700/50' 
                        : 'bg-white border-gray-200/80 shadow-sm'
                  }`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-2 ${
                    highlight.type === 'UNESCO'
                      ? isDark ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-200 text-amber-800'
                      : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {highlight.type === 'UNESCO' ? '🏛️ UNESCO' : highlight.type}
                  </span>
                  <h4 className={`font-semibold text-xs leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {highlight.name}
                  </h4>
                  {highlight.city && (
                    <p className={`text-[10px] mt-1 flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <MapPin size={8} />
                      {highlight.city}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

        {/* Places Section */}
        {places.length > 0 && (
        <section className={`py-12 px-4 relative ${isDark ? 'bg-gray-900/30' : 'bg-white/50'}`}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Camera className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                Explore Places
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
              }`}>
                {places.length}
              </span>
            </motion.div>

            {/* Places Grid - all places, equal-size cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {places.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02 }}
                  className="h-full"
                >
                  <Link
                    to={`/places/${stateName}/${place.id}`}
                    className={`flex gap-3 p-3 rounded-xl border group transition-all h-[5.5rem] items-center ${
                      isDark 
                        ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800' 
                        : 'bg-white border-gray-200/80 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {place.images?.[0] ? (
                        <img src={place.images[0]} alt={`${place.name} - ${place.category_name || 'destination'} in ${displayStateName}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Camera className={isDark ? 'text-gray-600' : 'text-gray-400'} size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5 overflow-hidden">
                      <span className={`text-[10px] font-medium uppercase tracking-wide block truncate ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{place.category_name}</span>
                      <h4 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{place.name}</h4>
                      <p className={`text-[11px] line-clamp-1 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{place.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <BookmarkButton 
                        place={{
                          id: place.id,
                          name: place.name,
                          state: stateData?.name || displayStateName,
                          stateSlug: stateName,
                          category_name: place.category_name,
                          images: place.images,
                          description: place.description,
                        }}
                        variant="icon"
                        size="sm"
                      />
                      <ArrowRight className={`${isDark ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-300 group-hover:text-orange-500'} transition-colors`} size={16} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facts Section */}
      <section className="py-12 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            Interesting Facts
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stateData.interestingFacts.map((fact, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-3 p-4 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800/80 border-gray-700/50' 
                    : 'bg-white border-gray-200/80 shadow-sm'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                }`}>
                  {idx + 1}
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{fact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data correction / contribution note */}
      <section className="py-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className={`p-4 rounded-xl border text-center text-sm ${
            isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-200/90' : 'bg-orange-50 border-orange-200/60 text-orange-800'
          }`}>
            If you find any incorrect information or would like to suggest additions, please email us or share your feedback through the feedback form.
          </div>
        </div>
      </section>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StatePage;
