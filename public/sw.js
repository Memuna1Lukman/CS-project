// Registered only so the app meets install criteria on browsers that still
// require an active service worker (installability, not offline mode — see
// docs/CS-Resource-Hub-Design-v1.1.md §2 non-goals: "no offline mode").
// No caching: every request passes through to the network untouched, so
// authenticated pages/API responses are never served stale.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Intentional no-op: not calling respondWith() lets the browser handle
  // the request normally.
});
