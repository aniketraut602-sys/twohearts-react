import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar({ user, onSignOut }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <img
                        src={logo}
                        alt="TwoHearts Home"
                        style={{ height: '40px', width: 'auto' }}
                    />
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation menu"
                >
                    <span className="hamburger"></span>
                </button>

                {/* Navigation Links */}
                <ul className={`navbar-links ${isOpen ? 'active' : ''}`} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {user ? (
                        <>
                            <li><Link to="/browse" className="nav-link" onClick={() => setIsOpen(false)}>Browse</Link></li>
                            <li><Link to="/chat" className="nav-link" onClick={() => setIsOpen(false)}>Chats</Link></li>
                            <li><Link to="/connections" className="nav-link" onClick={() => setIsOpen(false)}>Connections</Link></li>
                            <li><Link to="/global-chat" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#D81B60', fontWeight: 'bold' }}>Global Chat</Link></li>
                            <li><Link to="/profile/edit" className="nav-link" onClick={() => setIsOpen(false)}>Profile</Link></li>
                            <li>
                                <button onClick={() => { onSignOut(); setIsOpen(false); }} className="btn btn-ghost btn-sm">
                                    Sign Out
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/auth" className="nav-link" onClick={() => setIsOpen(false)}>Sign In</Link></li>
                            <li><Link to="/auth" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>Get Started</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
