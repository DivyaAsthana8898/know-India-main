import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Book, Sparkles, ArrowRight, ChevronDown, Globe, Users, Landmark, Mountain as MountainIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { updateSEO, SEO_CONFIG, generateStructuredData } from "../utils/seo";

// Import images
import Beach from "../Assets/home/Beach.jpg";
import Heritage from "../Assets/home/Heritage.jpg";
import Mountain from "../Assets/home/Mountains.jpg";
import Religious from "../Assets/home/religion.jpg";

const slideshowImages = [
  { src: Heritage, title: "Heritage", subtitle: "Ancient wonders", alt: "India's ancient heritage sites and monuments showcasing rich history and architecture" },
  { src: Beach, title: "Beaches", subtitle: "Coastal paradise", alt: "Beautiful beaches of India with pristine waters and golden sands" },
  { src: Mountain, title: "Mountains", subtitle: "Himalayan majesty", alt: "Majestic Himalayan mountains and hill stations of India" },
  { src: Religious, title: "Spirituality", subtitle: "Sacred destinations", alt: "Sacred temples and spiritual destinations across India" },
];

const Home = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // SEO: Set page meta tags on mount
  useEffect(() => {
    updateSEO(SEO_CONFIG.home);
    generateStructuredData({}, 'WebSite');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: MapPin, title: "28+ States", desc: "Explore every corner", color: "from-orange-500 to-amber-500" },
    { icon: Landmark, title: "Rich Heritage", desc: "5000 years of history", color: "from-blue-500 to-indigo-500" },
    { icon: Globe, title: "Diverse Culture", desc: "Unity in diversity", color: "from-purple-500 to-pink-500" },
    { icon: MountainIcon, title: "Natural Beauty", desc: "From peaks to beaches", color: "from-emerald-500 to-teal-500" },
  ];

  const stats = [
    { value: "1.4B+", label: "Population" },
    { value: "22", label: "Official Languages" },
    { value: "42", label: "UNESCO Sites" },
    { value: "500+", label: "Wildlife Sanctuaries" },
  ];

  return (
    <main className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`} role="main">
      
      {/* Hero Section - Full Screen */}
      <section className="relative w-full h-screen overflow-hidden" aria-label="Hero section showcasing India's destinations">
        <h1 className="sr-only">Know India - Explore India's Incredible Destinations by aryanjsx</h1>
        {/* Slideshow Background */}
        <AnimatePresence mode="wait">
        {slideshowImages.map((image, index) => (
          index === currentImageIndex && (
            <motion.div
              key={index}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${image.src})` }}
                />
              </motion.div>
          )
        ))}
      </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
          
          {/* Corner decorations */}
          <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full hidden md:block"></div>
          <div className="absolute top-24 left-14 w-24 h-24 border border-white/5 rounded-full hidden md:block"></div>
          <div className="absolute bottom-40 right-10 w-40 h-40 border border-white/10 rounded-full hidden md:block"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6 md:px-12 z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">Discover the Incredible</span>
          </motion.div>

          {/* Main Title */}
        <motion.h1
            initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
        >
            <span className="block">Explore</span>
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              India
            </span>
        </motion.h1>

          {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl max-w-2xl text-white/80 mb-8"
        >
            Journey through ancient temples, pristine beaches, majestic mountains, 
            and vibrant cities. Experience a land where tradition meets modernity.
        </motion.p>

          {/* CTA Buttons */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/places"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl text-lg shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-105"
            >
              <MapPin className="w-5 h-5" />
              Explore States
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/constitution"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-2xl text-lg transition-all duration-300"
            >
              <Book className="w-5 h-5" />
              Our Constitution
            </Link>
          </motion.div>

          {/* Image Indicator Dots */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-3 mt-12"
          >
            {slideshowImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`transition-all duration-300 ${
                  currentImageIndex === index 
                    ? 'w-8 h-2 bg-orange-400 rounded-full' 
                    : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </motion.div>

          {/* Current Slide Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute bottom-8 left-8 hidden md:block"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white/60 text-sm uppercase tracking-widest mb-1">
                  {slideshowImages[currentImageIndex].subtitle}
                </p>
                <p className="text-white text-2xl font-bold">
                  {slideshowImages[currentImageIndex].title}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, y: { duration: 1.5, repeat: Infinity } }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-white/60" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`relative py-20 px-4 overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-orange-50 via-amber-50/50 to-white'}`}>
        {/* Light Mode Background Effects */}
        {!isDark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Mesh Gradient */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 0% 30%, rgba(251, 146, 60, 0.2) 0%, transparent 50%),
                  radial-gradient(ellipse 60% 60% at 100% 70%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse 50% 50% at 50% 100%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)
                `,
              }}
            ></div>
            
            {/* Animated Orbs */}
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-orange-300/40 to-amber-300/30 blur-3xl"
            ></motion.div>
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-yellow-300/30 to-amber-300/25 blur-3xl"
            ></motion.div>
            
            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 border-2 border-orange-200/40 rounded-full"></div>
            <div className="absolute bottom-20 left-16 w-24 h-24 border-2 border-amber-200/30 rotate-45"></div>
            
            {/* Dot pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle, #f97316 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
              }}
            ></div>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
              isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700'
            }`}>
              Why Visit India
            </span>
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              A Land of{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Wonders
              </span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              From the snow-capped Himalayas to tropical beaches, ancient temples to modern metropolises
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group p-6 rounded-3xl border transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                    : 'bg-white border-gray-200/50 shadow-lg shadow-gray-100 hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`relative py-20 px-4 overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500'}`}>
        {/* Light mode decorative elements */}
        {!isDark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            
            {/* Animated shine effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              style={{ width: '50%' }}
            ></motion.div>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${isDark ? 'bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent' : 'text-white'}`}>
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-white/80'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative py-20 px-4 overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-white via-orange-50/30 to-amber-50/50'}`}>
        {/* Light Mode Background */}
        {!isDark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-72 h-72 rounded-full bg-gradient-to-br from-orange-200/40 to-amber-200/30 blur-3xl"
            ></motion.div>
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-tl from-yellow-200/30 to-orange-200/25 blur-3xl"
            ></motion.div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative rounded-3xl overflow-hidden ${
              isDark ? 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/20' : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-2xl shadow-orange-500/20'
            }`}
          >
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            
            {/* Animated shine */}
            {!isDark && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                style={{ width: '30%' }}
              ></motion.div>
            )}

            <div className="relative p-8 md:p-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6"
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>
                Ready to Explore?
              </h2>
              <p className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? 'text-orange-200' : 'text-white/90'}`}>
                Start your journey through India's 28 states and 8 union territories. 
                Discover unique cultures, cuisines, and landscapes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/places"
                  className={`group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    isDark 
                      ? 'bg-white text-orange-600 hover:bg-orange-50' 
                      : 'bg-white text-orange-600 hover:bg-orange-50 shadow-xl'
                  }`}
                >
                  Start Exploring
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                      : 'bg-transparent text-white hover:bg-white/10 border-2 border-white'
                  }`}
                >
                  Learn More
          </Link>
              </div>
            </div>
        </motion.div>
      </div>
    </section>
  </main>
  );
};

export default Home;
