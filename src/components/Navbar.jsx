import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onSignOut }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar" aria-label="Main navigation">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    TwoHearts
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
                <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/browse" className="nav-link" onClick={() => setIsOpen(false)}>Browse</Link>
                            <Link to="/chat" className="nav-link" onClick={() => setIsOpen(false)}>Chats</Link>
                            <Link to="/connections" className="nav-link" onClick={() => setIsOpen(false)}>Connections</Link>
                            <Link to="/profile/edit" className="nav-link" onClick={() => setIsOpen(false)}>Profile</Link>
                            <button onClick={() => { onSignOut(); setIsOpen(false); }} className="btn btn-ghost btn-sm">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" className="nav-link" onClick={() => setIsOpen(false)}>Sign In</Link>
                            <Link to="/auth" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
