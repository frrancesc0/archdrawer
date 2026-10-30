document.addEventListener('DOMContentLoaded', () => {
    const drawerToggle = document.getElementById('drawer-toggle');
    const bottomMenu = document.querySelector('.bottom-menu-wrapper');

    // 1. ANIMACIÓN DE ENTRADA (Cierre automático)
    // Revisamos si el menú viene abierto por defecto desde el HTML
    if (bottomMenu && bottomMenu.classList.contains('open')) {
        // El doble requestAnimationFrame asegura que la transición CSS 
        // se dispare correctamente sin cortes al cargar la página
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bottomMenu.classList.remove('open');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // 2. APERTURA Y CIERRE NORMAL CON LA FLECHA
    if (drawerToggle && bottomMenu) {
        drawerToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            bottomMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });
    }

    // 3. CIERRE AL HACER CLIC EN UN ESPACIO VACÍO
    document.addEventListener('click', (event) => {
        if (bottomMenu && bottomMenu.classList.contains('open')) {
            if (!bottomMenu.contains(event.target) && event.target !== drawerToggle) {
                bottomMenu.classList.remove('open');
                document.body.classList.remove('menu-open');
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionas el elemento que quieres cambiar (ej. tu header)
    const elementoAModificar = document.querySelector('.search'); 

    // 2. Escuchas el evento de scroll en la ventana
    window.addEventListener('scroll', () => {
        
        // Si el usuario baja más de 50 píxeles...
        if (window.scrollY > 50) {
            elementoAModificar.classList.add('scrolled'); // Se añade la clase
        } else {
            elementoAModificar.classList.remove('scrolled'); // Se quita al volver arriba
        }
    });
});