var CACHE_NAME = 'site-cache-v4';
var urlsToCache = [
    '/public_transportation/',
    '/public_transportation/index.html',
    '/public_transportation/build/css/style.css',
    '/public_transportation/build/js/all.min.js',
    '/public_transportation/json_data/caltrain/stops.json',
    '/public_transportation/json_data/caltrain/stop_times_weekday.json',
    '/public_transportation/json_data/caltrain/stop_times_saturday.json',
    '/public_transportation/json_data/caltrain/stop_times_sunday.json'
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
