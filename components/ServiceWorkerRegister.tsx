'use client';

import { useEffect } from 'react';

// Registers the no-op service worker so the app is installable (see
// public/sw.js — no caching/offline mode, that's an explicit non-goal).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  return null;
}
