'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, themes } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function ThemeSelectionPage() {
    const { theme: currentTheme, setTheme } = useTheme();
    const router = useRouter();

    const handleSave = () => {
        router.push('/');
    };

    return (
        <>
            <div className="ambient-glow" />
            <main className="app">
                <header className="header fade-in delay-1">
                    <div className="avatar">🎨</div>
                    <h1 className="greeting">
                        Custom <span className="greeting-accent">Themes</span>
                    </h1>
                    <p className="subtitle">Pick a style that fits your mood</p>
                    <Link href="/" className="badge" style={{ marginTop: '12px', cursor: 'pointer' }}>
                        ← Back to Home
                    </Link>
                </header>

                <div className="section-label fade-in delay-2">Select a Theme</div>

                <div className="cards-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)' }}>
                    {themes.map((t, i) => (
                        <div
                            key={t.id}
                            className={`card fade-in delay-${(i % 8) + 1}`}
                            style={{
                                border: currentTheme === t.id ? '2px solid var(--tg-button-color)' : '1px solid rgba(255,255,255,0.06)',
                                padding: 'var(--spacing-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--spacing-md)'
                            }}
                            onClick={() => setTheme(t.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '16px' }}>{t.name}</span>
                                {currentTheme === t.id && <span style={{ color: 'var(--tg-button-color)' }}>✅ Active</span>}
                            </div>

                            {/* Miniature Preview Container */}
                            <div
                                style={{
                                    background: t.colors.bg,
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    pointerEvents: 'none'
                                }}
                            >
                                {/* Miniature Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})` }} />
                                    <div style={{ height: '8px', width: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                                </div>

                                {/* Miniature Section Label */}
                                <div style={{ height: '4px', width: '60px', background: t.colors.accent, opacity: 0.5, borderRadius: '2px', marginTop: '4px' }} />

                                {/* Miniature Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                </div>

                                {/* Miniature Button */}
                                <div
                                    style={{
                                        height: '24px',
                                        background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
                                        borderRadius: '6px',
                                        marginTop: '4px'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="action-button fade-in delay-6"
                    style={{ marginTop: 'var(--spacing-xl)' }}
                    onClick={handleSave}
                >
                    ✨ Save & Apply
                </button>
            </main>
        </>
    );
}
