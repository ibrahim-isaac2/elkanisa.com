importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

workbox.core.setCacheNameDetails({
  prefix: "elkanisa",
  suffix: "v1",
  precache: "precache",
  runtime: "runtime-cache",
});

// Precache الملفات الأساسية لتشغيل الموقع دون إنترنت
workbox.precaching.precacheAndRoute([
  { url: "/", revision: "20250713" },
  { url: "/manifest.json", revision: "20250713" },
  { url: "/icon-192x192.png", revision: "20250713" },
  { url: "/icon-512x512.png", revision: "20250713" },
  { url: "/icon.png", revision: "20250713" },
  { url: "/offline.html", revision: "20250713" },
  { url: "/end.png", revision: "20250713" },
  { url: "/myfooter.jpg", revision: "20250713" },
  { url: "/BM.png", revision: "20250713" },
  { url: "/placeholder-logo.png", revision: "20250713" },
  { url: "/placeholder-logo.svg", revision: "20250713" },
  { url: "/placeholder-user.jpg", revision: "20250713" },
  { url: "/placeholder.jpg", revision: "20250713" },
  { url: "/placeholder.svg", revision: "20250713" },
  { url: "/screenshot-narrow.png", revision: "20250713" },
  { url: "/screenshot-wide.png", revision: "20250713" },
  { url: "/songs.json", revision: "20250713" },
  { url: "/hymns.json", revision: "20250713" },
  { url: "/bible.json", revision: "20250713" },
  { url: "/bible_arabic_full.json", revision: "20250713" },
  { url: "/add-hymn.json", revision: "20250713" },
  { url: "/files.json", revision: "20250713" },
  { url: "/sw.js", revision: "20250713" },
  { url: "/globals.css", revision: "20250713" },
  // مكونات من app/
  { url: "/_next/static/chunks/pages/layout.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/index.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/_app.js", revision: "20250713" },
  { url: "/_next/static/chunks/main.js", revision: "20250713" },
  { url: "/_next/static/chunks/webpack.js", revision: "20250713" },
  // مكونات من components/
  { url: "/_next/static/chunks/pages/add-hymn.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/add-lecture.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/attendance-record.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/audio-bible.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/ChatBot.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/CompetitionsSection.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/DailyVerse.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/footer.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/header.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/hero-section.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/install-button.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/PowerPointSection.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/SectionHandler.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/sections_component.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/seo_songs_component.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/seo_wrapper.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/TextBible.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/theme-provider.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/theme-toggle.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/word-and-melody-hymns.js", revision: "20250713" },
  // مكونات UI من components/ui/
  { url: "/_next/static/chunks/pages/accordion.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/alert-dialog.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/alert.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/aspect-ratio.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/avatar.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/badge.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/breadcrumb.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/button.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/calendar.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/card.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/carousel.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/chart.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/checkbox.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/collapsible.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/command.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/context-menu.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/dialog.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/drawer.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/dropdown-menu.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/form.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/hover-card.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/input-otp.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/input.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/label.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/menubar.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/navigation-menu.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/pagination.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/popover.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/progress.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/radio-group.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/resizable.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/scroll-area.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/select.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/separator.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/sheet.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/sidebar.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/skeleton.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/slider.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/sonner.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/switch.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/table.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/tabs.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/textarea.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/toast.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/toaster.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/toggle-group.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/toggle.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/tooltip.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/use-mobile.js", revision: "20250713" },
  { url: "/_next/static/chunks/pages/use-toast.js", revision: "20250713" },
]);

// كاش لملفات JSON من raw.githubusercontent.com
workbox.routing.registerRoute(
  ({ url }) => url.href.includes("raw.githubusercontent.com"),
  new workbox.strategies.NetworkFirst({
    cacheName: "json-files",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ملفات الصوتيات والفيديوهات (NetworkOnly)
workbox.routing.registerRoute(
  ({ url }) =>
    url.href.includes("pub-d84ec872e0d940018b402da80d54a407.r2.dev") ||
    url.href.includes("pub-daf4aa025299493f8f6634fe32b8754b.r2.dev"),
  new workbox.strategies.NetworkOnly()
);

// قسم الكنيسة الأرثوذكسية (NetworkOnly)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.includes("/orthodox-section"),
  new workbox.strategies.NetworkOnly()
);

// كاش لمحتوى الموقع الأساسي
workbox.routing.registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "site-content",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// التعامل مع الطلبات الفاشلة
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    return caches.match("/offline.html");
  }
  return Response.error();
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();
