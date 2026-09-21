import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../context/ThemeContext";
import { API_CONFIG, getApiUrl } from '../config';
import BookmarkButton from '../components/BookmarkButton';
import { updateSEO, SEO_CONFIG, generateStructuredData } from '../utils/seo';
import { 
  MapPin, ArrowLeft, ChevronLeft, ChevronRight, 
  Play, Pause, Camera, Navigation, Info, Clock, 
  Ticket, Sparkles, Star, Calendar, Users, Share2, X,
  Hotel, Building2, Pill, Shield, ExternalLink,
  Sun, Cloud, CloudRain, Snowflake, Thermometer, Wind,
  CloudSun, CloudFog, Loader2, RefreshCw, Droplets
} from "lucide-react";

/**
 * Weather code mapping for Open-Meteo API
 * https://open-meteo.com/en/docs
 */
const getWeatherInfo = (code) => {
  const weatherCodes = {
    0: { description: 'Clear sky', icon: 'sun' },
    1: { description: 'Mainly clear', icon: 'sun' },
    2: { description: 'Partly cloudy', icon: 'cloud-sun' },
    3: { description: 'Overcast', icon: 'cloud' },
    45: { description: 'Foggy', icon: 'fog' },
    48: { description: 'Depositing rime fog', icon: 'fog' },
    51: { description: 'Light drizzle', icon: 'rain' },
    53: { description: 'Moderate drizzle', icon: 'rain' },
    55: { description: 'Dense drizzle', icon: 'rain' },
    61: { description: 'Slight rain', icon: 'rain' },
    63: { description: 'Moderate rain', icon: 'rain' },
    65: { description: 'Heavy rain', icon: 'rain' },
    71: { description: 'Slight snow', icon: 'snow' },
    73: { description: 'Moderate snow', icon: 'snow' },
    75: { description: 'Heavy snow', icon: 'snow' },
    77: { description: 'Snow grains', icon: 'snow' },
    80: { description: 'Slight rain showers', icon: 'rain' },
    81: { description: 'Moderate rain showers', icon: 'rain' },
    82: { description: 'Violent rain showers', icon: 'rain' },
    85: { description: 'Slight snow showers', icon: 'snow' },
    86: { description: 'Heavy snow showers', icon: 'snow' },
    95: { description: 'Thunderstorm', icon: 'rain' },
    96: { description: 'Thunderstorm with hail', icon: 'rain' },
    99: { description: 'Thunderstorm with heavy hail', icon: 'rain' },
  };
  return weatherCodes[code] || { description: 'Unknown', icon: 'cloud' };
};

/**
 * Fetch current weather from Open-Meteo API (free, no API key needed)
 */
const fetchWeather = async (placeName, city, state) => {
  // Helper to try geocoding with a query
  const tryGeocode = async (query) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      if (!response.ok) return null;
      const data = await response.json();
      
      // Filter for India results
      if (data.results && data.results.length > 0) {
        const indiaResult = data.results.find(r => r.country_code === 'IN' || r.country === 'India');
        return indiaResult || data.results[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  try {
    let location = null;
    
    // Strategy 1: Try with city name (most reliable)
    if (city) {
      location = await tryGeocode(city);
    }
    
    // Strategy 2: Try with state capital or major city
    if (!location && state) {
      // Try state name directly (often matches capital city)
      location = await tryGeocode(state);
    }
    
    // Strategy 3: Try simplified place name (first 2-3 words)
    if (!location && placeName) {
      const simplifiedName = placeName.split(/[,\-–]/)[0].trim().split(' ').slice(0, 3).join(' ');
      location = await tryGeocode(simplifiedName);
    }
    
    // Strategy 4: Try just "India" with the state for a general location
    if (!location && state) {
      location = await tryGeocode(`${state} India`);
    }

    if (!location) {
      throw new Error('Location not found');
    }
    
    const { latitude, longitude, name: locationName } = location;
    
    // Fetch current weather with apparent temperature
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    
    if (!weatherResponse.ok) throw new Error('Weather fetch failed');
    
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    
    return {
      success: true,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      ...getWeatherInfo(current.weather_code),
      locationName: locationName || city || state,
      coordinates: { latitude, longitude }
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get best time to visit based on state/region
 * Returns seasonal recommendations with weather info
 */
const getBestTimeToVisit = (stateName, category) => {
  const state = (stateName || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  
  // Hill stations and mountain regions
  const hillStates = ['himachal pradesh', 'uttarakhand', 'sikkim', 'arunachal pradesh', 'meghalaya', 'nagaland', 'manipur', 'mizoram', 'tripura'];
  const desertStates = ['rajasthan', 'gujarat'];
  const coastalStates = ['goa', 'kerala', 'andaman and nicobar islands', 'lakshadweep', 'puducherry'];
  const northernStates = ['delhi', 'uttar pradesh', 'punjab', 'haryana', 'chandigarh', 'jammu and kashmir', 'ladakh'];
  const southernStates = ['tamil nadu', 'karnataka', 'andhra pradesh', 'telangana'];
  const easternStates = ['west bengal', 'odisha', 'jharkhand', 'bihar', 'assam'];
  const centralStates = ['madhya pradesh', 'chhattisgarh', 'maharashtra'];
  
  // Check for beach/hill categories first
  if (cat.includes('beach') || cat.includes('coastal')) {
    return {
      months: ['October', 'November', 'December', 'January', 'February', 'March'],
      peak: ['November', 'December', 'January'],
      weather: 'Pleasant & sunny',
      icon: 'sun',
      temp: '20-30°C',
      tip: 'Avoid monsoon season (June-September)'
    };
  }
  
  if (cat.includes('hill') || cat.includes('mountain') || cat.includes('trek')) {
    return {
      months: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
      peak: ['April', 'May', 'October'],
      weather: 'Cool & clear',
      icon: 'cloud',
      temp: '10-25°C',
      tip: 'Summer for snow regions, post-monsoon for trekking'
    };
  }
  
  // State-based recommendations
  if (hillStates.some(s => state.includes(s))) {
    return {
      months: ['March', 'April', 'May', 'June', 'September', 'October'],
      peak: ['April', 'May', 'October'],
      weather: 'Cool & pleasant',
      icon: 'cloud',
      temp: '5-20°C',
      tip: 'March-June for summer escape, Sept-Oct for clear skies'
    };
  }
  
  if (desertStates.some(s => state.includes(s))) {
    return {
      months: ['October', 'November', 'December', 'January', 'February', 'March'],
      peak: ['November', 'December', 'February'],
      weather: 'Cool & dry',
      icon: 'sun',
      temp: '10-25°C',
      tip: 'Avoid extreme summer heat (April-June)'
    };
  }
  
  if (coastalStates.some(s => state.includes(s))) {
    return {
      months: ['October', 'November', 'December', 'January', 'February', 'March'],
      peak: ['December', 'January', 'February'],
      weather: 'Warm & sunny',
      icon: 'sun',
      temp: '22-32°C',
      tip: 'Perfect beach weather, avoid monsoon rains'
    };
  }
  
  if (northernStates.some(s => state.includes(s))) {
    return {
      months: ['October', 'November', 'February', 'March'],
      peak: ['October', 'November', 'March'],
      weather: 'Pleasant',
      icon: 'sun',
      temp: '15-28°C',
      tip: 'Winter can be foggy, summers are hot'
    };
  }
  
  if (southernStates.some(s => state.includes(s))) {
    return {
      months: ['November', 'December', 'January', 'February'],
      peak: ['December', 'January'],
      weather: 'Mild & comfortable',
      icon: 'sun',
      temp: '20-30°C',
      tip: 'Pleasant winter, moderate humidity'
    };
  }
  
  if (easternStates.some(s => state.includes(s))) {
    return {
      months: ['October', 'November', 'December', 'January', 'February', 'March'],
      peak: ['November', 'December', 'February'],
      weather: 'Cool & dry',
      icon: 'cloud',
      temp: '15-28°C',
      tip: 'Festive season in Oct-Nov is special'
    };
  }
  
  if (centralStates.some(s => state.includes(s))) {
    return {
      months: ['October', 'November', 'December', 'January', 'February', 'March'],
      peak: ['November', 'December', 'February'],
      weather: 'Pleasant',
      icon: 'sun',
      temp: '15-28°C',
      tip: 'Ideal for heritage exploration'
    };
  }
  
  // Default recommendation
  return {
    months: ['October', 'November', 'December', 'January', 'February', 'March'],
    peak: ['November', 'December', 'February'],
    weather: 'Pleasant',
    icon: 'sun',
    temp: '18-30°C',
    tip: 'Winter months are generally ideal across India'
  };
};

const PlacePage = () => {
  const { stateName, placeId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const timerRef = useRef(null);

  // Fetch weather when place data is available
  useEffect(() => {
    if (place?.name) {
      setWeatherLoading(true);
      fetchWeather(place.name, place.city, place.state)
        .then(data => {
          setWeather(data);
          setWeatherLoading(false);
        })
        .catch(() => {
          setWeatherLoading(false);
        });
    }
  }, [place?.name, place?.city, place?.state]);

  // Refresh weather
  const refreshWeather = () => {
    if (place?.name && !weatherLoading) {
      setWeatherLoading(true);
      fetchWeather(place.name, place.city, place.state)
        .then(data => {
          setWeather(data);
          setWeatherLoading(false);
        })
        .catch(() => {
          setWeatherLoading(false);
        });
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = place?.name ? `${place.name} - Know India` : 'Know India';
    const shareText = place?.description 
      ? `Discover ${place.name}: ${place.description.substring(0, 100)}...`
      : `Explore amazing places in India!`;

    // Check if Web Share API is available (mainly mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - fallback to copy
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: Copy URL to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const displayStateName = stateName.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass the state name as-is (with dashes) - backend will handle formatting
        const apiUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.STATE_PLACE}/${stateName}/place/${placeId}`);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Check if API returned an error
        if (!response.ok || data.error) {
          const errorMsg = data.details || data.error || `HTTP error! status: ${response.status}`;
          setError(errorMsg);
          setPlace(null);
          return;
        }
        
        if (!data || !data.name) {
          setError('Invalid place data received');
          setPlace(null);
          return;
        }

        if (!Array.isArray(data.images)) {
          data.images = [data.images].filter(Boolean);
        }

        setPlace(data);
        setError(null);
        setCurrentImageIndex(0);
      } catch (err) {
        setError(err.message || 'Failed to fetch place data');
        setPlace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [stateName, placeId]);

  // SEO: Update meta tags when place data is loaded
  useEffect(() => {
    if (place) {
      const seoConfig = SEO_CONFIG.place(
        place.name,
        place.state || displayStateName,
        place.category,
        place.description
      );
      updateSEO({
        ...seoConfig,
        url: window.location.href,
        image: place.images?.[0],
        type: 'article'
      });
      // Generate structured data for tourist destination
      generateStructuredData({
        name: place.name,
        description: place.description,
        state: place.state || displayStateName,
        category: place.category,
        image: place.images?.[0]
      }, 'TouristDestination');
    }
  }, [place, displayStateName]);

  useEffect(() => {
    if (place?.images?.length > 1 && isPlaying) {
      timerRef.current = setInterval(() => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
      }, 4000);
    }
    return () => clearInterval(timerRef.current);
  }, [place, isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (place?.images?.length > 1) {
        if (e.key === 'ArrowLeft') {
          setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
        } else if (e.key === 'ArrowRight') {
          setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [place?.images?.length]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50'}`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-orange-500/20 border-t-orange-500' : 'border-orange-200 border-t-orange-500'}`}
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading destination...</h2>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50'}`}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-orange-100'}`}>
            <MapPin className={isDark ? 'text-gray-600' : 'text-orange-400'} size={32} />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Place not found</h1>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We couldn't find this destination</p>
          {error && (
            <p className={`mb-4 text-sm p-3 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {error}
            </p>
          )}
          <p className={`mb-6 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            State: {stateName} | Place ID: {placeId}
          </p>
          <Link 
            to={`/places/${stateName}`} 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium"
          >
            Back to {displayStateName}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50'}`}>
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            {/* Dark theme - Glowing orbs */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[80px]" />
            <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-yellow-500/10 blur-[60px]" />
            
            {/* Subtle grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
          </>
        ) : (
          <>
            {/* Light theme - Vibrant animated orbs */}
            <motion.div
              animate={{ 
                x: [0, 40, 0], 
                y: [0, -30, 0], 
                scale: [1, 1.15, 1] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-300/60 to-amber-300/50 blur-3xl"
            />
            <motion.div
              animate={{ 
                x: [0, -50, 0], 
                y: [0, 40, 0], 
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-rose-200/60 to-orange-200/50 blur-3xl"
            />
            <motion.div
              animate={{ 
                x: [0, 30, 0], 
                y: [0, -40, 0] 
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-yellow-200/50 to-orange-200/40 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-rose-300/40 to-amber-200/30 blur-2xl"
            />
            
            {/* Decorative elements */}
            <div className="absolute top-40 right-20 w-40 h-40 border-2 border-orange-300/40 rounded-full" />
            <div className="absolute bottom-60 left-16 w-28 h-28 border-2 border-amber-300/50 rotate-45" />
            <div className="absolute top-1/3 left-1/2 w-20 h-20 border border-orange-400/30 rounded-full" />
            
            {/* Dot pattern */}
            <div 
              className="absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(234, 88, 12, 0.12) 1.5px, transparent 1.5px)`,
                backgroundSize: '28px 28px'
              }}
            />
          </>
        )}
      </div>

      {/* Hero Image Section */}
      <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        {place.images?.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              src={place.images[currentImageIndex]}
                alt={place.name}
              className="w-full h-full object-cover"
            />
            </AnimatePresence>
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            
            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 pt-20 px-4 md:px-8 z-20">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link 
                  to={`/places/${stateName}`} 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline font-medium">{displayStateName}</span>
                </Link>
                
                <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                    title="Share this place"
                  >
                    <Share2 size={18} />
                  </button>
                  
                  {/* Copied notification */}
                  <AnimatePresence>
                    {showCopied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap"
                      >
                        ✓ Link copied!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {place && (
                    <BookmarkButton 
                      place={{
                        id: placeId,
                        name: place.name,
                        state: place.state,
                        stateSlug: stateName,
                        category_name: place.category_name,
                        images: place.images,
                        description: place.description,
                      }}
                      variant="card"
                      size="md"
                      className="!rounded-full"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Image Thumbnails & Controls */}
            {place.images.length > 1 && (
              <div className="absolute bottom-24 sm:bottom-28 left-3 right-3 sm:left-4 sm:right-4 md:left-8 md:right-8 z-20 flex items-end justify-between gap-2">
                {/* Thumbnails - hidden on very small screens */}
                <div className="hidden xs:flex gap-1.5 sm:gap-2">
                  {place.images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-white scale-105 shadow-xl' 
                          : 'border-white/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${place.name} thumbnail ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {place.images.length > 4 && (
                    <button 
                      onClick={() => setShowAllImages(true)}
                      className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-black/50 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-xs sm:text-base font-bold hover:bg-black/70 transition-colors"
                    >
                      +{place.images.length - 4}
                    </button>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 ml-auto xs:ml-0">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 sm:p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                  >
                    {isPlaying ? <Pause size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Play size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                  <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-black/30 backdrop-blur-md text-white">
                  <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)}
                      className="p-0.5 sm:p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                      <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                    <span className="text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[50px] text-center">
                      {currentImageIndex + 1} / {place.images.length}
                    </span>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % place.images.length)}
                      className="p-0.5 sm:p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-8 z-10">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white mb-2 sm:mb-3 shadow-lg">
                    <Sparkles size={10} className="sm:w-3 sm:h-3" />
                    {place.category_name}
                  </span>
                  
                  <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg leading-tight">
                    {place.name}
                  </h1>
                  
                  <p className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-lg">
                    <MapPin size={14} className="sm:w-[18px] sm:h-[18px]" />
                    {place.city}, {place.state}
                  </p>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-200 to-amber-200'}`}>
            <Camera className="text-white/50" size={64} />
            <span className="mt-4 text-white/70 text-lg">No images available</span>
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className="relative z-10 px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 -mt-8 sm:-mt-12 md:-mt-16 mb-6 sm:mb-10 relative z-20"
          >
            {[
              { icon: Star, label: 'Rating', value: '4.8', color: 'yellow' },
              { icon: Users, label: 'Visitors', value: '10K+/month', color: 'blue' },
              { icon: Clock, label: 'Timings', value: place.timing || 'All Day', color: 'green' },
              { icon: Ticket, label: 'Entry', value: place.entry_fee || 'Free', color: 'purple' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border backdrop-blur-sm ${
                  isDark 
                    ? 'bg-gray-800/90 border-gray-700' 
                    : 'bg-white border-orange-100 shadow-lg shadow-orange-200/40'
                }`}
              >
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-1.5 sm:mb-2 ${
                  stat.color === 'yellow' ? 'text-yellow-500' :
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'green' ? 'text-green-500' : 'text-purple-500'
                }`} />
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`font-bold text-xs sm:text-sm md:text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* About Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 rounded-3xl border mb-6 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-orange-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                <Info className={isDark ? 'text-orange-400' : 'text-orange-600'} size={22} />
              </div>
              <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                About This Place
              </h2>
          </div>

            <p className={`leading-relaxed text-base md:text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {place.description}
            </p>
            
            {place.address && (
              <div className={`p-4 md:p-5 rounded-2xl flex items-start gap-4 ${
                isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-orange-50 to-amber-50'
              }`}>
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDark ? 'bg-orange-500/20' : 'bg-white shadow-sm'}`}>
                  <MapPin className={isDark ? 'text-orange-400' : 'text-orange-600'} size={20} />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Address</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{place.address}</p>
          </div>
        </div>
            )}
          </motion.div>

          {/* Weather & Best Time to Visit Section */}
          {(() => {
            const visitInfo = getBestTimeToVisit(place.state, place.category_name);
            
            // Get weather icon based on current weather or fallback to seasonal
            const getCurrentWeatherIcon = () => {
              if (weather?.success) {
                switch (weather.icon) {
                  case 'sun': return Sun;
                  case 'cloud-sun': return CloudSun;
                  case 'cloud': return Cloud;
                  case 'fog': return CloudFog;
                  case 'rain': return CloudRain;
                  case 'snow': return Snowflake;
                  default: return Cloud;
                }
              }
              return visitInfo.icon === 'sun' ? Sun : visitInfo.icon === 'cloud' ? Cloud : Sun;
            };
            
            const WeatherIcon = getCurrentWeatherIcon();
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`p-6 md:p-8 rounded-3xl border mb-6 ${
                  isDark 
                    ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                    : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
                }`}
              >
                {/* Header with Refresh Button */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/20' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                      <Calendar className={isDark ? 'text-amber-400' : 'text-amber-600'} size={22} />
                    </div>
                    <div>
                      <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Weather & Best Time
                      </h2>
                      {weather?.success && (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Live weather data
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={refreshWeather}
                    disabled={weatherLoading}
                    className={`p-2 rounded-xl transition-all ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    } ${weatherLoading ? 'animate-spin' : ''}`}
                    title="Refresh weather"
                  >
                    {weatherLoading ? <Loader2 size={18} /> : <RefreshCw size={18} />}
                  </button>
                </div>

                {/* Current Weather - Live Data */}
                {weather?.success ? (
                  <div className={`p-5 rounded-2xl mb-5 ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/30 border border-blue-800/30' 
                      : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100'
                  }`}>
                    {/* Location indicator */}
                    <div className={`flex items-center gap-1.5 mb-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      <MapPin size={12} />
                      <span>Weather for: <span className="font-medium">{weather.locationName}</span></span>
                    </div>
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-white shadow-md'}`}>
                          <WeatherIcon className={isDark ? 'text-blue-400' : 'text-blue-600'} size={40} />
                        </div>
                        <div>
                          <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Current Weather
                          </p>
                          <p className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {weather.temperature}°C
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {weather.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 md:gap-6">
                        <div className="text-center">
                          <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Droplets size={16} />
                            <span className="text-xs">Humidity</span>
                          </div>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {weather.humidity}%
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Wind size={16} />
                            <span className="text-xs">Wind</span>
                          </div>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {weather.windSpeed} km/h
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Thermometer size={16} />
                            <span className="text-xs">Feels like</span>
                          </div>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {weather.feelsLike || weather.temperature}°C
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : weatherLoading ? (
                  <div className={`p-8 rounded-2xl mb-5 flex items-center justify-center ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <Loader2 className={`animate-spin mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Fetching live weather...</span>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl mb-5 text-center ${
                    isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Unable to fetch live weather. Showing seasonal data below.
                    </p>
                  </div>
                )}

                {/* Seasonal Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  {/* Typical Temperature */}
                  <div className={`p-4 rounded-2xl ${
                    isDark ? 'bg-gray-700/50' : 'bg-gradient-to-br from-orange-50 to-amber-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer className={isDark ? 'text-orange-400' : 'text-orange-600'} size={18} />
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Typical Range</p>
                    </div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitInfo.temp}</p>
                  </div>

                  {/* Peak Season */}
                  <div className={`p-4 rounded-2xl ${
                    isDark ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-emerald-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Star className={isDark ? 'text-green-400' : 'text-green-600'} size={18} />
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Peak Season</p>
                    </div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitInfo.peak.slice(0, 2).join(', ')}</p>
                  </div>

                  {/* Seasonal Weather */}
                  <div className={`p-4 rounded-2xl col-span-2 md:col-span-1 ${
                    isDark ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-cyan-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className={isDark ? 'text-blue-400' : 'text-blue-600'} size={18} />
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Season Weather</p>
                    </div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitInfo.weather}</p>
                  </div>
                </div>

                {/* Recommended Months */}
                <div className="mb-4">
                  <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Best Months to Visit
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visitInfo.months.map((month, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          visitInfo.peak.includes(month)
                            ? isDark 
                              ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500/50' 
                              : 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                            : isDark 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {month.slice(0, 3)}
                        {visitInfo.peak.includes(month) && (
                          <Star size={10} className="inline ml-1 -mt-0.5" fill="currentColor" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tip */}
                <div className={`p-3 rounded-xl flex items-start gap-3 ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <Sparkles className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} size={16} />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Tip:</span> {visitInfo.tip}
                  </p>
                </div>
              </motion.div>
            );
          })()}

        {/* Key Information Section */}
          {place.keyInformation?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border mb-6 ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                  : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
              }`}
            >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
                    <Calendar className={isDark ? 'text-blue-400' : 'text-blue-600'} size={22} />
                  </div>
                  <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Key Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.keyInformation.map((info, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-2xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50/80'}`}
                    >
                      <h4 className={`font-semibold mb-2 text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        {info.question}
                      </h4>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {info.answer}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Map Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 rounded-3xl border mb-6 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-green-500/20' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                <Navigation className={isDark ? 'text-green-400' : 'text-green-600'} size={22} />
              </div>
              <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Location & Directions
              </h2>
            </div>
            
            {place.map_link ? (
              <div className="space-y-5">
                <div className={`h-72 md:h-96 rounded-2xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <iframe 
                    src={place.map_link} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    title={`Map of ${place.name}`}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* <a
                    href={place.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <ExternalLink size={18} />
                    Open in Google Maps
                  </a> */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ', ' + place.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Navigation size={18} />
                    Get Directions
                  </a>
                </div>
              </div>
            ) : (
              <div className={`h-72 md:h-80 rounded-2xl flex flex-col items-center justify-center ${
                isDark ? 'bg-gray-700/50' : 'bg-gradient-to-br from-orange-50 to-amber-50'
              }`}>
                <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-gray-600' : 'bg-white shadow-lg'}`}>
                  <Navigation className={isDark ? 'text-gray-400' : 'text-orange-400'} size={40} />
                </div>
                <p className={`font-semibold text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Map Coming Soon</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Check back for directions</p>
              </div>
            )}
          </motion.div>

          {/* Essentials Near This Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 rounded-3xl border mb-6 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20' : 'bg-gradient-to-br from-purple-100 to-indigo-100'}`}>
                <Building2 className={isDark ? 'text-purple-400' : 'text-purple-600'} size={22} />
              </div>
              <div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Essentials Nearby
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Find hotels, hospitals & more near this place
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Hotels */}
              <a
                href={`https://www.google.com/maps/search/hotels+near+${encodeURIComponent(place.name + ', ' + (place.city || place.state))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gray-700/50 border-gray-600/50 hover:border-orange-500/50 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 hover:border-orange-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30' 
                    : 'bg-white text-orange-600 shadow-sm group-hover:shadow-md'
                }`}>
                  <Hotel size={24} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Hotels</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Stay nearby</p>
                </div>
                <ExternalLink size={14} className={`${isDark ? 'text-gray-600' : 'text-gray-400'} group-hover:text-orange-500 transition-colors`} />
              </a>

              {/* Hospitals */}
              <a
                href={`https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(place.name + ', ' + (place.city || place.state))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gray-700/50 border-gray-600/50 hover:border-red-500/50 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100 hover:border-red-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30' 
                    : 'bg-white text-red-600 shadow-sm group-hover:shadow-md'
                }`}>
                  <Building2 size={24} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Hospitals</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Medical care</p>
                </div>
                <ExternalLink size={14} className={`${isDark ? 'text-gray-600' : 'text-gray-400'} group-hover:text-red-500 transition-colors`} />
              </a>

              {/* Pharmacies */}
              <a
                href={`https://www.google.com/maps/search/pharmacies+near+${encodeURIComponent(place.name + ', ' + (place.city || place.state))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gray-700/50 border-gray-600/50 hover:border-green-500/50 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 hover:border-green-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30' 
                    : 'bg-white text-green-600 shadow-sm group-hover:shadow-md'
                }`}>
                  <Pill size={24} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Pharmacies</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Medicines</p>
                </div>
                <ExternalLink size={14} className={`${isDark ? 'text-gray-600' : 'text-gray-400'} group-hover:text-green-500 transition-colors`} />
              </a>

              {/* Police Stations */}
              <a
                href={`https://www.google.com/maps/search/police+stations+near+${encodeURIComponent(place.name + ', ' + (place.city || place.state))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gray-700/50 border-gray-600/50 hover:border-blue-500/50 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30' 
                    : 'bg-white text-blue-600 shadow-sm group-hover:shadow-md'
                }`}>
                  <Shield size={24} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Police</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Emergency</p>
                </div>
                <ExternalLink size={14} className={`${isDark ? 'text-gray-600' : 'text-gray-400'} group-hover:text-blue-500 transition-colors`} />
              </a>
            </div>

            <p className={`text-xs text-center mt-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Links open in Google Maps • Results based on location
            </p>
          </motion.div>

          {/* Back to State CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-3xl text-center ${
              isDark 
                ? 'bg-gradient-to-br from-orange-900/40 to-amber-900/30 border border-orange-800/30' 
                : 'bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200'
            }`}
          >
            <h3 className={`text-xl md:text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Explore More in {displayStateName}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover other amazing destinations in this beautiful region
            </p>
            <Link 
              to={`/places/${stateName}`}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm' 
                  : 'bg-white text-orange-600 hover:bg-white/80 shadow-lg'
              }`}
            >
              <ArrowLeft size={18} />
              Back to {displayStateName}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* All Images Modal */}
      <AnimatePresence>
        {showAllImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowAllImages(false)}
          >
            <button 
              onClick={() => setShowAllImages(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={24} />
            </button>
            
            <div className="max-w-6xl w-full max-h-[85vh] overflow-y-auto">
              <h3 className="text-white text-xl font-bold mb-4 px-4">All Photos ({place.images?.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                {place.images?.map((img, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                      setShowAllImages(false);
                    }}
                    className="aspect-video rounded-xl overflow-hidden hover:ring-4 ring-orange-500 transition-all"
                  >
                    <img 
                      src={img} 
                      alt={`${place.name} gallery ${idx + 1}`} 
                      loading="lazy" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </motion.button>
              ))}
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacePage; 
