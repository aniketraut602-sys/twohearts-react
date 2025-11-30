import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getToken } from '../lib/storage';

const API_URL = '/api';

export default function Browse() {
  const { user } = useOutletContext();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user || !user.id) {
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

    fetchProfiles();
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