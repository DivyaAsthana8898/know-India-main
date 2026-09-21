import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import ConstitutionSidebar from "../../components/ConstitutionSidebar";

const PreamblePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
            The Preamble
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-amber-50/90"
          >
            The soul of the Indian Constitution
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
            {/* Preamble Text Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <div className="border-l-4 border-amber-500 pl-6">
                <p className={`text-lg md:text-xl leading-relaxed italic ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a 
                  <span className="font-semibold text-amber-600"> SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC </span>
                  and to secure to all its citizens:
                </p>
                <ul className={`mt-4 space-y-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li><span className="font-semibold">JUSTICE,</span> social, economic and political;</li>
                  <li><span className="font-semibold">LIBERTY</span> of thought, expression, belief, faith and worship;</li>
                  <li><span className="font-semibold">EQUALITY</span> of status and of opportunity;</li>
                  <li>and to promote among them all</li>
                  <li><span className="font-semibold">FRATERNITY</span> assuring the dignity of the individual and the unity and integrity of the Nation;</li>
                </ul>
                <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  IN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION."
                </p>
              </div>
            </div>

            {/* Understanding the Preamble */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Understanding the Preamble
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Sovereign</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    India is an independent nation, not subject to any external power. The country has the supreme authority to make its own laws and decisions.
                  </p>
                </div>
                
                <div className={`p-5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>Socialist</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    The state aims to reduce inequality in income and status, with both public and private sectors coexisting for balanced economic development.
                  </p>
                </div>
                
                <div className={`p-5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Secular</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    The state treats all religions equally. There is no official state religion, and citizens are free to practice any religion of their choice.
                  </p>
                </div>
                
                <div className={`p-5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Democratic</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    The government is elected by the people through universal adult suffrage. Every citizen above 18 years has the right to vote.
                  </p>
                </div>
                
                <div className={`p-5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Republic</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    The head of state (President) is elected, not hereditary. All public offices are open to every citizen without discrimination.
                  </p>
                </div>
                
                <div className={`p-5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>Fraternity</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    A spirit of brotherhood and sisterhood among all citizens, promoting dignity and unity across diverse communities.
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Significance */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Historical Significance
              </h2>
              
              <div className="space-y-4">
                <div className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                  <p>The Preamble was adopted on November 26, 1949, by the Constituent Assembly. This day is celebrated as Constitution Day.</p>
                </div>
                <div className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                  <p>The words "Socialist" and "Secular" were added by the 42nd Amendment in 1976 to emphasize India's commitment to social and religious harmony.</p>
                </div>
                <div className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                  <p>The Preamble is based on the 'Objectives Resolution' drafted by Jawaharlal Nehru and adopted by the Constituent Assembly on January 22, 1947.</p>
                </div>
                <div className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                  <p>The Preamble serves as the guiding light for the Constitution and is often referred to as the "identity card" of the Constitution.</p>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default PreamblePage;

