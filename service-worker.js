const CACHE_NAME = 'ola-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/ola.png',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap',
  'https://fonts.gstatic.com/s/amiri/v19/J7aRnpd8CGxBHqUp.ttf'
];

// התקנה: שמירת קבצים סטטיים
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// אקטיבציה: מחיקת קאש ישן
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// שליפה: Cache First לכל דבר, ודינאמי לתמונות מה־Firebase
self.addEventListener('fetch', event => {
  const { request } = event;

  // תמונות מה־Firebase Storage – נאגור אותן באופן דינמי
  if (request.url.includes('firebasestorage.googleapis.com')) {
    event.respondWith(
      caches.open('dynamic').then(cache => {
        return cache.match(request).then(response => {
          return (
            response ||
            fetch(request).then(fetchRes => {
              cache.put(request, fetchRes.clone());
              return fetchRes;
            })
          );
        });
      })
    );
    return;
  }

  // שאר הבקשות – Cache First
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return (
        cachedResponse ||
        fetch(request).then(fetchRes => {
          return fetchRes;
        })
      );
    })
  );
});
