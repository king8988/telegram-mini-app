'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopNav } from '@/components/TopNav';
import { WeddingHeader } from '@/components/WeddingHeader';
import { PhotoSlider } from '@/components/PhotoSlider';
import { ActionCards } from '@/components/ActionCards';
import { WeddingFooter } from '@/components/WeddingFooter';

export default function Home() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <>
      <div className="ambient-glow" />
      <TopNav />

      <main className="app" style={{ paddingTop: '80px' }}>
        <WeddingHeader />
        <PhotoSlider />
        <ActionCards showToast={showToast} />
        <WeddingFooter />
      </main>

      <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </>
  );
}
