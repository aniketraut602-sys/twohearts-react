import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { loadCurrentUser, clearAuth } from '../lib/storage';

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = loadCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSignOut = () => {
    clearAuth();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="logo">TwoHearts</Link>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/browse" className="btn btn-ghost">Browse</Link>
              <Link to="/chat" className="btn btn-ghost">Chats</Link>
              <Link to="/connections" className="btn btn-ghost">Connections</Link>
              <Link to="/profile/edit" className="btn btn-ghost">Edit Profile</Link>
              <button onClick={handleSignOut} className="btn">Sign Out</button>
            </>
          ) : (
            <Link to="/auth" className="btn">Sign In</Link>
          )}
          <Link to="/help" className="btn btn-ghost">Help</Link>
        </nav>
      </header>
      <main>
        <Outlet context={{ user, setUser }} />
      </main>
      <footer style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '0.9rem' }}>
        <p>TwoHearts - A safe space for meaningful connections.</p>
        <p style={{ fontSize: '0.8rem' }}>Prototype. Do not share real personal data.</p>
      </footer>
    </div>
  );
}
