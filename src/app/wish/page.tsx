'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Pen, Type, Eraser, Download } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type Mode = 'draw' | 'type';

export default function WishPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [mode, setMode] = useState<Mode>('draw');
    const [isDrawing, setIsDrawing] = useState(false);
    const [textValue, setTextValue] = useState('');
    const [saved, setSaved] = useState(false);
    const [brushColor] = useState('#ffffff');
    const [brushSize] = useState(3);

    const isLight = theme === 'pearl-white';

    /* ── Canvas setup ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [mode]);

    /* ── Drawing helpers ── */
    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        setIsDrawing(true);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }, []);

    const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
    }, [isDrawing, brushColor, brushSize]);

    const endDraw = useCallback(() => {
        setIsDrawing(false);
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /* ── Save ── */
    const handleSave = () => {
        if (mode === 'draw') {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Create a final canvas with the blackboard background
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            const fCtx = finalCanvas.getContext('2d');
            if (!fCtx) return;

            // Draw blackboard background
            fCtx.fillStyle = '#1a1a2e';
            fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            // Draw the user's strokes on top
            fCtx.drawImage(canvas, 0, 0);

            finalCanvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-wish.png';
                a.click();
                URL.revokeObjectURL(url);
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }, 'image/png');
        } else {
            // Type mode — render text onto a canvas and save
            const w = 800;
            const h = 500;
            const fc = document.createElement('canvas');
            fc.width = w;
            fc.height = h;
            const fCtx = fc.getContext('2d');
            if (!fCtx) return;

            // Blackboard bg
            fCtx.fillStyle = '#1a1a2e';
            fCtx.fillRect(0, 0, w, h);

            // Subtle chalk-dust texture
            for (let i = 0; i < 150; i++) {
                fCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
                fCtx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }

            // Text
            fCtx.fillStyle = '#ffffff';
            fCtx.font = '36px "Lavishly Yours", cursive';
            fCtx.textAlign = 'center';

            const words = textValue.split(' ');
            const lines: string[] = [];
            let line = '';
            for (const word of words) {
                const test = line ? `${line} ${word}` : word;
                if (fCtx.measureText(test).width > w - 120) {
                    lines.push(line);
                    line = word;
                } else {
                    line = test;
                }
            }
            if (line) lines.push(line);

            const lineH = 52;
            const startY = (h - lines.length * lineH) / 2 + 20;
            lines.forEach((l, i) => {
                fCtx.fillText(l, w / 2, startY + i * lineH);
            });

            fc.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-wish.png';
                a.click();
                URL.revokeObjectURL(url);
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }, 'image/png');
        }
    };

    return (
        <>
            <div className="ambient-glow" />

            {/* Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
                padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(15,15,26,0.85)',
                borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'var(--tg-section-bg-color)',
                        border: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '50%', width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--tg-text-color)',
                    }}
                    aria-label="Go back"
                ><ChevronLeft size={20} /></button>

                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tg-text-color)' }}>
                    Add Your Wish
                </span>

                <div style={{ width: '40px' }} />
            </nav>

            <main className="app" style={{ paddingTop: '100px' }}>
                {/* Header */}
                <div className="header" style={{ padding: '0 0 var(--spacing-lg)' }}>
                    <h1 className="greeting">
                        Write a <span className="greeting-accent">Wish</span>
                    </h1>
                    <p className="subtitle" style={{ marginTop: '8px' }}>
                        Leave your heartfelt blessing on the blackboard.
                    </p>
                </div>

                {/* Mode toggle */}
                <div style={{
                    display: 'flex', gap: '8px', marginBottom: '20px',
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                    borderRadius: '14px', padding: '4px',
                }}>
                    <button
                        onClick={() => setMode('draw')}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: '11px', border: 'none',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            fontFamily: 'var(--font-sans)',
                            background: mode === 'draw'
                                ? 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))'
                                : 'transparent',
                            color: mode === 'draw' ? '#fff' : 'var(--tg-hint-color)',
                            boxShadow: mode === 'draw' ? '0 4px 14px rgba(108,92,231,0.3)' : 'none',
                            transition: 'all 0.25s ease',
                        }}
                    ><Pen size={15} /> Handwrite</button>
                    <button
                        onClick={() => setMode('type')}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: '11px', border: 'none',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            fontFamily: 'var(--font-sans)',
                            background: mode === 'type'
                                ? 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))'
                                : 'transparent',
                            color: mode === 'type' ? '#fff' : 'var(--tg-hint-color)',
                            boxShadow: mode === 'type' ? '0 4px 14px rgba(108,92,231,0.3)' : 'none',
                            transition: 'all 0.25s ease',
                        }}
                    ><Type size={15} /> Type</button>
                </div>

                {/* ── Blackboard ── */}
                <div
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '380px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: '#1a1a2e',
                        boxShadow: '0 8px 36px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.03)',
                        border: '3px solid #2a2a3e',
                    }}
                >
                    {/* Chalk-border rim */}
                    <div style={{
                        position: 'absolute', inset: '6px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        pointerEvents: 'none', zIndex: 2,
                    }} />

                    {/* Subtle grain texture */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                        pointerEvents: 'none', zIndex: 1,
                    }} />

                    {mode === 'draw' ? (
                        <>
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: 'absolute', inset: 0,
                                    touchAction: 'none', cursor: 'crosshair',
                                    zIndex: 3,
                                }}
                                onMouseDown={startDraw}
                                onMouseMove={draw}
                                onMouseUp={endDraw}
                                onMouseLeave={endDraw}
                                onTouchStart={startDraw}
                                onTouchMove={draw}
                                onTouchEnd={endDraw}
                            />

                            {/* Eraser button */}
                            <button
                                onClick={clearCanvas}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px', zIndex: 5,
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '10px', padding: '8px 14px',
                                    color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                    fontFamily: 'var(--font-sans)',
                                }}
                            ><Eraser size={14} /> Clear</button>

                            {/* Hint */}
                            <div style={{
                                position: 'absolute', bottom: '14px', left: 0, right: 0,
                                textAlign: 'center', zIndex: 4,
                                color: 'rgba(255,255,255,0.2)', fontSize: '12px',
                                pointerEvents: 'none',
                            }}>
                                Draw your wish with your finger ✨
                            </div>
                        </>
                    ) : (
                        /* ── Type mode ── */
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '24px',
                        }}>
                            <textarea
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                placeholder="Write your wish here..."
                                style={{
                                    width: '100%', height: '100%', resize: 'none',
                                    background: 'transparent', border: 'none', outline: 'none',
                                    color: '#ffffff',
                                    fontFamily: 'var(--font-lavishly), cursive',
                                    fontSize: '28px',
                                    lineHeight: 1.6,
                                    textAlign: 'center',
                                    caretColor: 'rgba(255,255,255,0.6)',
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* ── Save button ── */}
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <button
                        className="action-button"
                        onClick={handleSave}
                        disabled={mode === 'type' && !textValue.trim()}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', height: '52px', fontSize: '15px',
                            opacity: (mode === 'type' && !textValue.trim()) ? 0.5 : 1,
                            cursor: (mode === 'type' && !textValue.trim()) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saved ? (
                            <><span>Saved!</span> <span style={{ fontSize: '18px' }}>🎉</span></>
                        ) : (
                            <><Download size={18} /> <span>Save as Image</span></>
                        )}
                    </button>
                </div>

                {/* Live preview for type mode */}
                {mode === 'type' && textValue.trim() && (
                    <div style={{
                        marginTop: '24px', padding: '20px',
                        background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-lg)',
                        border: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                        <p className="section-label" style={{ margin: '0 0 12px', fontSize: '10px' }}>Preview</p>
                        <p style={{
                            fontFamily: 'var(--font-lavishly), cursive',
                            fontSize: '24px', lineHeight: 1.6,
                            color: 'var(--tg-text-color)',
                            textAlign: 'center', margin: 0,
                            wordBreak: 'break-word',
                        }}>
                            {textValue}
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}
