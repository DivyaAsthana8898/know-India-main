import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Quote } from "lucide-react";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import logo from "../Assets/logo.png";
import { useTheme } from "../context/ThemeContext";

const quotes = [
  { text: "Swaraj is my birthright, and I shall have it.", author: "Bal Gangadhar Tilak" },
  { text: "Give me blood, and I will give you freedom.", author: "Subhas Chandra Bose" },
  { text: "You may kill me, but you cannot kill my ideas.", author: "Bhagat Singh" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
];

const socialLinks = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/aryanjsx/", icon: FaLinkedinIn, hover: "hover:text-blue-400" },
  { name: "GitHub", url: "https://github.com/aryanjsx", icon: FaGithub, hover: "hover:text-white" },
  { name: "Portfolio", url: "https://aryankr.in/", icon: Globe, hover: "hover:text-green-400" },
];

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`relative ${isDark ? 'bg-gray-950' : 'bg-gray-900'}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

      <div className="w-full px-6 sm:px-10 lg:px-16 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={logo} alt="Know India" className="h-7 w-auto" />
          <span className="text-base font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Know India
          </span>
          <p className="text-gray-600 text-[11px] hidden sm:block">
            © {new Date().getFullYear()}
          </p>
        </Link>

        {/* Quote */}
        <div className="hidden md:flex items-center gap-1.5 min-w-0 flex-1 justify-center">
          <Quote className="w-3 h-3 text-orange-500/40 flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500 text-[11px] italic truncate"
            >
              &ldquo;{quotes[quoteIndex].text}&rdquo;{" "}
              <span className="text-orange-400/60">— {quotes[quoteIndex].author}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Right: Social + Copyright */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-7 h-7 rounded-md bg-gray-800/50 flex items-center justify-center text-gray-500 ${social.hover} transition-colors`}
                  aria-label={social.name}
                >
                  <Icon size={13} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
