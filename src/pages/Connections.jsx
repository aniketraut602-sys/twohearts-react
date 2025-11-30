import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../lib/storage';

const API_URL = '/api';

export default function Connections() {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'connections'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingRequests = async () => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/connections/pending`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch pending requests');
            const data = await response.json();
            setPendingRequests(data);
        } catch (err) {
            console.error('Error fetching pending requests:', err);
            setError(err.message);
        }
    };

    const fetchConnections = async () => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/connections/list`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch connections');
            const data = await response.json();
            setConnections(data);
        } catch (err) {
            console.error('Error fetching connections:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchPendingRequests(), fetchConnections()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleAccept = async (connectionId) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/connections/accept/${connectionId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to accept connection');
            const data = await response.json();

            // Refresh lists
            await Promise.all([fetchPendingRequests(), fetchConnections()]);

            // Show success message
            alert(`Connection accepted! You can now chat.`);
        } catch (err) {
            console.error('Error accepting connection:', err);
            alert('Failed to accept connection');
        }
    };

    const handleReject = async (connectionId) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/connections/reject/${connectionId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to reject connection');

            // Refresh list
            await fetchPendingRequests();

            alert('Connection rejected');
        } catch (err) {
            console.error('Error rejecting connection:', err);
            alert('Failed to reject connection');
        }
    };

    if (loading) {
        return <div className="card">Loading connections...</div>;
    }

    if (error) {
        return (
            <div role="alert" className="card" style={{ color: '#b00020' }}>
                Error: {error}
            </div>
        );
    }

    return (
        <div>
            <h2>Connections</h2>

            <div className="tabs" style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
                <button
                    onClick={() => setActiveTab('received')}
                    className={activeTab === 'received' ? 'tab-active' : 'tab'}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: activeTab === 'received' ? '#0056b3' : 'transparent',
                        color: activeTab === 'received' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'received' ? 'bold' : 'normal'
                    }}
                >
                    Pending Requests ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('connections')}
                    className={activeTab === 'connections' ? 'tab-active' : 'tab'}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: activeTab === 'connections' ? '#0056b3' : 'transparent',
                        color: activeTab === 'connections' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'connections' ? 'bold' : 'normal'
                    }}
                >
                    My Connections ({connections.length})
                </button>
            </div>

            {activeTab === 'received' && (
                <div>
                    {pendingRequests.length === 0 ? (
                        <div className="card">
                            <p>No pending connection requests</p>
                        </div>
                    ) : (
                        pendingRequests.map((request) => (
                            <div key={request.id} className="card" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 8px 0' }}>{request.requester.name}</h3>
                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                            {request.requester.bio || 'No bio available'}
                                        </p>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#999' }}>
                                            Requested {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="actions" style={{ marginTop: 0 }}>
                                        <Link to={`/profile/${request.requester.id}`} className="btn btn-ghost">
                                            View Profile
                                        </Link>
                                        <button onClick={() => handleAccept(request.id)} className="btn">
                                            Accept
                                        </button>
                                        <button onClick={() => handleReject(request.id)} className="btn btn-ghost">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'connections' && (
                <div>
                    {connections.length === 0 ? (
                        <div className="card">
                            <p>No connections yet. Browse profiles to connect with someone!</p>
                            <div className="actions">
                                <Link to="/browse" className="btn">
                                    Browse Profiles
                                </Link>
                            </div>
                        </div>
                    ) : (
                        connections.map((connection) => (
                            <div key={connection.id} className="card" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 8px 0' }}>{connection.user.name}</h3>
                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                            {connection.user.bio || 'No bio available'}
                                        </p>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#999' }}>
                                            Connected {new Date(connection.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="actions" style={{ marginTop: 0 }}>
                                        <Link to={`/profile/${connection.user.id}`} className="btn btn-ghost">
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
