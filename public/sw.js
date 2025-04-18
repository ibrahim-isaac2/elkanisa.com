// Service Worker Version: 1.0.7
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
importScripts('/offline-cache.js');

// حدث التثبيت لتخزين ملفات الصوت والفيديو
self.addEventListener('install', (event) => {
  event.waitUntil(
    cacheAllMedia(
      'https://pub-d84ec872e0d940018b402da80d54a407.r2.dev', // رابط الصوتيات
      'https://pub-daf4aa025298493f8f6634fe32b8754b.r2.dev'  // رابط الفيديوهات
    ).then(() => self.skipWaiting()) // اجبار التفعيل بعد التثبيت
  );
});

// حدث التفعيل لتنظيف الكاش القديم وتحديث الملفات
self.addEventListener('activate', (event) => {
  const expectedCaches = ['media-files', 'json-files', 'audio-files', 'video-files', 'site-content'];

  event.waitUntil(
    Promise.all([
      // تنظيف الكاش القديم
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!expectedCaches.includes(cacheName)) {
              console.log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // تحديث ملفات الوسائط
      updateMediaCache(
        'https://pub-d84ec872e0d940018b402da80d54a407.r2.dev',
        'https://pub-daf4aa025298493f8f6634fe32b8754b.r2.dev'
      )
    ]).then(() => self.clients.claim()) // السيطرة على العملاء فورًا
  );
});

// معالجة الرسائل من العميل
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  } else if (event.data && event.data.action === 'updateCache') {
    updateMediaCache(
      'https://pub-d84ec872e0d940018b402da80d54a407.r2.dev',
      'https://pub-daf4aa025298493f8f6634fe32b8754b.r2.dev'
    );
  }
});

// تخزين الملفات الرئيسية أثناء التثبيت
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/_next/static/chunks/main.js', revision: '1' },
  { url: '/_next/static/chunks/webpack.js', revision: '1' },
  { url: '/_next/static/css/main.css', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/icon-192x192.png', revision: '1' },
  { url: '/icon-512x512.png', revision: '1' },
  { url: '/offline.html', revision: '1' },
  { url: '/end.png', revision: '1' },
]);

// كاش لملفات JSON من raw.githubusercontent.com
workbox.routing.registerRoute(
  ({ url }) => url.href.includes('raw.githubusercontent.com'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'json-files',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60, // 1 يوم
      }),
    ],
  })
);

// كاش لملفات الصوتيات من R2
workbox.routing.registerRoute(
  ({ url }) => url.href.includes('pub-d84ec872e0d940018b402da80d54a407.r2.dev'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'audio-files',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يوم
      }),
    ],
  })
);

// كاش لملفات الفيديوهات من R2
workbox.routing.registerRoute(
  ({ url }) => url.href.includes('pub-daf4aa025298493f8f6634fe32b8754b.r2.dev'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'video-files',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يوم
      }),
    ],
  })
);

// كاش لمحتوى الموقع
workbox.routing.registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new workbox.strategies.NetworkFirst({
    cacheName: 'site-content',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// التعامل مع الطلبات الفاشلة
workbox.routing.setCatchHandler(({ event }) => {
  return caches.match('/offline.html');
});
