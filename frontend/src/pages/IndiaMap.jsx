import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import IndiaMap from "@aryanjsx/indiamap";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, Languages, Landmark, Mountain, ChevronRight, Sparkles, Quote, ArrowRight } from "lucide-react";
import "./IndiaMap.css";
import mandalaLogo from "../Assets/mandala logo.png";
import { useTheme } from "../context/ThemeContext";
import { getStateByCode, generateSlug } from "../lib/knowIndia";
import { convertMapCodeToKnowIndia } from "../utils/stateCodeMapping";
import { API_CONFIG, getApiUrl } from '../config';
import MapTour from "../components/MapTour";
import { updateSEO, SEO_CONFIG } from '../utils/seo';

const IndiaMapComponent = () => {
  const [selectedState, setSelectedState] = useState("");
  const [statesList, setStatesList] = useState({});
  const [zoomingState, setZoomingState] = useState(null);
  const [mapTransform, setMapTransform] = useState(null);
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // SEO: Set page meta tags on mount
  useEffect(() => {
    updateSEO(SEO_CONFIG.explore);
  }, []);

  // Initialize states list from knowindia package
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.STATES));
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        const data = await response.json();
        setStatesList(data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  // Original states list as fallback
  const states = {
    'AN': 'Andaman and Nicobar Islands',
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CH': 'Chandigarh',
    'CT': 'Chhattisgarh',
    'DD': 'Dadra and Nagar Haveli',
    'DL': 'Delhi',
    'DN': 'Daman and Diu',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HP': 'Himachal Pradesh',
    'HR': 'Haryana',
    'JH': 'Jharkhand',
    'JK': 'Jammu and Kashmir',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'LA': 'Ladakh',
    'LD': 'Lakshadweep',
    'MH': 'Maharashtra',
    'ML': 'Meghalaya',
    'MN': 'Manipur',
    'MP': 'Madhya Pradesh',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OR': 'Odisha',
    'PB': 'Punjab',
    'PY': 'Puducherry',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TG': 'Telangana',
    'TN': 'Tamil Nadu',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UT': 'Uttarakhand',
    'WB': 'West Bengal'
  };

  const computeZoomTransform = useCallback((stateCode) => {
    const container = mapContainerRef.current;
    if (!container) return null;

    const svgEl = container.querySelector('svg');
    if (!svgEl) return null;

    const statePath = svgEl.querySelector(`[id="${stateCode}"]`);
    if (!statePath) return null;

    const pathBox = statePath.getBBox();
    const svgBox = svgEl.getBBox();

    const pathCenterX = (pathBox.x + pathBox.width / 2 - svgBox.x) / svgBox.width;
    const pathCenterY = (pathBox.y + pathBox.height / 2 - svgBox.y) / svgBox.height;

    const containerRect = container.getBoundingClientRect();
    const originX = pathCenterX * 100;
    const originY = pathCenterY * 100;

    const scaleRatio = Math.min(
      containerRect.width / pathBox.width,
      containerRect.height / pathBox.height
    );
    const scale = Math.min(Math.max(scaleRatio * 0.5, 2), 5);

    return { originX, originY, scale };
  }, []);

  const handleClick = (stateCode) => {
    if (zoomingState) return;

    const stateName = statesList[stateCode] || states[stateCode] || stateCode;
    setSelectedState(stateName);

    const transform = computeZoomTransform(stateCode);
    if (transform) {
      setZoomingState(stateCode);
      setMapTransform(transform);

      const container = mapContainerRef.current;
      if (container) {
        const svgEl = container.querySelector('svg');
        if (svgEl) {
          svgEl.querySelectorAll('path').forEach(p => p.removeAttribute('data-selected'));
          const target = svgEl.querySelector(`[id="${stateCode}"]`);
          if (target) target.setAttribute('data-selected', 'true');
        }
      }
    }

    const knowIndiaCode = convertMapCodeToKnowIndia(stateCode);
    const stateData = getStateByCode(knowIndiaCode);
    const targetUrl = stateData
      ? `/places/${stateData.slug}`
      : `/places/${generateSlug(stateName)}`;

    const delay = transform ? 750 : 0;
    setTimeout(() => {
      navigate(targetUrl);
    }, delay);
  };

  const quotes = [
    { 
      text: "India is the cradle of the human race, the birthplace of human speech, the mother of history, the grandmother of legend, and the great-grandmother of tradition.", 
      author: "Mark Twain" 
    },
    { 
      text: "We owe a lot to the Indians, who taught us how to count, without which no worthwhile scientific discovery could have been made.", 
      author: "Albert Einstein" 
    },
    { 
      text: "If there is one place on the face of earth where all the dreams of living men have found a home from the very earliest days when man began the dream of existence, it is India.", 
      author: "Romain Rolland" 
    },
    { 
      text: "India is not a country, but a home; not a nation, but a family.", 
      author: "Mahatma Gandhi" 
    },
    { 
      text: "In India, I found a race of mortals living upon the Earth, but not adhering to it, inhabiting cities, but not being fixed to them, possessing everything, but possessed by nothing.", 
      author: "Apollonius Tyanaeus" 
    }
  ];

  const stats = [
    { icon: MapPin, value: "28", label: "States", color: "from-orange-500 to-amber-500" },
    { icon: Globe, value: "8", label: "Union Territories", color: "from-blue-500 to-cyan-500" },
    { icon: Languages, value: "19,500+", label: "Languages & Dialects", color: "from-purple-500 to-pink-500" },
    { icon: Landmark, value: "42", label: "UNESCO Sites", color: "from-emerald-500 to-teal-500" },
  ];

  const features = [
    { icon: Mountain, title: "Diverse Geography", desc: "From Himalayas to tropical beaches" },
    { icon: Landmark, title: "Ancient Heritage", desc: "Civilizations spanning 5000+ years" },
    { icon: Languages, title: "Cultural Mosaic", desc: "Unity in extraordinary diversity" },
    { icon: Sparkles, title: "Living Traditions", desc: "Festivals, arts, and crafts" },
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50'}`}>
      <MapTour />
      
      {/* Light Mode Mesh Gradient Background */}
      {!isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Main Mesh Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 20% 40%, rgba(251, 146, 60, 0.25) 0%, transparent 50%),
                radial-gradient(ellipse 60% 60% at 80% 20%, rgba(249, 115, 22, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse 70% 70% at 70% 80%, rgba(244, 63, 94, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 50% 50% at 10% 90%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse 40% 40% at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)
              `,
            }}
          ></div>
          
          {/* Animated Floating Orbs */}
          <motion.div
            animate={{ 
              x: [0, 30, 0], 
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300/40 to-amber-400/30 blur-3xl"
          ></motion.div>
          <motion.div
            animate={{ 
              x: [0, -40, 0], 
              y: [0, 30, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-rose-300/30 to-pink-400/25 blur-3xl"
          ></motion.div>
          <motion.div
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -30, 0],
              scale: [1, 1.08, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-300/25 to-cyan-300/20 blur-3xl"
          ></motion.div>
          <motion.div
            animate={{ 
              x: [0, -25, 0], 
              y: [0, 25, 0],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-2/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tl from-purple-300/20 to-violet-300/15 blur-3xl"
          ></motion.div>
          
          {/* Decorative geometric shapes */}
          <div className="absolute top-32 right-20 w-32 h-32 border-2 border-orange-300/30 rounded-full"></div>
          <div className="absolute bottom-40 left-16 w-24 h-24 border-2 border-amber-300/25 rotate-45"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-rose-300/20 rounded-lg rotate-12"></div>
          
          {/* Subtle dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle, #f97316 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>
      )}
      
      {/* Dark Mode Background */}
      {isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 bg-orange-600"></div>
          <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 bg-blue-600"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-20 bg-purple-600"></div>
          
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 px-4 gradient-background">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Mandala Logo */}
            <div className="mandala-container inline-block mb-6 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 md:w-24 md:h-24"
              >
                <img src={mandalaLogo} alt="Mandala Logo" className="w-full h-full" />
              </motion.div>
              <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${isDark ? 'bg-orange-500/30' : 'bg-orange-400/40'}`}></div>
            </div>

            {/* Title */}
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Explore{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Incredible India
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                  <path d="M0 4 Q50 0, 100 4 T200 4" stroke="url(#gradient)" strokeWidth="3" fill="none"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316"/>
                      <stop offset="50%" stopColor="#f59e0b"/>
                      <stop offset="100%" stopColor="#ea580c"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover the rich cultural heritage, breathtaking landscapes, and unique traditions of each Indian state
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`group flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600' 
                    : 'bg-white/80 border-gray-200/50 hover:border-gray-300 shadow-lg shadow-gray-200/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Sidebar - Info & Quotes */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full lg:w-1/3 space-y-6 state-info"
            >
              {/* How to Use Card */}
              <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-800/30' 
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-amber-500/20' : 'bg-amber-500/10'
                  }`}>
                    <Sparkles className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                    How to Explore
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Click on any state or union territory on the map to discover its attractions, culture, and highlights. 
                  Each region is color-coded for easy identification.
                </p>
              </div>

              {/* Features Grid */}
              <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
                isDark ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/90 border-gray-200/50 shadow-xl shadow-gray-200/30'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                  India: A Land of Diversity
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isDark 
                          ? 'bg-gray-700/50 hover:bg-gray-700' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <feature.icon className={`w-5 h-5 mb-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                      <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quote Carousel */}
              <div className={`quote-container rounded-2xl overflow-hidden border backdrop-blur-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-indigo-800/30' 
                  : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200/50 shadow-xl shadow-indigo-200/20'
              }`}>
                <div className="p-4 border-b border-opacity-20 flex items-center gap-3" style={{ borderColor: isDark ? '#6366f1' : '#c7d2fe' }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/10'
                  }`}>
                    <Quote className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <span className={`font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    Voices on India
                  </span>
                </div>

                <div className="relative h-40 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuoteIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 p-5 flex flex-col justify-center"
                    >
                      <p className={`text-sm italic leading-relaxed mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        "{quotes[currentQuoteIndex].text}"
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-0.5 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-500'}`}></div>
                        <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {quotes[currentQuoteIndex].author}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-center gap-2 pb-4">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuoteIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentQuoteIndex === index
                          ? isDark ? 'bg-indigo-400 w-6' : 'bg-indigo-500 w-6'
                          : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`View quote ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Map Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full lg:w-2/3"
            >
              <div className={`map-container relative rounded-3xl p-6 border backdrop-blur-sm overflow-hidden ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700/50' 
                  : 'bg-white/90 border-gray-200/50 shadow-2xl shadow-gray-300/30'
              }`}>
                {/* Map Glow Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${
                    isDark ? 'bg-orange-500' : 'bg-orange-300'
                  }`}></div>
                </div>

                {/* Selected State Display */}
                <AnimatePresence>
                  {selectedState && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mb-4 p-4 rounded-xl text-center ${
                        isDark ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-lg font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                          Loading {selectedState}...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* India Map */}
                <div
                  ref={mapContainerRef}
                  className={`relative flex justify-center items-center map-zoom-wrapper ${zoomingState ? 'map-zooming' : ''}`}
                  style={
                    mapTransform
                      ? {
                          transformOrigin: `${mapTransform.originX}% ${mapTransform.originY}%`,
                          transform: `scale(${mapTransform.scale})`,
                        }
                      : undefined
                  }
                >
                  <IndiaMap
                    onClick={handleClick}
                    size="100%"
                    mapColor="transparent"
                    strokeColor={isDark ? "#333333" : "#333333"}
                    strokeWidth="0.5"
                    className={`colorful-india-map ${isDark ? 'dark-map' : ''} ${zoomingState ? 'state-zooming' : ''}`}
                    data-zooming-state={zoomingState || undefined}
                  />
                </div>

                {/* Zoom overlay with state name */}
                <AnimatePresence>
                  {zoomingState && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className={`px-6 py-3 rounded-2xl backdrop-blur-md ${
                          isDark
                            ? 'bg-gray-900/80 border border-orange-500/40'
                            : 'bg-white/90 border border-orange-300 shadow-xl'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          <span className={`text-lg font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                            Exploring {selectedState}...
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Instruction Badge */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className={`absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                    isDark 
                      ? 'bg-gray-900/80 text-gray-300 border border-gray-700' 
                      : 'bg-white/90 text-gray-600 border border-gray-200 shadow-lg'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Click any state to explore</span>
                  <ChevronRight size={16} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA - Learn About Constitution */}
      <section className="relative px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className={`relative rounded-3xl overflow-hidden ${
            isDark ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="w-6 h-6 text-blue-200" />
                  <span className="text-sm font-medium text-blue-200 uppercase tracking-wider">Explore More</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                  Learn About Our Constitution
                </h3>
                <p className={`${isDark ? 'text-blue-200' : 'text-blue-100'}`}>
                  Discover the foundation of India's democracy and governance
                </p>
              </div>
              <button 
                onClick={() => navigate('/constitution')}
                className={`group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  isDark 
                    ? 'bg-white text-blue-600 hover:bg-blue-50' 
                    : 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20'
                }`}
              >
                View Constitution
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );    
};

export default IndiaMapComponent;
