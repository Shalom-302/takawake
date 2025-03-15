import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import TypingEffect from '../TypingEffect';
import Terminal from '../Terminal';

// Types pour l'effet de typing
interface TypingMessage {
  text: string;
  pauseAfter?: number;
}

// Types pour les éléments visuels tech
interface TechSquare {
  id: number;
  size: number;
  top: string;
  left: string;
  delay: number;
}

interface HeroSectionProps {
  techSquares: TechSquare[];
}

  // Messages pour l'effet de typing dans le terminal
  const terminalMessages: TypingMessage[] = [
    { text: '<span class="text-secondary">→ Creating FastAPI project structure...</span>', pauseAfter: 300 },
    { text: '<span class="text-accent">→ Setting up database models...</span>', pauseAfter: 350 },
    { text: '<span class="text-secondary">→ Generating CRUD endpoints...</span>', pauseAfter: 250 },
    { text: '<span class="text-gray-300">→ Configuring database connections...</span>', pauseAfter: 300 },
    { text: '<span class="text-accent">→ Building admin interface...</span>', pauseAfter: 350 },
    { text: '<span class="text-secondary">→ Creating content types and fields...</span>', pauseAfter: 300 },
    { text: '<span class="text-gray-300">→ Generating dashboard components...</span>', pauseAfter: 350 },
    { text: '<span class="text-accent">→ Setting up role-based permissions...</span>', pauseAfter: 300 },
    { text: '<span class="text-secondary">→ Configuring API endpoints...</span>', pauseAfter: 350 },
    { text: '<span class="text-gray-300">→ Installing plugins <span class="text-secondary">[4/6]</span>: authentication, webhooks, i18n, security...</span>', pauseAfter: 250 },
    { text: '<span class="text-accent">→ Launching admin panel at <span class="text-green-400">http://localhost:5000/admin</span></span>', pauseAfter: 500 },
  ];
  

const HeroSection = ({ techSquares }: HeroSectionProps) => {
  return (
    <section id="hero" className="pt-40 pb-32 relative overflow-hidden">
    {/* Patterns tech améliorés */}
    <div className="absolute inset-0 grid-bg opacity-40"></div>
    <div className="hero-pattern"></div>
    <div className="tech-dots"></div>
    
    {/* Lignes tech */}
    <div className="tech-line" style={{ top: '25%' }}></div>
    <div className="tech-line" style={{ top: '65%' }}></div>
    
    {/* Carrés tech flottants */}
    <div className="tech-squares">
      {techSquares.map((square) => (
        <motion.div
          key={square.id}
          className="tech-square"
          style={{
            width: square.size,
            height: square.size,
            top: square.top,
            left: square.left,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 8,
            delay: square.delay,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
    </div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-16 items-center"
      >
        <motion.div variants={fadeIn('right')}>
          <motion.div 
            variants={fadeIn('up', 0.1)} 
            className="relative inline-flex items-center mb-8 group"
          >
            {/* Couche de fond avec effet glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-indigo-50/40 backdrop-blur-[2px] rounded-lg"></div>
            <div className="absolute inset-0 bg-white/80 rounded-lg"></div>
            
            {/* Ligne et bordure design */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 rounded-l-lg"></div>
            <div className="absolute -inset-[0.5px] border border-indigo-100/80 rounded-lg"></div>
            
            {/* Effet de surbrillance et de hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-primary/5 to-blue-50/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-700"></div>
            
            {/* Effet de scintillement subtil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-30 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1500 ease-in-out"></div>
            
          
          </motion.div>
          <motion.h1 
            variants={fadeIn('up', 0.2)}
            className="text-5xl md:text-5xl mb-6 leading-tight font-[400] font-instrument"
          >
            Build and scale APIs with
            <span className="block text-primary">production-ready tools</span>
          </motion.h1>
          <motion.p
            variants={fadeIn('up', 0.3)}
            className="text-lg text-gray-600 mb-8 leading-relaxed"
          >
            Kaapi accelerates API development with a robust ecosystem. Built on FastAPI, it offers smart scaffolding, automatic CRUD, and enterprise-ready plugins to help you build, deploy, and scale APIs easily.
          </motion.p>
          <motion.div 
            variants={fadeIn('up', 0.4)}
            className="flex flex-wrap gap-4"
          >
            <a href="#" className="px-5 py-2 rounded-sm border border-primary text-white bg-primary font-medium transition-all mb-0">
              Get started
            </a>
            <a href="#" className="px-5 py-2 rounded-sm border border-gray-300 font-medium hover:border-gray-900 transition-all">
              Documentation
            </a>
          </motion.div>
        </motion.div>
        
        {/* Terminal amélioré avec effet de typing */}
        <motion.div 
          variants={fadeIn('left')}
          className="terminal-window"
        >
          <Terminal path="~/projects $ kaapi new project" className="min-h-100 max-w-3xl mx-auto">
            <TypingEffect messages={terminalMessages} className="text-white" />
          </Terminal>
        </motion.div>
      </motion.div>

      {/* Clients logos */}
      <motion.div 
        variants={fadeIn('up', 0.6)}
        initial="hidden"
        animate="visible"
        className="mt-32 text-center"
      >
        <p className="text-sm text-gray-500 mb-8 uppercase tracking-wider">TRUSTED BY INNOVATIVE TEAMS</p>
        <div className="flex justify-center space-x-10 opacity-60">
          {['Exceliam', 'Tonti Capital', 'VINCI Facilities', 'Opal'].map((brand) => (
            <div key={brand} className="text-xl font-bold text-gray-400">{brand}</div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default HeroSection;
