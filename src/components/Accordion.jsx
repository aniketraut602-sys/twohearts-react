import { useState } from 'react';

export default function Accordion({ items }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleItem = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="accordion">
            {items.map((item, index) => (
                <div key={index} className="accordion-item">
                    <h3>
                        <button
                            type="button"
                            className="accordion-header"
                            onClick={() => toggleItem(index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleItem(index);
                                }
                            }}
                            aria-expanded={activeIndex === index}
                            aria-controls={`accordion-content-${index}`}
                            id={`accordion-header-${index}`}
                        >
                            <span className="accordion-title">{item.title}</span>
                            <span className="accordion-icon" aria-hidden="true">
                                {activeIndex === index ? '−' : '+'}
                            </span>
                        </button>
                    </h3>
                    <div
                        id={`accordion-content-${index}`}
                        role="region"
                        aria-labelledby={`accordion-header-${index}`}
                        className={`accordion-content ${activeIndex === index ? 'active' : ''}`}
                        hidden={activeIndex !== index}
                    >
                        <div className="accordion-body">
                            {item.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
