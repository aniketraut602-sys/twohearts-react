import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../lib/storage';

const API_URL = '/api';

export default function ChatList() {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChatRooms = async () => {
            setLoading(true);
            setError(null);
            const token = getToken();

            try {
                const response = await fetch(`${API_URL}/chat-rooms`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chat rooms');
                }

                const data = await response.json();
                setChatRooms(data);
            } catch (err) {
                console.error('Error fetching chat rooms:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    if (loading) {
        return <div className="card">Loading your conversations...</div>;
    }

    if (error) {
        return (
            <div role="alert" className="card" style={{ color: '#b00020' }}>
                Error: {error}
            </div>
        );
    }

    if (!chatRooms || chatRooms.length === 0) {
        return (
            <div className="card">
                <h2>No Conversations Yet</h2>
                <p>Connect with someone to start chatting!</p>
                <div className="actions">
                    <Link to="/browse" className="btn">
                        Browse Profiles
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Your Conversations</h2>
            <div className="chat-list">
                {chatRooms.map((room) => (
                    <Link
                        key={room.id}
                        to={`/chat/${room.id}`}
                        className="card chat-room-card"
                        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 8px 0' }}>
                                    {room.otherUser.name}
                                    {room.unreadCount > 0 && (
                                        <span
                                            className="unread-badge"
                                            style={{
                                                marginLeft: '8px',
                                                background: '#0056b3',
                                                color: 'white',
                                                borderRadius: '12px',
                                                padding: '2px 8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {room.unreadCount}
                                        </span>
                                    )}
                                </h3>
                                {room.lastMessage && (
                                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                        {room.lastMessage.content.length > 50
                                            ? room.lastMessage.content.substring(0, 50) + '...'
                                            : room.lastMessage.content}
                                    </p>
                                )}
                            </div>
                            {room.lastMessage && (
                                <div style={{ fontSize: '0.75rem', color: '#999', marginLeft: '16px' }}>
                                    {new Date(room.lastMessage.created_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
