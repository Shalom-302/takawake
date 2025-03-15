
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Terminal as TerminalIcon,
  ArrowUp
} from '@phosphor-icons/react';


const Header = () => {

  // État pour suivre la section active lors du défilement
  const [activeSection, setActiveSection] = useState('hero');


  // Fonction pour défiler vers le haut
   const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('hero');
  };

   // Fonction pour défiler vers une section
   const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };


  return(
    <>
    {/* <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
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
  </div> */}
  
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
    className="fixed w-full z-50 bg-white"
  >
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-[500] text-primary font-instrument">Kaapi</div>
      <nav className="hidden md:flex space-x-8">
        {['Features', 'Ecosystem', 'Documentation', 'GitHub'].map((item) => (
          <a key={item} href="#" className="text-gray-600  hover:text-black transition-colors">
            {item}
          </a>
        ))}
      </nav>
      <button className="px-3 py-1 text-white font-medium rounded-sm bg-primary border-none transition-all">
        Get Started
      </button>
    </div>
  </motion.header>
  </>
  )
}

export default Header;