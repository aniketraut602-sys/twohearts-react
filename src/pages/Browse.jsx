import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

export default function Browse() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user || !user.id) {
        // If user is not loaded yet, wait or show loading. 
        // But if user is null and not loading, then error.
        // useAuth provides 'loading' too.
        // But here we just check user.
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const token = getToken();

      try {
        const response = await fetch(`${API_URL}/users/browse`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }

        const data = await response.json();
        setProfiles(data);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfiles();
    } else {
      // If user is null, maybe we are still loading auth?
      // But Browse is protected, so user should be there.
      // If not, setError.
      // But wait, if AuthContext is loading, we shouldn't error yet.
      // But ProtectedRoute handles loading. So if we are here, user should be present.
      // Unless ProtectedRoute is not wrapping it?
      // App.jsx wraps it.
      // So user should be present.
    }
  }, [user]);

  if (loading) {
    return <div className="card">Loading profiles...</div>;
  }

  if (error) {
    return (
      <div role="alert" className="card" style={{ color: '#b00020' }}>
        Error: {error}
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="card">
        <h2>No Profiles Available</h2>
        <p>Check back later for new members!</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Browse Profiles</h2>
      <div className="profile-list">
        {profiles.map((profile) => (
          <div key={profile.id} className="profile-card">
            <h3>{profile.name || profile.email}</h3>
            <p>{profile.bio || 'No bio available'}</p>
            {profile.interests && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                <strong>Interests:</strong> {profile.interests}
              </p>
            )}
            {profile.seeking && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                <strong>Looking for:</strong> {profile.seeking}
              </p>
            )}
            <div className="actions">
              <Link to={`/profile/${profile.id}`} className="btn">
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}