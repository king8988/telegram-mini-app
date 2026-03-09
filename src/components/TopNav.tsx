'use client';

import { motion } from 'framer-motion';
import { Heart, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export const TopNav = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, padding: '24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--tg-section-bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Heart size={16} strokeWidth={2.5} color="var(--tg-accent-text-color)" />
        </div>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 'bold', color: 'var(--tg-hint-color)' }}>Mireka</span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleTheme}
        style={{
          background: 'var(--tg-section-bg-color)',
          border: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          color: 'var(--tg-text-color)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Theme"
      >
        {theme === 'pearl-white' ? <Moon size={18} /> : <Sun size={18} />}
      </motion.button>
    </nav>
  );
};
