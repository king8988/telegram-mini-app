import { NextResponse } from 'next/server';

export async function GET() {
    // Artificial delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const notifications = [
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
    ];

    return NextResponse.json(notifications);
}
