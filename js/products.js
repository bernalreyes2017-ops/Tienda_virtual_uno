/**
 * MILAGRO - Lógica de Catálogo
 */

let allProducts = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar contador de carrito globlal
    updateCartCounter();

    // 2. Extraer categoría de la URL (si viene desde el Home)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        currentCategory = catParam;
        
        // Actualizar UI del filtro
        document.querySelectorAll('.chip').forEach(chip => {
            if (chip.dataset.cat === catParam) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    // 3. Cargar productos desde JSON
    allProducts = await fetchProducts();
    
    // 4. Renderizar por primera vez
    renderProducts(allProducts, currentCategory);

    // 5. Configurar Event Listeners (Búsqueda y Filtros)
    setupEventListeners();
});

const renderProducts = (products, categoryLimit = 'all', searchQuery = '') => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = ''; // Limpiar grilla

    // Aplicar filtros
    let filtered = products;

    if (categoryLimit !== 'all') {
        filtered = filtered.filter(p => p.category === categoryLimit);
    }

    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
        );
    }

    // Renderizar
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 3rem;">
                <i class="fa-solid fa-cow" style="font-size:3rem; color:var(--gris-medio); margin-bottom:1rem;"></i>
                <h3 class="color-verde">Uy... no encontramos lo que buscas</h3>
                <p>Intenta con otra palabra o navega por las categorías.</p>
            </div>
        `;
        return;
    }

    filtered.forEach((product, index) => {
        // Animación de cascada
        const animDelay = (index % 10) * 0.1;
        
        const cardHTML = `
            <div class="card product-card fade-in" style="animation-delay: ${animDelay}s">
                ${product.contegral ? '<div class="badge">⭐ Contegral</div>' : ''}
                <div class="product-img-wrapper">
                    <img src="${product.image}" loading="lazy" alt="${product.name}">
                </div>
                <div class="product-content">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <p style="font-size:0.9rem; margin-bottom:auto;">${product.description}</p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:20px;">
                        <span class="product-price">${formatCOP(product.price)}</span>
                        <button onclick='window.handleAddToCart(${JSON.stringify(product).replace(/'/g, "&#39;")})' 
                                class="btn btn-primary btn-sm"
                                aria-label="Agregar ${product.name} al carrito">
                            <i class="fa-solid fa-plus"></i> <i class="fa-solid fa-cart-shopping"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
};

const setupEventListeners = () => {
    // Filtros por Chips
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            
            currentCategory = e.target.dataset.cat;
            
            // Actualizar URL sin recargar
            const url = new URL(window.location);
            url.searchParams.set('cat', currentCategory);
            window.history.pushState({}, '', url);

            renderProducts(allProducts, currentCategory, document.getElementById('searchInput').value);
        });
    });

    // Búsqueda de texto
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(allProducts, currentCategory, e.target.value);
        });
    }
};

// Función global para ser llamada desde el HTML (onclick)
window.handleAddToCart = (productObj) => {
    addToCart(productObj, 1);
};
