// service-worker.js

const CACHE_NAME = 'ryuuseika-pwa-cache-v1'; // Nama cache untuk versi
const ASSET_URLS = [ // Daftar URL aset untuk di-cache saat instalasi (aset statis)
  'https://www.ryuuseika.top/index.html', // Cache homepage
  'https://hikinarou.com/ryuuseika-pwa/manifest.json', // Cache file manifest
  'https://hikinarou.com/ryuuseika-pwa/icons/icon-192x192.png',
  'https://hikinarou.com/ryuuseika-pwa/icons/icon-512x512.png',
  '/theme-4536747516074318835 (2).xml', // Cache file tema Anda (jika statis)
  'https://hikinarou.com/path/to/your/style.css', // Cache file CSS utama Anda (ganti dengan URL CSS Anda yang sebenarnya)
  'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js', // Contoh sumber daya eksternal untuk di-cache
  'https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.7.0/flowbite.min.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' // Contoh font untuk di-cache
  // Tambahkan URL aset statis lain yang ingin Anda cache (JS, CSS, gambar, font)
];

// Event 'install': Cache aset statis
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(ASSET_URLS); // Tambahkan semua URL ke cache
      })
      .catch(err => console.error('Cache addAll failed:', err)) // Tambahkan penanganan kesalahan untuk addAll
  );
  self.skipWaiting(); // Lewati fase menunggu untuk aktivasi yang lebih cepat
});

// Event 'activate': Bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME) // Filter cache saat ini
          .map(cacheName => caches.delete(cacheName)) // Hapus cache lama
      );
    })
    .catch(err => console.error('Cache cleanup failed:', err)) // Tambahkan penanganan kesalahan untuk pembersihan cache
  );
  self.clients.claim(); // Kontrol halaman segera dengan SW yang diaktifkan
});

// Event 'fetch': Tangani permintaan jaringan dan caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // Coba temukan permintaan di cache
      .then(cachedResponse => {
        if (cachedResponse) {
          // Cache hit - kembalikan respons dari cache
          return cachedResponse;
        }

        // Cache miss - fetch dari jaringan
        return fetch(event.request).then(networkResponse => {
          // Periksa apakah kita menerima respons yang valid
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse; // Jangan cache jika tidak valid
          }

          // Clone respons karena ini adalah stream dan hanya dapat dikonsumsi sekali
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache); // Masukkan respons ke dalam cache
            })
            .catch(err => console.warn('Cache put failed:', err)); // Tambahkan penanganan kesalahan untuk cache.put

          return networkResponse; // Kembalikan respons jaringan
        });
      }).catch(err => console.error('Fetch handler failed:', err)) // Tambahkan penanganan kesalahan untuk keseluruhan fetch event
  );
});

// Push Notification
self.addEventListener('push', event => {
  let title = 'Ryuuseika PWA'; // Judul default jika data tidak mengandung judul
  let body = 'Dapatkan update terbaru dan konten menarik lainnya!'; // Isi default jika data tidak mengandung body
  let icon = 'https://hikinarou.com/ryuuseika-pwa/icons/icon-192.png'; // Ikon default
  let badge = 'https://hikinarou.com/ryuuseika-pwa/icons/badge-96x96.png'; // Badge default

  if (event.data) {
    const data = event.data.json();
    title = data.title || title; // Gunakan judul dari data jika ada
    body = data.body || body;     // Gunakan body dari data jika ada
    icon = data.icon || icon;     // Gunakan ikon dari data jika ada
    badge = data.badge || badge;   // Gunakan badge dari data jika ada
  }

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    vibrate: [100, 50, 100], // Contoh pola getaran
    data: { primaryKey: 1 }, // Data kustom yang bisa digunakan saat notifikasi diklik
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click
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
        return clients.openWindow('/'); // Buka PWA di root jika tidak ada jendela yang terbuka
      }
    })
  );
});
