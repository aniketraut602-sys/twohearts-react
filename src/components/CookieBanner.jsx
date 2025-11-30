import { useState, useEffect } from 'react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner" role="dialog" aria-modal="false" aria-label="Cookie Consent">
            <div className="container cookie-content">
                <p>
                    We use cookies to improve your experience and ensure the safety of our platform.
                    By continuing, you agree to our use of cookies.
                </p>
                <div className="cookie-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleDecline} className="btn btn-ghost btn-sm">
                        Decline
                    </button>
                    <button onClick={handleAccept} className="btn btn-primary btn-sm">
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
