// service-worker.js

const CACHE_NAME = 'ryuuseika-pwa-cache-v1'; // Nama cache untuk versi
const ASSET_URLS = [ // Daftar URL aset untuk di-cache saat instalasi (aset statis)
  'https://www.ryuuseika.top/index.html', // Cache homepage
  'https://hikinarou.com/ryuuseika-pwa/manifest.json', // Cache file manifest
  '/ryuuseika-pwa/icons/icon-192x192.png',
  '/ryuuseika-pwa/icons/icon-512x512.png',
  '/ryuuseika-pwa/theme-4536747516074318835 (2).xml', // Cache file tema Anda (jika statis)
  'https://hikinarou.com/path/to/your/style.css', // Cache file CSS utama Anda (ganti dengan URL CSS Anda yang sebenarnya)
  'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js', // Contoh sumber daya eksternal untuk di-cache
  'https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.7.0/flowbite.min.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' // Contoh font untuk di-cache
  // Tambahkan URL aset statis lain yang ingin Anda cache (JS, CSS, gambar, font)
];

// Install event: Cache aset statis PWA (dari GitHub)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker (GitHub): Caching PWA assets');
        return cache.addAll(ASSET_URLS); // Cache hanya aset PWA yang dihosting di GitHub
      })
      .catch(err => console.error('Cache addAll failed (GitHub assets):', err))
  );
  self.skipWaiting();
});

// Activate event: Bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
    .catch(err => console.error('Cache cleanup failed (GitHub):', err))
  );
  self.clients.claim();
});

// Fetch event: Tangani permintaan jaringan (TERBATAS PADA CAKUPAN GITHUB)
self.addEventListener('fetch', event => {
  // Batasan Penting: Service worker HANYA dapat mengontrol permintaan DALAM CAKUPANNYA (domain GitHub)
  // Tidak dapat langsung meng-cache atau mengontrol aset dari domain Blogger (ryuuseika.top)!

  const requestUrl = new URL(event.request.url);

  // Hanya tangani permintaan yang berasal dari domain GitHub PWA (cakupan service worker)
  if (requestUrl.origin !== location.origin) {
    return fetch(event.request); // Lewati permintaan lintas domain (Blogger) - biarkan browser menanganinya
  }

  event.respondWith(
    caches.match(event.request) // Cek cache HANYA UNTUK ASET PWA DI GITHUB
      .then(cachedResponse => {
        if (cachedResponse) {
          // Cache hit (untuk aset PWA di GitHub) - kembalikan dari cache
          return cachedResponse;
        }

        // Cache miss (atau permintaan lintas domain) - fetch dari jaringan (GitHub atau domain lain)
        return fetch(event.request).then(networkResponse => {
          // Periksa apakah respons jaringan valid (untuk aset PWA di GitHub)
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse; // Jangan cache jika tidak valid atau lintas domain
          }

          // Clone respons dan masukkan ke cache (HANYA CACHE ASET PWA DI GITHUB)
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache); // Cache hanya aset PWA dari domain GitHub
            })
            .catch(err => console.warn('Cache put failed (GitHub assets):', err));

          return networkResponse; // Kembalikan respons jaringan
        });
      }).catch(err => console.error('Fetch handler failed (GitHub):', err))
  );
});

// Push Notification (Tetap sama seperti sebelumnya - perlu backend server untuk pemicu push yang andal)
self.addEventListener('push', event => {
  let title = 'Ryuuseika PWA';
  let body = 'Dapatkan update terbaru dan konten menarik lainnya!';
  let icon = 'https://hikinarou.com/ryuuseika-pwa/icons/icon-192.png';
  let badge = 'https://hikinarou.com/ryuuseika-pwa/icons/badge-96x96.png';

  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    body = data.body || body;
    icon = data.icon || icon;
    badge = data.badge || badge;
  }

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    vibrate: [100, 50, 100],
    data: { primaryKey: 1 },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click (Tetap sama seperti sebelumnya)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) {
        const client = windowClients[0];
        if ('focus' in client) {
          return client.focus();
        }
      } else {
        return clients.openWindow('/');
      }
    })
  );
});
