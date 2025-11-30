import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
      console.log('ServiceWorker registered');
    }).catch((e) => console.warn('SW registration failed', e));
  });
}

// Analytics bootstrap
import('./utils/analytics').then(({ trackEvent }) => {
  try {
    trackEvent('app_loaded');
  } catch (e) {
    console.error('Failed to track event:', e);
  }
});

import('./utils/accessibility').then(({ applyAccessibilityPreferences }) => {
  applyAccessibilityPreferences();
});
