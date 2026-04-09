/**
 * MILAGRO - Lógica Checkout
 */

let paymentMethod = 'wompi'; // default
let cartTotal = 0;
let cartItemsText = '';

let cartSubtotal = 0;

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
    cartTotal = cartSubtotal; // El envío NO se suma al total

    // Construir texto resumen para WhatsApp
    cart.forEach(item => {
        cartItemsText += `- ${item.quantity}x ${item.name} ($${item.price} c/u)\n`;
    });

    // Mostrar total sin envío
    document.getElementById('finalTotal').textContent = `${formatCOP(cartTotal)} (Envío a convenir)`;
});

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
        total: cartTotal,
        method: paymentMethod,
        status: 'pending' // pending, prep, sent, delivered
    };

    const ordersDB = JSON.parse(localStorage.getItem('milagro_db_orders')) || [];
    ordersDB.push(newOrder);
    localStorage.setItem('milagro_db_orders', JSON.stringify(ordersDB));

    // Acumular Puntos (1pto x cada $1000)
    const activeUser = JSON.parse(localStorage.getItem('milagro_user') || 'null');
    const ptsEarned = Math.floor(cartTotal / 1000);
    
    if (activeUser && activeUser.role === 'client') {
        const usersDB = JSON.parse(localStorage.getItem('milagro_db_users')) || [];
        const userIndex = usersDB.findIndex(u => String(u.cedula) === String(activeUser.cedula));
        if (userIndex > -1) {
            usersDB[userIndex].points = (usersDB[userIndex].points || 0) + ptsEarned;
            localStorage.setItem('milagro_db_users', JSON.stringify(usersDB));
            // update session
            activeUser.points = usersDB[userIndex].points;
            localStorage.setItem('milagro_user', JSON.stringify(activeUser));
        }
    }

    if (paymentMethod === 'whatsapp') {
        const waNumber = "573105913506";
        const msg = `¡Hola MilAgro! 👋\nQuiero hacer un pedido a domicilio:\n\n*Orden:* ${orderId}\n*Cliente:* ${name}\n*Dirección:* ${address}, Barrio ${barrio} (${city}, ${dept})\n\n*Mi Pedido:*\n${cartItemsText}\n*Subtotal productos:* ${formatCOP(cartTotal)}\n*Envío:* A convenir\n*(+ Acumulas ${ptsEarned} Puntos)*\n\nPor favor envíenme el Nequi/Bancolombia.`;
        
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
