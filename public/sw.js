importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js" );
import { cacheAllMedia } from "./offline-cache.ts";

// تحديث Workbox ليتعامل مع التخزين المؤقت بشكل أفضل
workbox.core.setCacheNameDetails({
  prefix: "elkanisa",
  suffix: "v1",
  precache: "precache",
  runtime: "runtime-cache",
});

// حدث التثبيت لتخزين ملفات الصوت والفيديو
self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheAllMedia(
      "https://pub-d84ec872e0d940018b402da80d54a407.r2.dev", // رابط الصوتيات
      "https://pub-daf4aa025299493f8f6634fe32b8754b.r2.dev"  // رابط الفيديوهات (تم تعديل الرابط ليكون صحيحًا )
    )
  );
});

// تخزين الملفات الرئيسية أثناء التثبيت
workbox.precaching.precacheAndRoute([
  { url: "/", revision: "2" }, // تم تحديث رقم المراجعة
  { url: "/_next/static/chunks/main.js", revision: "2" },
  { url: "/_next/static/chunks/webpack.js", revision: "2" },
  { url: "/_next/static/css/main.css", revision: "2" },
  { url: "/manifest.json", revision: "2" },
  { url: "/icon-192x192.png", revision: "2" },
  { url: "/icon-512x512.png", revision: "2" },
  { url: "/offline.html", revision: "2" },
  { url: "/end.png", revision: "2" },
  // إضافة مسارات أخرى مهمة للصفحة الرئيسية هنا إذا كانت ثابتة
]);

// كاش لملفات JSON من raw.githubusercontent.com (استراتيجية NetworkFirst لتحميل أحدث البيانات أولاً)
workbox.routing.registerRoute(
  ({ url }) => url.href.includes("raw.githubusercontent.com"),
  new workbox.strategies.NetworkFirst({
    cacheName: "json-files",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50, // تخزين 50 إدخال كحد أقصى
        maxAgeSeconds: 7 * 24 * 60 * 60, // تخزين لمدة أسبوع
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// كاش لملفات الصوتيات من R2 (استراتيجية CacheFirst)
workbox.routing.registerRoute(
  ({ url }) => url.href.includes("pub-d84ec872e0d940018b402da80d54a407.r2.dev"),
  new workbox.strategies.CacheFirst({
    cacheName: "audio-files",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200, // تخزين 200 إدخال كحد أقصى
        maxAgeSeconds: 30 * 24 * 60 * 60, // تخزين لمدة شهر
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// كاش لملفات الفيديوهات من R2 (استراتيجية CacheFirst)
workbox.routing.registerRoute(
  ({ url }) => url.href.includes("pub-daf4aa025299493f8f6634fe32b8754b.r2.dev"),
  new workbox.strategies.CacheFirst({
    cacheName: "video-files",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100, // تخزين 100 إدخال كحد أقصى
        maxAgeSeconds: 30 * 24 * 60 * 60, // تخزين لمدة شهر
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// كاش لمحتوى الموقع (استراتيجية NetworkFirst)
workbox.routing.registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new workbox.strategies.NetworkFirst({
    cacheName: "site-content",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100, // تخزين 100 إدخال كحد أقصى
        maxAgeSeconds: 7 * 24 * 60 * 60, // تخزين لمدة أسبوع
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// التعامل مع الطلبات الفاشلة (fallback to offline.html)
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    return caches.match("/offline.html");
  }
  return Response.error();
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();
