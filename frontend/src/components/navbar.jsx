import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageSquare, MapPin, Book, Users, Phone, Search, Bookmark, LogIn, LogOut, User, Settings, Info, Star, Loader2, PartyPopper } from "lucide-react";
import logo from "../Assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import useGoogleLogin from "../hooks/useGoogleLogin";

const Navbar = () => {
    useTheme();
    // SECURITY: Include isLoading to handle auth flash
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    // Use shared login hook with rate limit protection
    const { openGoogleLogin, isLoggingIn } = useGoogleLogin();

    // Get display name: use name if valid, otherwise fallback to email username
    const getDisplayName = () => {
        if (user?.name && user.name.trim().length > 0) {
            return user.name.trim();
        }
        return user?.email?.split('@')[0] || 'User';
    };
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Listen for auth success message from popup
    useEffect(() => {
        const handleAuthMessage = (event) => {
            // SECURITY: Strict origin validation - only accept exact matches
            // Do NOT use regex patterns which can be exploited
            const allowedOrigins = new Set([
                window.location.origin,
                'https://knowindia.vercel.app',
                'https://know-india.vercel.app',
                'https://know-india-final.vercel.app'
            ]);
            
            // SECURITY: Use exact matching only - reject unknown origins
            if (!allowedOrigins.has(event.origin)) {
                return;
            }
            
            // SECURITY: Validate message structure before processing
            if (!event.data || typeof event.data !== 'object') {
                return;
            }
            
            if (event.data.type === 'AUTH_SUCCESS') {
                // Clear the popup flag
                localStorage.removeItem('auth_popup_active');
                // Reload the page to get fresh auth state from cookie
                window.location.reload();
            } else if (event.data.type === 'AUTH_ERROR') {
                // Clear the popup flag on error too
                localStorage.removeItem('auth_popup_active');
            }
        };

        window.addEventListener('message', handleAuthMessage);
        return () => window.removeEventListener('message', handleAuthMessage);
    }, []);

    // Listen for storage events (fallback for popup communication)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'auth_login_complete' && event.newValue === 'true') {
                // Clear the flags
                localStorage.removeItem('auth_login_complete');
                localStorage.removeItem('auth_popup_active');
                // Reload to get fresh auth state
                window.location.reload();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Use shared login hook for Google OAuth
    const handleGoogleLogin = openGoogleLogin;

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu and search on route change
    useEffect(() => {
        setIsOpen(false);
        setShowMobileSearch(false);
        setShowUserMenu(false);
    }, [location.pathname]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('[data-user-menu]')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    const navItems = [
        { name: "Explore", path: "/places", icon: MapPin },
        { name: "Constitution", path: "/constitution", icon: Book },
        { name: "Festivals", path: "/festivals", icon: PartyPopper },
        { name: "Reviews", path: "/reviews", icon: Star },
        { name: "About", path: "/about", icon: Users },
        { name: "Contact", path: "/contactus", icon: Phone },
        { name: "Feedback", path: "/feedback", icon: MessageSquare },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-xl border-b ${
                    isScrolled 
                        ? 'bg-gray-900/75 shadow-lg shadow-black/10 border-gray-700/50' 
                        : 'bg-gray-900/40 border-gray-700/30'
                }`}
            >
                <div className="w-full px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        
                        {/* Left: Logo & Name */}
                        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="relative"
                            >
                                <img src={logo} alt="Know India" className="h-9 md:h-10 w-auto" />
                            </motion.div>
                            <span className={`text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:block`}>
                                Know India
                            </span>
                        </Link>

                        {/* Center: Navigation Links */}
                        <div className="hidden md:flex items-center justify-center flex-1 mx-6">
                            <nav className="flex items-center gap-1">
                                {navItems.map((item, index) => {
                                    const active = isActive(item.path);
                                    return (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                        >
                                            <Link
                                                to={item.path}
                                                className={`relative px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 whitespace-nowrap ${
                                                    active
                                                        ? 'text-orange-400'
                                                        : 'text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {item.name}
                                                {active && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right: Search, Theme Toggle & Auth */}
                        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowMobileSearch(true)}
                                className="p-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/10"
                                aria-label="Search"
                            >
                                <Search size={18} />
                            </button>
                            <ThemeToggle />
                            
                            {/* Auth Section - with loading state to prevent flash */}
                            {authLoading ? (
                                <div className="flex items-center gap-2 px-3 py-2 text-gray-400">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                            ) : isAuthenticated ? (
                                <div className="relative" data-user-menu>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-300"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-orange-500/20 text-orange-400">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium max-w-[120px] truncate">
                                            {getDisplayName()}
                                        </span>
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden bg-gray-800 border border-gray-700"
                                            >
                                                {/* User Info Header */}
                                                <div className="px-4 py-3 border-b border-gray-700">
                                                    <p className="text-sm font-medium text-white">
                                                        {getDisplayName()}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                                
                                                {/* Menu Items */}
                                                <div className="py-1 border-b border-gray-700">
                                                    <Link
                                                        to="/saved"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-gray-300 hover:bg-white/5 hover:text-white"
                                                    >
                                                        <Bookmark size={16} />
                                                        Saved Places
                                                    </Link>
                                                    <Link
                                                        to="/profile/shareExperience"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-gray-300 hover:bg-white/5 hover:text-white"
                                                    >
                                                        <Info size={16} />
                                                        Share Experience
                                                    </Link>
                                                    <Link
                                                        to="/profile/settings"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-gray-300 hover:bg-white/5 hover:text-white"
                                                    >
                                                        <Settings size={16} />
                                                        Settings
                                                    </Link>
                                                </div>
                                                
                                                {/* Logout */}
                                                <div className="py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <LogOut size={16} />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoggingIn}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white transition-all duration-300 ${
                                        isLoggingIn 
                                            ? 'opacity-70 cursor-not-allowed' 
                                            : 'hover:shadow-lg hover:shadow-orange-500/25'
                                    }`}
                                >
                                    {isLoggingIn ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <LogIn size={16} />
                                    )}
                                    {isLoggingIn ? 'Signing in...' : 'Sign in'}
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Controls */}
                        <div className="flex md:hidden items-center gap-2">
                            {/* Mobile Search Button */}
                            <button 
                                onClick={() => setShowMobileSearch(true)}
                                className="p-2 rounded-xl transition-colors text-gray-300 hover:bg-white/10"
                            >
                                <Search size={20} />
                            </button>
                            
                            <ThemeToggle />
                            
                            <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-xl transition-colors text-gray-300 hover:bg-white/10"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden border-t bg-gray-900/95 backdrop-blur-xl border-gray-800"
                        >
                            <div className="px-4 py-4 space-y-1">
                                {navItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                        >
                                            <Link
                                                to={item.path}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                                    active
                                                        ? 'text-orange-400 bg-orange-500/10'
                                                        : 'text-gray-300 hover:bg-white/5'
                                                }`}
                                            >
                                                <Icon size={20} />
                                                {item.name}
                                                {active && (
                                                    <div className="ml-auto w-2 h-2 rounded-full bg-orange-500" />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}

                                {/* Mobile Auth Section */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * (navItems.length + 1) }}
                                    className="mt-4 pt-4 border-t border-gray-700"
                                >
                                    {authLoading ? (
                                        <div className="flex items-center justify-center py-4 text-gray-400">
                                            <Loader2 size={24} className="animate-spin" />
                                        </div>
                                    ) : isAuthenticated ? (
                                        <div className="space-y-1">
                                            {/* User Info */}
                                            <div className="flex items-center gap-3 px-4 py-3 text-gray-300">
                                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-orange-500/20 text-orange-400">
                                                    {user?.avatar ? (
                                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{getDisplayName()}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Profile Links */}
                                            <Link
                                                to="/saved"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:bg-white/5"
                                            >
                                                <Bookmark size={20} />
                                                Saved Places
                                            </Link>
                                            <Link
                                                to="/profile/shareExperience"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:bg-white/5"
                                            >
                                                <Info size={20} />
                                                Share Experience
                                            </Link>
                                            <Link
                                                to="/profile/settings"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:bg-white/5"
                                            >
                                                <Settings size={20} />
                                                Settings
                                            </Link>
                                            
                                            {/* Logout */}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10"
                                            >
                                                <LogOut size={20} />
                                                Sign out
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGoogleLogin}
                                            disabled={isLoggingIn}
                                            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white ${
                                                isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isLoggingIn ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <LogIn size={20} />
                                            )}
                                            {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                                        </button>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Mobile Search Modal */}
            <AnimatePresence>
                {showMobileSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100]"
                    >
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowMobileSearch(false)}
                        />
                        
                        {/* Search Container */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="relative mx-auto mt-20 p-4 rounded-2xl bg-gray-900 shadow-2xl w-[calc(100%-2rem)] max-w-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    Search
                                </h3>
                                <button
                                    onClick={() => setShowMobileSearch(false)}
                                    className="p-2 rounded-xl transition-colors text-gray-400 hover:bg-gray-800"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <GlobalSearch isMobile={true} onClose={() => setShowMobileSearch(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
