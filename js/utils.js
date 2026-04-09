/**
 * MILAGRO - Utils Generales
 */

// Formatear moneda a pesos colombianos (COP)
const formatCOP = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
};

// ============================================
// Lógica Global del Carrito (LocalStorage)
// ============================================
const getCart = () => {
    return JSON.parse(localStorage.getItem('milagro_cart')) || [];
};

const saveCart = (cart) => {
    localStorage.setItem('milagro_cart', JSON.stringify(cart));
    updateCartCounter();
};

const addToCart = (product, quantity = 1) => {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === product.id);
    
    if (index > -1) {
        cart[index].quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    
    saveCart(cart);
    
    // Feedback visual rápido
    showToast(`¡Se agregó ${product.name} al carrito! 🚜`);
};

const updateCartCounter = () => {
    const counterItem = document.getElementById('cart-counter');
    if (counterItem) {
        const cart = getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        counterItem.textContent = totalItems;
        
        // Animación de rebote (pulso)
        counterItem.style.transform = 'scale(1.5)';
        setTimeout(() => counterItem.style.transform = 'scale(1)', 300);
    }
};

// ============================================
// Feedback UI Simple (Toast) Rural y Claro
// ============================================
const showToast = (message) => {
    // Si ya hay un toast, lo borramos
    const existing = document.getElementById('milagro-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'milagro-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--verde-oscuro);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: fadeIn 0.3s ease;
        text-align: center;
        width: max-content;
        max-width: 90vw;
    `;
    toast.innerHTML = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

// ============================================
// Lógica de Base de Datos (LocalStorage Dinámico)
// ============================================

// Lee los productos desde la memoria del navegador
const fetchProducts = async () => {
    try {
        const stored = localStorage.getItem('milagro_db_products');
        if (stored) {
            return JSON.parse(stored);
        } else {
            // Si no hay nada, intentar leer el JSON limpio por defecto y guardarlo en memoria
            let url = '../data/products.json';
            if(window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                url = './data/products.json';
            }
            
            const req = await fetch(url);
            const data = await req.json();
            
            // Si el JSON viene limpio, guardará el arreglo vacío en memoria
            localStorage.setItem('milagro_db_products', JSON.stringify(data));
            return data;
        }
    } catch(e) {
        console.error("Error cargando productos", e);
        return [];
    }
};

// Guarda y sobreescribe toda la lista de productos
const saveProductsDB = (productsArray) => {
    localStorage.setItem('milagro_db_products', JSON.stringify(productsArray));
};

// ============================================
// Helper Archivos a Base64
// ============================================
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
