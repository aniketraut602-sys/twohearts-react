import { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getToken } from '../lib/storage';
import axios from 'axios';

const API_URL = '/api'; // Consolidated API server

// A simple component for displaying message status
const MessageStatus = ({ message, currentUserId }) => {
  if (message.user_id !== currentUserId) return null;

  const wasRead = message.read_receipts && message.read_receipts.length > 0;
  // In a group chat, you'd check for all participants.

  return (
    <span className={`text-xs ${wasRead ? 'text-blue-500' : 'text-gray-400'}`}>
      {wasRead ? 'Read' : 'Sent'}
    </span>
  );
};


const Chat = () => {
  const { chatId } = useParams();
  const { user: currentUser } = useOutletContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [isOpponentOnline, setIsOpponentOnline] = useState(false);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = getToken();

  // Redirect if not authenticated
  useEffect(() => {
    // If no token, definitely redirect
    if (!getToken()) {
      navigate('/auth');
    }
  }, [navigate]);

  // Fetch messages
  useEffect(() => {
    if (!token || !chatId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat-rooms/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatId, token]);

  // Socket.IO connection and listeners
  useEffect(() => {
    if (!currentUser?.id || !token || !chatId) return;

    // Connect to Socket.IO server (now on same port as API)
    const socket = io('http://localhost:3000', {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      socket.emit('joinChat', chatId);
    });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => {
        // Deduplicate based on ID or tempId if we had one
        if (prevMessages.some(m => m.id === message.id || (m.tempId && m.tempId === message.tempId))) {
          return prevMessages.map(m => m.tempId === message.tempId ? message : m);
        }
        return [...prevMessages, message];
      });
    });

    socket.on('messageDeleted', ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map(msg => msg.id === messageId ? { ...msg, content: 'This message was deleted.', isDeleted: true } : msg)
      );
    });

    // --- Feature Listeners ---
    socketRef.current.on('userTyping', ({ user }) => {
      if (user.id !== currentUser.id) {
        setTypingUser(user);
      }
    });
    socketRef.current.on('userStoppedTyping', () => setTypingUser(null));
    socketRef.current.on('userOnline', () => {
      // In a real app, you'd check if this userId is the person you're chatting with
      setIsOpponentOnline(true);
    });
    socketRef.current.on('userOffline', () => setIsOpponentOnline(false));
    socketRef.current.on('messageReadReceipt', ({ messageId, userId }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newReceipts = msg.read_receipts ? [...msg.read_receipts, { user_id: userId }] : [{ user_id: userId }];
          return { ...msg, read_receipts: newReceipts };
        }
        return msg;
      }));
    });


    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId, token, currentUser?.id]);

  // --- Read Receipt Logic with Intersection Observer ---
  useEffect(() => {
    if (!socketRef.current || !currentUser?.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const message = messages.find(m => m.id === parseInt(messageId));

            if (message && message.user_id !== currentUser.id &&
              (!message.read_receipts || !message.read_receipts.some(r => r.user_id === currentUser.id))) {
              socketRef.current.emit('messageRead', {
                messageId: message.id,
                chatId,
                readerId: currentUser.id
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all message elements
    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, chatId, currentUser?.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Validate chatId exists
  if (!chatId) {
    return (
      <div className="card">
        <h2>Error</h2>
        <p>No chat ID provided.</p>
      </div>
    );
  }

  // --- Typing Indicator Logic ---
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      socketRef.current.emit('typing', { chatRoomId: chatId, user: currentUser });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stopTyping', { chatRoomId: chatId });
      typingTimeoutRef.current = null;
    }, 2000); // 2 seconds of inactivity
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !socketRef.current || !currentUser) return;

    // Stop typing indicator immediately on send
    clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('stopTyping', { chatRoomId: chatId });
    typingTimeoutRef.current = null;

    const content = newMessage;
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      tempId: tempId,
      content: content,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    setNewMessage('');
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await axios.post(
        `${API_URL}/chat-rooms/${chatId}/messages`,
        { content: newMessage, tempId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Success - let socket handle the rest (replacing tempId)
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
      alert('Failed to send message.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl">Chat Room</h2>
        <p className={`text-sm ${isOpponentOnline ? 'text-green-500' : 'text-gray-500'}`}>
          {isOpponentOnline ? 'Online' : 'Offline'}
        </p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id || msg.tempId}
            data-message-id={msg.id}
            className={`p-2 my-2 rounded max-w-lg ${msg.user_id === currentUser?.id ? 'bg-blue-200 ml-auto' : 'bg-gray-200'} ${msg.isOptimistic ? 'opacity-70' : ''}`}
          >
            <p className={msg.isDeleted ? 'text-gray-500 italic' : ''}>{msg.content}</p>
            <div className="flex justify-end items-center">
              <span className="text-xs text-gray-500 mr-2">{new Date(msg.created_at).toLocaleTimeString()}</span>
              {msg.isOptimistic ? <span className="text-xs text-gray-400">Sending...</span> : <MessageStatus message={msg} currentUserId={currentUser?.id} />}
            </div>
          </div>
        ))}
        {typingUser && <div className="text-gray-500 italic">{typingUser.email} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          className="w-full p-2 border rounded"
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
};

export default Chat;