'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const PHOTOS = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1469&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1470&auto=format&fit=crop"
];

export const PhotoSlider = () => {
  const { theme } = useTheme();
  const [cards, setCards] = useState(PHOTOS);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleNextCard = () => {
    setCards((prev) => {
      const newCards = [...prev];
      const removed = newCards.shift();
      if (removed) newCards.push(removed);
      return newCards;
    });
  };

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      handleNextCard();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextCard();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in delay-2" style={{ position: 'relative', height: '360px', marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.button
        onClick={handleNextCard}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: 'absolute', left: '-12px', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tg-section-bg-color)', border: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`, color: 'var(--tg-text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
      >
        <ChevronLeft size={20} />
      </motion.button>

      <AnimatePresence>
        {cards.map((src, index) => {
          const isTop = index === cards.length - 1;
          return (
            <motion.div
              key={src}
              drag={isTop ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={isTop ? handleDragEnd : undefined}
              style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                opacity: isTop ? opacity : 1 - ((cards.length - 1 - index) * 0.2),
                position: 'absolute',
                width: '100%',
                maxWidth: '280px',
                height: '340px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: isTop ? '0 30px 60px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.1)',
                border: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
                cursor: isTop ? 'grab' : 'default',
                zIndex: index
              }}
              animate={{
                scale: 1 - ((cards.length - 1 - index) * 0.05),
                y: (cards.length - 1 - index) * 15,
              }}
              whileHover={isTop ? { scale: 1.02 } : {}}
              whileTap={isTop ? { cursor: 'grabbing' } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              exit={{ x: -200, opacity: 0 }}
            >
              <img
                src={src}
                alt={`Aman and Selam ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: theme === 'pearl-white'
                  ? 'linear-gradient(to top, rgba(253, 251, 247, 0.4) 0%, transparent 40%)'
                  : 'linear-gradient(to top, rgba(13, 31, 21, 0.6) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.button
        onClick={handleNextCard}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: 'absolute', right: '-12px', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tg-section-bg-color)', border: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`, color: 'var(--tg-text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
      >
        <ChevronRight size={20} />
      </motion.button>
    </div>
  );
};
