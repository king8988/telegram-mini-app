'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, UploadCloud, X,
    CheckCircle2, Image as ImageIcon, Trash2, Camera,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { WeddingFooter } from '@/components/WeddingFooter';

/* ── Quota ── */
const MAX_UPLOADS = 15;

/* ── Seed data ── */
const INITIAL_PHOTOS = Array.from({ length: 8 }, (_, i) => ({
    id: `existing-${i + 1}`,
    url: `https://picsum.photos/seed/myupload${i + 1}/400/400`,
}));

const PHOTOS_PER_PAGE = 9;

export default function UploadPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [photos, setPhotos] = useState(INITIAL_PHOTOS);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const uploaded = photos.length;
    const remaining = MAX_UPLOADS - uploaded;
    const progress = (uploaded / MAX_UPLOADS) * 100;
    const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);

    const paginatedPhotos = useMemo(() => {
        const s = (currentPage - 1) * PHOTOS_PER_PAGE;
        return photos.slice(s, s + PHOTOS_PER_PAGE);
    }, [currentPage, photos]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = () => {
        if (!selectedFile || remaining <= 0) return;
        setIsUploading(true);
        setTimeout(() => {
            const newPhoto = { id: `upload-${Date.now()}`, url: previewUrl! };
            setPhotos((prev) => [newPhoto, ...prev]);
            setIsUploading(false);
            setUploadSuccess(true);
            setCurrentPage(1);
            setTimeout(() => {
                setUploadSuccess(false);
                setPreviewUrl(null);
                setSelectedFile(null);
            }, 2000);
        }, 1800);
    };

    const handleRemove = useCallback((id: string) => {
        setRemovingId(null);
        setPhotos((prev) => {
            const next = prev.filter((p) => p.id !== id);
            const newTotal = Math.ceil(next.length / PHOTOS_PER_PAGE);
            if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
            if (next.length === 0) setCurrentPage(1);
            return next;
        });
    }, [currentPage]);

    const isLight = theme === 'pearl-white';

    return (
        <>
            <div className="ambient-glow" />

            {/* ── Nav ── */}
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

                <span style={{ fontSize: '16px', fontWeight: '600', letterSpacing: '0.5px', color: 'var(--tg-text-color)' }}>
                    Upload Photo
                </span>

                <div style={{ width: '40px' }} />
            </nav>

            <main className="app" style={{ paddingTop: '100px' }}>

                {/* ── Header + Progress ── */}
                <div className="header" style={{ padding: '0 0 var(--spacing-lg)' }}>
                    <h1 className="greeting">
                        Share a <span className="greeting-accent">Moment</span>
                    </h1>
                    <p className="subtitle" style={{ marginTop: '8px', marginBottom: '24px' }}>
                        Add your captured memories to our wedding gallery.
                    </p>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px',
                                    background: 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    {uploaded}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--tg-hint-color)', fontWeight: 500 }}>
                                    of {MAX_UPLOADS} uploaded
                                </span>
                            </div>
                            <div style={{
                                padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                                letterSpacing: '0.3px',
                                background: remaining > 0 ? 'rgba(108,92,231,0.1)' : 'rgba(255,107,107,0.12)',
                                color: remaining > 0 ? 'var(--tg-accent-text-color)' : 'var(--tg-destructive-color)',
                            }}>
                                {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
                            </div>
                        </div>

                        {/* Track */}
                        <div style={{
                            position: 'relative', height: '8px', borderRadius: '100px',
                            background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0,
                                width: `${progress}%`,
                                borderRadius: '100px',
                                background: remaining > 0
                                    ? 'linear-gradient(90deg, var(--tg-button-color), var(--tg-accent-text-color))'
                                    : 'linear-gradient(90deg, var(--tg-destructive-color), #ff9f9f)',
                                transition: 'width 0.6s ease',
                            }} />
                        </div>
                    </div>
                </div>

                {/* ── Upload / Success ── */}
                {uploadSuccess ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '48px 0', textAlign: 'center',
                        animation: 'fadeInUp 0.4s ease both',
                    }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'rgba(0,184,148,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#00b894', marginBottom: '20px',
                        }}><CheckCircle2 size={36} /></div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: 'var(--tg-text-color)' }}>Upload Complete!</h2>
                        <p style={{ fontSize: '14px', color: 'var(--tg-hint-color)' }}>Your photo has been added to the gallery.</p>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                        {/* Upload zone */}
                        <div
                            onDragOver={handleDragOver} onDrop={handleDrop}
                            style={{
                                background: 'var(--tg-section-bg-color)',
                                border: `2px dashed ${previewUrl ? 'transparent' : 'var(--tg-button-color)'}`,
                                borderRadius: 'var(--radius-xl)',
                                padding: previewUrl ? '12px' : '44px 24px',
                                textAlign: 'center', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                minHeight: '260px', position: 'relative', overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                opacity: remaining <= 0 ? 0.5 : 1,
                                pointerEvents: remaining <= 0 ? 'none' : 'auto',
                            }}
                        >
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

                            {previewUrl ? (
                                <div style={{
                                    position: 'relative', width: '100%', height: '280px',
                                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                                        style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            background: 'rgba(0,0,0,0.5)',
                                            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
                                            width: '34px', height: '34px', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', zIndex: 10,
                                        }}
                                    ><X size={16} /></button>
                                </div>
                            ) : (
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: 'pointer', width: '100%' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(162,155,254,0.15))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--tg-button-color)',
                                        border: '1px solid rgba(108,92,231,0.2)',
                                    }}>
                                        <UploadCloud size={34} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '0 0 4px', color: 'var(--tg-text-color)' }}>Tap to Browse</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--tg-hint-color)', margin: 0, maxWidth: '220px', lineHeight: 1.5 }}>
                                            High-res images from your camera roll or files
                                        </p>
                                    </div>
                                    <div style={{
                                        marginTop: '2px', padding: '6px 14px',
                                        background: 'rgba(108,92,231,0.1)', borderRadius: '100px',
                                        color: 'var(--tg-button-color)', fontSize: '12px', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        <ImageIcon size={14} /> Select Image
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Upload button */}
                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="action-button"
                                style={{
                                    opacity: !previewUrl || isUploading || remaining <= 0 ? 0.6 : 1,
                                    cursor: !previewUrl || isUploading || remaining <= 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '12px', height: '52px', fontSize: '15px',
                                }}
                                onClick={handleUpload}
                                disabled={!previewUrl || isUploading || remaining <= 0}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="tg-loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Upload Photo</span>
                                        <span style={{ fontSize: '18px' }}>✨</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Gallery ── */}
                <div style={{ marginTop: '44px', paddingBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <p className="section-label" style={{ margin: 0 }}>Your Uploads</p>
                        {photos.length > 0 && (
                            <span style={{
                                fontSize: '12px', color: 'var(--tg-hint-color)', fontWeight: 500,
                                background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                padding: '4px 10px', borderRadius: '100px',
                            }}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    {photos.length === 0 ? (
                        /* ── Empty state ── */
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
                            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                            borderRadius: 'var(--radius-xl)',
                            border: `1px dashed ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}`,
                            animation: 'fadeInUp 0.4s ease both',
                        }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '20px' }}>
                                {/* Stacked card layers */}
                                <div style={{
                                    position: 'absolute', top: '8px', left: '8px',
                                    width: '72px', height: '72px', borderRadius: '18px',
                                    background: isLight ? 'rgba(108,92,231,0.06)' : 'rgba(108,92,231,0.1)',
                                    border: `1px solid ${isLight ? 'rgba(108,92,231,0.1)' : 'rgba(108,92,231,0.15)'}`,
                                    transform: 'rotate(-8deg)',
                                }} />
                                <div style={{
                                    position: 'absolute', top: '4px', left: '16px',
                                    width: '72px', height: '72px', borderRadius: '18px',
                                    background: isLight ? 'rgba(253,121,168,0.06)' : 'rgba(253,121,168,0.1)',
                                    border: `1px solid ${isLight ? 'rgba(253,121,168,0.1)' : 'rgba(253,121,168,0.15)'}`,
                                    transform: 'rotate(6deg)',
                                }} />
                                <div style={{
                                    position: 'absolute', top: '10px', left: '12px',
                                    width: '72px', height: '72px', borderRadius: '18px',
                                    background: isLight
                                        ? 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(162,155,254,0.12))'
                                        : 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(162,155,254,0.15))',
                                    border: `1px solid ${isLight ? 'rgba(108,92,231,0.15)' : 'rgba(108,92,231,0.25)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--tg-button-color)',
                                }}>
                                    <Camera size={28} strokeWidth={1.5} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--tg-text-color)' }}>
                                No photos yet
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--tg-hint-color)', maxWidth: '220px', lineHeight: 1.5 }}>
                                Your uploaded moments will appear here. Tap the upload area above to get started!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* 3-col grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {paginatedPhotos.map((photo) => (
                                    <div key={photo.id} style={{
                                        position: 'relative',
                                        background: isLight
                                            ? 'linear-gradient(145deg, #ffffff, #f0eff5)'
                                            : 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                                        borderRadius: '14px', padding: '5px',
                                        boxShadow: isLight
                                            ? '0 2px 12px rgba(0,0,0,0.08)'
                                            : '0 4px 20px rgba(0,0,0,0.3)',
                                        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                    }}>
                                        {/* Image */}
                                        <div style={{
                                            width: '100%', aspectRatio: '1', borderRadius: '10px',
                                            overflow: 'hidden', position: 'relative',
                                        }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo.url} alt="Your upload" loading="lazy"
                                                style={{
                                                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                                                    filter: removingId === photo.id ? 'brightness(0.4)' : 'none',
                                                    transition: 'filter 0.2s ease',
                                                }}
                                            />

                                            {/* Confirm overlay */}
                                            {removingId === photo.id && (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    animation: 'fadeInUp 0.2s ease both',
                                                }}>
                                                    <button
                                                        onClick={() => handleRemove(photo.id)}
                                                        style={{
                                                            background: 'var(--tg-destructive-color)', border: 'none',
                                                            borderRadius: '10px', padding: '8px 16px',
                                                            color: '#fff', fontSize: '11px', fontWeight: 600,
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                            fontFamily: 'var(--font-sans)',
                                                        }}
                                                    ><Trash2 size={12} /> Remove</button>
                                                    <button
                                                        onClick={() => setRemovingId(null)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.15)',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            borderRadius: '10px', padding: '6px 14px',
                                                            color: '#fff', fontSize: '11px', fontWeight: 500,
                                                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                                        }}
                                                    >Cancel</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove button */}
                                        {removingId !== photo.id && (
                                            <div style={{ padding: '5px 2px 3px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setRemovingId(photo.id)}
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        color: 'var(--tg-hint-color)', fontSize: '10px', fontWeight: 600,
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        padding: '3px 8px', borderRadius: '6px',
                                                        fontFamily: 'var(--font-sans)',
                                                    }}
                                                ><X size={12} /> Remove</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                                    <button disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((v) => Math.max(1, v - 1))}
                                        style={{
                                            width: '34px', height: '34px', borderRadius: '10px', border: 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: currentPage === 1 ? 'default' : 'pointer',
                                            background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                            color: 'var(--tg-text-color)', opacity: currentPage === 1 ? 0.35 : 1,
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    ><ChevronLeft size={16} /></button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                        <button key={pg} onClick={() => setCurrentPage(pg)}
                                            style={{
                                                width: '34px', height: '34px', borderRadius: '10px', border: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                                                fontFamily: 'var(--font-sans)',
                                                background: pg === currentPage
                                                    ? 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))'
                                                    : isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                                color: pg === currentPage ? '#fff' : 'var(--tg-text-color)',
                                                boxShadow: pg === currentPage ? '0 4px 14px rgba(108,92,231,0.3)' : 'none',
                                            }}
                                        >{pg}</button>
                                    ))}

                                    <button disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((v) => Math.min(totalPages, v + 1))}
                                        style={{
                                            width: '34px', height: '34px', borderRadius: '10px', border: 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: currentPage === totalPages ? 'default' : 'pointer',
                                            background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                            color: 'var(--tg-text-color)', opacity: currentPage === totalPages ? 0.35 : 1,
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    ><ChevronRight size={16} /></button>
                                    <WeddingFooter />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
