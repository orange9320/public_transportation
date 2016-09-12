var CACHE_NAME = 'site-cache-v4';
var urlsToCache = [
    '/',
    '/index.html',
    '/build/css/style.css',
    '/build/js/all.min.js',
    '/json_data/caltrain/stops.json',
    '/json_data/caltrain/stop_times_weekday.json',
    '/json_data/caltrain/stop_times_saturday.json',
    '/json_data/caltrain/stop_times_sunday.json'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })


    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName != CACHE_NAME;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                }));
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request);
        })
    );
});
