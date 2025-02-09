const CACHE_NAME = "pwa-blog-v1";
const ASSETS = [
  "https://www.ryuuseika.top/index.html",
  "https://hikinarou.com/ryuuseika-pwa/icons/icon-192.png",
  "https://hikinarou.com/ryuuseika-pwa/icons/icon-512.png"
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// Push Notification
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notifikasi Baru";
  const options = {
    body: data.body || "Isi notifikasi...",
    icon: "/icons/icon-192.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      } else {
        return clients.openWindow('/');
      }
    })
  );
});
