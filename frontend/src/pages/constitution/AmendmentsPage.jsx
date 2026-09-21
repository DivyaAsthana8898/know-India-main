import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import ConstitutionSidebar from "../../components/ConstitutionSidebar";

const AmendmentsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedAmendment, setExpandedAmendment] = useState(null);

  const majorAmendments = [
    {
      number: "1st Amendment (1951)",
      title: "Freedom of Speech Restrictions",
      description: "Added reasonable restrictions on freedom of speech and expression. Introduced Ninth Schedule to protect land reform laws from judicial review.",
      category: "Fundamental Rights"
    },
    {
      number: "7th Amendment (1956)",
      title: "Reorganisation of States",
      description: "Reorganized states on linguistic basis. Abolished the distinction between Part A, B, C, and D states. Created Union Territories as a new category.",
      category: "Federal Structure"
    },
    {
      number: "42nd Amendment (1976)",
      title: "Mini Constitution",
      description: "Added 'Socialist', 'Secular', and 'Integrity' to the Preamble. Added Fundamental Duties. Gave precedence to Directive Principles over Fundamental Rights.",
      category: "Preamble & Structure"
    },
    {
      number: "44th Amendment (1978)",
      title: "Restoration of Rights",
      description: "Restored the original position that was altered by 42nd Amendment. Right to Property removed as a Fundamental Right. Made proclamation of Emergency more difficult.",
      category: "Fundamental Rights"
    },
    {
      number: "52nd Amendment (1985)",
      title: "Anti-Defection Law",
      description: "Added Tenth Schedule containing provisions for disqualification of members on grounds of defection from their political parties.",
      category: "Political"
    },
    {
      number: "61st Amendment (1989)",
      title: "Voting Age Reduction",
      description: "Reduced voting age from 21 years to 18 years for Lok Sabha and State Assembly elections.",
      category: "Electoral"
    },
    {
      number: "73rd Amendment (1992)",
      title: "Panchayati Raj",
      description: "Gave constitutional status to Panchayati Raj institutions. Added Part IX and Eleventh Schedule. Mandated reservation for SCs, STs, and women.",
      category: "Local Governance"
    },
    {
      number: "74th Amendment (1992)",
      title: "Municipalities",
      description: "Gave constitutional status to urban local bodies. Added Part IXA and Twelfth Schedule. Established Nagar Panchayats, Municipal Councils, and Municipal Corporations.",
      category: "Local Governance"
    },
    {
      number: "86th Amendment (2002)",
      title: "Right to Education",
      description: "Made education a Fundamental Right for children aged 6-14 years (Article 21A). Added education as a Fundamental Duty for parents.",
      category: "Fundamental Rights"
    },
    {
      number: "101st Amendment (2016)",
      title: "Goods and Services Tax",
      description: "Introduced GST as a comprehensive indirect tax. Created GST Council. Subsumed multiple central and state taxes into one unified tax.",
      category: "Taxation"
    },
    {
      number: "103rd Amendment (2019)",
      title: "EWS Reservation",
      description: "Provided 10% reservation for Economically Weaker Sections (EWS) in higher education and government jobs.",
      category: "Social Justice"
    },
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
            Constitutional Amendments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-amber-50/90"
          >
            Evolution of the Constitution through amendments
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
                About Constitutional Amendments
              </h2>
              <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The Constitution of India provides for its amendment under Article 368. Amendments help the Constitution evolve with changing times while preserving its basic structure. India has seen over 100 amendments since 1950.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>105+</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Amendments</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>1951</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>First Amendment</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>3</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Types of Process</div>
                </div>
              </div>
            </div>

            {/* Amendment Process */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Amendment Process (Article 368)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>Simple Majority</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    For matters like admission of new states, creation of legislative councils, etc. Passed by simple majority of members present and voting.
                  </p>
                </div>
                <div className={`p-5 rounded-lg border-l-4 border-amber-500 ${isDark ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Special Majority</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Most amendments require majority of total membership of each House AND 2/3 majority of members present and voting.
                  </p>
                </div>
                <div className={`p-5 rounded-lg border-l-4 border-red-500 ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Special + State Ratification</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    For federal provisions, requires special majority plus ratification by at least half of the state legislatures.
                  </p>
                </div>
              </div>
            </div>

            {/* Major Amendments */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Major Amendments
              </h2>
              <div className="space-y-3">
                {majorAmendments.map((amendment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} overflow-hidden`}
                  >
                    <button
                      onClick={() => setExpandedAmendment(expandedAmendment === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          {amendment.number}
                        </span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {amendment.title}
                        </span>
                      </div>
                    </button>
                    {expandedAmendment === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`px-4 pb-4 ${isDark ? 'border-t border-gray-600' : 'border-t border-gray-200'}`}
                      >
                        <div className="pt-4">
                          <span className={`text-xs px-2 py-1 rounded mr-2 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            {amendment.category}
                          </span>
                          <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {amendment.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default AmendmentsPage;