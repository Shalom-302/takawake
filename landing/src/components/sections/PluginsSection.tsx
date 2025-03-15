import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { 
  Cpu, 
  Graph, 
  Rocket, 
  Terminal as TerminalIcon,
  Timer,
  Clipboard,
  ArrowsOutCardinal,
  ShieldStar,
  ChartLineUp,
  ChatTeardrop,
  ArrowRight,
  Plus,
  Lightning,
  Code,
  Package
} from '@phosphor-icons/react';
import { useState } from 'react';

const plugins = [
  {
    name: 'Advanced Security',
    category: 'Security',
    icon: <ShieldStar size={24} weight="duotone" className="text-blue-600" />,
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'from-blue-50 to-indigo-50',
    description: 'Enterprise-grade security with MFA, encryption, session management, intrusion detection and WAF protection.',
    features: [
      'Multi-factor authentication',
      'Data encryption & vault integration',
      'Honeypot deception systems'
    ]
  },
  {
    name: 'Advanced Audit',
    category: 'Compliance',
    icon: <Clipboard size={24} weight="duotone" className="text-indigo-600" />,
    color: 'from-indigo-500 to-purple-600',
    lightColor: 'from-indigo-50 to-purple-50',
    description: 'Comprehensive audit logging for all user actions and system events with advanced filtering and reporting.',
    features: [
      'User activity tracking',
      'Resource access logs',
      'GDPR & compliance reporting'
    ]
  },
  {
    name: 'Task Scheduler',
    category: 'Automation',
    icon: <Timer size={24} weight="duotone" className="text-teal-600" />,
    color: 'from-teal-500 to-emerald-600',
    lightColor: 'from-teal-50 to-emerald-50',
    description: 'Robust job scheduling with cron-like expressions, retry policies, and task management dashboard.',
    features: [
      'Background job processing',
      'Recurring task scheduling',
      'Task failure handling'
    ]
  },
  {
    name: 'Messaging',
    category: 'Communication',
    icon: <ChatTeardrop size={24} weight="duotone" className="text-purple-600" />,
    color: 'from-purple-500 to-pink-600',
    lightColor: 'from-purple-50 to-pink-50',
    description: 'Real-time messaging system with support for direct messages, channels, and notifications.',
    features: [
      'Message queueing',
      'Real-time notifications',
      'Email & SMS integration'
    ]
  },
  {
    name: 'Webhooks',
    category: 'Integration',
    icon: <ArrowsOutCardinal size={24} weight="duotone" className="text-amber-600" />,
    color: 'from-amber-500 to-orange-600',
    lightColor: 'from-amber-50 to-orange-50',
    description: 'Create, manage and monitor webhook subscriptions with automatic retry and event filtering.',
    features: [
      'Subscription management',
      'Delivery monitoring',
      'Event filtering'
    ]
  },
  {
    name: 'Monitoring',
    category: 'Observability',
    icon: <ChartLineUp size={24} weight="duotone" className="text-blue-600" />,
    color: 'from-blue-500 to-cyan-600',
    lightColor: 'from-blue-50 to-cyan-50',
    description: 'Comprehensive system monitoring with metrics, alerts, and visualization dashboards.',
    features: [
      'Performance metrics',
      'Customizable alerts',
      'Availability checks'
    ]
  }
];

// Illustrations pour les plugins (simples formes SVG selon catégorie)
const PluginIllustration = ({ type }: { type: string }) => {
  switch(type) {
    case 'Security':
      return (
        <div className="absolute -right-4 bottom-4 w-20 h-20 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeWidth="2" stroke="currentColor" />
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" strokeWidth="2" stroke="currentColor" />
            <path d="M12 5V7M12 17V19M5 12H7M17 12H19" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'Compliance':
      return (
        <div className="absolute -right-4 bottom-4 w-20 h-20 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" strokeWidth="2" stroke="currentColor" />
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" strokeWidth="2" stroke="currentColor" />
            <path d="M9 12H15M9 16H13" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'Automation':
      return (
        <div className="absolute -right-4 bottom-4 w-20 h-20 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeWidth="2" stroke="currentColor" />
            <path d="M12 6V12L16 16" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'Communication':
      return (
        <div className="absolute -right-4 bottom-4 w-20 h-20 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10.5H16M8 14.5H13" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V15C3 16.1046 3.89543 17 5 17H8L12 21V17H19C20.1046 17 21 16.1046 21 15V6C21 4.89543 20.1046 4 19 4Z" strokeWidth="2" stroke="currentColor" />
          </svg>
        </div>
      );
    case 'Integration':
      return (
        <div className="absolute -right-4 bottom-4 w-20 h-20 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 8L3 12L7 16M17 8L21 12L17 16" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 4L10 20" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="absolute -right-4 bottom-4 w-20 h-20 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
            <path d="M7 14.5L10 11.5L13 14.5L17 10.5" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
  }
};

// Animated background shapes component
const FloatingShape = ({ size, color, positionClass, delay }: { size: string, color: string, positionClass: string, delay: number }) => (
  <motion.div 
    className={`absolute ${positionClass} ${size} rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl`}
    animate={{ 
      y: [0, -15, 0], 
      x: [0, 7, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{ 
      duration: 8, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay
    }}
  />
);

// Décoration pour le fond de la section
const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    {/* Dégradé de base */}
    <div className="absolute top-0 w-full h-full bg-gradient-to-b from-gray-50 to-white"></div>
    
    {/* Animated floating shapes */}
    <FloatingShape size="w-80 h-80" color="from-blue-200 to-indigo-200" positionClass="-top-40 right-1/4" delay={0} />
    <FloatingShape size="w-60 h-60" color="from-indigo-200 to-blue-200" positionClass="top-1/4 -left-20" delay={2} />
    <FloatingShape size="w-72 h-72" color="from-blue-100 to-indigo-200" positionClass="bottom-0 right-10" delay={4} />
    
    {/* Motifs géométriques */}
    <motion.div 
      className="hidden lg:block absolute top-40 right-20 w-32 h-32 border-2 border-indigo-100 rounded-lg opacity-30"
      animate={{ rotate: [12, 22, 12] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="hidden lg:block absolute bottom-60 left-40 w-24 h-24 border-2 border-blue-100 rounded-full opacity-30"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="hidden lg:block absolute top-1/2 left-1/3 w-16 h-16 border-2 border-indigo-100 rounded-xl opacity-20"
      animate={{ rotate: [-12, -22, -12] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Additional decorative elements */}
    <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-indigo-400 opacity-40"></div>
    <div className="absolute top-2/3 left-1/4 w-2 h-2 rounded-full bg-blue-400 opacity-40"></div>
    <div className="absolute bottom-1/4 right-1/2 w-2 h-2 rounded-full bg-indigo-400 opacity-40"></div>
    <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-blue-400 opacity-30"></div>
  </div>
);

const PluginsSection = () => {
  const [activePlugin, setActivePlugin] = useState<number | null>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  
  return (
    <section 
      id="plugins" 
      className="py-32 px-6 bg-white overflow-hidden relative"
    >
      <BackgroundDecoration />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeIn('up')} className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
              <span className="text-gray-600 font-medium text-sm uppercase tracking-wide">Plugin Ecosystem</span>
              <div className="w-10 h-1 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium text-center mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Extend with Powerful Plugins
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
              Enhance your application with ready-to-use plugins that solve common problems so you can focus on your core business logic.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plugins Categories */}
            <motion.div variants={fadeIn('right')} className="col-span-1">
              <div className="glassmorphism rounded-xl border border-white border-opacity-60 p-6 backdrop-blur-md shadow-lg relative overflow-hidden transition-all">
                {/* Illustration d'arrière-plan */}
                <div className="absolute inset-0 overflow-hidden opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full transform translate-x-1/2 -translate-y-1/4"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-300 to-blue-400 rounded-full transform -translate-x-1/2 translate-y-1/4"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md shadow-sm">
                      <Package size={20} weight="duotone" className="text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Available Plugins</h3>
                  </div>
                  
                  <div className="space-y-2.5">
                    {plugins.map((plugin, index) => (
                      <motion.button
                        key={plugin.name}
                        onClick={() => setActivePlugin(index)}
                        onMouseEnter={() => setHovered(index)}
                        onMouseLeave={() => setHovered(null)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-300 ${
                          index === activePlugin 
                            ? `bg-gradient-to-r ${plugin.lightColor} shadow-sm border border-white border-opacity-50` 
                            : 'hover:bg-white hover:bg-opacity-70 hover:shadow-sm'
                        }`}
                        whileHover={{ x: 4 }}
                        animate={{ 
                          scale: hovered === index && index !== activePlugin ? 1.02 : 1,
                          boxShadow: hovered === index && index !== activePlugin ? "0 4px 12px rgba(79, 70, 229, 0.08)" : "none"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`flex-shrink-0 p-2 rounded-md bg-white bg-opacity-90 ${
                          index === activePlugin ? 'shadow-sm ring-1 ring-white' : ''
                        }`}>
                          {plugin.icon}
                        </div>
                        <div>
                          <p className={`font-medium ${index === activePlugin ? 'text-gray-900' : 'text-gray-700'}`}>
                            {plugin.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {plugin.category}
                          </span>
                        </div>
                        {index === activePlugin && (
                          <motion.div 
                            className="ml-auto w-2 h-8 rounded-full bg-gradient-to-b from-indigo-600 to-blue-600"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 24 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="mt-8 border-t border-gray-100 border-opacity-60 pt-4 text-center">
                    <motion.a 
                      href="#" 
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm mt-2 relative group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        <Plus size={16} weight="bold" className="group-hover:opacity-0 transition-opacity" />
                        <Plus size={16} weight="fill" className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      Request custom plugin
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
                    </motion.a>
                  </div>
                </div>
              </div>
              
            </motion.div>
            
            {/* Plugin Details */}
            <motion.div variants={fadeIn('left')} className="col-span-1 lg:col-span-2">
              {activePlugin !== null && (
                <motion.div 
                  className="glassmorphism rounded-xl border border-white border-opacity-60 p-8 backdrop-blur-md shadow-lg h-full relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={plugins[activePlugin].name}
                >
                  {/* Illustration d'arrière-plan spécifique au plugin */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plugins[activePlugin].lightColor} opacity-40`}></div>
                  
                  {/* Formes décoratives spécifiques à la catégorie */}
                  <PluginIllustration type={plugins[activePlugin].category} />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center mb-10 border-b border-gray-100 border-opacity-60 pb-8">
                      <motion.div 
                        className={`p-4 rounded-lg inline-flex bg-gradient-to-br ${plugins[activePlugin].lightColor} shadow-md`}
                        whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                      >
                        {plugins[activePlugin].icon}
                      </motion.div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {plugins[activePlugin].category}
                        </div>
                        <h3 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {plugins[activePlugin].name}
                        </h3>
                      </div>
                      
                      {/* Badge de popularité amélioré */}
                      <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-80 rounded-full text-xs border border-white border-opacity-80 shadow-sm">
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-green-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="font-medium text-gray-800">Popular Plugin</span>
                      </div>
                    </div>
                    
                    <div className="mb-10">
                      <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Description</h4>
                      <p className="text-gray-700 bg-white bg-opacity-50 p-4 rounded-lg border border-white border-opacity-60">
                        {plugins[activePlugin].description}
                      </p>
                    </div>
                    
                    <div className="mb-10">
                      <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Key Features</h4>
                      <ul className="space-y-3 bg-white bg-opacity-50 p-4 rounded-lg border border-white border-opacity-60">
                        {plugins[activePlugin].features.map((feature, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <motion.div 
                              className={`p-1.5 mt-0.5 rounded-full bg-gradient-to-r ${plugins[activePlugin].color} shadow-sm`}
                              whileHover={{ scale: 1.2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            </motion.div>
                            <span className="text-gray-700">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Illustration pour le code d'exemple */}
                    <div className="mb-10 p-4 bg-gray-800 rounded-lg overflow-hidden shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Code size={16} className="text-gray-400" />
                          <span className="text-xs text-gray-400">Installation</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-gray-300">
                        npm install @kaapi/plugin-{plugins[activePlugin].category.toLowerCase()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-white flex items-center justify-center text-xs font-medium text-indigo-600">
                              {['JD', 'KL', 'MN'][i]}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">+18 users</span>
                      </div>
                      
                      <a 
                        href="#" 
                        className={`inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r ${plugins[activePlugin].color} text-white hover:shadow-lg font-medium rounded-lg transition-all text-sm`}
                      >
                        Install plugin
                        <ArrowRight size={16} weight="bold" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <motion.div variants={fadeIn('up')} className="mt-16 text-center">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg font-medium rounded-lg transition-all text-sm"
            >
              View plugin marketplace
              <ArrowRight size={16} weight="bold" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PluginsSection;
