'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from '@/components/TelegramProvider';

export const WeddingHeader = () => {
  const { isTelegram } = useTelegram();
  const [guestName, setGuestName] = useState('Guest');

  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.first_name) {
        setGuestName(tg.initDataUnsafe.user.first_name);
      }
    } catch (e) {
      console.error('Failed to get TG User', e);
    }
  }, []);

  return (
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
  );
};
