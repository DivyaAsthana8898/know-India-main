import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Search, Filter, Sparkles, ChevronDown, Loader2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getApiUrl } from "../config";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FESTIVALS_PER_PAGE = 9;

const FestivalsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl('/api/festivals'));
        const data = await response.json();
        if (data.success) {
          setFestivals(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching festivals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFestivals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth]);

  const filteredFestivals = festivals.filter(festival => {
    const matchesSearch = !searchTerm || 
      festival.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.main_states.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.best_places.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = !selectedMonth || festival.month === selectedMonth;
    
    return matchesSearch && matchesMonth;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFestivals.length / FESTIVALS_PER_PAGE));
  const startIndex = (currentPage - 1) * FESTIVALS_PER_PAGE;
  const paginatedFestivals = filteredFestivals.slice(startIndex, startIndex + FESTIVALS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const truncateText = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <main className={`min-h-screen pt-20 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-b from-orange-50 to-white'}`}>
      
      {/* Hero Section */}
      <section className={`relative py-16 md:py-24 overflow-hidden ${isDark ? 'bg-gray-900/50' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}>
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl ${isDark ? 'bg-orange-500/10' : 'bg-white/20'}`}></div>
          <div className={`absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-amber-500/10' : 'bg-yellow-300/20'}`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'}`}>
              <Sparkles size={16} />
              <span className="text-sm font-medium">Celebrate India</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-white'}`}
          >
            Indian Festivals
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-white/90'}`}
          >
            Discover the vibrant celebrations that bring India together - from ancient traditions to modern festivities
          </motion.p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 md:p-6 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                placeholder="Search festivals by name, state, or place..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
            </div>

            {/* Month Filter */}
            <div className="relative">
              <Filter className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`pl-12 pr-10 py-3 rounded-xl border appearance-none cursor-pointer transition-all ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              >
                <option value="">All Months</option>
                {MONTHS.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
            </div>
          </div>

          {/* Results count */}
          <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Showing {filteredFestivals.length} of {festivals.length} festivals
            {filteredFestivals.length > FESTIVALS_PER_PAGE && (
              <span> · Page {currentPage} of {totalPages}</span>
            )}
          </div>
        </motion.div>
      </section>

      {/* Festivals Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading festivals...</p>
          </div>
        ) : filteredFestivals.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFestivals.map((festival, index) => (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/festivals/${festival.id}`}
                  className={`group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isDark ? 'bg-gray-800 border border-gray-700 hover:border-orange-500/50' : 'bg-white hover:shadow-orange-500/10'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={festival.image_url}
                      alt={festival.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Month Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                      <Calendar size={14} className="text-orange-500" />
                      <span className="text-sm font-medium text-gray-800">{festival.month}</span>
                    </div>

                    {/* View Details Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                      <span className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        View Details
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-xl font-bold mb-3 line-clamp-1 group-hover:text-orange-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {festival.name}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {truncateText(festival.description, 150)}
                    </p>

                    {/* Info */}
                    <div className={`space-y-2 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Main States</p>
                          <p className={`text-sm line-clamp-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{festival.main_states}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Best Places</p>
                          <p className={`text-sm line-clamp-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{festival.best_places}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-10"
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`min-w-[2.5rem] py-2 rounded-xl font-medium transition-all ${
                      currentPage === page
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
              <Calendar size={40} className={isDark ? 'text-gray-600' : 'text-orange-300'} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No festivals found
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm || selectedMonth 
                ? 'Try adjusting your search or filter criteria' 
                : 'Festivals will appear here once added'}
            </p>
            {(searchTerm || selectedMonth) && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedMonth(''); }}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Stats Section */}
      {festivals.length > 0 && (
        <section className={`py-16 ${isDark ? 'bg-gray-900/50' : 'bg-orange-50'}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className={`text-4xl font-bold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                  {festivals.length}
                </p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Festivals</p>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-bold mb-2 ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                  {[...new Set(festivals.map(f => f.month))].length}
                </p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Months Covered</p>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>
                  {[...new Set(festivals.flatMap(f => f.main_states.split(',')))].length}+
                </p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>States Celebrate</p>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-bold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  365
                </p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Days of Celebration</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default FestivalsPage;
