import { useState, useEffect } from 'react';

export default function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);

    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    useEffect(() => {
        if (largeText) {
            document.documentElement.style.fontSize = '125%'; // 20px base
        } else {
            document.documentElement.style.fontSize = '100%'; // 16px base
        }
    }, [largeText]);

    return (
        <div className="accessibility-menu">
            <button
                className="btn btn-primary a11y-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Accessibility Options"
                aria-expanded={isOpen}
            >
                <span aria-hidden="true">♿</span>
            </button>

            {isOpen && (
                <div className="a11y-panel" role="dialog" aria-label="Accessibility Controls">
                    <button
                        className={`btn btn-ghost ${highContrast ? 'active' : ''}`}
                        onClick={() => setHighContrast(!highContrast)}
                        aria-pressed={highContrast}
                    >
                        High Contrast
                    </button>
                    <button
                        className={`btn btn-ghost ${largeText ? 'active' : ''}`}
                        onClick={() => setLargeText(!largeText)}
                        aria-pressed={largeText}
                    >
                        Large Text
                    </button>
                </div>
            )}
        </div>
    );
}
