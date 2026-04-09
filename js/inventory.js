/**
 * MILAGRO - Lógica de Inventario Admin con CRUD en LocalStorage
 */

let invProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener la base de datos de productos (que ahora viene de LocalStorage)
    invProducts = await fetchProducts();
    renderInventory(invProducts);

    // 2. Event Listeners Búsqueda
    document.getElementById('invSearch').addEventListener('input', filterInv);
    document.getElementById('invFilter').addEventListener('change', filterInv);
    
    // 3. Listener conversión archivo a B64
    document.getElementById('prodImageFile').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64Content = await fileToBase64(file);
                document.getElementById('prodBase64Image').value = base64Content;
            } catch (err) {
                alert("Error leyendo la imagen.");
            }
        }
    });
});

const filterInv = () => {
    const q = document.getElementById('invSearch').value.toLowerCase();
    const filter = document.getElementById('invFilter').value;

    let filtered = invProducts;

    if (q) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.id.toLowerCase().includes(q)
        );
    }

    if (filter === 'low') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
    } else if (filter === 'out') {
        filtered = filtered.filter(p => parseInt(p.stock) === 0);
    }

    renderInventory(filtered);
};

const renderInventory = (products) => {
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Vaya... El catálogo está vacío. Comienza a subir productos.</td></tr>`;
        return;
    }

    let html = '';
    products.forEach(p => {
        let statusHtml = '';
        if (parseInt(p.stock) === 0) {
            statusHtml = `<span class="status-badge status-out">Agotado</span>`;
        } else if (parseInt(p.stock) <= 10) {
            statusHtml = `<span class="status-badge status-low">Bajo</span>`;
        } else {
            statusHtml = `<span class="status-badge status-ok">Normal</span>`;
        }
        
        let thumb = p.image || '../../assets/images/hero-bg.jpg';

        html += `
            <tr>
                <td style="display:flex; align-items:center; gap:10px;">
                    <img src="${thumb}" style="width:40px; height:40px; object-fit:cover; border-radius:5px;">
                    <strong>${p.id}</strong>
                </td>
                <td style="font-weight:600;">${p.name}</td>
                <td><span style="text-transform:capitalize;">${p.category}</span></td>
                <td>${formatCOP(p.price)}</td>
                <td>${p.stock}</td>
                <td>${statusHtml}</td>
                <td class="action-btns">
                    <button class="btn-edit" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
};

// ===============================================
// Lógica del Modal Form CRUD
// ===============================================
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

window.openProductModal = () => {
    form.reset();
    document.getElementById('prodEditId').value = '';
    document.getElementById('prodBase64Image').value = '';
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('prodId').readOnly = false; // Permitir setear ID
    modal.style.display = 'flex';
};

window.closeProductModal = () => {
    modal.style.display = 'none';
};

window.handleSaveProduct = (e) => {
    e.preventDefault();

    const editId = document.getElementById('prodEditId').value;
    const isEdit = !!editId;
    
    // Recolectar datos
    const productData = {
        id: document.getElementById('prodId').value,
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        stock: parseInt(document.getElementById('prodStock').value),
        description: document.getElementById('prodDesc').value,
        image: document.getElementById('prodBase64Image').value || '../../assets/images/categorias/bovinos.jpg' // Default general
    };

    if (isEdit) {
        // Encontrar índice y reemplazar
        const index = invProducts.findIndex(p => p.id === editId);
        if(index !== -1) {
            // Si no subió foto nueva y tenía una vieja, conservar la vieja
            if(!document.getElementById('prodBase64Image').value && invProducts[index].image) {
                productData.image = invProducts[index].image; 
            }
            invProducts[index] = productData;
        }
    } else {
        // Al crear, el ID no debería existir
        if(invProducts.find(p => p.id === productData.id)) {
            alert('¡Ojo! Este Código de producto ya existe.');
            return;
        }
        invProducts.push(productData);
    }

    // Persistir DB
    saveProductsDB(invProducts);
    
    // Cerrar y refrescar tabla
    closeProductModal();
    renderInventory(invProducts);
};

window.editProduct = (id) => {
    const prod = invProducts.find(p => p.id === id);
    if(prod) {
        document.getElementById('prodEditId').value = prod.id;
        document.getElementById('prodId').value = prod.id;
        document.getElementById('prodId').readOnly = true; // No cambiar ID
        document.getElementById('prodName').value = prod.name;
        document.getElementById('prodCategory').value = prod.category;
        document.getElementById('prodPrice').value = prod.price;
        document.getElementById('prodStock').value = prod.stock;
        document.getElementById('prodDesc').value = prod.description;
        document.getElementById('prodBase64Image').value = ''; // Reset, si quiere subir nueva la sube
        
        document.getElementById('modalTitle').textContent = 'Editar ' + prod.name;
        modal.style.display = 'flex';
    }
};

window.deleteProduct = (id) => {
    if(confirm(`¿Estás seguro de eliminar el producto ${id} permanentemente?`)) {
        invProducts = invProducts.filter(p => p.id !== id);
        saveProductsDB(invProducts);
        renderInventory(invProducts);
    }
};
