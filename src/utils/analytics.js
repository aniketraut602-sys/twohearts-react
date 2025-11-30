/**
 * Simple privacy-first analytics stub.
 * Replace with Google Analytics or other provider as needed.
 * This file exposes `trackEvent` and `identifyUser`.
 */
const ANALYTICS_ENABLED = true;

function sendToServer(payload) {
  if (!ANALYTICS_ENABLED) return;

  const trySend = (retryCount = 0) => {
    const data = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      try {
        navigator.sendBeacon('/api/events', data);
        return;
      } catch (e) {
        // Fallback to fetch if sendBeacon fails
      }
    }

    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
      keepalive: true,
    }).catch(() => {
      if (retryCount < 3) {
        setTimeout(() => trySend(retryCount + 1), 1000 * Math.pow(2, retryCount));
      }
    });
  };

  trySend();
}

export function identifyUser(userId) {
  sendToServer({ type: 'identify', userId, ts: Date.now() });
}

export function trackEvent(name, properties = {}) {
  sendToServer({ type: 'event', name, properties, ts: Date.now() });
}
