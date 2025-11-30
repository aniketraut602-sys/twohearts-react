import { getFromStorage } from '../lib/storage';

export function applyAccessibilityPreferences() {
  const preferences = getFromStorage('accessibility');
  if (preferences) {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (preferences.fontSize) {
      document.documentElement.style.fontSize = `${preferences.fontSize}px`;
    }
  }
}
