
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedText = () => {
  const phrases = ["Beat them ALL", "Top them ALL", "Sell them ALL", "Rule them ALL"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight text-center">
      <div className="mb-2">One AI to</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 20px rgba(251, 146, 60, 0.5)',
            filter: 'brightness(1.2)',
          }}
        >
          {phrases[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedText;
