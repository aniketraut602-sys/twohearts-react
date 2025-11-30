import { useState, useEffect, useRef } from 'react';

export default function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const firstOptionRef = useRef(null);

    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    useEffect(() => {
        if (largeText) {
            document.documentElement.style.fontSize = '125%';
        } else {
            document.documentElement.style.fontSize = '100%';
        }
    }, [largeText]);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            // Move focus to first option when opened
            setTimeout(() => firstOptionRef.current?.focus(), 50);
        } else {
            // Return focus to toggle button when closed
            // Only if the menu was previously open (to avoid focusing on mount)
            if (document.activeElement && menuRef.current && menuRef.current.contains(document.activeElement)) {
                buttonRef.current?.focus();
            }
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div className="accessibility-menu" ref={menuRef}>
            <button
                ref={buttonRef}
                className="btn btn-primary a11y-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Accessibility Options"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span aria-hidden="true">♿</span>
            </button>

            {isOpen && (
                <div className="a11y-panel" role="menu" aria-label="Accessibility Controls">
                    <button
                        ref={firstOptionRef}
                        className={`btn btn-ghost ${highContrast ? 'active' : ''}`}
                        onClick={() => setHighContrast(!highContrast)}
                        aria-pressed={highContrast}
                        role="menuitemcheckbox"
                    >
                        High Contrast
                    </button>
                    <button
                        className={`btn btn-ghost ${largeText ? 'active' : ''}`}
                        onClick={() => setLargeText(!largeText)}
                        aria-pressed={largeText}
                        role="menuitemcheckbox"
                    >
                        Large Text
                    </button>
                </div>
            )}
        </div>
    );
}
