import { useState, useEffect } from 'react';
import { ArrowUp } from '@phosphor-icons/react';

interface NavigationProps {
  sections: string[];
}

const Navigation = ({ sections }: NavigationProps) => {
  const [activeSection, setActiveSection] = useState('hero');

  // Observer pour détecter la section active lors du défilement
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
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
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Fonction pour défiler vers une section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fonction pour défiler vers le haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Labels pour l'affichage dans la navigation
  const sectionLabels: Record<string, string> = {
    hero: 'Home',
    features: 'Features',
    admin: 'Admin',
    plugins: 'Plugins',
    install: 'Install',
    community: 'Community'
  };

  return (
    <>
      {/* Navigation fixe */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="glassmorphism-dark py-3 px-5 rounded-full flex items-center gap-3 shadow-xl">
          {sections.map(id => (
            <button 
              key={id}
              onClick={() => scrollToSection(id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                activeSection === id ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {sectionLabels[id] || id}
            </button>
          ))}
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
    </>
  );
};

export default Navigation;
