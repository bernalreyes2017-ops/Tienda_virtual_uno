/**
 * MILAGRO - Generador de Facturas PDF
 * Usa jsPDF (cargado via CDN) para generar facturas descargables
 */

window.generateInvoicePDF = (orderId) => {
    const ordersDB = JSON.parse(localStorage.getItem('milagro_db_orders')) || [];
    const order = ordersDB.find(o => o.id === orderId);
    if (!order) {
        alert('Pedido no encontrado.');
        return;
    }
    _buildPDF(order);
};

window.generateInvoiceFromOrder = (order) => {
    _buildPDF(order);
};

const _buildPDF = (order) => {
    try {
        let JSPDF_CLASS = null;
        if (window.jspdf && window.jspdf.jsPDF) {
            JSPDF_CLASS = window.jspdf.jsPDF;
        } else if (typeof jsPDF !== 'undefined') {
            JSPDF_CLASS = jsPDF;
        } else if (window.jsPDF) {
            JSPDF_CLASS = window.jsPDF;
        }

        if (!JSPDF_CLASS) {
            alert('El generador de PDF aún está cargando. Por favor, espera unos segundos y vuelve a intentar.');
            return;
        }

        const doc = new JSPDF_CLASS('p', 'mm', 'a4');

    // ---- Colores ----
    const VERDE = [44, 110, 55];
    const AMARILLO = [212, 160, 0];
    const GRIS_CLARO = [240, 240, 240];
    const GRIS_TEXTO = [100, 100, 100];
    const NEGRO = [30, 30, 30];
    const BLANCO = [255, 255, 255];

    const W = 210; // ancho A4
    let y = 0;

    // ---- HEADER VERDE ----
    doc.setFillColor(...VERDE);
    doc.rect(0, 0, W, 42, 'F');

    doc.setTextColor(...BLANCO);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MilAgro CS S.A.S', 15, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Calle 29 # 39-82, Barrio Villa Caribe, Montería - Córdoba', 15, 24);
    doc.text('Tel: +57 310 5913506  |  milagrocssas@gmail.com', 15, 30);

    // Núm factura (derecha)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('FACTURA DE VENTA', W - 15, 14, { align: 'right' });
    doc.setFontSize(14);
    doc.setTextColor(...AMARILLO);
    doc.text(order.id, W - 15, 22, { align: 'right' });
    doc.setTextColor(...BLANCO);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(order.date).toLocaleDateString('es-CO', {year:'numeric', month:'long', day:'numeric'})}`, W - 15, 30, { align: 'right' });
    doc.text(`Método: ${order.method === 'whatsapp' ? 'WhatsApp / Nequi' : 'Pasarela Online'}`, W - 15, 36, { align: 'right' });

    y = 50;

    // ---- INFO CLIENTE ----
    doc.setFillColor(...GRIS_CLARO);
    doc.rect(10, y, W - 20, 28, 'F');

    doc.setTextColor(...VERDE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DATOS DEL CLIENTE', 15, y + 7);

    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Nombre: ${order.customer}`, 15, y + 14);
    doc.text(`Celular: ${order.phone}`, 15, y + 20);
    doc.text(`Dirección: ${order.address || 'N/A'}`, 15, y + 26, { maxWidth: W - 30 });

    y += 36;

    // ---- TABLA DE PRODUCTOS ----
    // Header tabla
    doc.setFillColor(...VERDE);
    doc.rect(10, y, W - 20, 8, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Producto', 13, y + 5.5);
    doc.text('Cant.', 110, y + 5.5, { align: 'center' });
    doc.text('P. Unitario', 145, y + 5.5, { align: 'center' });
    doc.text('Subtotal', W - 13, y + 5.5, { align: 'right' });

    y += 8;

    const items = order.items || [];
    items.forEach((item, idx) => {
        const rowH = 8;
        if (idx % 2 === 0) {
            doc.setFillColor(248, 252, 248);
            doc.rect(10, y, W - 20, rowH, 'F');
        }
        doc.setTextColor(...NEGRO);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        // Truncar nombre si es muy largo
        const nameTrunc = item.name.length > 45 ? item.name.substring(0, 43) + '…' : item.name;
        doc.text(nameTrunc, 13, y + 5.5);
        doc.text(String(item.quantity), 110, y + 5.5, { align: 'center' });
        doc.text(formatCOPPDF(item.price), 145, y + 5.5, { align: 'center' });
        doc.text(formatCOPPDF(item.price * item.quantity), W - 13, y + 5.5, { align: 'right' });

        y += rowH;
    });

    // Línea cierre tabla
    doc.setDrawColor(...VERDE);
    doc.setLineWidth(0.5);
    doc.line(10, y, W - 10, y);

    y += 6;

    // ---- TOTALES ----
    const subtotal = order.subtotal || order.total;
    const discount = order.pointsDiscount || 0;
    const redeemed = order.pointsRedeemed || 0;
    const total = order.total;
    const ptsEarned = Math.floor(subtotal / 1000);

    const totalsX = W - 80;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('Subtotal productos:', totalsX, y + 5);
    doc.setTextColor(...NEGRO);
    doc.text(formatCOPPDF(subtotal), W - 13, y + 5, { align: 'right' });

    if (discount > 0) {
        y += 7;
        doc.setTextColor(...GRIS_TEXTO);
        doc.text(`Descuento (${redeemed} pts):`, totalsX, y + 5);
        doc.setTextColor([200, 0, 0]);
        doc.text(`-${formatCOPPDF(discount)}`, W - 13, y + 5, { align: 'right' });
    }

    y += 7;
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('Envío:', totalsX, y + 5);
    doc.setTextColor(150, 100, 0);
    doc.text('A convenir', W - 13, y + 5, { align: 'right' });

    y += 4;
    // Separador total
    doc.setFillColor(...VERDE);
    doc.rect(totalsX - 5, y + 3, W - totalsX - 5, 9, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL A PAGAR:', totalsX - 2, y + 9.5);
    doc.text(formatCOPPDF(total), W - 13, y + 9.5, { align: 'right' });

    y += 18;

    // ---- PUNTOS FIDELIZACIÓN ----
    doc.setFillColor(...AMARILLO);
    doc.rect(10, y, W - 20, 14, 'F');
    doc.setTextColor(60, 40, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('⭐ PROGRAMA DE PUNTOS MilAgro', 15, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Ganaste ${ptsEarned} puntos con esta compra. Cada punto equivale a $15 en descuento.`, 15, y + 11);

    y += 22;

    // ---- FOOTER ----
    doc.setDrawColor(...VERDE);
    doc.setLineWidth(0.3);
    doc.line(10, y, W - 10, y);
    y += 5;

    doc.setTextColor(...GRIS_TEXTO);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('¡Gracias por tu compra en MilAgro CS S.A.S! — "Del campo a tu hogar con calidad y confianza"', W / 2, y, { align: 'center' });
    y += 5;
    doc.text('Este documento es generado electrónicamente y no requiere firma física.', W / 2, y, { align: 'center' });

    // ---- WATERMARK MUY SUTIL ----
    doc.setTextColor(246, 252, 247); // Más transparente / cercano al blanco
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('MilAgro', W / 2, 160, { align: 'center', angle: 30 });

    // ---- GUARDAR ----
    doc.save(`Factura_${order.id}.pdf`);
    
    } catch (err) {
        console.error('Error generando PDF:', err);
        alert('Ocurrió un error al generar de factura. Detalles: ' + err.message);
    }
};

// Helper: formato COP para PDF (sin DOM)
const formatCOPPDF = (value) => {
    return '$ ' + Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
