import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaEnvelope, FaGlobe } from "react-icons/fa";
import { Code, Target, Heart, Sparkles, MapPin } from "lucide-react";
import Brajesh from "../Assets/Brajesh.JPG";
import Aryan from "../Assets/Aryan.webp";
import { useTheme } from "../context/ThemeContext";
import { updateSEO, SEO_CONFIG } from '../utils/seo';

const AboutUs = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // SEO: Set page meta tags on mount
    useEffect(() => {
        updateSEO(SEO_CONFIG.about);
    }, []);

    const teamMembers = [
        {
            id: 1,
            name: "Aryan Kumar",
            role: "Software Engineer",
            bio: "Full-stack developer with a focus on creating intuitive user experiences. Passionate about modern web technologies and Cloud Computing.",
            image: Aryan,
            skills: ["React", "Python", "Azure", "CI/CD"],
            social: {
                linkedin: "https://www.linkedin.com/in/aryanjsx",
                github: "https://github.com/aryanjsx",
                email: "mailto:me@aryankr.in",
                portfolio: "https://aryankr.in",
            },
        },
        {
            id: 2,
            name: "Brajesh Jha",
            role: "Data Engineer",
            bio: "Passionate Data engineer with expertise in building scalable applications. Specializes in full stack development and Python applications.",
            image: Brajesh,
            skills: ["Python", "React", "Terraform", "AWS"],
            social: {
                linkedin: "https://www.linkedin.com/in/brajeshkrjha",
                github: "https://github.com/brajeshkrjha",
                email: "mailto:brajeshjha2001@gmail.com",
                portfolio: "https://brajeshjha.vercel.app/",
            },
        },
    ];

    const stats = [
        { number: "28", label: "States & UTs", icon: MapPin },
        { number: "100+", label: "Tourist Places", icon: Target },
        { number: "24/7", label: "Accessible", icon: Sparkles },
        { number: "∞", label: "Passion", icon: Heart },
    ];

    const values = [
        {
            icon: Target,
            title: "Our Mission",
            description: "To create an immersive digital experience that educates and inspires people about India's rich history, traditions, and landmarks.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Sparkles,
            title: "Our Vision",
            description: "To become the go-to platform for anyone seeking to explore and understand the incredible diversity of Indian culture and heritage.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Code,
            title: "Our Approach",
            description: "Leveraging modern technology to present traditional knowledge in an engaging, accessible, and interactive format for all audiences.",
            color: "from-amber-500 to-orange-500"
        },
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section - Redesigned */}
            <div className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    {/* Base Gradient - Enhanced for Light Mode */}
                    <div className={`absolute inset-0 ${isDark
                            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-gray-900 to-gray-900'
                            : 'bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50'
                        }`}></div>

                    {/* Mesh Gradient Overlay for Light Mode */}
                    {!isDark && (
                        <div className="absolute inset-0 opacity-60" style={{
                            backgroundImage: `
                                radial-gradient(at 20% 30%, rgba(251, 146, 60, 0.3) 0px, transparent 50%),
                                radial-gradient(at 80% 20%, rgba(244, 63, 94, 0.2) 0px, transparent 50%),
                                radial-gradient(at 40% 80%, rgba(245, 158, 11, 0.25) 0px, transparent 50%),
                                radial-gradient(at 90% 70%, rgba(251, 113, 133, 0.2) 0px, transparent 50%)
                            `
                        }}></div>
                    )}

                    {/* Animated Orbs */}
                    <motion.div
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${isDark ? 'bg-orange-500/20' : 'bg-gradient-to-br from-orange-400/50 to-amber-300/40'
                            }`}
                    />
                    <motion.div
                        animate={{
                            x: [0, -20, 0],
                            y: [0, 30, 0],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className={`absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-amber-500/15' : 'bg-gradient-to-br from-rose-400/40 to-pink-300/30'
                            }`}
                    />
                    <motion.div
                        animate={{
                            x: [0, 25, 0],
                            y: [0, -15, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className={`absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-rose-500/15' : 'bg-gradient-to-br from-amber-400/40 to-yellow-300/30'
                            }`}
                    />

                    {/* Floating Decorative Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [-20, 20, -20],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 15 + i * 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: i * 0.5,
                                }}
                                className={`absolute rounded-full ${isDark
                                        ? 'w-4 h-4 bg-amber-500/30'
                                        : 'w-3 h-3 bg-gradient-to-r from-orange-400 to-rose-400 opacity-60'
                                    }`}
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Subtle Pattern for Light Mode */}
                    {!isDark && (
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                    )}
                </div>

                {/* Content */}
                <div className="relative z-10 w-full pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-left"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-sm"
                                    style={{
                                        background: isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.15)',
                                        borderColor: isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.4)',
                                    }}
                                >
                                    <span className="text-2xl">🇮🇳</span>
                                    <span className={`text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                                        Celebrating India's Diversity
                                    </span>
                                </motion.div>

                                <h1 className={`text-5xl md:text-7xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Meet the
                                    <br />
                                    <span className="relative inline-block">
                                        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                                            Creators
                                        </span>
                                        <motion.svg
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, delay: 0.8 }}
                                            className="absolute -bottom-2 left-0 w-full"
                                            viewBox="0 0 200 12"
                                            fill="none"
                                        >
                                            <motion.path
                                                d="M2 8C50 2 150 2 198 8"
                                                stroke="url(#underline-gradient)"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.5, delay: 0.8 }}
                                            />
                                            <defs>
                                                <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                                                    <stop offset="0%" stopColor="#f59e0b" />
                                                    <stop offset="50%" stopColor="#f97316" />
                                                    <stop offset="100%" stopColor="#f43f5e" />
                                                </linearGradient>
                                            </defs>
                                        </motion.svg>
                                    </span>
                                </h1>

                                <p className={`text-lg md:text-xl leading-relaxed mb-10 max-w-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Two passionate developers on a mission to showcase the rich cultural heritage and breathtaking diversity of India through innovative technology.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="#team"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
                                    >
                                        Meet the Team
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="/places"
                                        className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-full border-2 transition-all ${isDark
                                                ? 'border-gray-700 text-white hover:bg-gray-800'
                                                : 'border-orange-300 text-orange-700 bg-white/80 hover:bg-orange-50 hover:border-orange-400 shadow-sm'
                                            }`}
                                    >
                                        Explore India
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </motion.a>
                                </div>
                            </motion.div>

                            {/* Right Content - Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    {stats.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className={`relative p-6 rounded-3xl backdrop-blur-xl overflow-hidden group cursor-pointer transition-all duration-300 ${isDark
                                                    ? 'bg-gray-800/60 border border-gray-700/50'
                                                    : index === 0 ? 'bg-gradient-to-br from-white to-amber-50 border border-amber-200/50 shadow-lg shadow-amber-100/50 hover:shadow-amber-200/50'
                                                        : index === 1 ? 'bg-gradient-to-br from-white to-orange-50 border border-orange-200/50 shadow-lg shadow-orange-100/50 hover:shadow-orange-200/50'
                                                            : index === 2 ? 'bg-gradient-to-br from-white to-rose-50 border border-rose-200/50 shadow-lg shadow-rose-100/50 hover:shadow-rose-200/50'
                                                                : 'bg-gradient-to-br from-white to-pink-50 border border-pink-200/50 shadow-lg shadow-pink-100/50 hover:shadow-pink-200/50'
                                                }`}
                                        >
                                            {/* Hover Gradient */}
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${index === 0 ? 'bg-gradient-to-br from-amber-500/15 to-transparent' :
                                                    index === 1 ? 'bg-gradient-to-br from-orange-500/15 to-transparent' :
                                                        index === 2 ? 'bg-gradient-to-br from-rose-500/15 to-transparent' :
                                                            'bg-gradient-to-br from-pink-500/15 to-transparent'
                                                }`}></div>

                                            <div className="relative z-10">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark
                                                        ? index === 0 ? 'bg-amber-500/20' :
                                                            index === 1 ? 'bg-orange-500/20' :
                                                                index === 2 ? 'bg-rose-500/20' :
                                                                    'bg-pink-500/20'
                                                        : index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-200' :
                                                            index === 1 ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md shadow-orange-200' :
                                                                index === 2 ? 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-md shadow-rose-200' :
                                                                    'bg-gradient-to-br from-pink-400 to-pink-500 shadow-md shadow-pink-200'
                                                    }`}>
                                                    <stat.icon className={`w-6 h-6 ${isDark
                                                            ? index === 0 ? 'text-amber-500' :
                                                                index === 1 ? 'text-orange-500' :
                                                                    index === 2 ? 'text-rose-500' :
                                                                        'text-pink-500'
                                                            : 'text-white'
                                                        }`} />
                                                </div>
                                                <div className={`text-4xl md:text-5xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {stat.number}
                                                </div>
                                                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {stat.label}
                                                </div>
                                            </div>

                                            {/* Corner Decoration */}
                                            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${isDark ? 'opacity-20' : 'opacity-30'
                                                } ${index === 0 ? 'bg-amber-500' :
                                                    index === 1 ? 'bg-orange-500' :
                                                        index === 2 ? 'bg-rose-500' :
                                                            'bg-pink-500'
                                                }`}></div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Decorative Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 1, type: "spring" }}
                                    className={`absolute -top-4 -right-4 px-4 py-2 rounded-full shadow-lg ${isDark ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                        }`}
                                >
                                    <span className="text-white font-semibold text-sm">Made with ❤️</span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <div className={`w-6 h-10 rounded-full border-2 flex justify-center pt-2 ${isDark ? 'border-gray-600' : 'border-gray-400'
                        }`}>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className={`w-1.5 h-3 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Team Section */}
            <div id="team" className="relative py-20 px-4 md:px-8 scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            The Creators
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className={`group relative rounded-3xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'
                                    } shadow-xl hover:shadow-2xl transition-all duration-500`}
                            >
                                {/* Gradient Border Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '2px' }}>
                                    <div className={`w-full h-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl`}></div>
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row">
                                    {/* Image Section */}
                                    <div className="md:w-2/5 relative overflow-hidden">
                                        <div className="aspect-square md:aspect-auto md:h-full">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="md:w-3/5 p-8">
                                        <div className="mb-4">
                                            <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {member.name}
                                            </h3>
                                            <p className="text-amber-500 font-semibold">{member.role}</p>
                                        </div>

                                        <p className={`mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {member.bio}
                                        </p>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {member.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${isDark
                                                            ? 'bg-gray-700 text-gray-300'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Social Links */}
                                        <div className="flex space-x-3">
                                            <a
                                                href={member.social.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark
                                                        ? 'bg-gray-700 text-blue-400 hover:bg-blue-500 hover:text-white'
                                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white'
                                                    }`}
                                            >
                                                <FaLinkedin size={20} />
                                            </a>
                                            <a
                                                href={member.social.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark
                                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                            >
                                                <FaGithub size={20} />
                                            </a>
                                            <a
                                                href={member.social.email}
                                                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark
                                                        ? 'bg-gray-700 text-red-400 hover:bg-red-500 hover:text-white'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                                                    }`}
                                            >
                                                <FaEnvelope size={20} />
                                            </a>
                                            <a
                                                href={member.social.portfolio}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark
                                                        ? 'bg-gray-700 text-green-400 hover:bg-green-500 hover:text-white'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
                                                    }`}
                                            >
                                                <FaGlobe size={20} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission, Vision, Approach Section */}
            <div className={`py-20 px-4 md:px-8 ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            What Drives Us
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                viewport={{ once: true }}
                                className={`relative p-8 rounded-2xl group hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-gray-800 hover:shadow-xl hover:shadow-amber-500/10' : 'bg-gray-50 hover:shadow-xl'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <value.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {value.title}
                                </h3>
                                <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="py-20 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className={`relative p-8 md:p-12 rounded-3xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow-xl'
                            }`}
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Our Story
                                </h2>
                            </div>

                            <div className="space-y-6">
                                <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    The <span className="font-semibold text-amber-500">"Know India"</span> project was inspired by our shared appreciation for India’s diverse culture and rich heritage. As software engineers from different parts of the country, we wanted to build a platform that highlights the beauty and uniqueness found across its many regions.
                                </p>
                                <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Our journey began with a simple realization — many people, including ourselves, are often unaware of the incredible cultural diversity that exists across different states. We chose to use our technical skills to create an interactive platform that makes this knowledge more accessible and engaging.
                                </p>
                                <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Today, we continue to expand and improve the platform by adding detailed information about each state, including its traditions, cuisines, festivals, and landmarks. Through this initiative, we hope to encourage others to explore and appreciate the remarkable cultural tapestry that defines India.
                                </p>
                            </div>

                            {/* Quote */}
                            <div className={`mt-10 p-6 rounded-2xl border-l-4 border-amber-500 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                                }`}>
                                <p className={`text-lg italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    "Unity in Diversity is not just a slogan for India, it's our way of life. Through Know India, we aim to celebrate this beautiful diversity."
                                </p>
                                <p className={`mt-3 font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                    — The Know India Team
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="py-20 px-4 md:px-8"
            >
                <div className="max-w-4xl mx-auto text-center">
                    <div className={`p-12 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 relative overflow-hidden`}>
                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <circle cx="10" cy="10" r="2" fill="white" />
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#circles)" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Explore India?
                            </h2>
                            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                                Discover the incredible diversity of Indian states, their cultures, traditions, and hidden gems waiting to be explored.
                            </p>
                            <a
                                href="/places"
                                className="inline-flex items-center px-8 py-4 bg-white text-amber-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Start Exploring
                                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AboutUs;
