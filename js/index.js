document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos todas las tarjetas de herramientas
    const tarjetasHerramientas = document.querySelectorAll(".tool-card");

    tarjetasHerramientas.forEach(tarjeta => {
        // Detectamos cuando el usuario pasa el mouse por encima
        tarjeta.addEventListener("mouseenter", () => {
            const urlDestino = tarjeta.getAttribute("href");
            
            // Verificamos que no se haya precargado antes para no saturar
            if (urlDestino && !document.querySelector(`link[href="${urlDestino}"]`)) {
                const linkPrefetch = document.createElement("link");
                linkPrefetch.rel = "prefetch";
                linkPrefetch.href = urlDestino;
                document.head.appendChild(linkPrefetch);
            }
        }, { once: true }); // Se ejecuta una sola vez por tarjeta
    });
});