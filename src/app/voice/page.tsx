'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mic, Square, Play, Pause, RotateCcw, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing' | 'saved';

export default function VoiceBlessingPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const isLight = theme === 'pearl-white';

    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [duration, setDuration] = useState(0);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [barHeights, setBarHeights] = useState<number[]>(Array(40).fill(4));
    const [savedBarHeights, setSavedBarHeights] = useState<number[]>([]);
    const [saved, setSaved] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const barsSnapshotRef = useRef<number[]>([]);

    /* ── helpers ── */
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const stopAnalysis = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = 0;
        }
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startBarAnimation = useCallback((analyser: AnalyserNode) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
            analyser.getByteFrequencyData(dataArray);
            const bars: number[] = [];
            const step = Math.max(1, Math.floor(dataArray.length / 40));
            for (let i = 0; i < 40; i++) {
                const val = dataArray[i * step] / 255;
                bars.push(Math.max(4, val * 64));
            }
            setBarHeights(bars);
            barsSnapshotRef.current = bars;
            animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, []);

    /* ── idle wave animation ── */
    useEffect(() => {
        if (recordingState !== 'idle') return;
        let t = 0;
        const idle = setInterval(() => {
            t += 0.08;
            const bars = Array.from({ length: 40 }, (_, i) => {
                const wave = Math.sin(t + i * 0.35) * 6 + Math.sin(t * 1.7 + i * 0.6) * 3;
                return Math.max(4, 8 + wave);
            });
            setBarHeights(bars);
        }, 50);
        return () => clearInterval(idle);
    }, [recordingState]);

    /* ── start recording ── */
    const handleStartRecording = useCallback(async (e: React.PointerEvent) => {
        e.preventDefault(); // prevent ghost click after pointerUp
        if (recordingState !== 'idle') return; // guard against double tap

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (evt) => {
                if (evt.data.size > 0) audioChunksRef.current.push(evt.data);
            };

            // Set onstop BEFORE calling start() so it's always wired up
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = URL.createObjectURL(blob);

                const audio = new Audio(audioUrlRef.current);
                audioRef.current = audio;
                audio.onloadedmetadata = () => setAudioDuration(Math.round(audio.duration));
                audio.onended = () => {
                    setRecordingState('recorded');
                    if (playbackTimerRef.current) {
                        clearInterval(playbackTimerRef.current);
                        playbackTimerRef.current = null;
                    }
                    setPlaybackTime(0);
                };
                setRecordingState('recorded');
            };

            mediaRecorder.start();
            setRecordingState('recording');
            setDuration(0);

            // fresh timer — stop any stale one first
            stopTimer();
            timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
            startBarAnimation(analyser);
        } catch {
            alert('Microphone access is required to record a voice blessing.');
        }
    }, [recordingState, startBarAnimation, stopTimer]);

    /* ── stop recording ── */
    const handleStopRecording = useCallback((e?: React.PointerEvent) => {
        e?.preventDefault();
        const mr = mediaRecorderRef.current;
        if (!mr || mr.state !== 'recording') return; // guard: only stop if actually recording

        // Stop the timer FIRST before any async work
        stopTimer();
        stopAnalysis();

        streamRef.current?.getTracks().forEach((t) => t.stop());

        const snapshot = [...barsSnapshotRef.current];
        setSavedBarHeights(snapshot.length ? snapshot : Array(40).fill(10));

        mr.stop(); // triggers onstop → setRecordingState('recorded')
        setPlaybackTime(0);
    }, [stopAnalysis, stopTimer]);

    /* ── play / pause ── */
    const handlePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (recordingState === 'playing') {
            audio.pause();
            if (playbackTimerRef.current) {
                clearInterval(playbackTimerRef.current);
                playbackTimerRef.current = null;
            }
            setRecordingState('recorded');
        } else {
            audio.currentTime = playbackTime; // resume from where we are
            audio.play();
            setRecordingState('playing');
            playbackTimerRef.current = setInterval(() => {
                setPlaybackTime(Math.floor(audio.currentTime));
            }, 200);
        }
    }, [recordingState, playbackTime]);

    /* ── retake ── */
    const handleRetake = useCallback(() => {
        audioRef.current?.pause();
        if (playbackTimerRef.current) {
            clearInterval(playbackTimerRef.current);
            playbackTimerRef.current = null;
        }
        stopTimer();
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
        audioRef.current = null;
        mediaRecorderRef.current = null;
        setSavedBarHeights([]);
        setDuration(0);
        setPlaybackTime(0);
        setAudioDuration(0);
        setBarHeights(Array(40).fill(4));
        setRecordingState('idle');
    }, [stopTimer]);

    /* ── save ── */
    const handleSave = useCallback(() => {
        if (!audioUrlRef.current) return;
        const a = document.createElement('a');
        a.href = audioUrlRef.current;
        a.download = 'voice-blessing.webm';
        a.click();
        setSaved(true);
        setRecordingState('saved');
        setTimeout(() => setSaved(false), 3000);
    }, []);

    /* ── cleanup on unmount ── */
    useEffect(() => {
        return () => {
            stopAnalysis();
            stopTimer();
            if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [stopAnalysis, stopTimer]);

    /* ── derived state ── */
    const isRecording = recordingState === 'recording';
    const hasRecording = recordingState === 'recorded' || recordingState === 'playing' || recordingState === 'saved';
    const isPlaying = recordingState === 'playing';
    const displayBars = hasRecording ? savedBarHeights : barHeights;
    const playbackProgress = audioDuration > 0 ? Math.min(1, playbackTime / audioDuration) : 0;

    /* ── theme-aware colours ── */
    // Bars: dark themes use white-tinted bars; light theme uses dark tinted bars
    const barBase = isLight ? 'rgba(44,42,41,' : 'rgba(255,255,255,';
    const panelBg = isLight
        ? 'rgba(0,0,0,0.04)'
        : 'rgba(255,255,255,0.03)';
    const panelBorder = isLight
        ? '1px solid rgba(0,0,0,0.08)'
        : '1px solid rgba(255,255,255,0.06)';
    const scrubberTrack = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    const retakeBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const retakeBorder = isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.1)';
    const navBg = isLight ? 'rgba(253,251,247,0.9)' : 'rgba(15,15,26,0.85)';
    const navBorder = isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.05)';
    const backBtnBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
    const backBtnBorder = isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)';

    const barColor = (h: number, i: number): string => {
        if (isRecording) return `rgba(9,132,227,${0.5 + (h / 64) * 0.5})`;
        if (isPlaying && i / 40 < playbackProgress) return `rgba(108,92,231,${0.55 + (h / 64) * 0.45})`;
        // idle / recorded / paused
        const opacity = isLight
            ? 0.18 + (h / 64) * 0.45   // darker on light bg
            : 0.12 + (h / 64) * 0.35;  // lighter on dark bg
        return `${barBase}${opacity})`;
    };

    return (
        <>
            <div className="ambient-glow" />

            {/* ── Nav ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
                padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: navBg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: navBorder,
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: backBtnBg,
                        border: backBtnBorder,
                        borderRadius: '50%', width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--tg-text-color)',
                    }}
                    aria-label="Go back"
                ><ChevronLeft size={20} /></button>

                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tg-text-color)' }}>
                    Voice Blessing
                </span>
                <div style={{ width: '40px' }} />
            </nav>

            <main className="app" style={{ paddingTop: '100px', minHeight: '100dvh' }}>

                {/* ── Header ── */}
                <div className="header" style={{ padding: '0 0 var(--spacing-lg)' }}>
                    <h1 className="greeting">
                        Record a <span className="greeting-accent">Blessing</span>
                    </h1>
                    <p className="subtitle" style={{ marginTop: '8px' }}>
                        {isRecording
                            ? 'Tap the button when you\'re done.'
                            : hasRecording
                                ? 'Listen back and save your blessing. 💌'
                                : 'Tap the mic and speak from your heart.'}
                    </p>
                </div>

                {/* ── Visualizer panel ── */}
                <div style={{
                    position: 'relative',
                    background: panelBg,
                    backdropFilter: 'blur(20px)',
                    border: panelBorder,
                    borderRadius: '24px',
                    padding: '28px 20px',
                    marginBottom: '32px',
                    overflow: 'hidden',
                }}>
                    {/* Ambient glow inside panel */}
                    <div style={{
                        position: 'absolute', top: '-40px', left: '50%',
                        transform: 'translateX(-50%)',
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: isRecording
                            ? 'radial-gradient(circle, rgba(9,132,227,0.12) 0%, transparent 70%)'
                            : isPlaying
                                ? 'radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)'
                                : 'transparent',
                        transition: 'background 0.5s ease',
                        pointerEvents: 'none',
                    }} />

                    {/* Timer display */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        color: isRecording ? '#0984e3' : 'var(--tg-hint-color)',
                        marginBottom: '20px',
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'color 0.3s ease',
                    }}>
                        {hasRecording
                            ? `${formatTime(playbackTime)} / ${formatTime(audioDuration || duration)}`
                            : isRecording
                                ? `● REC  ${formatTime(duration)}`
                                : '0:00'}
                    </div>

                    {/* Waveform bars */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        height: '72px',
                    }}>
                        {displayBars.map((h, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '4px',
                                    height: `${h}px`,
                                    borderRadius: '2px',
                                    background: barColor(h, i),
                                    transition: isRecording ? 'height 0.08s ease' : 'height 0.3s ease, background 0.3s ease',
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </div>

                    {/* Playback scrubber */}
                    {hasRecording && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{
                                width: '100%',
                                height: '3px',
                                background: scrubberTrack,
                                borderRadius: '2px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${playbackProgress * 100}%`,
                                    background: 'linear-gradient(90deg, var(--tg-button-color), var(--tg-accent-text-color))',
                                    borderRadius: '2px',
                                    transition: 'width 0.2s linear',
                                }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Big Mic Button ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        {/* Pulse rings (recording only) */}
                        {isRecording && (
                            <>
                                <div style={{
                                    position: 'absolute',
                                    width: '180px', height: '180px',
                                    borderRadius: '50%',
                                    border: '1.5px solid rgba(9,132,227,0.35)',
                                    animation: 'voicePulse1 1.8s ease-out infinite',
                                    pointerEvents: 'none',
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '148px', height: '148px',
                                    borderRadius: '50%',
                                    border: '1.5px solid rgba(9,132,227,0.45)',
                                    animation: 'voicePulse1 1.8s ease-out infinite 0.45s',
                                    pointerEvents: 'none',
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '120px', height: '120px',
                                    borderRadius: '50%',
                                    background: 'rgba(9,132,227,0.08)',
                                    animation: 'voicePulse2 1.2s ease-in-out infinite',
                                    pointerEvents: 'none',
                                }} />
                            </>
                        )}

                        {/* Central mic / stop / play-pause button */}
                        <button
                            id="voice-mic-button"
                            onPointerDown={!isRecording && !hasRecording ? handleStartRecording : undefined}
                            onPointerUp={isRecording ? handleStopRecording : undefined}
                            onPointerCancel={isRecording ? handleStopRecording : undefined}
                            onClick={hasRecording ? handlePlayPause : undefined}
                            aria-label={
                                isRecording ? 'Stop recording'
                                    : hasRecording ? (isPlaying ? 'Pause' : 'Play')
                                        : 'Start recording'
                            }
                            style={{
                                position: 'relative', zIndex: 1,
                                width: '100px', height: '100px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isRecording
                                    ? 'linear-gradient(135deg, #0984e3, #74b9ff)'
                                    : 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))',
                                boxShadow: isRecording
                                    ? '0 8px 36px rgba(9,132,227,0.5)'
                                    : '0 8px 32px rgba(108,92,231,0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                transform: isRecording ? 'scale(1.06)' : 'scale(1)',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                touchAction: 'none',
                            }}
                        >
                            {isRecording ? (
                                <Square size={34} color="#fff" fill="#fff" />
                            ) : hasRecording ? (
                                isPlaying
                                    ? <Pause size={34} color="#fff" fill="#fff" />
                                    : <Play size={34} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
                            ) : (
                                <Mic size={36} color="#fff" />
                            )}
                        </button>
                    </div>

                    {/* Hint text */}
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--tg-hint-color)',
                        textAlign: 'center',
                        lineHeight: 1.6,
                    }}>
                        {isRecording
                            ? 'Tap the button to stop recording'
                            : hasRecording
                                ? isPlaying ? 'Tap to pause' : 'Tap to play your blessing'
                                : 'Tap the mic button to start'}
                    </p>
                </div>

                {/* ── Save / Retake buttons ── */}
                {hasRecording && (
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '40px',
                        animation: 'fadeInUp 0.4s ease forwards',
                    }}>
                        <button
                            id="voice-retake-button"
                            onClick={handleRetake}
                            style={{
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                height: '52px',
                                background: retakeBg,
                                border: retakeBorder,
                                borderRadius: '14px',
                                color: 'var(--tg-text-color)',
                                fontSize: '15px', fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                transition: 'all 0.25s ease',
                            }}
                        >
                            <RotateCcw size={18} /> Retake
                        </button>

                        <button
                            id="voice-save-button"
                            onClick={handleSave}
                            style={{
                                flex: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                height: '52px',
                                background: saved
                                    ? 'linear-gradient(135deg, #00b894, #55efc4)'
                                    : 'linear-gradient(135deg, var(--tg-button-color), var(--tg-accent-text-color))',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '15px', fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                boxShadow: saved
                                    ? '0 4px 20px rgba(0,184,148,0.35)'
                                    : '0 4px 20px rgba(108,92,231,0.35)',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                            }}
                        >
                            {saved
                                ? <><CheckCircle size={18} /> Saved! 🎉</>
                                : <><Save size={18} /> Save Blessing</>}
                        </button>
                    </div>
                )}

                {/* ── Tips (idle only) ── */}
                {!hasRecording && !isRecording && (
                    <div style={{
                        marginTop: '48px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                    }}>
                        <p className="section-label" style={{ margin: '0 0 4px' }}>Tips</p>
                        {[
                            { icon: '❤️', text: 'Share something personal and heartfelt' }
                        ].map((tip, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: 'var(--spacing-md)',
                                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                                    border: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{tip.icon}</span>
                                <span style={{ fontSize: '14px', color: 'var(--tg-hint-color)' }}>{tip.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Keyframes ── */}
            <style>{`
        @keyframes voicePulse1 {
          0%   { transform: scale(0.88); opacity: 0.9; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes voicePulse2 {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50%       { transform: scale(1.06); opacity: 0.25; }
        }
      `}</style>
        </>
    );
}
