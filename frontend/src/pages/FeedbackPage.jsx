import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, Send, CheckCircle, AlertCircle, Heart, Lightbulb, LogIn } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG, getApiUrl } from '../config';
import useGoogleLogin from "../hooks/useGoogleLogin";

const FeedbackPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    // SECURITY: Use getAuthHeaders for API calls - JWT is now in HttpOnly cookie
    const { isAuthenticated, getAuthHeaders } = useAuth();
    // Use shared login hook for Google OAuth
    const { openGoogleLogin } = useGoogleLogin();
    
    const [formData, setFormData] = useState({
        rating: 5,
        feedback: '',
        suggestions: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isServerDownError, setIsServerDownError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        // SECURITY: Only check isAuthenticated - token is now in HttpOnly cookie
        if (!isAuthenticated) {
            setErrorMessage('Please login to submit feedback');
            return;
        }
        
        setIsSubmitting(true);
        setErrorMessage('');
        setIsServerDownError(false);
        
        try {
            // SECURITY: Use credentials: 'include' to send HttpOnly cookie
            // Use getAuthHeaders() which includes CSRF token
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK), {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include', // SECURITY: Send HttpOnly cookie
                body: JSON.stringify({
                    feedback: formData.feedback || null,
                    rating: formData.rating || null,
                    suggestions: formData.suggestions || null
                }),
                mode: 'cors'
            });

            if (!response.ok) {
                let errorMsg = `Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                    
                    if (errorMsg.includes('ECONNREFUSED') || 
                        errorMsg.includes('database') || 
                        errorMsg.includes('Database') ||
                        errorMsg.includes('connection')) {
                        setIsServerDownError(true);
                        throw new Error('Our database is temporarily unavailable. Your feedback has been saved locally.');
                    }
                } catch (parseError) {
                    await response.text();
                }
                throw new Error(`Failed to submit feedback: ${errorMsg}`);
            }

            await response.json();
            setIsSubmitted(true);
            
        } catch (error) {
            setErrorMessage(error.message);
            
            if (error.message.includes('database') || 
                error.message.includes('unavailable') ||
                error.message.includes('saved locally')) {
                setIsServerDownError(true);
                
                try {
                    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
                    pendingFeedback.push({
                        ...formData,
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('pendingFeedback', JSON.stringify(pendingFeedback));
                    setIsSubmitted(true);
                } catch (storageError) {
                    console.error('Error saving feedback to local storage:', storageError);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            rating: 5,
            feedback: '',
            suggestions: ''
        });
        setIsSubmitted(false);
        setErrorMessage('');
        setIsServerDownError(false);
    };

    // Use shared login hook instead of duplicating logic
    const handleGoogleLogin = openGoogleLogin;

    return (
        <div className={`min-h-screen relative ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50'}`}>
            
            {/* Light Mode Background */}
            {!isDark && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {/* Base gradient layer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/30"></div>
                    
                    {/* Rich Mesh Gradient */}
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: `
                                radial-gradient(ellipse 100% 80% at 10% 20%, rgba(167, 139, 250, 0.35) 0%, transparent 50%),
                                radial-gradient(ellipse 80% 60% at 90% 10%, rgba(244, 114, 182, 0.3) 0%, transparent 50%),
                                radial-gradient(ellipse 70% 70% at 80% 90%, rgba(129, 140, 248, 0.25) 0%, transparent 50%),
                                radial-gradient(ellipse 60% 50% at 20% 80%, rgba(251, 113, 133, 0.2) 0%, transparent 50%),
                                radial-gradient(ellipse 50% 50% at 50% 50%, rgba(192, 132, 252, 0.15) 0%, transparent 60%)
                            `,
                        }}
                    ></div>
                    
                    {/* Large Animated Orbs with vibrant colors */}
                    <motion.div
                        animate={{ 
                            x: [0, 50, 0], 
                            y: [0, -40, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-400/50 via-purple-400/40 to-fuchsia-400/30 blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ 
                            x: [0, -60, 0], 
                            y: [0, 50, 0],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-pink-400/40 via-rose-400/30 to-red-300/20 blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ 
                            x: [0, 40, 0], 
                            y: [0, -50, 0],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                        className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-indigo-400/35 via-blue-400/25 to-cyan-300/20 blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ 
                            x: [0, -30, 0], 
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-fuchsia-300/25 to-pink-300/20 blur-3xl"
                    ></motion.div>
                    
                    {/* Floating decorative rings */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute top-20 right-16 w-40 h-40"
                    >
                        <div className="w-full h-full border-2 border-purple-300/40 rounded-full"></div>
                        <div className="absolute inset-4 border-2 border-pink-300/30 rounded-full"></div>
                        <div className="absolute inset-8 border-2 border-violet-300/20 rounded-full"></div>
                    </motion.div>
                    
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-32 left-12 w-32 h-32"
                    >
                        <div className="w-full h-full border-2 border-fuchsia-300/35 rounded-full"></div>
                        <div className="absolute inset-3 border-2 border-rose-300/25 rounded-full"></div>
                    </motion.div>
                    
                    {/* Decorative shapes */}
                    <div className="absolute top-1/3 left-8 w-20 h-20 border-2 border-violet-300/30 rotate-45 rounded-lg"></div>
                    <div className="absolute bottom-1/4 right-12 w-16 h-16 border-2 border-pink-300/25 rotate-12 rounded-xl"></div>
                    <div className="absolute top-2/3 right-1/4 w-12 h-12 bg-gradient-to-br from-purple-200/40 to-pink-200/30 rounded-full blur-sm"></div>
                    <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-gradient-to-br from-fuchsia-200/50 to-rose-200/40 rounded-full blur-sm"></div>
                    
                    {/* Top and bottom accent lines */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent"></div>
                    
                    {/* Subtle grid pattern */}
                    <div 
                        className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage: `linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    ></div>
                    
                    {/* Sparkle dots */}
                    <div className="absolute top-40 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse"></div>
                    <div className="absolute top-60 right-1/3 w-1.5 h-1.5 bg-pink-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-40 left-1/2 w-2 h-2 bg-violet-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 right-20 w-1.5 h-1.5 bg-fuchsia-400/60 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                </div>
            )}
            
            {/* Dark Mode Background */}
            {isDark && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-purple-600"></div>
                    <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-pink-600"></div>
                    <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-20 bg-indigo-600"></div>
                    
                    <div className="absolute inset-0 opacity-[0.02]" 
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }}
                    ></div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-28 pb-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center justify-center mb-6"
                        >
                            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-100 to-pink-100'}`}>
                                <MessageSquare className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                        </motion.div>

                        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Share Your{" "}
                            <span className={`bg-gradient-to-r ${isDark ? 'from-purple-400 via-pink-400 to-rose-400' : 'from-purple-600 via-pink-600 to-rose-600'} bg-clip-text text-transparent`}>
                                Feedback
                            </span>
                        </h1>

                        <p className={`text-lg md:text-xl max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your thoughts help us improve. Tell us about your experience exploring India with us.
                        </p>
                        <p className={`mt-3 text-sm max-w-xl mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        If you find any incorrect information or would like to suggest additions, please email us or share your feedback through the feedback form.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="relative px-4 pb-20">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`rounded-3xl p-8 md:p-10 border backdrop-blur-sm ${
                            isDark 
                                ? 'bg-gray-800/60 border-gray-700/50' 
                                : 'bg-white/80 border-gray-200/50 shadow-2xl shadow-purple-200/30'
                        }`}
                    >
                        {!isAuthenticated ? (
                            /* Login Required State */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                                    isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                }`}>
                                    <LogIn className={`w-10 h-10 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>
                                <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Login Required
                                </h2>
                                <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Please login to submit your feedback. We value your input!
                                </p>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center gap-2 mx-auto"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Login with Google
                                </button>
                            </motion.div>
                        ) : isSubmitted ? (
                            /* Success State */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                                    isDark ? 'bg-green-500/20' : 'bg-green-100'
                                }`}>
                                    <CheckCircle className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                </div>
                                <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Thank You!
                                </h2>
                                <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {isServerDownError 
                                        ? "Your feedback has been saved locally. We'll submit it when our services are back online."
                                        : "Your feedback has been submitted successfully. We truly appreciate your input!"
                                    }
                                </p>
                                <button
                                    onClick={resetForm}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                        isDark 
                                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                >
                                    Submit Another Response
                                </button>
                            </motion.div>
                        ) : (
                            /* Form */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Error Message */}
                                {errorMessage && !isServerDownError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl flex items-start gap-3 ${
                                            isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                                        }`}
                                    >
                                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                        <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{errorMessage}</p>
                                    </motion.div>
                                )}

                                {/* Rating */}
                                <div>
                                    <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <Star size={16} />
                                        Rate Your Experience
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.15 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleRatingClick(star)}
                                                className="focus:outline-none"
                                            >
                                                <Star 
                                                    size={36} 
                                                    className={`transition-colors ${
                                                        star <= formData.rating 
                                                            ? 'text-amber-400 fill-amber-400' 
                                                            : isDark ? 'text-gray-600' : 'text-gray-300'
                                                    }`} 
                                                />
                                            </motion.button>
                                        ))}
                                        <span className={`ml-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formData.rating}/5
                                        </span>
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div>
                                    <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <Heart size={16} />
                                        What did you like about our website?
                                    </label>
                                    <textarea
                                        name="feedback"
                                        value={formData.feedback}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 resize-none ${
                                            isDark 
                                                ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-purple-500/50 focus:border-purple-500' 
                                                : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500/30 focus:border-purple-400'
                                        }`}
                                        placeholder="Tell us what you enjoyed..."
                                    ></textarea>
                                </div>

                                {/* Suggestions */}
                                <div>
                                    <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <Lightbulb size={16} />
                                        Any suggestions for improvement?
                                    </label>
                                    <textarea
                                        name="suggestions"
                                        value={formData.suggestions}
                                        onChange={handleChange}
                                        rows={3}
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 resize-none ${
                                            isDark 
                                                ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-purple-500/50 focus:border-purple-500' 
                                                : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500/30 focus:border-purple-400'
                                        }`}
                                        placeholder="Share your ideas (optional)..."
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                                        isSubmitting 
                                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                                            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit Feedback
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default FeedbackPage;

