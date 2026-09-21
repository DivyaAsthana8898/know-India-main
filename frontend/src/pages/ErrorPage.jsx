import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Home, MapPin, Compass, Search, ArrowRight, Sparkles } from 'lucide-react';

const ErrorPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeHint, setActiveHint] = useState(0);

  const hints = [
    "Perhaps the page took a detour through the Himalayas?",
    "This path seems to have vanished like morning mist in Kerala...",
    "Even the Thar Desert couldn't hide this page better!",
    "The page might be meditating in Rishikesh...",
    "Lost in the bazaars of Rajasthan, perhaps?"
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHint((prev) => (prev + 1) % hints.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hints.length]);

  const quickLinks = [
    { name: 'Home', path: '/', icon: Home, color: 'from-orange-500 to-amber-500' },
    { name: 'Explore States', path: '/places', icon: MapPin, color: 'from-emerald-500 to-teal-500' },
    { name: 'Constitution', path: '/constitution', icon: Sparkles, color: 'from-blue-500 to-indigo-500' },
    { name: 'About Us', path: '/about', icon: Compass, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'}`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        {isDark ? (
          <>
            <motion.div 
              className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
              style={{
                background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
                top: '10%',
                left: '20%',
              }}
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
              style={{
                background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                bottom: '10%',
                right: '10%',
              }}
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
              style={{
                background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
                top: '50%',
                left: '60%',
              }}
              animate={{
                x: [0, 60, 0],
                y: [0, -50, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        ) : (
          <>
            {/* Mesh Gradient Overlay */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 0% 0%, rgba(251, 146, 60, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 100% 0%, rgba(239, 68, 68, 0.12) 0%, transparent 50%),
                  radial-gradient(ellipse at 100% 100%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 0% 100%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
                `,
              }}
            />
            
            {/* Large Animated Orbs */}
            <motion.div 
              className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(234, 88, 12, 0.2) 40%, transparent 70%)',
                top: '-15%',
                left: '-10%',
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.15) 40%, transparent 70%)',
                top: '20%',
                right: '-15%',
              }}
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.2) 40%, transparent 70%)',
                bottom: '-10%',
                left: '30%',
              }}
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%)',
                bottom: '20%',
                right: '20%',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Rotating Decorative Rings */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-full h-full rounded-full border border-orange-300/30" />
              <div className="absolute inset-4 rounded-full border border-amber-300/20" />
              <div className="absolute inset-8 rounded-full border border-rose-300/15" />
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-72 h-72"
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-full h-full rounded-full border border-amber-300/25" />
              <div className="absolute inset-6 rounded-full border border-orange-300/20" />
            </motion.div>

            {/* Concentric Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-orange-400/30"
                  style={{
                    width: `${(i + 1) * 200}px`,
                    height: `${(i + 1) * 200}px`,
                    left: `${-(i + 1) * 100}px`,
                    top: `${-(i + 1) * 100}px`,
                  }}
                />
              ))}
      </div>

            {/* Sparkle Dots */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  boxShadow: '0 0 6px rgba(251, 146, 60, 0.5)',
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </>
        )}

        {/* Interactive Spotlight Effect */}
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 60%)'
              : 'radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 60%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />

        {/* Floating Particles */}
        {[...Array(isDark ? 20 : 30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              isDark 
                ? 'w-2 h-2 bg-orange-400/20' 
                : 'w-3 h-3 bg-gradient-to-br from-orange-300/50 to-amber-400/50'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: isDark ? 0 : [0, 10, 0],
              opacity: isDark ? [0.2, 0.5, 0.2] : [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Decorative Pattern */}
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.06]'}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? 'ffffff' : 'f97316'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Light Mode Shine Effect */}
        {!isDark && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)',
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        
        {/* Compass Animation */}
        <motion.div
          className="mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className={`w-32 h-32 rounded-full border-4 ${
            isDark ? 'border-orange-500/30' : 'border-orange-400/40'
          } flex items-center justify-center relative`}>
            <Compass 
              size={64} 
              className={`${isDark ? 'text-orange-400' : 'text-orange-500'}`}
              strokeWidth={1.5}
            />
            {/* Cardinal Points */}
            {['N', 'E', 'S', 'W'].map((dir, i) => (
              <span
                key={dir}
                className={`absolute text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                style={{
                  top: i === 0 ? '-24px' : i === 2 ? 'auto' : '50%',
                  bottom: i === 2 ? '-24px' : 'auto',
                  left: i === 3 ? '-16px' : i === 1 ? 'auto' : '50%',
                  right: i === 1 ? '-16px' : 'auto',
                  transform: i === 0 || i === 2 ? 'translateX(-50%)' : 'translateY(-50%)',
                }}
              >
                {dir}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 404 Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-8xl md:text-9xl font-black mb-4 relative">
            <span className={`bg-gradient-to-r ${
              isDark 
                ? 'from-orange-400 via-amber-400 to-yellow-400' 
                : 'from-orange-500 via-amber-500 to-yellow-500'
            } bg-clip-text text-transparent`}>
              404
            </span>
            {/* Glowing Effect */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent blur-2xl opacity-50"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.span>
          </h1>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
          >
            Lost in the Journey?
          </motion.h2>

          {/* Rotating Hints */}
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeHint}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-md`}
              >
                {hints[activeHint]}
              </motion.p>
            </AnimatePresence>
      </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`w-full max-w-md mb-12 relative group`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
          <div className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl ${
            isDark 
              ? 'bg-gray-900/60 border-gray-700/50' 
              : 'bg-white/60 border-gray-200/50'
          }`}>
            <Search className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Try exploring these instead...
            </span>
          </div>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full"
        >
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="h-full"
              >
                <Link
                  to={link.path}
                  className={`group relative flex flex-col h-full p-5 md:p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-900/40 border-gray-700/50 hover:border-gray-600/50' 
                      : 'bg-white/40 border-gray-200/50 hover:border-gray-300/50'
                  }`}
                >
                  {/* Hover Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                  
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  
                  <h3 className={`font-semibold mb-1 flex items-center gap-2 text-sm md:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <span className="whitespace-nowrap">{link.name}</span>
                    <ArrowRight 
                      size={14} 
                      className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </h3>
                  
                  <p className={`text-xs md:text-sm mt-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {link.name === 'Home' && 'Start fresh'}
                    {link.name === 'Explore States' && 'Discover India'}
                    {link.name === 'Constitution' && 'Learn more'}
                    {link.name === 'About Us' && 'Know the team'}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Decorative Element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex items-center gap-4"
        >
          <div className={`w-16 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-gray-600' : 'via-gray-400'} to-transparent`} />
          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            🇮🇳 Know India
          </span>
          <div className={`w-16 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-gray-600' : 'via-gray-400'} to-transparent`} />
        </motion.div>

        {/* Fun Fact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className={`mt-4 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'} max-w-sm text-center`}
        >
          Fun fact: India has 28 states and 8 union territories, each with its own unique culture and heritage!
        </motion.p>
      </div>
    </div>
  );
};

export default ErrorPage; 

