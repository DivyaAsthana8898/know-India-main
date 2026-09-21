import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Search, ChevronRight, X } from "lucide-react";
import constitutionPdf from "../../src/Assets/Constitution.pdf";
import { useTheme } from "../context/ThemeContext";

const Constitution = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sidebarItems = [
    { id: "preamble", label: "Preamble", path: "/constitution/preamble" },
    { id: "constitution", label: "Constitution of India", path: "/constitution/overview" },
    { id: "initiation", label: "Constitutional Initiation", path: "/constitution/initiation" },
    { id: "amendments", label: "Constitutional Amendments", path: "/constitution/amendments" },
    { id: "features", label: "Key Features", path: "/constitution/features" },
    { id: "contents", label: "Contents", path: "/constitution" },
  ];

  const timelineData = [
    { year: "1950", title: "Constitution of India", description: "The Constitution came into effect on January 26, 1950" },
    { year: "1951", title: "First Amendment", description: "Added restrictions on freedom of speech and expression" },
    { year: "1976", title: "42nd Amendment", description: "Added 'Socialist', 'Secular' and 'Integrity' to Preamble" },
    { year: "2002", title: "86th Amendment", description: "Right to Education made a Fundamental Right" },
    { year: "2024", title: "Recent Updates", description: "Ongoing constitutional developments" },
  ];

  const keyFeatures = [
    "The longest written constitution in the world",
    "Provides fundamental rights to all citizens",
    "Establishes a federal structure with unitary features",
    "Independent judiciary with judicial review",
    "Parliamentary form of government",
    "Fundamental duties for citizens",
  ];

  // Searchable content database
  const searchableContent = [
    // Preamble related
    { title: "Preamble", description: "Introduction to the Constitution declaring India as Sovereign, Socialist, Secular, Democratic Republic", path: "/constitution/preamble", category: "Preamble" },
    { title: "Sovereign", description: "India is an independent nation, not subject to any external power", path: "/constitution/preamble", category: "Preamble" },
    { title: "Socialist", description: "The state aims to reduce inequality in income and status", path: "/constitution/preamble", category: "Preamble" },
    { title: "Secular", description: "The state treats all religions equally with no official state religion", path: "/constitution/preamble", category: "Preamble" },
    { title: "Democratic", description: "Government is elected by the people through universal adult suffrage", path: "/constitution/preamble", category: "Preamble" },
    { title: "Republic", description: "The head of state (President) is elected, not hereditary", path: "/constitution/preamble", category: "Preamble" },
    { title: "Justice", description: "Social, economic and political justice for all citizens", path: "/constitution/preamble", category: "Preamble" },
    { title: "Liberty", description: "Liberty of thought, expression, belief, faith and worship", path: "/constitution/preamble", category: "Preamble" },
    { title: "Equality", description: "Equality of status and opportunity for all", path: "/constitution/preamble", category: "Preamble" },
    { title: "Fraternity", description: "Brotherhood assuring dignity of individual and unity of nation", path: "/constitution/preamble", category: "Preamble" },
    
    // Constitution Overview
    { title: "Constitution of India", description: "The supreme law of India with 470+ Articles, 25 Parts, and 12 Schedules", path: "/constitution/overview", category: "Overview" },
    { title: "Articles", description: "Over 470 articles covering various aspects of governance", path: "/constitution/overview", category: "Overview" },
    { title: "Parts", description: "25 Parts organizing different aspects of the Constitution", path: "/constitution/overview", category: "Overview" },
    { title: "Schedules", description: "12 Schedules containing additional details and lists", path: "/constitution/overview", category: "Overview" },
    { title: "Dr. B.R. Ambedkar", description: "Father of the Indian Constitution, Chairman of Drafting Committee", path: "/constitution/overview", category: "Overview" },
    { title: "Dr. Rajendra Prasad", description: "President of the Constituent Assembly, First President of India", path: "/constitution/overview", category: "Overview" },
    { title: "Jawaharlal Nehru", description: "Member of Drafting Committee, First Prime Minister of India", path: "/constitution/overview", category: "Overview" },
    
    // Constitutional Initiation
    { title: "Constituent Assembly", description: "The body that drafted the Constitution between 1946-1949", path: "/constitution/initiation", category: "History" },
    { title: "Cabinet Mission Plan", description: "1946 plan that established the Constituent Assembly", path: "/constitution/initiation", category: "History" },
    { title: "November 26, 1949", description: "Date when the Constitution was adopted", path: "/constitution/initiation", category: "History" },
    { title: "January 26, 1950", description: "Date when the Constitution came into effect - Republic Day", path: "/constitution/initiation", category: "History" },
    { title: "Drafting Committee", description: "Committee headed by Dr. Ambedkar that drafted the Constitution", path: "/constitution/initiation", category: "History" },
    { title: "Republic Day", description: "Celebrated on January 26 to mark the Constitution coming into effect", path: "/constitution/initiation", category: "History" },
    { title: "Constitution Day", description: "Celebrated on November 26 to mark the adoption of Constitution", path: "/constitution/initiation", category: "History" },
    
    // Amendments
    { title: "Constitutional Amendments", description: "Changes made to the Constitution under Article 368", path: "/constitution/amendments", category: "Amendments" },
    { title: "Article 368", description: "Provides the procedure for amending the Constitution", path: "/constitution/amendments", category: "Amendments" },
    { title: "First Amendment 1951", description: "Added reasonable restrictions on freedom of speech", path: "/constitution/amendments", category: "Amendments" },
    { title: "42nd Amendment 1976", description: "Added Socialist, Secular, and Integrity to Preamble", path: "/constitution/amendments", category: "Amendments" },
    { title: "44th Amendment 1978", description: "Restored rights altered by 42nd Amendment", path: "/constitution/amendments", category: "Amendments" },
    { title: "73rd Amendment 1992", description: "Gave constitutional status to Panchayati Raj", path: "/constitution/amendments", category: "Amendments" },
    { title: "74th Amendment 1992", description: "Gave constitutional status to Municipalities", path: "/constitution/amendments", category: "Amendments" },
    { title: "86th Amendment 2002", description: "Made Right to Education a Fundamental Right", path: "/constitution/amendments", category: "Amendments" },
    { title: "101st Amendment 2016", description: "Introduced Goods and Services Tax (GST)", path: "/constitution/amendments", category: "Amendments" },
    { title: "Anti-Defection Law", description: "52nd Amendment preventing legislators from switching parties", path: "/constitution/amendments", category: "Amendments" },
    
    // Key Features
    { title: "Fundamental Rights", description: "Basic rights guaranteed to all citizens under Part III", path: "/constitution/features", category: "Features" },
    { title: "Right to Equality", description: "Articles 14-18 ensuring equality before law", path: "/constitution/features", category: "Features" },
    { title: "Right to Freedom", description: "Articles 19-22 guaranteeing various freedoms", path: "/constitution/features", category: "Features" },
    { title: "Right against Exploitation", description: "Articles 23-24 prohibiting exploitation", path: "/constitution/features", category: "Features" },
    { title: "Right to Freedom of Religion", description: "Articles 25-28 ensuring religious freedom", path: "/constitution/features", category: "Features" },
    { title: "Right to Education", description: "Article 21A making education a fundamental right", path: "/constitution/features", category: "Features" },
    { title: "Right to Constitutional Remedies", description: "Article 32 - the heart and soul of Constitution", path: "/constitution/features", category: "Features" },
    { title: "Directive Principles", description: "Guidelines for government in Part IV", path: "/constitution/features", category: "Features" },
    { title: "Fundamental Duties", description: "11 duties of citizens added by 42nd Amendment", path: "/constitution/features", category: "Features" },
    { title: "Federal Structure", description: "Division of powers between Centre and States", path: "/constitution/features", category: "Features" },
    { title: "Parliamentary System", description: "Westminster model with executive responsible to legislature", path: "/constitution/features", category: "Features" },
    { title: "Independent Judiciary", description: "Supreme Court with power of judicial review", path: "/constitution/features", category: "Features" },
    { title: "Single Citizenship", description: "Every Indian is citizen of India only, not of states", path: "/constitution/features", category: "Features" },
    { title: "Universal Adult Franchise", description: "Voting right for all citizens above 18 years", path: "/constitution/features", category: "Features" },
    { title: "Emergency Provisions", description: "Articles 352, 356, 360 for national emergencies", path: "/constitution/features", category: "Features" },
  ];

  // Filter search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return searchableContent.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 results
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const handleDownloadPdf = (e) => {
    e.preventDefault();
    fetch(constitutionPdf)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Indian_Constitution.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section with Parliament Image */}
      <div className="relative h-[280px] md:h-[320px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/70 via-amber-800/60 to-amber-900/80" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-amber-100 mb-4"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            The Constitution of India
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-amber-50/90 max-w-2xl"
          >
            The longest written constitution in the world and the supreme law of India
          </motion.p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:w-64 flex-shrink-0 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
          >
            {/* Contents Section */}
            <div className="mb-8">
              <h3 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                Contents
              </h3>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center group ${
                      item.id === "contents"
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.id === "contents" && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                    )}
                    {item.label}
                    <ChevronRight size={14} className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${item.id === "contents" ? 'opacity-100' : ''}`} />
                  </Link>
                ))}
              </nav>
          </div>

            {/* Quick Download Section */}
            <div>
              <h3 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                Quick Download
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPdf}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform">
                    <Download size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-sm">Download PDF</span>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Constitution</p>
                  </div>
                </button>
                {/* <a
                  href={constitutionPdf}
                  download="Indian_Constitution_Summary.pdf"
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform">
                    <Download size={20} className="text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">Download PDF</span>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Summary Version</p>
                  </div>
                </a> */}
              </div>
            </div>
          </motion.aside>

          {/* Right Content Area */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            {/* Search Bar */}
            <div className={`relative mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-visible z-20`}>
              <div className="flex items-center px-4 py-3">
                <Search size={20} className={`${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search topics, articles, amendments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className={`flex-1 ml-3 bg-transparent border-none outline-none text-base ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <X size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery && searchResults.length > 0 && isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {searchResults.length} results found
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <Link
                          key={index}
                          to={result.path}
                          onClick={handleResultClick}
                          className={`block px-4 py-3 transition-colors ${
                            isDark 
                              ? 'hover:bg-gray-700 border-b border-gray-700 last:border-0' 
                              : 'hover:bg-gray-50 border-b border-gray-100 last:border-0'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {result.title}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {result.category}
                                </span>
                              </div>
                              <p className={`text-sm mt-1 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {result.description}
                              </p>
                            </div>
                            <ChevronRight size={16} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* No Results Message */}
                {searchQuery && searchResults.length === 0 && isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border p-6 text-center z-50 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Search size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      No results found
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Try searching for "Preamble", "Rights", "Amendments", etc.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Three Column Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* The Preamble Card */}
              <Link to="/constitution/preamble" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`h-full ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg p-6 border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-xl`}
                >
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    The Preamble
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    The Preamble is the introduction to the Constitution. It declares India to be a Sovereign, Socialist, Secular, Democratic Republic and secures justice, liberty, equality, and fraternity for all citizens.
            </p>
                </motion.div>
              </Link>

              {/* Historical Context Card */}
              <Link to="/constitution/initiation" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`h-full ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg p-6 border-l-4 border-amber-500 cursor-pointer transition-all hover:shadow-xl`}
                >
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Historical Context
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Drafted by the Constituent Assembly between 1946-1949, the Constitution was adopted on November 26, 1949 and came into effect on January 26, 1950, marking India's transition to a republic.
                  </p>
                </motion.div>
              </Link>

              {/* Key Features Card */}
              <Link to="/constitution/features" className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className={`h-full ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer transition-all hover:shadow-xl`}
                >
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Key Features
                  </h3>
                  <ul className={`text-sm space-y-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {keyFeatures.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="line-clamp-1">{feature}</span>
              </li>
                    ))}
            </ul>
                </motion.div>
              </Link>
            </div>

            {/* Constitutional Amendments Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
            >
              <h3 className={`text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Constitutional Amendments Timeline
              </h3>
              
              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className={`absolute top-4 left-0 right-0 h-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              
                {/* Timeline Items */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
                  {timelineData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      {/* Dot */}
                      <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'} border-4 ${isDark ? 'border-gray-800' : 'border-white'} shadow-md z-10 mb-4`}></div>
                      
                      {/* Year */}
                      <span className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.year}
                      </span>
                      
                      {/* Title */}
                      <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.title}
                      </h4>
                      
                      {/* View Details Button */}
                      <Link 
                        to="/constitution/amendments"
                        className="px-4 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
              
            {/* Rights and Duties Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Rights Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative overflow-hidden rounded-xl shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700"></div>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                  }}></div>
                </div>
                <div className="relative z-10 p-6">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Your Rights</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Right to Equality",
                      "Right to Freedom",
                      "Right against Exploitation",
                      "Right to Freedom of Religion",
                      "Right to Education"
                    ].map((right, index) => (
                      <li key={index} className="flex items-center text-white/90 text-sm">
                        <svg className="h-4 w-4 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                        {right}
                  </li>
                    ))}
                </ul>
              </div>
            </motion.div>

              {/* Duties Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="relative overflow-hidden rounded-xl shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600"></div>
              <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                  }}></div>
              </div>
                <div className="relative z-10 p-6">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Your Duties</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Respect the national flag and anthem",
                      "Protect the unity of India",
                      "Protect the environment",
                      "Be kind to all people",
                      "Help children get education"
                    ].map((duty, index) => (
                      <li key={index} className="flex items-center text-white/90 text-sm">
                        <svg className="h-4 w-4 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                        {duty}
                  </li>
                    ))}
                </ul>
              </div>
            </motion.div>
          </div>

            {/* Fun Facts Section */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className={`mt-8 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-800 to-gray-900'} rounded-xl shadow-lg p-6`}
          >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Facts About Our Constitution
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Dr. B.R. Ambedkar is known as the "Father of the Indian Constitution"',
                  "It took 2 years, 11 months and 17 days to complete",
                  "The original Constitution was handwritten and beautifully decorated",
                  "It is the longest written constitution of any country"
                ].map((fact, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                    <p className="text-white text-sm">{fact}</p>
              </div>
                ))}
            </div>
          </motion.div>
          </motion.main>
            </div>
      </div>
    </div>
  );
};

export default Constitution; 
