import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import ConstitutionSidebar from "../../components/ConstitutionSidebar";

const ConstitutionalInitiation = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const timeline = [
    { year: "1934", event: "M.N. Roy first proposed the idea of a Constituent Assembly" },
    { year: "1935", event: "Indian National Congress officially demanded a Constituent Assembly" },
    { year: "1940", event: "August Offer by British Government accepted the demand in principle" },
    { year: "1942", event: "Cripps Mission proposed an elected body to frame the Constitution" },
    { year: "1946", event: "Cabinet Mission Plan accepted; elections held for Constituent Assembly" },
    { year: "Dec 9, 1946", event: "First meeting of Constituent Assembly held" },
    { year: "Dec 11, 1946", event: "Dr. Rajendra Prasad elected as permanent Chairman" },
    { year: "Aug 29, 1947", event: "Drafting Committee formed with Dr. Ambedkar as Chairman" },
    { year: "Nov 26, 1949", event: "Constitution adopted by the Constituent Assembly" },
    { year: "Jan 26, 1950", event: "Constitution came into effect; India became a Republic" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative h-[200px] md:h-[240px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/70 via-amber-800/60 to-amber-900/80" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-amber-100 mb-2"
          >
            Constitutional Initiation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-amber-50/90"
          >
            The journey to India's Constitution
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ConstitutionSidebar />

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            {/* Introduction */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                The Making of the Constitution
              </h2>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The Constitution of India was drafted by the Constituent Assembly, which was established under the Cabinet Mission Plan of 1946. The Assembly met for the first time on December 9, 1946, and took almost 3 years to complete its historic task of drafting the Constitution for independent India.
              </p>
            </div>

            {/* Timeline */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Timeline of Events
              </h2>
              <div className="relative">
                {/* Timeline line */}
                <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="relative pl-12"
                    >
                      {/* Dot */}
                      <div className={`absolute left-2 w-5 h-5 rounded-full border-4 ${
                        index === timeline.length - 1 
                          ? 'bg-amber-500 border-amber-200' 
                          : isDark ? 'bg-gray-600 border-gray-800' : 'bg-white border-blue-500'
                      }`}></div>
                      
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          {item.year}
                        </span>
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.event}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Constituent Assembly Facts */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Constituent Assembly Facts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Members</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    389 members initially, reduced to 299 after partition
                  </p>
                </div>
                <div className={`p-5 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sessions Held</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    11 sessions over 2 years, 11 months and 18 days
                  </p>
                </div>
                <div className={`p-5 rounded-lg border-l-4 border-amber-500 ${isDark ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Days of Sitting</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    166 days of actual sitting to draft the Constitution
                  </p>
                </div>
                <div className={`p-5 rounded-lg border-l-4 border-purple-500 ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Cost</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    ₹64 lakh (approximately) to complete the entire process
                  </p>
                </div>
              </div>
            </div>

            {/* Committees */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Major Committees
              </h2>
              <div className="space-y-4">
                {[
                  { name: "Drafting Committee", chairman: "Dr. B.R. Ambedkar", members: "7 members" },
                  { name: "Union Powers Committee", chairman: "Jawaharlal Nehru", members: "9 members" },
                  { name: "Provincial Constitution Committee", chairman: "Sardar Vallabhbhai Patel", members: "25 members" },
                  { name: "Advisory Committee on Fundamental Rights", chairman: "Sardar Vallabhbhai Patel", members: "54 members" },
                  { name: "Rules of Procedure Committee", chairman: "Dr. Rajendra Prasad", members: "15 members" },
                ].map((committee, index) => (
                  <div key={index} className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div>
                      <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{committee.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chairman: {committee.chairman}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-blue-100 text-blue-700'}`}>
                      {committee.members}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default ConstitutionalInitiation;

