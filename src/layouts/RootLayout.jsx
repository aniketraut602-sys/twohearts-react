import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { loadCurrentUser, clearAuth } from '../lib/storage';
import Navbar from '../components/Navbar';
import CookieBanner from '../components/CookieBanner';

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
      <Navbar user={user} onSignOut={handleSignOut} />

      <main>
        <Outlet context={{ user, setUser }} />
      </main>

      <footer className="app-footer" style={{ backgroundColor: '#f5f5f5', padding: '4rem 0', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#D81B60' }}>TwoHearts</h3>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              A safe space for meaningful connections. We prioritize your privacy and safety above all else.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Home</Link></li>
              <li><Link to="/browse" style={{ textDecoration: 'none', color: '#333' }}>Browse</Link></li>
              <li><Link to="/help" style={{ textDecoration: 'none', color: '#333' }}>Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/privacy" style={{ textDecoration: 'none', color: '#333' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ textDecoration: 'none', color: '#333' }}>Terms of Service</Link></li>
              <li><Link to="/cookies" style={{ textDecoration: 'none', color: '#333' }}>Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          <p>&copy; {new Date().getFullYear()} TwoHearts. All rights reserved.</p>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
