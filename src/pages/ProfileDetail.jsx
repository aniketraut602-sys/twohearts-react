import { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { getToken } from '../lib/storage';

const API_URL = '/api';

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useOutletContext(); // The logged-in user

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'none' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = getToken();

      try {
        // Fetch profile
        const profileResponse = await fetch(`${API_URL}/users/profile/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch connection status
        const statusResponse = await fetch(`${API_URL}/connections/status/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!statusResponse.ok) throw new Error('Failed to fetch connection status');
        const statusData = await statusResponse.json();
        setConnectionStatus(statusData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleConnect = async () => {
    setActionLoading(true);
    const token = getToken();

    try {
      const response = await fetch(`${API_URL}/connections/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: parseInt(id) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send connection request');
      }

      const data = await response.json();
      alert('Connection request sent successfully!');

      // Refresh connection status
      const statusResponse = await fetch(`${API_URL}/connections/status/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statusData = await statusResponse.json();
      setConnectionStatus(statusData);
    } catch (err) {
      console.error('Error sending connection request:', err);
      alert(err.message || 'Failed to send connection request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading profile...</div>;
  }

  if (error) {
    return (
      <div role="alert" className="card" style={{ color: '#b00020' }}>
        Error: {error}
      </div>
    );
  }

  if (!profile) {
    return <div className="card">Profile not found</div>;
  }

  const displayName = profile.name || profile.email;
  const isOwnProfile = currentUser && currentUser.id === profile.id;

  return (
    <div className="card">
      <h2>{displayName}</h2>

      {profile.age && <p><strong>Age:</strong> {profile.age}</p>}
      {profile.location && <p><strong>Location:</strong> {profile.location}</p>}
      {profile.bio && (
        <div>
          <h3>About</h3>
          <p>{profile.bio}</p>
        </div>
      )}
      {profile.interests && (
        <div>
          <h3>Interests</h3>
          <p>{profile.interests}</p>
        </div>
      )}
      {profile.seeking && (
        <div>
          <h3>Looking For</h3>
          <p>{profile.seeking}</p>
        </div>
      )}

      <div className="actions">
        <Link to="/browse" className="btn btn-ghost">
          Back to Browse
        </Link>

        {isOwnProfile ? (
          <Link to="/profile/edit" className="btn">
            Edit Profile
          </Link>
        ) : (
          <>
            {connectionStatus?.status === 'none' && (
              <button
                onClick={handleConnect}
                className="btn"
                disabled={actionLoading}
              >
                {actionLoading ? 'Sending...' : `Connect with ${displayName}`}
              </button>
            )}
            {connectionStatus?.status === 'pending' && (
              <button className="btn" disabled>
                {connectionStatus.isRequester ? 'Request Sent' : 'Request Received'}
              </button>
            )}
            {connectionStatus?.status === 'accepted' && (
              <button className="btn" disabled>
                Connected ✓
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}