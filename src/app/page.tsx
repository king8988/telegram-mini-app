'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTelegram } from '@/components/TelegramProvider';
import { useTheme } from '@/components/ThemeProvider';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';

const PHOTOS = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1469&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1470&auto=format&fit=crop"
];

export default function Home() {
  const { isTelegram } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  const [toast, setToast] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('Guest');

  // Slider State
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
    try {
      // Access Telegram Web App API to get user metadata safely
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.first_name) {
        setGuestName(tg.initDataUnsafe.user.first_name);
      }
    } catch (e) {
      console.error('Failed to get TG User', e);
    }
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleActionClick = useCallback(
    (title: string) => {
      showToast(`Opening ${title}... ✨`);
    },
    [showToast]
  );

  return (
    <>
      <div className="ambient-glow" />

      {/* Top Navigation */}
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

        {/* Theme Toggler */}
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

      <main className="app" style={{ paddingTop: '80px' }}>
        {/* Header (Redesigned with framer-motion split names) */}
        <header className="header fade-in delay-1" style={{ paddingTop: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--tg-accent-text-color)', fontWeight: 'bold' }}
            >
              The Wedding Of
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontFamily: 'Georgia, serif', fontSize: '72px', lineHeight: '0.85', letterSpacing: '-0.05em', color: 'var(--tg-text-color)' }}
            >
              {['Aman', 'Selam'].map((name, i) => (
                <div key={name}>
                  {i > 0 && <span style={{ color: 'var(--tg-accent-text-color)', fontStyle: 'italic', display: 'block', marginLeft: '48px' }}>&amp;</span>}
                  <span style={{ display: 'block' }}>{name}</span>
                </div>
              ))}
            </motion.h1>
          </div>
          <p className="subtitle" style={{ maxWidth: '80%', margin: '0 auto 20px', fontSize: '15px' }}>
            Join us in celebrating a union of two souls. Your presence is our greatest gift.
          </p>
          <div className="badge">
            <span className="badge-dot" />
            {isTelegram ? `Welcome, ${guestName}` : `Welcome, ${guestName}`}
          </div>
        </header>

        {/* Couples Interactive Photo Slider - Deck of Cards */}
        <div className="fade-in delay-2" style={{ position: 'relative', height: '360px', marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

          {/* Deck Controls - Left Arrow */}
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

          {/* Deck Controls - Right Arrow */}
          <motion.button
            onClick={handleNextCard}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ position: 'absolute', right: '-12px', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tg-section-bg-color)', border: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`, color: 'var(--tg-text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {/* Action Cards */}
        <p className="section-label fade-in delay-3" style={{ marginTop: '40px' }}>Guest Activities</p>
        <div className="cards-grid">
          <div
            className={`card purple fade-in delay-4`}
            onClick={() => handleActionClick('Photo Upload')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleActionClick('Photo Upload')}
          >
            <div className="card-icon">📸</div>
            <div className="card-title">Upload Photo</div>
            <div className="card-desc">Share your captured moments</div>
          </div>

          <div
            className={`card blue fade-in delay-5`}
            onClick={() => handleActionClick('Voice Blessing')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleActionClick('Voice Blessing')}
          >
            <div className="card-icon">🎤</div>
            <div className="card-title">Voice Blessing</div>
            <div className="card-desc">Record a message for us</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="fade-in delay-6" style={{
          marginTop: '64px',
          paddingTop: '32px',
          borderTop: `1px solid ${theme === 'pearl-white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px'
        }}>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold', color: 'var(--tg-hint-color)', opacity: 0.6, marginBottom: '8px' }}>
                Since
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: 'var(--tg-text-color)' }}>
                2026
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold', color: 'var(--tg-hint-color)', opacity: 0.6, marginBottom: '8px' }}>
                Status
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontStyle: 'italic', color: 'var(--tg-accent-text-color)' }}>
                Live
              </p>
            </div>
          </div>
          <p style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.6em', color: 'var(--tg-hint-color)', opacity: 0.5, fontWeight: 'bold', textAlign: 'center', paddingLeft: '0.6em' }}>
            A Crafted Experience by Mireka
          </p>
        </footer>
      </main>

      {/* Toast */}
      <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </>
  );
}
