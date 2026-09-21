import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Landmark, X, ArrowRight, Camera, PartyPopper } from "lucide-react";
import { getAllStates, generateSlug } from "../lib/knowIndia";
import { useTheme } from "../context/ThemeContext";
import { getApiUrl } from "../config";

/**
 * Build a searchable index from knowindia data (states & tourist attractions)
 * Uses the new data adapter for consistent data access
 */
const buildStaticSearchIndex = () => {
  const allStatesAndUTs = getAllStates();
  const searchIndex = [];

  // Process all states and union territories
  allStatesAndUTs.forEach(region => {
    const regionType = region.type === 'union_territory' ? 'Union Territory' : 'State';
    
    searchIndex.push({
      id: `${region.type}-${region.code}`,
      type: 'state',
      name: region.name,
      subtitle: `${regionType} • Capital: ${region.capital}`,
      slug: region.slug,
      route: `/places/${region.slug}`,
      keywords: [
        region.name.toLowerCase(),
        region.capital?.toLowerCase(),
        region.code?.toLowerCase(),
        ...(region.officialLanguages || []).map(l => l.toLowerCase()),
        ...(region.famousFor || []).map(f => f.toLowerCase()),
      ].filter(Boolean),
    });

    // Add tourist attractions as places
    if (region.touristAttractions) {
      region.touristAttractions.forEach((attraction, idx) => {
        const placeSlug = generateSlug(attraction.name);
        searchIndex.push({
          id: `attraction-${region.code}-${idx}`,
          type: 'attraction',
          name: attraction.name,
          subtitle: `${attraction.type || 'Attraction'} • ${region.name}`,
          stateName: region.name,
          stateSlug: region.slug,
          placeType: attraction.type,
          slug: placeSlug,
          route: `/places/${region.slug}`,
          keywords: [
            attraction.name.toLowerCase(),
            attraction.type?.toLowerCase(),
            region.name.toLowerCase(),
            attraction.city?.toLowerCase(),
          ].filter(Boolean),
        });
      });
    }
  });

  return searchIndex;
};

/**
 * Search function with fuzzy matching
 */
const searchItems = (query, index, limit = 10) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  
  const scored = index.map(item => {
    let score = 0;
    const nameLC = item.name.toLowerCase();
    
    // Exact match
    if (nameLC === normalizedQuery) {
      score += 100;
    }
    // Starts with query
    else if (nameLC.startsWith(normalizedQuery)) {
      score += 50;
    }
    // Contains query
    else if (nameLC.includes(normalizedQuery)) {
      score += 30;
    }
    
    // Word matches
    queryWords.forEach(word => {
      if (word.length < 2) return;
      
      if (nameLC.includes(word)) {
        score += 15;
      }
      
      item.keywords.forEach(keyword => {
        if (keyword.includes(word)) {
          score += 5;
        }
        if (keyword.startsWith(word)) {
          score += 8;
        }
      });
    });
    
    // Boost database places (they have images)
    if (item.type === 'place') {
      score += 5;
    }

    // Boost festivals when query contains 'festival'
    if (item.type === 'festival' && normalizedQuery.includes('festival')) {
      score += 15;
    }
    
    // Boost states for short queries
    if (item.type === 'state' && normalizedQuery.length < 4) {
      score += 10;
    }
    
    return { ...item, score };
  });
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

const GlobalSearch = ({ isMobile = false, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [festivals, setFestivals] = useState([]);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  
  // Fetch festivals from API once on mount
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(getApiUrl('/api/festivals'));
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setFestivals(data.data);
        }
      } catch (error) {
        console.error('Error fetching festivals for search:', error);
      }
    };
    fetchFestivals();
  }, []);

  // Build combined search index from local data + festivals
  const searchIndex = useMemo(() => {
    const staticIndex = buildStaticSearchIndex();

    const festivalEntries = festivals.map((festival) => ({
      id: `festival-${festival._id || festival.id}`,
      type: 'festival',
      name: festival.name,
      subtitle: `${festival.month || 'Festival'} • ${festival.main_states || 'India'}`,
      route: `/festivals/${festival._id || festival.id}`,
      keywords: [
        festival.name?.toLowerCase(),
        festival.month?.toLowerCase(),
        festival.main_states?.toLowerCase(),
        festival.best_places?.toLowerCase(),
        'festival',
      ].filter(Boolean),
    }));

    return [...staticIndex, ...festivalEntries];
  }, [festivals]);
  
  // Handle search with debounce
  const handleSearch = useCallback((value) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      const searchResults = searchItems(value, searchIndex);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0 || value.length >= 2);
    }, 150);
  }, [searchIndex]);
  
  // Handle selection
  const handleSelect = useCallback((item) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onClose) onClose();
    
    navigate(item.route);
  }, [navigate, onClose]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect]);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Group results by type
  const groupedResults = useMemo(() => {
    const states = results.filter(r => r.type === 'state');
    const places = results.filter(r => r.type === 'place');
    const attractions = results.filter(r => r.type === 'attraction');
    const festivalResults = results.filter(r => r.type === 'festival');
    return { states, places, attractions, festivals: festivalResults };
  }, [results]);

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-64 lg:w-72'}`}>
      {/* Search Input */}
      <div className={`relative flex items-center rounded-2xl transition-all duration-200 ${
        isOpen 
          ? isDark 
            ? 'ring-2 ring-orange-500/50 bg-gray-800' 
            : 'ring-2 ring-orange-500/50 bg-white shadow-lg'
          : isDark 
            ? 'bg-gray-800/80 hover:bg-gray-800' 
            : 'bg-gray-100 hover:bg-gray-200/80'
      }`}>
        <Search className={`absolute left-4 w-5 h-5 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search states, places, festivals..."
          className={`w-full py-3 pl-12 pr-10 text-sm rounded-2xl outline-none transition-colors ${
            isDark 
              ? 'bg-transparent text-white placeholder-gray-500' 
              : 'bg-transparent text-gray-900 placeholder-gray-500'
          }`}
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className={`absolute right-3 p-1 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-300 text-gray-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Results Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 shadow-2xl border ${
          isDark 
            ? 'bg-gray-900 border-gray-700/50' 
            : 'bg-white border-gray-200'
        }`}>
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {/* States Section */}
              {groupedResults.states.length > 0 && (
                <div>
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                    isDark ? 'text-gray-500 bg-gray-800/90 backdrop-blur-sm' : 'text-gray-500 bg-gray-50/90 backdrop-blur-sm'
                  }`}>
                    States & Union Territories
                  </div>
                  {groupedResults.states.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <ResultItem 
                        key={item.id} 
                        item={item} 
                        isSelected={selectedIndex === globalIdx}
                        isDark={isDark}
                        onSelect={handleSelect}
                        onHover={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </div>
              )}
              
              {/* Database Places Section */}
              {groupedResults.places.length > 0 && (
                <div>
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                    isDark ? 'text-gray-500 bg-gray-800/90 backdrop-blur-sm' : 'text-gray-500 bg-gray-50/90 backdrop-blur-sm'
                  }`}>
                    Featured Places
                  </div>
                  {groupedResults.places.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <ResultItem 
                        key={item.id} 
                        item={item} 
                        isSelected={selectedIndex === globalIdx}
                        isDark={isDark}
                        onSelect={handleSelect}
                        onHover={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </div>
              )}
              
              {/* Tourist Attractions Section */}
              {groupedResults.attractions.length > 0 && (
                <div>
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                    isDark ? 'text-gray-500 bg-gray-800/90 backdrop-blur-sm' : 'text-gray-500 bg-gray-50/90 backdrop-blur-sm'
                  }`}>
                    Tourist Attractions
                  </div>
                  {groupedResults.attractions.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <ResultItem 
                        key={item.id} 
                        item={item} 
                        isSelected={selectedIndex === globalIdx}
                        isDark={isDark}
                        onSelect={handleSelect}
                        onHover={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Festivals Section */}
              {groupedResults.festivals.length > 0 && (
                <div>
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                    isDark ? 'text-gray-500 bg-gray-800/90 backdrop-blur-sm' : 'text-gray-500 bg-gray-50/90 backdrop-blur-sm'
                  }`}>
                    Festivals
                  </div>
                  {groupedResults.festivals.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <ResultItem 
                        key={item.id} 
                        item={item} 
                        isSelected={selectedIndex === globalIdx}
                        isDark={isDark}
                        onSelect={handleSelect}
                        onHover={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : query.length >= 2 ? (
            <div className={`px-4 py-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for a state, place, or festival name</p>
            </div>
          ) : null}
          
          {/* Keyboard hints */}
          <div className={`px-4 py-2 text-xs border-t flex items-center gap-3 ${
            isDark 
              ? 'text-gray-600 border-gray-800 bg-gray-900/50' 
              : 'text-gray-400 border-gray-100 bg-gray-50/50'
          }`}>
            <span>
              <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>↑↓</kbd>
              {' '}Navigate
            </span>
            <span>
              <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>↵</kbd>
              {' '}Select
            </span>
            <span>
              <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>esc</kbd>
              {' '}Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Separate result item component for better performance
const ResultItem = ({ item, isSelected, isDark, onSelect, onHover }) => {
  const getIcon = () => {
    if (item.type === 'state') return <MapPin className="w-5 h-5" />;
    if (item.type === 'festival') return <PartyPopper className="w-5 h-5" />;
    if (item.type === 'place' && item.image) {
      return (
        <img 
          src={item.image} 
          alt="" 
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    if (item.type === 'place') return <Camera className="w-5 h-5" />;
    return <Landmark className="w-5 h-5" />;
  };

  const getIconStyle = () => {
    if (item.type === 'state') {
      return isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600';
    }
    if (item.type === 'festival') {
      return isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-600';
    }
    if (item.type === 'place') {
      return item.image ? '' : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600');
    }
    return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600';
  };

  return (
    <button
      onClick={() => onSelect(item)}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isSelected
          ? isDark 
            ? 'bg-orange-500/20 text-white' 
            : 'bg-orange-50 text-gray-900'
          : isDark 
            ? 'text-gray-300 hover:bg-gray-800' 
            : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${getIconStyle()}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {item.name}
        </div>
        <div className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {item.subtitle}
        </div>
      </div>
      
      <ArrowRight className={`flex-shrink-0 w-4 h-4 transition-transform ${
        isSelected ? 'translate-x-1' : ''
      } ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
    </button>
  );
};

export default GlobalSearch;
