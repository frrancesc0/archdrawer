// sw.js
const CACHE_NAME = 'adrawer-cache-v1';

// Lista de todos los archivos estáticos que quieres precargar obligatoriamente
const ASSETS_TO_CACHE = [
    '/archdrawer/',
    '/archdrawer/index.html',
    '/archdrawer/css/main.css',
    '/archdrawer/css/tool.css',
    '/archdrawer/css/index.css',

    '/archdrawer/js/pdf-lib.min.js',
    '/archdrawer/js/pdf.min.js',
    '/archdrawer/js/pdf.worker.min.js',
    '/archdrawer/js/area.js',
    '/archdrawer/js/caracteres.js',
    '/archdrawer/js/cerchas.js',
    '/archdrawer/js/escala.js',
    '/archdrawer/js/imposicion.js',
    '/archdrawer/js/index.js',
    '/archdrawer/js/longitud.js',
    '/archdrawer/js/luminaria.js',
    '/archdrawer/js/main.js',
    '/archdrawer/js/papel.js',
    '/archdrawer/js/pendiente.js',
    '/archdrawer/js/und-digitales.js',
    '/archdrawer/js/vigas.js',

    '/archdrawer/assets/icons/home.svg',
    '/archdrawer/assets/icons/arrow-menu.svg',
    '/archdrawer/assets/icons/area.svg',
    '/archdrawer/assets/icons/area-2.svg',
    '/archdrawer/assets/icons/caracteres.svg',
    '/archdrawer/assets/icons/caracteres-2.svg',
    '/archdrawer/assets/icons/cerchas.svg',
    '/archdrawer/assets/icons/cerchas-2.svg',
    '/archdrawer/assets/icons/escala.svg',
    '/archdrawer/assets/icons/escala-2.svg',
    '/archdrawer/assets/icons/escaleras.svg',
    '/archdrawer/assets/icons/escaleras-2.svg',
    '/archdrawer/assets/icons/imposicion.svg',
    '/archdrawer/assets/icons/imposicion-2.svg',
    '/archdrawer/assets/icons/longitud.svg',
    '/archdrawer/assets/icons/longitud-2.svg',
    '/archdrawer/assets/icons/luminaria.svg',
    '/archdrawer/assets/icons/luminaria-2.svg',
    '/archdrawer/assets/icons/papel.svg',
    '/archdrawer/assets/icons/papel-2.svg',
    '/archdrawer/assets/icons/pendiente.svg',
    '/archdrawer/assets/icons/pendiente-2.svg',
    '/archdrawer/assets/icons/und-digitales.svg',
    '/archdrawer/assets/icons/und-digitales-2.svg',
    '/archdrawer/assets/icons/vigas.svg',
    '/archdrawer/assets/icons/vigas-2.svg',

    '/archdrawer/assets/images/adrawer-index.svg',
    '/archdrawer/assets/images/adrawer-iso.svg',
    '/archdrawer/assets/images/adrawer-iso-01.png',

    '/archdrawer/pages/area.html',
    '/archdrawer/pages/caracteres.html',
    '/archdrawer/pages/cerchas.html',
    '/archdrawer/pages/escala.html',
    '/archdrawer/pages/imposicion.html',
    '/archdrawer/pages/longitud.html',
    '/archdrawer/pages/luminaria.html',
    '/archdrawer/pages/papel.html',
    '/archdrawer/pages/pendiente.html',
    '/archdrawer/pages/und-digitales.html',
    '/archdrawer/pages/vigas.html'
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
