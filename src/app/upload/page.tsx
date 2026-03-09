'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, UploadCloud, X,
    CheckCircle2, Image as ImageIcon, Trash2, Camera,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

/* ── Quota constants ── */
const MAX_UPLOADS = 15;

/* ── Seed initial "already uploaded" photos ── */
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

    const uploaded = photos.length;
    const remaining = MAX_UPLOADS - uploaded;
    const progress = (uploaded / MAX_UPLOADS) * 100;
    const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);

    const paginatedPhotos = useMemo(() => {
        const s = (currentPage - 1) * PHOTOS_PER_PAGE;
        return photos.slice(s, s + PHOTOS_PER_PAGE);
    }, [currentPage, photos]);

    /* ── Handlers ── */
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
            const newPhoto = {
                id: `upload-${Date.now()}`,
                url: previewUrl!,
            };
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
        setPhotos((prev) => {
            const next = prev.filter((p) => p.id !== id);
            const newTotal = Math.ceil(next.length / PHOTOS_PER_PAGE);
            if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
            if (next.length === 0) setCurrentPage(1);
            return next;
        });
    }, [currentPage]);

    const isLight = theme === 'pearl-white';

    /* ═══════════════════════════════════════════════════
       Sub-components
       ═══════════════════════════════════════════════════ */

    /* ── Animated Progress Bar ── */
    const ProgressBar = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ marginBottom: '28px' }}
        >
            {/* Stats row */}
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
                    background: remaining > 0
                        ? 'rgba(108, 92, 231, 0.1)'
                        : 'rgba(255, 107, 107, 0.12)',
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
                {/* Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: 'absolute', inset: 0, right: 'auto',
                        borderRadius: '100px',
                        background: remaining > 0
                            ? 'linear-gradient(90deg, var(--tg-button-color), var(--tg-accent-text-color))'
                            : 'linear-gradient(90deg, var(--tg-destructive-color), #ff9f9f)',
                    }}
                />
                {/* Shine sweep */}
                <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1 }}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                        borderRadius: '100px',
                    }}
                />
            </div>
        </motion.div>
    );

    /* ── Photo Frame w/ remove ── */
    const PhotoFrame = ({ photo, index }: { photo: typeof photos[0]; index: number }) => {
        const [confirmRemove, setConfirmRemove] = useState(false);

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                style={{
                    position: 'relative',
                    background: isLight
                        ? 'linear-gradient(145deg, #ffffff, #f0eff5)'
                        : 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                    borderRadius: '14px',
                    padding: '5px',
                    boxShadow: isLight
                        ? '0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                        : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                    border: isLight
                        ? '1px solid rgba(0,0,0,0.06)'
                        : '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                }}
            >
                {/* Image */}
                <div style={{
                    width: '100%', aspectRatio: '1', borderRadius: '10px',
                    overflow: 'hidden', position: 'relative',
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={photo.url}
                        alt="Your upload"
                        loading="lazy"
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                            transition: 'transform 0.35s ease',
                            filter: confirmRemove ? 'brightness(0.4)' : 'none',
                        }}
                    />

                    {/* Confirm-remove overlay */}
                    <AnimatePresence>
                        {confirmRemove && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRemove(photo.id)}
                                    style={{
                                        background: 'var(--tg-destructive-color)', border: 'none',
                                        borderRadius: '10px', padding: '8px 16px',
                                        color: '#fff', fontSize: '11px', fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                >
                                    <Trash2 size={12} /> Remove
                                </motion.button>
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, transition: { delay: 0.05 } }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setConfirmRemove(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(6px)',
                                        borderRadius: '10px', padding: '6px 14px',
                                        color: '#fff', fontSize: '11px', fontWeight: 500,
                                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                    }}
                                >
                                    Cancel
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Remove button strip */}
                {!confirmRemove && (
                    <div style={{ padding: '5px 2px 3px', textAlign: 'center' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setConfirmRemove(true)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--tg-hint-color)', fontSize: '10px', fontWeight: 600,
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '3px 8px', borderRadius: '6px',
                                transition: 'color 0.2s',
                                fontFamily: 'var(--font-sans)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--tg-destructive-color)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--tg-hint-color)')}
                        >
                            <X size={12} /> Remove
                        </motion.button>
                    </div>
                )}
            </motion.div>
        );
    };

    /* ── Empty State ── */
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
                background: isLight
                    ? 'rgba(0,0,0,0.02)'
                    : 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-xl)',
                border: `1px dashed ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}`,
            }}
        >
            {/* Animated camera stack */}
            <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '20px' }}>
                <motion.div
                    animate={{ rotate: [-8, -8] }}
                    style={{
                        position: 'absolute', top: '8px', left: '8px',
                        width: '72px', height: '72px', borderRadius: '18px',
                        background: isLight
                            ? 'rgba(108,92,231,0.06)'
                            : 'rgba(108,92,231,0.1)',
                        border: `1px solid ${isLight ? 'rgba(108,92,231,0.1)' : 'rgba(108,92,231,0.15)'}`,
                    }}
                />
                <motion.div
                    animate={{ rotate: [6, 6] }}
                    style={{
                        position: 'absolute', top: '4px', left: '16px',
                        width: '72px', height: '72px', borderRadius: '18px',
                        background: isLight
                            ? 'rgba(253,121,168,0.06)'
                            : 'rgba(253,121,168,0.1)',
                        border: `1px solid ${isLight ? 'rgba(253,121,168,0.1)' : 'rgba(253,121,168,0.15)'}`,
                    }}
                />
                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: '10px', left: '12px',
                        width: '72px', height: '72px', borderRadius: '18px',
                        background: isLight
                            ? 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(162,155,254,0.12))'
                            : 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(162,155,254,0.15))',
                        border: `1px solid ${isLight ? 'rgba(108,92,231,0.15)' : 'rgba(108,92,231,0.25)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--tg-button-color)',
                    }}
                >
                    <Camera size={28} strokeWidth={1.5} />
                </motion.div>
            </div>

            <h3 style={{
                fontSize: '18px', fontWeight: 700, marginBottom: '6px',
                color: 'var(--tg-text-color)',
            }}>
                No photos yet
            </h3>
            <p style={{
                fontSize: '13px', color: 'var(--tg-hint-color)',
                maxWidth: '220px', lineHeight: 1.5,
            }}>
                Your uploaded moments will appear here. Tap the upload area above to get started!
            </p>
        </motion.div>
    );

    /* ── Pagination ── */
    const Pagination = () => {
        if (totalPages <= 1) return null;
        const getPages = () => {
            const p: (number | '...')[] = [];
            if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) p.push(i); }
            else {
                p.push(1);
                if (currentPage > 3) p.push('...');
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) p.push(i);
                if (currentPage < totalPages - 2) p.push('...');
                p.push(totalPages);
            }
            return p;
        };
        const btn: React.CSSProperties = {
            width: '34px', height: '34px', borderRadius: '10px', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            transition: 'all 0.2s ease', fontFamily: 'var(--font-sans)',
        };
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px' }}
            >
                <motion.button whileTap={{ scale: 0.9 }} disabled={currentPage === 1}
                    onClick={() => setCurrentPage((v) => Math.max(1, v - 1))}
                    style={{ ...btn, background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)', color: 'var(--tg-text-color)', opacity: currentPage === 1 ? 0.35 : 1 }}
                ><ChevronLeft size={16} /></motion.button>

                {getPages().map((pg, i) =>
                    pg === '...'
                        ? <span key={`d${i}`} style={{ color: 'var(--tg-hint-color)', fontSize: '13px', width: '26px', textAlign: 'center' }}>…</span>
                        : <motion.button key={pg} whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage(pg)}
                            style={{
                                ...btn,
                                background: pg === currentPage
                                    ? 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))'
                                    : isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                color: pg === currentPage ? '#fff' : 'var(--tg-text-color)',
                                boxShadow: pg === currentPage ? '0 4px 14px rgba(108,92,231,0.3)' : 'none',
                            }}
                        >{pg}</motion.button>
                )}

                <motion.button whileTap={{ scale: 0.9 }} disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((v) => Math.min(totalPages, v + 1))}
                    style={{ ...btn, background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)', color: 'var(--tg-text-color)', opacity: currentPage === totalPages ? 0.35 : 1 }}
                ><ChevronRight size={16} /></motion.button>
            </motion.div>
        );
    };

    /* ═══════════════════════════════════════════════════
       Render
       ═══════════════════════════════════════════════════ */
    return (
        <>
            <div className="ambient-glow" />

            {/* Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
                padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(15,15,26,0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            }}>
                <motion.button
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    style={{
                        background: 'var(--tg-section-bg-color)',
                        border: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '50%', width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        color: 'var(--tg-text-color)',
                    }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    aria-label="Go back"
                ><ChevronLeft size={20} /></motion.button>

                <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '16px', fontWeight: '600', letterSpacing: '0.5px', color: 'var(--tg-text-color)' }}
                >Upload Photo</motion.span>

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
                    <ProgressBar />
                </div>

                {/* ── Upload or Success ── */}
                <AnimatePresence mode="wait">
                    {uploadSuccess ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', textAlign: 'center' }}
                        >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,184,148,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b894', marginBottom: '20px' }}
                            ><CheckCircle2 size={36} /></motion.div>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: 'var(--tg-text-color)' }}>Upload Complete!</h2>
                            <p style={{ fontSize: '14px', color: 'var(--tg-hint-color)' }}>Your photo has been added to the gallery.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="upload-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                            {/* Upload zone */}
                            <motion.div
                                onDragOver={handleDragOver} onDrop={handleDrop}
                                whileHover={{ scale: previewUrl ? 1 : 1.01 }}
                                style={{
                                    background: 'var(--tg-section-bg-color)', backdropFilter: 'blur(20px)',
                                    border: `2px dashed ${previewUrl ? 'transparent' : 'var(--tg-button-color)'}`,
                                    borderRadius: 'var(--radius-xl)',
                                    padding: previewUrl ? '12px' : '44px 24px',
                                    textAlign: 'center', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    minHeight: '260px', position: 'relative', overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    opacity: remaining <= 0 ? 0.5 : 1,
                                    pointerEvents: remaining <= 0 ? 'none' : 'auto',
                                }}
                            >
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

                                <AnimatePresence mode="wait">
                                    {previewUrl ? (
                                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                            style={{ position: 'relative', width: '100%', height: '280px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }}
                                                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '34px', height: '34px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                                            ><X size={16} /></motion.button>
                                            <div onClick={() => fileInputRef.current?.click()}
                                                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                            >
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '100px', backdropFilter: 'blur(8px)', color: 'white', fontWeight: 500, fontSize: '14px' }}>Change Photo</div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: 'pointer', width: '100%' }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                                                style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(162,155,254,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tg-button-color)', boxShadow: '0 8px 32px rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}
                                            ><UploadCloud size={34} strokeWidth={1.5} /></motion.div>
                                            <div>
                                                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '0 0 4px', color: 'var(--tg-text-color)' }}>Tap to Browse</h3>
                                                <p style={{ fontSize: '13px', color: 'var(--tg-hint-color)', margin: 0, maxWidth: '220px', lineHeight: 1.5 }}>High-res images from your camera roll or files</p>
                                            </div>
                                            <div style={{ marginTop: '2px', padding: '6px 14px', background: 'rgba(108,92,231,0.1)', borderRadius: '100px', color: 'var(--tg-button-color)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ImageIcon size={14} /> Select Image
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Upload button */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 'var(--spacing-lg)' }}>
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
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                                            />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Upload Photo</span>
                                            <span style={{ fontSize: '18px' }}>✨</span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Gallery ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: '44px', paddingBottom: '32px' }}>
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
                        <EmptyState />
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <AnimatePresence mode="popLayout">
                                    {paginatedPhotos.map((p, i) => (
                                        <PhotoFrame key={p.id} photo={p} index={i} />
                                    ))}
                                </AnimatePresence>
                            </div>
                            <Pagination />
                        </>
                    )}
                </motion.div>
            </main>
        </>
    );
}
