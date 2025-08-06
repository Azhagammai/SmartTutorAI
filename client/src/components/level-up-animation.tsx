import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface LevelUpAnimationProps {
  level: string;
  show: boolean;
  onComplete: () => void;
}

export function LevelUpAnimation({ level, show, onComplete }: LevelUpAnimationProps) {
  const [isVisible, setIsVisible] = useState(show);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          {/* Confetti animation */}
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
          />
          
          <motion.div 
            className="bg-white rounded-lg p-8 text-center shadow-xl mx-4 relative overflow-hidden"
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 100 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {/* Background stars */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Star className="w-96 h-96" />
            </div>
            
            {/* Trophy animation */}
            <motion.div
              className="relative"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0],
              }}
              transition={{ 
                duration: 1,
                repeat: 2,
                repeatType: "reverse"
              }}
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              
              {/* Animated glow effect */}
              <motion.div 
                className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                style={{ zIndex: -1 }}
              />
            </motion.div>

            <motion.h2 
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity
              }}
            >
              Level Up!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-600 text-lg mb-2">
                Congratulations! You've reached
              </p>
              <p className="text-2xl font-semibold text-primary">
                {level} Level
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
