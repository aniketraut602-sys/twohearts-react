import { useEffect, useState } from 'react';

const STORAGE_KEY = 'twohearts_accessibility_prefs';

const defaultPrefs = {
  textSize: 'normal', // small | normal | large
  reducedMotion: false,
  highContrast: false
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultPrefs;
  } catch (e) {
    return defaultPrefs;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save accessibility preferences:', e);
  }
}

export default function AccessibilityPreferences() {
  const [prefs, setPrefs] = useState(loadPrefs());

  useEffect(() => {
    // apply preferences to document
    document.documentElement.style.setProperty('--text-scale', prefs.textSize === 'large' ? '1.25' : prefs.textSize === 'small' ? '0.9' : '1');
    if (prefs.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    if (prefs.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    savePrefs(prefs);
  }, [prefs]);

  return (
    <div aria-label="Accessibility preferences" role="region" className="accessibility-prefs" style={{padding: '1rem', border: '1px solid #eee', borderRadius: 8}}>
      <h3>Accessibility preferences</h3>
      <label>
        Text size:
        <select value={prefs.textSize} onChange={(e) => setPrefs({...prefs, textSize: e.target.value})}>
          <option value="small">Small</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </label>
      <div>
        <label>
          <input type="checkbox" checked={prefs.reducedMotion} onChange={(e) => setPrefs({...prefs, reducedMotion: e.target.checked})} />
          Reduced motion
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setPrefs({...prefs, highContrast: e.target.checked})} />
          High contrast mode
        </label>
      </div>
    </div>
  );
}
