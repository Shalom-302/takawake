import { useState, useEffect } from 'react';


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
        setDisplayText(prev => prev + messages[currentIndex]?.text[currentChar]);
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


export default TypingEffect