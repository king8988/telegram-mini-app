'use client';

import { useTelegram } from '@/components/TelegramProvider';
import Link from 'next/link';
import { useCallback, useState, useEffect } from 'react';

export default function NotificationsPage() {
    const { isTelegram } = useTelegram();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', desc: '', icon: '🔔' });

useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await new Promise<any[]>((resolve) => {
                    setTimeout(() => {
                        resolve([
                            {
                                id: 1,
                                title: 'Welcome Package',
                                desc: 'You received 500 bonus points!',
                                time: '2m ago',
                                icon: '🎁',
                                accent: 'purple',
                                unread: true,
                            },
                            {
                                id: 2,
                                title: 'Daily Streak',
                                desc: 'Day 3! Keep going to earn more.',
                                time: '4h ago',
                                icon: '🔥',
                                accent: 'orange',
                                unread: false,
                            },
                            {
                                id: 3,
                                title: 'System Update',
                                desc: 'Mini App v2.4 is now live.',
                                time: '1d ago',
                                icon: '⚙️',
                                accent: 'blue',
                                unread: false,
                            },
                            {
                                id: 4,
                                title: 'New Event',
                                desc: 'Join the Summer Challenge now!',
                                time: '2d ago',
                                icon: '⭐',
                                accent: 'pink',
                                unread: false,
                            },
                            {
                                id: 5,
                                title: 'Security Alert',
                                desc: 'New login detected from Chrome.',
                                time: '3d ago',
                                icon: '🔐',
                                accent: 'teal',
                                unread: false,
                            },
                            {
                                id: 6,
                                title: 'Friend Request',
                                desc: 'Alex wants to connect with you.',
                                time: '5d ago',
                                icon: '👋',
                                accent: 'green',
                                unread: false,
                            },
                        ]);
                    }, 1000);
                });
                setNotifications(response);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    function showToast(message: string) {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    }

    function handleClearAll() {
        console.log('Clearing notifications state');
        setNotifications([]);
        showToast('All notifications cleared ✨');
    }

    function handleAddNotification() {
        setIsModalOpen(true);
    }

    function handleSaveNotification() {
        if (!formData.title || !formData.desc) {
            showToast('Please fill in all fields');
            return;
        }

        const newNotif = {
            id: Date.now(),
            title: formData.title,
            desc: formData.desc,
            icon: formData.icon || '🔔',
            accent: 'purple', // Defaulting to purple for custom notifications
            time: 'Just now',
            unread: true
        };

        setNotifications(prev => [newNotif, ...prev]);
        setIsModalOpen(false);
        setFormData({ title: '', desc: '', icon: '🔔' });
        showToast(`New "${formData.title}" added!`);
    }

    function handleEditClick(e: React.MouseEvent, notif: any) {
        e.stopPropagation();
        setSelectedNotif({ ...notif });
        setIsEditModalOpen(true);
    }

    function handleEditSave() {
        if (!selectedNotif.title || !selectedNotif.desc) {
            showToast('Please fill in all fields');
            return;
        }

        setNotifications(prev => prev.map(n => n.id === selectedNotif.id ? selectedNotif : n));
        setIsEditModalOpen(false);
        setSelectedNotif(null);
        showToast(`Notification "${selectedNotif.title}" updated!`);
    }

    return (
        <>
            <div className="ambient-glow" />
            <main className="app" key={notifications.length}>
                {/* Header */}
                <header className="header fade-in delay-1">
                    <div className="avatar">🔔</div>
                    <h1 className="greeting">
                        Your <span className="greeting-accent">Notifications</span>
                    </h1>
                    <p className="subtitle">Stay updated with latest activity</p>
                    <Link href="/" className="badge" style={{ marginTop: '12px', cursor: 'pointer' }}>
                        ← Back to Home
                    </Link>
                </header>

                {/* Notifications Grid */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="section-label fade-in delay-2">Recent Alerts</p>
                    <button
                        type="button"
                        className="badge fade-in delay-2"
                        style={{ background: 'var(--tg-button-color)', color: 'var(--tg-button-text-color)', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                        onClick={handleAddNotification}
                    >
                        + Add Notification
                    </button>
                </div>
                {loading ? (
                    <div className="fade-in delay-2" style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--tg-hint-color)'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="cards-grid">
                            {notifications.map((notif, i) => (
                                <div
                                    key={notif.id}
                                    className={`card ${notif.accent} fade-in delay-${(i % 8) + 1}`}
                                    onClick={() => showToast(`Notification "${notif.title}" tapped`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && showToast(`Notification "${notif.title}" tapped`)}
                                >
                                    {notif.unread && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                width: '8px',
                                                height: '8px',
                                                background: '#ff4757',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 10px #ff4759'
                                            }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                        <div className="card-icon" style={{ marginBottom: 0 }}>{notif.icon}</div>
                                        <button
                                            className="badge"
                                            style={{ margin: 0, padding: '4px 8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            onClick={(e) => handleEditClick(e, notif)}
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                    <div className="card-title">{notif.title}</div>
                                    <div className="card-desc">{notif.desc}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--tg-hint-color)', marginTop: '8px', opacity: 0.7 }}>
                                        {notif.time}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Clear All Button */}
                        <button
                            type="button"
                            className="action-button fade-in delay-8"
                            style={{ background: 'rgba(255, 255, 255, 0.05)', boxShadow: 'none', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '24px' }}
                            onClick={handleClearAll}
                        >
                            🧹 Clear All
                        </button>
                    </>
                ) : (
                    <div className="fade-in delay-2" style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                        color: 'var(--tg-hint-color)'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                        <p>No new notifications</p>
                    </div>
                )}
            </main>

            {/* Toast */}
            <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-header">Add Notification</h2>

                        <div className="form-group">
                            <label className="form-label">Icon (Emoji)</label>
                            <input
                                className="form-input"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="e.g. 🎁"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter title"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                value={formData.desc}
                                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                placeholder="Enter description"
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="action-button secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-button" onClick={handleSaveNotification}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedNotif && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-header">Edit Notification</h2>

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                className="form-input"
                                value={selectedNotif.title}
                                onChange={(e) => setSelectedNotif({ ...selectedNotif, title: e.target.value })}
                                placeholder="Enter title"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                value={selectedNotif.desc}
                                onChange={(e) => setSelectedNotif({ ...selectedNotif, desc: e.target.value })}
                                placeholder="Enter description"
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="action-button secondary" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-button" onClick={handleEditSave}>
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
