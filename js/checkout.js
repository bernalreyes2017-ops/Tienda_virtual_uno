/**
 * MILAGRO - Lógica Checkout con Redención de Puntos
 */

let paymentMethod = 'wompi'; // default
let cartTotal = 0;
let cartItemsText = '';
let cartSubtotal = 0;
let pointsDiscount = 0; // descuento aplicado por puntos
let pointsRedeemed = 0; // puntos canjeados

document.addEventListener('DOMContentLoaded', () => {
    // Autocompletar datos si está logueado
    const userStr = localStorage.getItem('milagro_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('ckName').value = user.name;
        document.getElementById('ckPhone').value = user.phone;
    }

    // Calcular Total
    const cart = getCart();
    if(cart.length === 0) {
        alert("Tu carrito está vacío. Serás redirigido.");
        window.location.href = 'catalogo.html';
        return;
    }

    cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal = cartSubtotal;

    // Construir texto resumen para WhatsApp
    cart.forEach(item => {
        cartItemsText += `- ${item.quantity}x ${item.name} ($${item.price} c/u)\n`;
    });

    updateTotalDisplay();

    // ---- Mostrar panel de puntos si el usuario tiene ----
    checkUserPoints();
});

const checkUserPoints = () => {
    const userStr = localStorage.getItem('milagro_user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    if (user.role !== 'client') return;

    // Leer puntos frescos desde la DB
    const usersDB = JSON.parse(localStorage.getItem('milagro_db_users')) || [];
    const freshUser = usersDB.find(u => String(u.cedula) === String(user.cedula));
    const availablePoints = freshUser ? (freshUser.points || 0) : (user.points || 0);

    if (availablePoints <= 0) return;

    // Calcular el máximo de puntos que se pueden redimir (limitado al valor total)
    const maxRedeemablePts = Math.min(availablePoints, Math.floor(cartSubtotal / 20));
    const maxDiscount = maxRedeemablePts * 15;

    // Inyectar el panel de puntos en el checkout
    const pointsPanel = document.getElementById('pointsPanel');
    if (!pointsPanel) return;

    pointsPanel.innerHTML = `
        <div style="background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%); border: 2px solid var(--amarillo); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 8px 0; color: var(--verde-oscuro);">
                <i class="fa-solid fa-star" style="color:var(--amarillo);"></i> 
                Tienes <strong>${availablePoints} puntos</strong> disponibles 
                <small style="color:var(--gris-medio);">(≈ ${formatCOP(availablePoints * 15)} en descuento)</small>
            </h4>
            <p style="margin: 0 0 12px 0; font-size: 0.9rem; color: var(--texto-secundario);">
                Cada punto vale $15. Puedes usar hasta <strong>${maxRedeemablePts} pts</strong> en esta compra (máx. ${formatCOP(maxDiscount)} de descuento).
            </p>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <input type="number" id="pointsInput" class="form-control" 
                       style="max-width:140px;" 
                       placeholder="Puntos a usar" 
                       min="0" max="${maxRedeemablePts}" step="1"
                       oninput="previewPointsDiscount(${availablePoints}, ${maxRedeemablePts})">
                <button type="button" class="btn btn-primary btn-sm" onclick="applyPoints(${availablePoints}, ${maxRedeemablePts})">
                    <i class="fa-solid fa-check"></i> Aplicar
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="removePoints()" id="removePointsBtn" style="display:none;">
                    <i class="fa-solid fa-xmark"></i> Quitar descuento
                </button>
            </div>
            <div id="pointsPreviewMsg" style="margin-top:10px; font-size:0.9rem; color:var(--verde-oscuro); font-weight:bold;"></div>
        </div>
    `;

    pointsPanel.style.display = 'block';
};

window.previewPointsDiscount = (available, maxPts) => {
    const input = document.getElementById('pointsInput');
    const preview = document.getElementById('pointsPreviewMsg');
    let val = parseInt(input.value) || 0;
    if (val > maxPts) { val = maxPts; input.value = maxPts; }
    if (val < 0) { val = 0; input.value = 0; }

    if (val > 0) {
        const discount = val * 15;
        const newTotal = cartSubtotal - discount;
        preview.innerHTML = `✅ Aplicarás <strong>${val} pts</strong> → descuento de <strong>${formatCOP(discount)}</strong> → Total: <strong style="color:var(--error);">${formatCOP(newTotal)}</strong>`;
    } else {
        preview.innerHTML = '';
    }
};

window.applyPoints = (available, maxPts) => {
    const input = document.getElementById('pointsInput');
    let val = parseInt(input.value) || 0;
    if (val <= 0) { alert('Ingresa cuántos puntos deseas usar.'); return; }
    if (val > maxPts) { val = maxPts; input.value = maxPts; }
    if (val > available) { alert('No tienes suficientes puntos.'); return; }

    pointsRedeemed = val;
    pointsDiscount = val * 15;
    cartTotal = cartSubtotal - pointsDiscount;

    input.disabled = true;
    document.getElementById('removePointsBtn').style.display = 'inline-flex';
    updateTotalDisplay();
    document.getElementById('pointsPreviewMsg').innerHTML = 
        `🎉 Descuento aplicado: <strong>${formatCOP(pointsDiscount)}</strong> usando ${pointsRedeemed} puntos.`;
    showToast(`¡Descuento de ${formatCOP(pointsDiscount)} aplicado!`);
};

window.removePoints = () => {
    pointsRedeemed = 0;
    pointsDiscount = 0;
    cartTotal = cartSubtotal;

    const input = document.getElementById('pointsInput');
    if (input) { input.disabled = false; input.value = ''; }
    const removeBtn = document.getElementById('removePointsBtn');
    if (removeBtn) removeBtn.style.display = 'none';
    document.getElementById('pointsPreviewMsg').innerHTML = '';

    updateTotalDisplay();
};

const updateTotalDisplay = () => {
    const el = document.getElementById('finalTotal');
    if (!el) return;
    if (pointsDiscount > 0) {
        el.innerHTML = `
            <span style="text-decoration:line-through; color:#999; font-size:0.9rem;">${formatCOP(cartSubtotal)}</span>
            <span style="color:var(--error); margin-left:8px;">- ${formatCOP(pointsDiscount)}</span>
            <br>${formatCOP(cartTotal)} <small style="font-weight:normal; color:var(--texto-secundario);">(Envío a convenir)</small>
        `;
    } else {
        el.textContent = `${formatCOP(cartTotal)} (Envío a convenir)`;
    }
};

window.selectPayment = (method) => {
    paymentMethod = method;
    document.getElementById('optWompi').classList.remove('selected');
    document.getElementById('optWhatsapp').classList.remove('selected');
    
    if(method === 'wompi') document.getElementById('optWompi').classList.add('selected');
    if(method === 'whatsapp') document.getElementById('optWhatsapp').classList.add('selected');
};

window.processPayment = () => {
    const form = document.getElementById('checkoutForm');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const name = document.getElementById('ckName').value;
    const phone = document.getElementById('ckPhone').value;
    const dept = document.getElementById('ckDept') ? document.getElementById('ckDept').options[document.getElementById('ckDept').selectedIndex].text : '';
    const city = document.getElementById('ckCity') ? document.getElementById('ckCity').options[document.getElementById('ckCity').selectedIndex].text : '';
    const address = document.getElementById('ckAddress').value;
    const barrio = document.getElementById('ckBarrio') ? document.getElementById('ckBarrio').value : '';
    const cart = getCart();

    // Crear registro de Pedido Local
    const orderId = 'PED-' + Math.floor(Math.random() * 1000000);
    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        customer: name,
        phone: phone,
        address: `${address}, Barrio ${barrio} (${city}, ${dept})`,
        items: cart,
        subtotal: cartSubtotal,
        pointsDiscount: pointsDiscount,
        pointsRedeemed: pointsRedeemed,
        total: cartTotal,
        method: paymentMethod,
        status: 'pending'
    };

    const ordersDB = JSON.parse(localStorage.getItem('milagro_db_orders')) || [];
    ordersDB.push(newOrder);
    localStorage.setItem('milagro_db_orders', JSON.stringify(ordersDB));

    // Acumular Puntos por la compra (sobre el subtotal, no sobre el total descontado)
    const activeUser = JSON.parse(localStorage.getItem('milagro_user') || 'null');
    const ptsEarned = Math.floor(cartSubtotal / 1000);
    
    if (activeUser && activeUser.role === 'client') {
        const usersDB = JSON.parse(localStorage.getItem('milagro_db_users')) || [];
        const userIndex = usersDB.findIndex(u => String(u.cedula) === String(activeUser.cedula));
        if (userIndex > -1) {
            // Restar los puntos redimidos y sumar los ganados
            const currentPts = usersDB[userIndex].points || 0;
            usersDB[userIndex].points = Math.max(0, currentPts - pointsRedeemed) + ptsEarned;
            localStorage.setItem('milagro_db_users', JSON.stringify(usersDB));
            // Actualizar sesión
            activeUser.points = usersDB[userIndex].points;
            localStorage.setItem('milagro_user', JSON.stringify(activeUser));
        }
    }

    const discountLine = pointsRedeemed > 0 
        ? `\n*Descuento puntos (${pointsRedeemed} pts):* -${formatCOP(pointsDiscount)}` 
        : '';
    const ptsLine = pointsRedeemed > 0
        ? `*(Canjeaste ${pointsRedeemed} pts + Ganas ${ptsEarned} pts nuevos)*`
        : `*(+ Acumulas ${ptsEarned} Puntos)*`;

    if (paymentMethod === 'whatsapp') {
        const waNumber = "573105913506";
        const msg = `¡Hola MilAgro! 👋\nQuiero hacer un pedido a domicilio:\n\n*Orden:* ${orderId}\n*Cliente:* ${name}\n*Dirección:* ${address}, Barrio ${barrio} (${city}, ${dept})\n\n*Mi Pedido:*\n${cartItemsText}\n*Subtotal productos:* ${formatCOP(cartSubtotal)}${discountLine}\n*Total a pagar:* ${formatCOP(cartTotal)}\n*Envío:* A convenir\n${ptsLine}\n\nPor favor envíenme el Nequi/Bancolombia.`;
        
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
        
        localStorage.removeItem('milagro_cart');
        window.open(waUrl, '_blank');
        window.location.href = `order-tracking.html?id=${orderId}`;

    } else if (paymentMethod === 'wompi') {
        const wompiContainer = document.getElementById('wompiContainer');
        wompiContainer.innerHTML = ''; 
        
        const script = document.createElement('script');
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', 'pub_test_X0zDA9ooKE8CEEE89');
        script.setAttribute('data-currency', 'COP');
        script.setAttribute('data-amount-in-cents', cartTotal * 100);
        script.setAttribute('data-reference', orderId);

        wompiContainer.appendChild(script);
        
        setTimeout(() => {
            if(confirm("Simulador Demo: ¿Simular que el pago Wompi fue exitoso?")) {
                localStorage.removeItem('milagro_cart');
                window.location.href = `order-tracking.html?id=${orderId}`;
            }
        }, 5000);
        
        showToast("Widget de Wompi generado. Simulación en 5 segs...");
    }
};
