import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import ConstitutionSidebar from "../../components/ConstitutionSidebar";

const KeyFeaturesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const features = [
    {
      title: "Lengthiest Written Constitution",
      icon: "📜",
      description: "The Indian Constitution is the longest written constitution in the world. Originally, it had 395 Articles, 22 Parts, and 8 Schedules. Currently, it has about 470 Articles, 25 Parts, and 12 Schedules.",
      color: "blue"
    },
    {
      title: "Drawn from Various Sources",
      icon: "🌍",
      description: "The Constitution is drawn from various sources. The structural part is derived from the Government of India Act, 1935. Fundamental Rights from the US Constitution, Directive Principles from Ireland, and the idea of a federation with a strong Centre from Canada.",
      color: "green"
    },
    {
      title: "Federal System with Unitary Bias",
      icon: "🏛️",
      description: "India has a federal structure with a strong central government. While power is divided between the Centre and States, the Constitution grants more powers to the Centre, especially during emergencies.",
      color: "purple"
    },
    {
      title: "Parliamentary Form of Government",
      icon: "🗳️",
      description: "India has adopted the British Parliamentary system where the executive is responsible to the legislature. The President is the nominal head while the Prime Minister is the real executive authority.",
      color: "amber"
    },
    {
      title: "Blend of Rigidity and Flexibility",
      icon: "⚖️",
      description: "The Constitution strikes a balance between being rigid and flexible. Some provisions can be amended by simple majority, while others require special majority or ratification by states.",
      color: "red"
    },
    {
      title: "Fundamental Rights",
      icon: "🛡️",
      description: "Part III guarantees six fundamental rights to all citizens: Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.",
      color: "indigo"
    },
    {
      title: "Directive Principles of State Policy",
      icon: "🎯",
      description: "Part IV contains guidelines for the government to establish a just and welfare society. Though not enforceable by courts, they are fundamental in governance and represent the soul of the Constitution.",
      color: "teal"
    },
    {
      title: "Fundamental Duties",
      icon: "📋",
      description: "Added by the 42nd Amendment (1976), Part IVA lists 11 fundamental duties for citizens. These include respecting the Constitution, national flag, and anthem, and promoting harmony and brotherhood.",
      color: "orange"
    },
    {
      title: "Independent Judiciary",
      icon: "⚔️",
      description: "The Constitution establishes an independent judiciary headed by the Supreme Court. It has the power of judicial review and can declare any law unconstitutional if it violates fundamental rights.",
      color: "cyan"
    },
    {
      title: "Single Citizenship",
      icon: "🪪",
      description: "Unlike the USA, India has single citizenship. Every Indian is a citizen of India only, irrespective of the state they reside in. This promotes national unity and integrity.",
      color: "pink"
    },
    {
      title: "Universal Adult Franchise",
      icon: "✋",
      description: "Every citizen above 18 years of age has the right to vote, regardless of caste, creed, religion, gender, or economic status. This is one of the largest democratic exercises in the world.",
      color: "lime"
    },
    {
      title: "Emergency Provisions",
      icon: "🚨",
      description: "The Constitution provides for three types of emergencies: National Emergency (Article 352), State Emergency/President's Rule (Article 356), and Financial Emergency (Article 360).",
      color: "rose"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50', border: 'border-blue-500', text: isDark ? 'text-blue-400' : 'text-blue-700' },
      green: { bg: isDark ? 'bg-green-900/30' : 'bg-green-50', border: 'border-green-500', text: isDark ? 'text-green-400' : 'text-green-700' },
      purple: { bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50', border: 'border-purple-500', text: isDark ? 'text-purple-400' : 'text-purple-700' },
      amber: { bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50', border: 'border-amber-500', text: isDark ? 'text-amber-400' : 'text-amber-700' },
      red: { bg: isDark ? 'bg-red-900/30' : 'bg-red-50', border: 'border-red-500', text: isDark ? 'text-red-400' : 'text-red-700' },
      indigo: { bg: isDark ? 'bg-indigo-900/30' : 'bg-indigo-50', border: 'border-indigo-500', text: isDark ? 'text-indigo-400' : 'text-indigo-700' },
      teal: { bg: isDark ? 'bg-teal-900/30' : 'bg-teal-50', border: 'border-teal-500', text: isDark ? 'text-teal-400' : 'text-teal-700' },
      orange: { bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50', border: 'border-orange-500', text: isDark ? 'text-orange-400' : 'text-orange-700' },
      cyan: { bg: isDark ? 'bg-cyan-900/30' : 'bg-cyan-50', border: 'border-cyan-500', text: isDark ? 'text-cyan-400' : 'text-cyan-700' },
      pink: { bg: isDark ? 'bg-pink-900/30' : 'bg-pink-50', border: 'border-pink-500', text: isDark ? 'text-pink-400' : 'text-pink-700' },
      lime: { bg: isDark ? 'bg-lime-900/30' : 'bg-lime-50', border: 'border-lime-500', text: isDark ? 'text-lime-400' : 'text-lime-700' },
      rose: { bg: isDark ? 'bg-rose-900/30' : 'bg-rose-50', border: 'border-rose-500', text: isDark ? 'text-rose-400' : 'text-rose-700' },
    };
    return colors[color] || colors.blue;
  };

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
            Key Features
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-amber-50/90"
          >
            Salient features of the Indian Constitution
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
                Salient Features of the Constitution
              </h2>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The Indian Constitution is unique in its contents and spirit. It reflects the aspirations of the people and embodies the principles of democracy, justice, liberty, equality, and fraternity. Here are the key features that make it distinctive.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const colorClasses = getColorClasses(feature.color);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border-l-4 ${colorClasses.border}`}
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">{feature.icon}</span>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {feature.title}
                        </h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className={`mt-8 ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-amber-500 to-orange-500'} rounded-xl shadow-lg p-8 text-white`}
            >
              <h3 className="text-xl font-bold mb-4">Why These Features Matter</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Unity in Diversity</h4>
                  <p className="text-sm opacity-90">The Constitution unifies a diverse nation under one legal framework while respecting regional differences.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Democratic Values</h4>
                  <p className="text-sm opacity-90">It ensures that power remains with the people through regular elections and fundamental rights.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Social Justice</h4>
                  <p className="text-sm opacity-90">Special provisions protect marginalized communities and promote equality and opportunity for all.</p>
                </div>
              </div>
            </motion.div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default KeyFeaturesPage;

