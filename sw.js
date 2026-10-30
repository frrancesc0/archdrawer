// sw.js
const CACHE_NAME = 'adrawer-cache-v1';

// Lista de todos los archivos estáticos que quieres precargar obligatoriamente
const ASSETS_TO_CACHE = [
    '',
    'index.html',
    'css/main.css',
    'css/tool.css',
    'css/index.css',

    'js/pdf-lib.min.js',
    'js/pdf.min.js',
    'js/pdf.worker.min.js',
    'js/area.js',
    'js/caracteres.js',
    'js/cerchas.js',
    'js/escala.js',
    'js/imposicion.js',
    'js/index.js',
    'js/longitud.js',
    'js/luminaria.js',
    'js/main.js',
    'js/papel.js',
    'js/pendiente.js',
    'js/und-digitales.js',
    'js/vigas.js',

    'assets/icons/home.svg',
    'assets/icons/arrow-menu.svg',
    'assets/icons/area.svg',
    'assets/icons/area-2.svg',
    'assets/icons/caracteres.svg',
    'assets/icons/caracteres-2.svg',
    'assets/icons/cerchas.svg',
    'assets/icons/cerchas-2.svg',
    'assets/icons/escala.svg',
    'assets/icons/escala-2.svg',
    'assets/icons/escaleras.svg',
    'assets/icons/escaleras-2.svg',
    'assets/icons/imposicion.svg',
    'assets/icons/imposicion-2.svg',
    'assets/icons/longitud.svg',
    'assets/icons/longitud-2.svg',
    'assets/icons/luminaria.svg',
    'assets/icons/luminaria-2.svg',
    'assets/icons/papel.svg',
    'assets/icons/papel-2.svg',
    'assets/icons/pendiente.svg',
    'assets/icons/pendiente-2.svg',
    'assets/icons/und-digitales.svg',
    'assets/icons/und-digitales-2.svg',
    'assets/icons/vigas.svg',
    'assets/icons/vigas-2.svg',

    'assets/images/adrawer-index.svg',
    'assets/images/adrawer-iso.svg',
    'assets/images/adrawer-iso-01.png',

    'pages/area.html',
    'pages/caracteres.html',
    'pages/cerchas.html',
    'pages/escala.html',
    'pages/imposicion.html',
    'pages/longitud.html',
    'pages/luminaria.html',
    'pages/papel.html',
    'pages/pendiente.html',
    'pages/und-digitales.html',
    'pages/vigas.html'
];

// 1. INSTALACIÓN: Guarda los recursos críticos en la caché del navegador
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Precargando recursos de la suite');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVACIÓN: Elimina las cachés viejas si actualizas la versión de tu web
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Borrando caché obsoleta:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. INTERCEPCIÓN (FETCH): Estrategia "Cache-First" (Primero busca en caché, si no, va a la red)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si el recurso ya está guardado en la caché, se entrega al instante (0ms de red)
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no está en caché, lo busca en la red y lo almacena automáticamente para la próxima
                return fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }).catch(() => {
                // Opcional: Si el usuario está offline y solicita una página de navegación nueva
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});
