/**
 * MILAGRO - Lógica de vista Carrito
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa contador del header si lo hay
    updateCartCounter();
    
    // Pinta la lista
    renderCart();
});

const renderCart = () => {
    const cart = getCart();
    const container = document.getElementById('cartItemsList');
    const summarySection = document.getElementById('cartSummarySection');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state fade-in">
                <i class="fa-solid fa-cart-arrow-down" style="font-size: 4rem; color: var(--gris-medio); margin-bottom: 1rem;"></i>
                <h3 class="color-verde">Tu carrito está vacío</h3>
                <p>Parece que aún no has agregado productos para tus animales.</p>
                <a href="catalogo.html" class="btn btn-primary" style="margin-top:1rem;">Ir al catálogo</a>
            </div>
        `;
        if(summarySection) summarySection.style.display = 'none';
        return;
    }

    if(summarySection) summarySection.style.display = 'block';
    
    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item fade-in" style="animation-delay: ${index * 0.1}s">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-price">${formatCOP(item.price)} C/U</span>
                    
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)">-</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="999"
                               onchange="setItemQty('${item.id}', this.value)"
                               style="width:50px; text-align:center; font-weight:700; border:1px solid #ccc; border-radius:5px; padding:2px;">
                        <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div>
                    <h4 class="color-verde" style="margin-bottom:0.5rem; text-align:right;">${formatCOP(itemTotal)}</h4>
                    <button class="cart-item-remove" onclick="removeItem('${item.id}')" aria-label="Eliminar producto"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Updates totales
    document.getElementById('subtotalVal').textContent = formatCOP(total);
    // Para simplificar, total sin envío por ahora. En el checkout se añade
    document.getElementById('totalVal').textContent = formatCOP(total);
};

window.updateItemQty = (id, change) => {
    let cart = getCart();
    const index = cart.findIndex(i => i.id === id);
    
    if (index > -1) {
        cart[index].quantity += change;
        
        // Si baja a 0, eliminarlo
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        saveCart(cart);
        renderCart();
    }
};

window.removeItem = (id) => {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
};

window.setItemQty = (id, newQty) => {
    let qty = parseInt(newQty);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 999) qty = 999;
    
    let cart = getCart();
    const index = cart.findIndex(i => i.id === id);
    if (index > -1) {
        cart[index].quantity = qty;
        saveCart(cart);
        renderCart();
    }
};

window.applyPromo = () => {
    // Falso descuento para demostración
    const code = document.getElementById('promoCode').value.toUpperCase();
    if (code === 'MILAGRO10') {
        showToast('¡Descuento aplicado!');
        // Aquí se aplicaría el 10%
    } else {
        alert('Código no válido');
    }
};
