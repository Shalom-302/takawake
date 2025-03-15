"use client";
import { 
  Cpu, 
  Graph, 
  PuzzlePiece, 
  Rocket, 
  Terminal as TerminalIcon,
  Timer,
  Clipboard,
  ArrowsOutCardinal,
  ShieldStar,
  ChartLineUp,
  ChatTeardrop,
  ArrowRight,
  ArrowUp
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { useEffect, useState } from 'react';

// Types pour l'effet de typing
interface TypingMessage {
  text: string;
  pauseAfter?: number;
}

interface TypingEffectProps {
  messages: TypingMessage[];
  className?: string;
}

// Composant pour l'effet de typing personnalisé
const TypingEffect: React.FC<TypingEffectProps> = ({ messages, className = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  
  useEffect(() => {
    if (currentIndex >= messages.length) return;
    
    if (currentChar < messages[currentIndex].text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + messages[currentIndex].text[currentChar]);
        setCurrentChar(prev => prev + 1);
      }, 15 + Math.random() * 10); // Vitesse de frappe beaucoup plus rapide
      
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + "<br/>");
        setCurrentIndex(prev => prev + 1);
        setCurrentChar(0);
      }, messages[currentIndex].pauseAfter || 250); // Pauses plus courtes entre les lignes
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, currentChar, messages]);
  
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: displayText + "<span class='typing-cursor'>▋</span>" }} />
  );
};

// Interface pour le composant Terminal
interface TerminalProps {
  path?: string;
  children: React.ReactNode;
  className?: string;
}

// Composant Terminal réutilisable
const Terminal = ({ path = "~/kaapi $", children, className = "" }: TerminalProps) => {
  return (
    <div className={`terminal-window flex flex-col ${className}`}>
      <div className="terminal-header flex items-center p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-sm text-gray-400 font-mono">{path}</div>
      </div>
      <div className="terminal-body flex-1 bg-dark p-6 font-mono text-sm overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

// Composant TypeWriter pour créer l'effet de typing
interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  pauseBeforeErasing?: number;
  eraseSpeed?: number;
}

const TypeWriter = ({ 
  text, 
  speed = 100, 
  delay = 500, 
  pauseBeforeErasing = 1500,
  eraseSpeed = 50 
}: TypeWriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    // Initial delay before typing starts
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (!isErasing && currentIndex < text.length) {
      // Typing mode
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } 
    else if (!isErasing && currentIndex >= text.length) {
      // Completed typing, wait before erasing
      const pauseTimeout = setTimeout(() => {
        setIsErasing(true);
      }, pauseBeforeErasing);

      return () => clearTimeout(pauseTimeout);
    }
    else if (isErasing && displayText.length > 0) {
      // Erasing mode
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText.slice(0, -1));
      }, eraseSpeed);

      return () => clearTimeout(timeout);
    }
    else if (isErasing && displayText.length === 0) {
      // Completed erasing, reset and start again
      const resetTimeout = setTimeout(() => {
        setCurrentIndex(0);
        setIsErasing(false);
      }, delay);

      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, started, text, speed, isErasing, displayText, delay, pauseBeforeErasing, eraseSpeed]);

  return (
    <div className="flex items-center">
      <span>{displayText}</span>
      <span className="ml-1 inline-block w-2 h-5 bg-white animate-cursor-blink"></span>
    </div>
  );
};

// Interface pour les éléments visuels tech
interface TechSquare {
  id: number;
  size: number;
  top: string;
  left: string;
  delay: number;
}

const Home = () => {
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
  
  // État pour les éléments visuels tech
  const [techSquares, setTechSquares] = useState<TechSquare[]>([]);
  
  // État pour suivre la section active lors du défilement
  const [activeSection, setActiveSection] = useState('hero');

  // Fonction pour défiler vers une section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Fonction pour défiler vers le haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('hero');
  };
  
  // Générer des carrés tech aléatoires
  useEffect(() => {
    const squares: TechSquare[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 80) + 40, // 40-120px
      top: `${Math.floor(Math.random() * 80)}%`,
      left: `${Math.floor(Math.random() * 80)}%`,
      delay: Math.random() * 5
    }));
    setTechSquares(squares);

    // Observer pour détecter la section active lors du défilement
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Observer toutes les sections
    ['hero', 'features', 'admin', 'plugins', 'install', 'community'].forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen text-gray-800 bg-white">
      {/* Navigation fixe */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="glassmorphism-dark py-3 px-5 rounded-full flex items-center gap-3 shadow-xl">
          <button 
            onClick={() => scrollToSection('hero')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeSection === 'hero' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeSection === 'features' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('admin')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeSection === 'admin' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Admin
          </button>
          <button 
            onClick={() => scrollToSection('plugins')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeSection === 'plugins' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Plugins
          </button>
          <button 
            onClick={() => scrollToSection('install')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeSection === 'install' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Install
          </button>
          <button 
            onClick={() => scrollToSection('community')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeSection === 'community' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Community
          </button>
        </nav>
      </div>
      
      {/* Bouton de retour en haut */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg transition-opacity duration-300 ${
          activeSection === 'hero' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <ArrowUp size={24} weight="bold" />
      </button>
      
      {/* Header avec design tech */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute  w-full z-50 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Kaapi</div>
          <nav className="hidden md:flex space-x-8">
            {['Features', 'Ecosystem', 'Documentation', 'GitHub'].map((item) => (
              <a key={item} href="#" className="text-gray-600 hover:text-black transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <button className="px-5 py-2 text-white bg-primary border-none transition-all">
            Get Started
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
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
                
                {/* Contenu du badge */}
                <span className="relative flex items-center gap-3 px-6 py-2.5 z-10">
                  {/* Indicateur de statut */}
                  <span className="flex h-full items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse"></span>
                  </span>
                  
                  {/* Texte principal */}
                  <span className="font-medium text-[11px] tracking-[0.08em] text-gray-700 uppercase">
                    Revolutionizing API Development
                  </span>
                </span>
              </motion.div>
              <motion.h1 
                variants={fadeIn('up', 0.2)}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                API-Centric Development
                <span className="block text-primary">Reimagined</span>
              </motion.h1>
              <motion.p
                variants={fadeIn('up', 0.3)}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Accelerate your FastAPI development with intelligent scaffolding, 
                automatic CRUD generation, and enterprise-ready plugins.
              </motion.p>
              <motion.div 
                variants={fadeIn('up', 0.4)}
                className="flex flex-wrap gap-4"
              >
                <a href="#" className="px-8 py-3 text-white bg-primary transition-all">
                  Get Started
                </a>
                <a href="#" className="px-8 py-3 border border-gray-300 text-lg hover:border-gray-900 transition-all">
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
              {['Google', 'Microsoft', 'Airbnb', 'Stripe', 'Netflix'].map((brand) => (
                <div key={brand} className="text-xl font-bold text-gray-400">{brand}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative bg-light overflow-hidden feature-section">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-b from-primary/5 to-indigo-100/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-b from-primary/5 to-indigo-100/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto px-6 relative z-10"
        >
          {/* Section header */}
          <motion.div variants={fadeIn('up')} className="text-center mb-24">
            <div className="inline-flex flex-col items-center">
              <motion.div className="inline-block px-4 py-1 text-sm mb-4 bg-white rounded-full shadow-sm border border-primary/10">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 font-medium">CAPABILITIES</span>
              </motion.div>
              <motion.h2 className="text-5xl md:text-6xl font-bold mb-8 relative">
                Developer Superpowers
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1.5 bg-gradient-to-r from-primary/80 to-indigo-400/80 rounded-full"></div>
              </motion.h2>
              <motion.p className="text-xl text-gray-600 max-w-3xl">
                Unlock powerful capabilities that transform how you build, test, and deploy APIs
              </motion.p>
            </div>
          </motion.div>

          {/* Features grid with illustrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Feature 1 - Large card with illustration space */}
            <motion.div 
              variants={fadeIn('up', 0.1)}
              className="plugin-card glassmorphism flex flex-col overflow-hidden relative z-10"
            >
              {/* Illustration space */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 relative flex items-center justify-center overflow-hidden">
                {/* Éléments graphiques abstraits */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Formes géométriques */}
                  <div className="relative w-full h-full">
                    {/* Cercle principal */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-4 border-primary/10"></div>
                    
                    {/* Lignes de connexion */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 rounded-l-lg"></div>
                    <div className="absolute -inset-[0.5px] border border-indigo-100/80 rounded-lg"></div>
                    
                    {/* Petits cercles */}
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-primary/20"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full bg-primary/20"></div>
                    <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-primary/15"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-primary/15"></div>
                    
                    {/* Carrés et rectangles */}
                    <div className="absolute top-1/2 right-1/5 w-12 h-12 border border-primary/10 transform rotate-12"></div>
                    <div className="absolute bottom-1/2 left-1/5 w-10 h-10 border border-primary/10 transform -rotate-12"></div>
                    
                    {/* Symboles de terminal */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary/20 text-xl font-mono">
                      &lt;/&gt;
                    </div>
                    
                    {/* Points de connexion */}
                    <div className="absolute top-0 left-0 right-0 bottom-0">
                      <div className="absolute top-1/3 left-2/3 w-1 h-1 rounded-full bg-primary/30"></div>
                      <div className="absolute top-2/3 left-1/3 w-1 h-1 rounded-full bg-primary/30"></div>
                      <div className="absolute top-1/2 left-3/4 w-1 h-1 rounded-full bg-primary/30"></div>
                      <div className="absolute top-1/4 left-1/2 w-1 h-1 rounded-full bg-primary/30"></div>
                      <div className="absolute top-3/4 left-1/2 w-1 h-1 rounded-full bg-primary/30"></div>
                    </div>
                  </div>
                </div>
                
                {/* Icon badge */}
                <div className="absolute -bottom-6 left-8 w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
                  <TerminalIcon size={32} weight="bold" className="text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 pt-12">
                <h3 className="text-2xl font-bold mb-4">Instant API Scaffolding</h3>
                <p className="text-gray-600 mb-6">
                  Generate fully-functional API endpoints with a single command. Skip the boilerplate and focus on what matters.
                </p>
                <a href="#" className="group inline-flex items-center font-medium text-primary">
                  <span>Discover how</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Feature 2 - Large card with illustration space */}
            <motion.div 
              variants={fadeIn('up', 0.2)}
              className="plugin-card glassmorphism flex flex-col overflow-hidden relative z-10"
            >
              {/* Illustration space with AI theme */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 relative flex items-center justify-center overflow-hidden">
                {/* Éléments graphiques abstraits */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Formes géométriques */}
                  <div className="relative w-full h-full">
                    {/* Nœuds de réseau neuronal */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32">
                      {/* Couche d'entrée */}
                      <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary/40"></div>
                      <div className="absolute left-0 top-1/3 w-2 h-2 rounded-full bg-primary/40"></div>
                      <div className="absolute left-0 top-2/3 w-2 h-2 rounded-full bg-primary/40"></div>
                      <div className="absolute left-0 bottom-0 w-2 h-2 rounded-full bg-primary/40"></div>
                      
                      {/* Couche cachée 1 */}
                      <div className="absolute left-1/3 top-1/6 w-2 h-2 rounded-full bg-primary/30"></div>
                      <div className="absolute left-1/3 top-3/6 w-2 h-2 rounded-full bg-primary/30"></div>
                      <div className="absolute left-1/3 top-5/6 w-2 h-2 rounded-full bg-primary/30"></div>
                      
                      {/* Couche cachée 2 */}
                      <div className="absolute left-2/3 top-1/4 w-2 h-2 rounded-full bg-primary/30"></div>
                      <div className="absolute left-2/3 top-3/4 w-2 h-2 rounded-full bg-primary/30"></div>
                      
                      {/* Couche de sortie */}
                      <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-primary/40"></div>
                      
                      {/* Connexions */}
                      {/* Connexion entrée vers cachée 1 */}
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-0 left-2 transform rotate-12"></div>
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-1/3 left-2 transform -rotate-6"></div>
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-2/3 left-2 transform rotate-6"></div>
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 bottom-0 left-2 transform -rotate-12"></div>
                      
                      {/* Connexion cachée 1 vers cachée 2 */}
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-1/6 left-[33%] transform rotate-2"></div>
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-3/6 left-[33%] transform -rotate-2"></div>
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-5/6 left-[33%] transform rotate-2"></div>
                      
                      {/* Connexion cachée 2 vers sortie */}
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-1/4 right-2 transform -rotate-12"></div>
                      <div className="absolute w-16 h-0.5 bg-gradient-to-r from-primary/10 to-primary/20 top-3/4 right-2 transform rotate-12"></div>
                    </div>
                    
                    {/* Cadre contenant le réseau */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-40 border border-primary/10 rounded-lg"></div>
                    
                    {/* Effet de données */}
                    <div className="absolute top-5 left-1/4 text-xs text-primary/20 font-mono">model.predict()</div>
                    <div className="absolute bottom-5 right-1/4 text-xs text-primary/20 font-mono">accuracy: 99.2%</div>
                    
                    {/* Particules flottantes */}
                    <div className="absolute top-1/6 right-1/6 w-1 h-1 rounded-full bg-primary/20"></div>
                    <div className="absolute top-5/6 left-1/6 w-1 h-1 rounded-full bg-primary/20"></div>
                    <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-primary/20"></div>
                  </div>
                </div>
                
                {/* Icon badge */}
                <div className="absolute -bottom-6 left-8 w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
                  <PuzzlePiece size={32} weight="bold" className="text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 pt-12">
                <h3 className="text-2xl font-bold mb-4">AI-Enhanced Development</h3>
                <p className="text-gray-600 mb-6">
                  Leverage AI to suggest optimizations, detect anti-patterns, and generate documentation automatically.
                </p>
                <a href="#" className="group inline-flex items-center font-medium text-primary">
                  <span>See it in action</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Smaller feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 3 */}
            <motion.div
              variants={fadeIn('up', 0.3)}
              className="plugin-card glassmorphism p-8 relative z-10"
            >
              <div className="mb-6">
                {/* Icon with gradient background */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                  <Cpu size={28} weight="bold" className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Performance Optimization</h3>
                <p className="text-gray-600 text-sm">
                  Automatically identify bottlenecks and optimize your API for maximum throughput and minimal latency.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={fadeIn('up', 0.4)}
              className="plugin-card glassmorphism p-8 relative z-10"
            >
              <div className="mb-6">
                {/* Icon with gradient background */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                  <Rocket size={28} weight="bold" className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">One-Click Deployment</h3>
                <p className="text-gray-600 text-sm">
                  Deploy to any cloud provider with a single command. Infrastructure as code included.
                </p>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              variants={fadeIn('up', 0.5)}
              className="plugin-card glassmorphism p-8 relative z-10"
            >
              <div className="mb-6">
                {/* Icon with gradient background */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                  <Graph size={28} weight="bold" className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
                <p className="text-gray-600 text-sm">
                  Monitor API usage, performance metrics, and user patterns with built-in analytics dashboards.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Call-to-action button */}
          <motion.div variants={fadeIn('up', 0.6)} className="text-center mt-16">
            <a href="#" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
              Explore all features
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Admin Dashboard Preview */}
      <section id="admin" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 opacity-50"></div>
        
        {/* Formes géométriques décoratives */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-200 opacity-20 blur-xl"></div>
          <div className="absolute left-1/4 bottom-0 w-72 h-72 rounded-full bg-blue-300 opacity-20 blur-xl"></div>
          <div className="absolute right-1/4 top-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-green-50 to-green-100 opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-indigo-700 bg-clip-text text-transparent">
              Powerful Admin Dashboard
            </h2>
            <p className="text-lg mx-auto text-gray-600 max-w-3xl">
              Manage your content, users, and APIs with our intuitive admin interface. No coding required.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Dashboard Preview */}
            <motion.div 
              variants={fadeIn('up', 0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="relative rounded-xl shadow-2xl overflow-hidden"
            >
              {/* En-tête du dashboard */}
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center">
                    <PuzzlePiece size={20} weight="bold" className="text-indigo-700" />
                  </div>
                  <span className="text-white font-medium">Kaapi Admin</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                    <ChatTeardrop size={18} className="text-white" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400"></div>
                </div>
              </div>
              
              {/* Corps du dashboard */}
              <div className="bg-white p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Carte de statistiques 1 */}
                  <div className="glassmorphism-card p-6 rounded-lg flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <ChartLineUp size={24} weight="fill" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">API Requests</p>
                      <h4 className="text-2xl font-bold">2.4M</h4>
                    </div>
                  </div>
                  
                  {/* Carte de statistiques 2 */}
                  <div className="glassmorphism-card p-6 rounded-lg flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <ShieldStar size={24} weight="fill" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Auth Success</p>
                      <h4 className="text-2xl font-bold">99.8%</h4>
                    </div>
                  </div>
                  
                  {/* Carte de statistiques 3 */}
                  <div className="glassmorphism-card p-6 rounded-lg flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <ArrowsOutCardinal size={24} weight="fill" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Content Types</p>
                      <h4 className="text-2xl font-bold">12</h4>
                    </div>
                  </div>
                </div>
                
                {/* Panneau de gestion des ressources */}
                <div className="glassmorphism-card p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Content Management</h3>
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition">+ Create New</button>
                  </div>
                  
                  {/* Tableau des ressources */}
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Lignes du tableau */}
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Products</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Collection</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 hours ago</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-gray-600 hover:text-gray-900">View</button>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Categories</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Collection</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 days ago</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-gray-600 hover:text-gray-900">View</button>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Blog Posts</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Collection</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 days ago</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-gray-600 hover:text-gray-900">View</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Bouton d'action */}
            <div className="mt-10 text-center">
              <a 
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try the admin dashboard
                <ArrowRight size={20} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Plugins Section */}
      <section id="plugins" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-red-50 to-red-100 opacity-50"></div>
          <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-50 to-blue-100 opacity-40"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-green-50 to-green-100 opacity-40"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
            className="text-center mb-20"
          >
            <motion.h2 className="text-4xl md:text-5xl font-bold mb-6">
              Extend with Powerful Plugins
            </motion.h2>
            <motion.p className="text-xl mx-auto text-gray-600 max-w-3xl">
              Customize your API with specialized modules designed for enterprise needs
            </motion.p>
          </motion.div>

          {/* Plugin Gallery */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  delayChildren: 0.3,
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {/* Plugin Card: Security */}
            <motion.div
              variants={fadeIn('up', 0.1)}
              className="plugin-card glassmorphism flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 opacity-5 w-40 h-40 -ml-10 -mt-10">
                  <ShieldStar size={140} weight="bold" className="text-red-500" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="mb-4"></div>
                  <div className="bg-red-50 py-1 px-3 text-red-700 text-sm font-medium">Security</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Advanced Security</h3>
                <p className="text-gray-600 mb-4">
                  Enterprise-grade security with MFA, encryption, session management, intrusion detection and WAF protection.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-red-500"></span>
                    <span>Multi-factor authentication</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-red-500"></span>
                    <span>Data encryption & vault integration</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-red-500"></span>
                    <span>Honeypot deception systems</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="see-more-btn text-red-600 font-medium hover:text-red-700 inline-flex items-center">
                  See more <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Plugin Card: Audit */}
            <motion.div
              variants={fadeIn('up', 0.2)}
              className="plugin-card glassmorphism flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 opacity-5 w-40 h-40 -ml-10 -mt-10">
                  <Clipboard size={140} weight="bold" className="text-blue-500" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="mb-4"></div>
                  <div className="bg-blue-50 py-1 px-3 text-blue-700 text-sm font-medium">Compliance</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Advanced Audit</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive audit logging for all user actions and system events with advanced filtering and reporting.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-blue-500"></span>
                    <span>User activity tracking</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-blue-500"></span>
                    <span>Resource access logs</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-blue-500"></span>
                    <span>GDPR & compliance reporting</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="see-more-btn text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                  See more <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Plugin Card: Scheduler */}
            <motion.div
              variants={fadeIn('up', 0.3)}
              className="plugin-card glassmorphism flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 opacity-5 w-40 h-40 -ml-10 -mt-10">
                  <Timer size={140} weight="bold" className="text-green-500" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="mb-4"></div>
                  <div className="bg-green-50 py-1 px-3 text-green-700 text-sm font-medium">Automation</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Task Scheduler</h3>
                <p className="text-gray-600 mb-4">
                  Robust job scheduling with cron-like expressions, retry policies, and task management dashboard.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-green-500"></span>
                    <span>Background job processing</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-green-500"></span>
                    <span>Recurring task scheduling</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-green-500"></span>
                    <span>Task failure handling</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="see-more-btn text-green-600 font-medium hover:text-green-700 inline-flex items-center">
                  See more <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Plugin Card: Messaging */}
            <motion.div
              variants={fadeIn('up', 0.4)}
              className="plugin-card glassmorphism flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 opacity-5 w-40 h-40 -ml-10 -mt-10">
                  <ChatTeardrop size={140} weight="bold" className="text-purple-500" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="mb-4"></div>
                  <div className="bg-purple-50 py-1 px-3 text-purple-700 text-sm font-medium">Communication</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Messaging</h3>
                <p className="text-gray-600 mb-4">
                  Real-time messaging system with support for direct messages, channels, and notifications.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-purple-500"></span>
                    <span>Message queueing</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-purple-500"></span>
                    <span>Real-time notifications</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-purple-500"></span>
                    <span>Email & SMS integration</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="see-more-btn text-purple-600 font-medium hover:text-purple-700 inline-flex items-center">
                  See more <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Plugin Card: Webhooks */}
            <motion.div
              variants={fadeIn('up', 0.5)}
              className="plugin-card glassmorphism flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 opacity-5 w-40 h-40 -ml-10 -mt-10">
                  <ArrowsOutCardinal size={140} weight="bold" className="text-yellow-500" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="mb-4"></div>
                  <div className="bg-yellow-50 py-1 px-3 text-yellow-700 text-sm font-medium">Integration</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Webhooks</h3>
                <p className="text-gray-600 mb-4">
                  Create, manage and monitor webhook subscriptions with automatic retry and event filtering.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-yellow-500"></span>
                    <span>Subscription management</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-yellow-500"></span>
                    <span>Delivery monitoring</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-yellow-500"></span>
                    <span>Event filtering</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="see-more-btn text-yellow-600 font-medium hover:text-yellow-700 inline-flex items-center">
                  See more <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Plugin Card: Monitoring */}
            <motion.div
              variants={fadeIn('up', 0.6)}
              className="plugin-card glassmorphism flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 opacity-5 w-40 h-40 -ml-10 -mt-10">
                  <ChartLineUp size={140} weight="bold" className="text-indigo-500" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="mb-4"></div>
                  <div className="bg-indigo-50 py-1 px-3 text-indigo-700 text-sm font-medium">Observability</div>
                </div>
                <h3 className="text-xl font-bold mb-3">Monitoring</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive system monitoring with metrics, alerts, and visualization dashboards.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-indigo-500"></span>
                    <span>Performance metrics</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-indigo-500"></span>
                    <span>Customizable alerts</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 w-1 h-1 bg-indigo-500"></span>
                    <span>Availability checks</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="see-more-btn text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center">
                  See more <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Plugin Installation */}
          <motion.div 
            variants={fadeIn('up', 0.7)}
            className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 p-8 text-white max-w-4xl mx-auto mt-16 rounded-lg shadow-xl relative overflow-hidden"
          >
            {/* Éléments de design abstrait */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Formes géométriques */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
              <div className="absolute left-1/4 bottom-0 w-48 h-48 rounded-full bg-white opacity-5"></div>
              <div className="absolute -bottom-8 right-1/4 w-32 h-32 rounded-full bg-white opacity-10"></div>
              
              {/* Lignes subtiles */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white via-transparent to-white opacity-10"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">Install any plugin with a simple command</h3>
              
              <Terminal path="~/kaapi $" className='mb-4 min-h-12 max-w-3xl mx-auto'>
                <TypeWriter text="kaapi plugin install security" speed={80} delay={800} />
              </Terminal>
              
              <p className="text-white text-opacity-90 mb-8">Plugins are automatically configured with sensible defaults but can be fully customized for your specific needs.</p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-300"></span>
                  <span className="text-sm">Zero-config setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-300"></span>
                  <span className="text-sm">Automatic dependency resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-300"></span>
                  <span className="text-sm">Modular architecture</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative bg-primary">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto px-6 relative z-10"
        >
          <motion.div 
            variants={fadeIn('up')}
            className="bg-white p-12 text-center max-w-4xl mx-auto tech-card"
          >
            <motion.h2 variants={fadeIn('up')} className="text-4xl font-bold mb-6">
              Ready to Transform Your API Development?
            </motion.h2>
            <motion.p variants={fadeIn('up', 0.1)} className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of developers building faster, more secure APIs with Kaapi&apos;s next-generation tooling.
            </motion.p>
            <motion.div variants={fadeIn('up', 0.2)} className="flex flex-wrap justify-center gap-4">
              <a href="#" className="px-8 py-4 bg-primary text-white text-lg transition-all">
                Start Building
              </a>
              <a href="#" className="px-8 py-4 border border-gray-300 text-lg hover:border-gray-900 transition-all">
                View Documentation
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Installation Section */}
      <section id="install" className="py-32 relative">
        <motion.div 
          variants={fadeIn('up', 0.7)}
          className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 p-8 text-white max-w-4xl mx-auto mt-16 rounded-lg shadow-xl relative overflow-hidden"
        >
          {/* Éléments de design abstrait */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Formes géométriques */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
            <div className="absolute left-1/4 bottom-0 w-48 h-48 rounded-full bg-white opacity-5"></div>
            <div className="absolute -bottom-8 right-1/4 w-32 h-32 rounded-full bg-white opacity-10"></div>
            
            {/* Lignes subtiles */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white via-transparent to-white opacity-10"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6">Install any plugin with a simple command</h3>
            
            <Terminal path="~/kaapi $" className='mb-4 min-h-12 max-w-3xl mx-auto'>
              <TypeWriter text="kaapi plugin install security" speed={80} delay={800} />
            </Terminal>
            
            <p className="text-white text-opacity-90 mb-8">Plugins are automatically configured with sensible defaults but can be fully customized for your specific needs.</p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-300"></span>
                <span className="text-sm">Zero-config setup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-300"></span>
                <span className="text-sm">Automatic dependency resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-300"></span>
                <span className="text-sm">Modular architecture</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 bg-white relative">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto px-6 relative z-10"
        >
          <motion.div 
            variants={fadeIn('up')}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join the Kaapi Community
            </h2>
            <p className="text-lg mx-auto text-gray-600 max-w-3xl">
              Connect with thousands of developers, share knowledge, and get help from the community.
            </p>
          </motion.div>
          <motion.div 
            variants={fadeIn('up', 0.1)}
            className="flex flex-wrap justify-center gap-4"
          >
            <a href="#" className="px-8 py-4 bg-primary text-white text-lg transition-all">
              Join the Community
            </a>
            <a href="#" className="px-8 py-4 border border-gray-300 text-lg hover:border-gray-900 transition-all">
              View Forum
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">Kaapi</h3>
              <p className="text-gray-600">Modern API development platform built for speed and scalability.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Plugins', 'Templates', 'Pricing'].map(item => (
                  <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Tutorials', 'Examples', 'Blog'].map(item => (
                  <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2">
                {['GitHub', 'Twitter', 'Discord', 'Contact'].map(item => (
                  <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-16 pt-8 text-center text-gray-600">
            2024 Kaapi - Crafted for developers, powered by Kaanari
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home;
