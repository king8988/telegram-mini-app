'use client';

import { useTheme } from '@/components/ThemeProvider';

export const WeddingFooter = () => {
  const { theme } = useTheme();

  return (
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
  );
};
