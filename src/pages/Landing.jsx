import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Accordion from '../components/Accordion';
import AccessibilityMenu from '../components/AccessibilityMenu';

export default function Landing() {
  // Set page title for accessibility
  useEffect(() => {
    document.title = 'TwoHearts - Text-First Dating Platform';
  }, []);

  const faqItems = [
    {
      title: "Is TwoHearts really free?",
      content: "Yes! TwoHearts is currently in a prototype phase and completely free to use. We believe in accessible connections for everyone."
    },
    {
      title: "How does the 'Text-First' approach work?",
      content: "Unlike other apps, we prioritize conversation over swiping. You connect based on shared interests and values, and photos are only revealed when you both feel comfortable."
    },
    {
      title: "Is my data safe?",
      content: "Absolutely. We use end-to-end encryption for chats and have strict privacy policies. We also have automated contact detection to prevent harassment."
    },
    {
      title: "Can I block users?",
      content: "Yes, you have full control. You can block or report any user who makes you feel uncomfortable immediately."
    }
  ];

  return (
    <main id="main-content" tabIndex="-1" className="landing-page">
      <AccessibilityMenu />

      {/* Hero Section */}
      <section className="hero" aria-label="Hero Section" style={{
        textAlign: 'center',
        padding: '6rem 1rem',
        background: 'linear-gradient(135deg, #fce4ec 0%, #fff 100%)',
        borderRadius: '0 0 50% 50% / 4rem'
      }}>
        <div className="container">
          <h1 id="hero-heading" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#D81B60' }}>
            Connect Heart to Heart
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.25rem', color: '#555', maxWidth: '600px', margin: '0 auto 2rem' }}>
            A text-first dating platform where meaningful conversations come before photos.
          </p>

          <nav className="hero-actions" aria-label="Primary actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link
              to="/auth"
              className="btn btn-primary"
              aria-label="Get started with TwoHearts - Sign up or log in"
            >
              Get Started
            </Link>
            <Link
              to="/help"
              className="btn btn-ghost"
              aria-label="Learn about safety and help resources"
            >
              Learn More
            </Link>
          </nav>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" aria-label="Platform Statistics" style={{ padding: '2rem 1rem', backgroundColor: '#fce4ec', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D81B60', margin: 0 }}>
            🎉 Over 1,000 meaningful connections made!
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" aria-label="How It Works Section" style={{ padding: '4rem 1rem', backgroundColor: '#fff' }}>
        <div className="container">
          <h2 id="how-heading" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>How It Works</h2>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <article>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3>1. Create Profile</h3>
              <p>Share your interests and values, not just your best selfies.</p>
            </article>
            <article>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3>2. Start Chatting</h3>
              <p>Connect with matches through text. Get to know the real person.</p>
            </article>
            <article>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
              <h3>3. Reveal & Connect</h3>
              <p>Unlock photos and meet up when the connection feels right.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="safety" aria-label="Safety Section" style={{ padding: '4rem 1rem', backgroundColor: '#fce4ec' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 id="safety-heading" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Safety is Our Priority</h2>
            <p style={{ marginBottom: '1rem' }}>
              We use advanced technology to keep you safe. Our <strong>Contact Detection</strong> system warns you if someone shares personal info too early.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>Verified Profiles</li>
              <li style={{ marginBottom: '0.5rem' }}>End-to-End Encryption</li>
              <li style={{ marginBottom: '0.5rem' }}>24/7 Moderation</li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '300px', textAlign: 'center', fontSize: '8rem' }}>
            🛡️
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq" aria-label="FAQ Section" style={{ padding: '4rem 1rem', backgroundColor: '#fff' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 id="faq-heading" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>Frequently Asked Questions</h2>
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" aria-label="Call to Action Section" style={{ padding: '6rem 1rem', textAlign: 'center', backgroundColor: '#212121', color: 'white' }}>
        <div className="container">
          <h2 id="cta-heading" style={{ marginBottom: '2rem', color: 'white' }}>Ready to find your connection?</h2>
          <Link
            to="/auth"
            className="btn btn-primary"
            style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
            aria-label="Join TwoHearts now - Create your account"
          >
            Join Now
          </Link>
        </div>
      </section>
    </main>
  );
}
