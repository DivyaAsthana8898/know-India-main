import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      
      {/* Track */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-700 dark:to-purple-900 opacity-0 dark:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Thumb */}
      <motion.div
        className="absolute left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{
          x: isDark ? 24 : 0,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF'
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={12} className="text-yellow-300" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle; 