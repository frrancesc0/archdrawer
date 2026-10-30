// js/index.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito. Scope:', registration.scope);
            })
            .catch(error => {
                console.log('Fallo el registro del Service Worker:', error);
            });
    });
}