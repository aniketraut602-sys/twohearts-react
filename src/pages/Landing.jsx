import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function Landing() {
  // Set page title for accessibility
  useEffect(() => {
    document.title = 'TwoHearts - Text-First Dating Platform';
  }, []);

  return (
    <main id="main-content" tabIndex="-1" className="landing-page" role="main">
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-link" style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '1em',
        backgroundColor: '#0056b3',
        color: 'white',
        textDecoration: 'none'
      }}
        onFocus={(e) => e.target.style.left = '0'}
        onBlur={(e) => e.target.style.left = '-9999px'}>
        Skip to main content
      </a>

      <section className="hero" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="hero-title">
          Welcome to TwoHearts
        </h1>
        <p className="hero-subtitle" role="doc-subtitle">
          A text-first dating platform focused on meaningful connections
        </p>

        <nav className="hero-actions" aria-label="Primary actions">
          <Link
            to="/auth"
            className="btn btn-primary"
            aria-label="Get started with TwoHearts - Sign up or log in"
          >
            Get Started
          </Link>
          <Link
            to="/chat"
            className="btn btn-ghost"
            aria-label="View your chat conversations (login required)"
          >
            View Chats
          </Link>
          <Link
            to="/help"
            className="btn btn-ghost"
            aria-label="Learn about safety and help resources"
          >
            Learn More
          </Link>
        </nav>
      </section>

      <section className="features" aria-labelledby="features-heading">
        <h2 id="features-heading" className="section-title">
          Why TwoHearts?
        </h2>
        <div className="feature-grid" role="list">
          <article className="feature-card" role="listitem">
            <h3>💬 Text-First Approach</h3>
            <p>Focus on meaningful conversations without the pressure of photos</p>
          </article>
          <article className="feature-card" role="listitem">
            <h3>🔒 Safe & Secure</h3>
            <p>Your privacy and safety are our top priorities</p>
          </article>
          <article className="feature-card" role="listitem">
            <h3>⚡ Real-Time Chat</h3>
            <p>Instant messaging with typing indicators and read receipts</p>
          </article>
        </div>
      </section>

      <section className="cta" aria-labelledby="cta-heading">
        <h2 id="cta-heading">Ready to find your connection?</h2>
        <Link
          to="/auth"
          className="btn btn-primary btn-large"
          aria-label="Join TwoHearts now - Create your account"
        >
          Join Now
        </Link>
      </section>
    </main>
  );
}
