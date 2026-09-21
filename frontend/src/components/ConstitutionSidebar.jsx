import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import constitutionPdf from "../Assets/Constitution.pdf";

const ConstitutionSidebar = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();

  const sidebarItems = [
    { id: "preamble", label: "Preamble", path: "/constitution/preamble" },
    { id: "constitution", label: "Constitution of India", path: "/constitution/overview" },
    { id: "initiation", label: "Constitutional Initiation", path: "/constitution/initiation" },
    { id: "amendments", label: "Constitutional Amendments", path: "/constitution/amendments" },
    { id: "features", label: "Key Features", path: "/constitution/features" },
    { id: "contents", label: "Contents", path: "/constitution" },
  ];

  const isActive = (path) => {
    if (path === "/constitution") {
      return location.pathname === "/constitution";
    }
    return location.pathname === path;
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={`lg:w-64 flex-shrink-0 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 h-fit sticky top-24`}
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
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {isActive(item.path) && (
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
              )}
              {item.label}
              <ChevronRight size={14} className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isActive(item.path) ? 'opacity-100' : ''}`} />
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
          <a
            href={constitutionPdf}
            download="Indian_Constitution.pdf"
            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform">
              <Download size={20} className="text-white" />
            </div>
            <div>
              <span className="font-medium text-sm">Download PDF</span>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Constitution</p>
            </div>
          </a>
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
  );
};

export default ConstitutionSidebar;

