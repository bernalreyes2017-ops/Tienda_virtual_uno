/**
 * MILAGRO - Lógica de POS (Admin)
 */

let posProducts = [];
let ticket = []; // Lista de venta actual

document.addEventListener('DOMContentLoaded', async () => {
    posProducts = await fetchProducts();
    renderPosProducts(posProducts);

    document.getElementById('posSearch').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        if(q === '') {
            renderPosProducts(posProducts);
            return;
        }

        const filtered = posProducts.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.id.toLowerCase().includes(q)
        );
        renderPosProducts(filtered);
    });
});

const renderPosProducts = (products) => {
    const grid = document.getElementById('posProductsGrid');
    if (!grid) return;

    let html = '';
    products.forEach(p => {
        // En un POS el thumbnail puede fallar si estamos offline, es normal en UI, pero asumo paths correctos
        html += `
            <div class="pos-item-card" onclick='addToTicket(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
                <img src="../../assets/images/categorias/${p.category || 'bovinos'}.jpg" class="pos-item-img" onerror="this.src='../../assets/images/hero-bg.jpg'">
                <div class="pos-item-title">${p.name}</div>
                <div class="pos-item-price">${formatCOP(p.price)}</div>
            </div>
        `;
    });
    grid.innerHTML = html;
};

window.addToTicket = (product) => {
    const index = ticket.findIndex(item => item.id === product.id);
    if(index > -1) {
        ticket[index].quantity += 1;
    } else {
        ticket.push({ ...product, quantity: 1 });
    }
    renderTicket();
};

window.changeTicketQty = (id, change) => {
    const index = ticket.findIndex(i => i.id === id);
    if (index > -1) {
        ticket[index].quantity += change;
        if(ticket[index].quantity <= 0) {
            ticket.splice(index, 1);
        }
        renderTicket();
    }
};

const renderTicket = () => {
    const container = document.getElementById('posTicketItems');
    if(ticket.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:50%;">Ticket vacío</p>';
        document.getElementById('posSubtotal').textContent = '$0';
        document.getElementById('posTotal').textContent = '$0';
        return;
    }

    let html = '';
    let total = 0;

    ticket.forEach(item => {
        const sub = item.price * item.quantity;
        total += sub;
        html += `
            <div class="pos-cart-line">
                <div class="cart-line-info">
                    <div class="cart-line-title">${item.name}</div>
                    <div class="cart-line-meta">${item.id} | ${formatCOP(item.price)}</div>
                </div>
                <div style="text-align:right;">
                    <div class="qty-controls">
                        <button onclick="changeTicketQty('${item.id}', -1)">-</button>
                        <span style="font-weight:bold; min-width:20px; text-align:center;">${item.quantity}</span>
                        <button onclick="changeTicketQty('${item.id}', 1)">+</button>
                    </div>
                    <div style="font-weight:bold; color:var(--verde-oscuro); margin-top:5px;">${formatCOP(sub)}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('posSubtotal').textContent = formatCOP(total);
    document.getElementById('posTotal').textContent = formatCOP(total);
};
