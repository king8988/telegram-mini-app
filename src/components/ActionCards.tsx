'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ActionCardsProps {
  showToast: (message: string) => void;
}

export const ActionCards = ({ showToast }: ActionCardsProps) => {
  const router = useRouter();

  const handleActionClick = useCallback(
    (id: string, title: string) => {
      if (id === 'photo') {
        router.push('/upload');
      } else if (id === 'wish') {
        router.push('/wish');
      } else if (id === 'voice') {
        router.push('/voice');
      } else {
        showToast(`Opening ${title}... ✨`);
      }
    },
    [router, showToast]
  );

  const cards = [
    { id: 'photo', title: 'Upload Photo', desc: 'Share your captured moments', icon: '📸', color: 'purple', delay: 4 },
    { id: 'wish', title: 'Add Your Wish', desc: 'Write a heartfelt note', icon: '✍️', color: 'pink', delay: 5 },
    { id: 'voice', title: 'Voice Blessing', desc: 'Record a message for us', icon: '🎤', color: 'blue', delay: 6 },
  ];

  return (
    <>
      <p className="section-label fade-in delay-3" style={{ marginTop: '40px' }}>Guest Activities</p>
      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${card.color} fade-in delay-${card.delay} ${card.id === 'voice' ? 'full-width' : ''}`}
            onClick={() => handleActionClick(card.id, card.title)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleActionClick(card.id, card.title)}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-title">{card.title}</div>
            <div className="card-desc">{card.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
};
