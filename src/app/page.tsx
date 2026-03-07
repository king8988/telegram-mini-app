'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useTelegram } from '@/components/TelegramProvider';

const FEATURES = [
  {
    icon: '🚀',
    title: 'Quick Actions',
    desc: 'Perform tasks with a single tap',
    accent: 'purple',
  },
  {
    icon: '🔔',
    title: 'Notifications',
    desc: 'Stay updated in real time',
    accent: 'pink',
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'Track your activity insights',
    accent: 'blue',
  },
  {
    icon: '🎨',
    title: 'Themes',
    desc: 'Adapts to your Telegram theme',
    accent: 'green',
  },
  {
    icon: '⚡',
    title: 'Performance',
    desc: 'Lightning-fast responses',
    accent: 'orange',
  },
  {
    icon: '🔐',
    title: 'Secure',
    desc: 'End-to-end encrypted data',
    accent: 'teal',
  },
];

const INFO_ITEMS = [
  { icon: '📱', label: 'Platform', key: 'platform' },
  { icon: '🌐', label: 'Environment', key: 'environment' },
  { icon: '🎯', label: 'SDK Status', key: 'sdk' },
];

export default function Home() {
  const { isTelegram } = useTelegram();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleCardClick = useCallback(
    (title: string) => {
      showToast(`${title} tapped ✨`);
    },
    [showToast]
  );

  return (
    <>
      <div className="ambient-glow" />
      <main className="app">
        {/* Header */}
        <header className="header fade-in delay-1">
          <div className="avatar">✦</div>
          <h1 className="greeting">
            Hello, <span className="greeting-accent">Explorer</span>
          </h1>
          <p className="subtitle">Welcome to your Mini App</p>
          <div className="badge">
            <span className="badge-dot" />
            {isTelegram ? 'Running in Telegram' : 'Browser Preview'}
          </div>
        </header>

        {/* Stats */}
        <div className="stats-banner fade-in delay-2">
          <div className="stat">
            <div className="stat-value">12.4k</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat">
            <div className="stat-value">98%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat">
            <div className="stat-value">4.9</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>

        {/* Feature Cards */}
        <p className="section-label fade-in delay-3">Features</p>
        <div className="cards-grid">
          {FEATURES.map((feature, i) => {
            const cardContent = (
              <div
                key={feature.title}
                className={`card ${feature.accent} fade-in delay-${i + 3}`}
                onClick={() => !['Notifications', 'Themes'].includes(feature.title) && handleCardClick(feature.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !['Notifications', 'Themes'].includes(feature.title) && handleCardClick(feature.title)}
              >
                <div className="card-icon">{feature.icon}</div>
                <div className="card-title">{feature.title}</div>
                <div className="card-desc">{feature.desc}</div>
              </div>
            );

            if (feature.title === 'Notifications') {
              return (
                <Link href="/notifications" key={feature.title} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {cardContent}
                </Link>
              );
            }

            if (feature.title === 'Themes') {
              return (
                <Link href="/themes" key={feature.title} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {cardContent}
                </Link>
              );
            }

            return cardContent;
          })}
        </div>

        {/* Game Link */}
        <p className="section-label fade-in delay-7">Mini Games</p>
        <Link href="/tiktaktoe" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="card purple fade-in delay-8" style={{ cursor: 'pointer' }}>
            <div className="card-icon">🎮</div>
            <div className="card-title">Tic Tac Toe</div>
            <div className="card-desc">Play against a friend or CPU</div>
          </div>
        </Link>

        {/* Info */}
        <p className="section-label fade-in delay-7">App Info</p>
        <div className="info-list fade-in delay-8">
          {INFO_ITEMS.map((item) => (
            <div className="info-item" key={item.key}>
              <div className="info-item-left">
                <div className="info-item-icon">{item.icon}</div>
                <div className="info-item-label">{item.label}</div>
              </div>
              <div className="info-item-value">
                {item.key === 'platform'
                  ? isTelegram
                    ? 'Telegram'
                    : 'Web Browser'
                  : item.key === 'environment'
                    ? isTelegram
                      ? 'Mini App'
                      : 'Development'
                    : isTelegram
                      ? 'Connected'
                      : 'Standalone'}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="action-button fade-in delay-8"
          onClick={() => showToast('Let\'s get started! 🎉')}
        >
          🚀 Get Started
        </button>
      </main>

      {/* Toast */}
      <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </>
  );
}
