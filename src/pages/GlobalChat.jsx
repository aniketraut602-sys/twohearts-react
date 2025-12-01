import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { playMessageSound } from '../utils/sound';
import Navbar from '../components/Navbar';

const GlobalChat = () => {
    const { user, token } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user && !isLoading) {
            navigate('/auth');
        }
    }, [user, isLoading, navigate]);

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!token) return;
            try {
                const response = await fetch('/api/global-chat', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Error fetching global messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchMessages();
        } else {
            setIsLoading(false);
        }
    }, [token, user]);

    // Socket listener for new messages
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = (message) => {
            // Check if message already exists (to avoid duplicates from optimistic update)
            setMessages((prev) => {
                if (prev.some(m => m.id === message.id || (m.tempId && m.tempId === message.tempId))) {
                    return prev.map(m => m.tempId === message.tempId ? message : m);
                }
                return [...prev, message];
            });

            // Play sound if message is from someone else
            if (message.user.id !== user.id) {
                playMessageSound();
            }
        };

        socket.on('globalMessage', handleNewMessage);

        return () => {
            socket.off('globalMessage', handleNewMessage);
        };
    }, [socket, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const content = newMessage;
        const tempId = Date.now();
        const optimisticMessage = {
            id: tempId,
            tempId: tempId,
            content: content,
            user: user,
            created_at: new Date().toISOString(),
            isOptimistic: true
        };

        setNewMessage(''); // Clear input
        setMessages(prev => [...prev, optimisticMessage]); // Optimistic add

        try {
            const response = await fetch('/api/global-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, tempId }) // Send tempId to server if supported, or just rely on content match
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // If server doesn't support tempId echo back, we might get a duplicate. 
            // But usually socket comes back fast. 
            // If the socket event comes back with the real ID, we replace the optimistic one.
            // For now, we rely on the socket event handler to replace/deduplicate if possible.
            // If the server doesn't return the tempId, we might have a duplicate for a moment until we refresh or if we can match by content/timestamp.
            // Simplified: We'll just let the socket add the real one and we might need to filter duplicates if we care deeply.
            // But to fix "don't know where it is going", showing it immediately is key.

        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message and restore input
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(content);
            alert('Failed to send message. Please try again.');
        }
    };

    if (!user) return null; // Or loading spinner

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto p-4 max-w-4xl flex flex-col h-[calc(100vh-80px)]">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1 border border-gray-100">

                    {/* Header */}
                    <div className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                                Global Community
                            </h1>
                            <p className="text-xs text-gray-500">Connect with everyone on TwoHearts</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-green-600">Live</span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
                        ref={chatContainerRef}
                        role="log"
                        aria-live="polite"
                        aria-label="Global chat messages"
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10">
                                <p>No messages yet. Be the first to say hello! 👋</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.user.id === user.id;
                                const showAvatar = index === 0 || messages[index - 1].user.id !== msg.user.id;

                                return (
                                    <div
                                        key={msg.id || msg.tempId}
                                        className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group ${msg.isOptimistic ? 'opacity-70' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm
                      ${isMe ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-600 border border-gray-200'}
                      ${!showAvatar ? 'opacity-0' : 'opacity-100'}
                    `}>
                                            {msg.user.name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`max-w-[70%] space-y-1`}>
                                            {showAvatar && !isMe && (
                                                <span className="text-xs text-gray-500 ml-1 block">{msg.user.name}</span>
                                            )}
                                            <div className={`
                        px-4 py-2 rounded-2xl shadow-sm text-sm break-words relative
                        ${isMe
                                                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                      `}>
                                                {msg.content}
                                            </div>
                                            <span className={`text-[10px] text-gray-400 block ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.isOptimistic && ' (Sending...)'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t">
                        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all outline-none text-sm"
                                aria-label="Type a message"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-md transition-all transform active:scale-95 flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default GlobalChat;
