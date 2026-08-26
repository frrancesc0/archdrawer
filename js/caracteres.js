document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Base de Datos de Símbolos (Puedes agregar los que quieras)
    const charDatabase = [
        // Matemáticas y Técnica
        { symbol: 'Ø', textToCopy: 'Ø', label: 'diámetro', tags: 'diametro circulo vacio tecnico' },
        { symbol: '±', textToCopy: '±', label: 'más menos', tags: 'mas menos tolerancia mate' },
        { symbol: '≈', textToCopy: '≈', label: 'casi igual', tags: 'casi aproximado igual mate' },
        { symbol: '≠', textToCopy: '≠', label: 'no es igual', tags: 'distinto diferente mate' },
        { symbol: '≤', textToCopy: '≤', label: 'menor o igual', tags: 'menor igual mate' },
        { symbol: '≥', textToCopy: '≥', label: 'mayor o igual', tags: 'mayor igual mate' },
        { symbol: '∞', textToCopy: '∞', label: 'infinito', tags: 'infinito mate' },
        { symbol: '°', textToCopy: '°', label: 'grados', tags: 'grados angulo temperatura' },
        { symbol: 'Δ', textToCopy: 'Δ', label: 'delta', tags: 'delta triangulo incremento' },
        { symbol: 'π', textToCopy: 'π', label: 'pi', tags: 'pi mate circulo' },
        { symbol: '√', textToCopy: '√', label: 'raíz', tags: 'raiz cuadrada mate' },
        
        // Superíndices y Subíndices
        { symbol: '²', textToCopy: '²', label: 'elevado a 2', tags: 'cuadrado superindice dos area' },
        { symbol: '³', textToCopy: '³', label: 'elevado a 3', tags: 'cubo superindice tres volumen' },
        { symbol: '¹', textToCopy: '¹', label: 'elevado a 1', tags: 'superindice uno' },
        { symbol: 'ⁿ', textToCopy: 'ⁿ', label: 'elevado a n', tags: 'superindice n enesimo' },
        { symbol: '₂', textToCopy: '₂', label: 'subíndice 2', tags: 'subindice dos base' },
        
        // Dimensiones y Unidades
        { symbol: 'μ', textToCopy: 'μ', label: 'micro', tags: 'micro micra unidad' },
        { symbol: 'Ω', textToCopy: 'Ω', label: 'ohm', tags: 'ohm resistencia electrica unidad' },
        { symbol: '′', textToCopy: '′', label: 'min / pies', tags: 'minutos pies prima longitud tiempo' },
        { symbol: '″', textToCopy: '″', label: 'seg / pulg', tags: 'segundos pulgadas doble prima longitud tiempo' },
        
        // Tipografía y Espaciado (Aquí entra tu sugerencia sobre caracteres invisibles)
        { symbol: '[nbsp]', textToCopy: ' ', label: 'espacio insep.', tags: 'espacio sin romper nbsp tipografia invisible blanco', isInvisible: true },
        { symbol: '—', textToCopy: '—', label: 'guion largo', tags: 'guion largo raya tipografia' },
        { symbol: '–', textToCopy: '–', label: 'guion medio', tags: 'guion medio tipografia' },
        { symbol: '©', textToCopy: '©', label: 'copyright', tags: 'copyright derechos autor' },
        { symbol: '®', textToCopy: '®', label: 'registrado', tags: 'marca registrada' },
        { symbol: '™', textToCopy: '™', label: 'trademark', tags: 'trademark marca comercial' },
        { symbol: '«', textToCopy: '«', label: 'comilla lat.', tags: 'comilla latina izquierda apertura tipografia' },
        { symbol: '»', textToCopy: '»', label: 'comilla lat.', tags: 'comilla latina derecha cierre tipografia' },
        
        // Flechas y Orientación
        { symbol: '→', textToCopy: '→', label: 'derecha', tags: 'flecha derecha orientacion' },
        { symbol: '←', textToCopy: '←', label: 'izquierda', tags: 'flecha izquierda orientacion' },
        { symbol: '↑', textToCopy: '↑', label: 'arriba', tags: 'flecha arriba orientacion' },
        { symbol: '↓', textToCopy: '↓', label: 'abajo', tags: 'flecha abajo orientacion' },
        { symbol: '↔', textToCopy: '↔', label: 'ambos lados', tags: 'flecha horizontal doble' }
    ];

    const charGrid = document.getElementById('charGrid');
    const searchInput = document.getElementById('searchInput');

    // 2. Función para renderizar tarjetas
    function renderCards(filterText = '') {
        charGrid.innerHTML = ''; // Limpiar grilla
        
        const term = filterText.toLowerCase().trim();
        
        // Filtrar basado en la etiqueta o nombre
        const filtered = charDatabase.filter(item => {
            if (!term) return true;
            return item.label.toLowerCase().includes(term) || item.tags.includes(term);
        });

        // Crear elementos DOM
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'char-card';
            
            // Si es un caracter invisible como NBSP, aplicamos la clase especial
            const symbolSpan = document.createElement('span');
            symbolSpan.className = item.isInvisible ? 'char-symbol invisible-badge' : 'char-symbol';
            symbolSpan.textContent = item.symbol;
            
            const labelSpan = document.createElement('span');
            labelSpan.className = 'char-label';
            labelSpan.textContent = item.label;
            
            card.appendChild(symbolSpan);
            card.appendChild(labelSpan);

            // 3. Evento Click para Copiar al Portapapeles
            card.addEventListener('click', () => {
                navigator.clipboard.writeText(item.textToCopy).then(() => {
                    
                    // Feedback visual (se vuelve verde y se encoge sutilmente)
                    card.classList.add('copied');
                    const originalLabel = item.label;
                    labelSpan.textContent = '¡copiado!';
                    
                    setTimeout(() => {
                        card.classList.remove('copied');
                        labelSpan.textContent = originalLabel;
                    }, 800);
                    
                }).catch(err => {
                    console.error('Error al copiar: ', err);
                });
            });

            charGrid.appendChild(card);
        });
    }

    // Inicializar con todos los caracteres
    renderCards();

    // 4. Evento de Búsqueda en vivo
    searchInput.addEventListener('input', (e) => {
        renderCards(e.target.value);
    });

});