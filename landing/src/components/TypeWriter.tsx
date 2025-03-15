import { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  pauseBeforeErasing?: number;
  eraseSpeed?: number;
}

const TypeWriter = ({ 
  text='', 
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

    if (!isErasing && currentIndex < text?.length) {
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

export default TypeWriter;
