/**
 * MILAGRO - Menú Móvil Desplegable
 * Se inyecta en todas las páginas públicas
 */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    // Detectar si estamos en raíz o en /pages/
    const isRoot = !window.location.pathname.includes('/pages/');
    const prefix = isRoot ? './pages/' : '';
    const indexPath = isRoot ? 'index.html' : '../index.html';

    // ---- Crear botón hamburguesa si no existe ----
    let menuBtn = header.querySelector('.mobile-menu-btn');
    if (!menuBtn) {
        const actions = header.querySelector('.header-actions') || header.querySelector('.header-container');
        menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.setAttribute('aria-label', 'Abrir menú');
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        actions.appendChild(menuBtn);
    }

    // ---- Crear overlay del menú móvil ----
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'mobileMenuOverlay';

    // Obtener el auth button actual
    const authBtn = document.getElementById('btnAuthGlobal');
    const authHref = authBtn ? authBtn.getAttribute('href') : (prefix + 'login.html');
    const authText = authBtn ? authBtn.innerHTML : '<i class="fa-solid fa-user"></i> Ingresar';

    overlay.innerHTML = `
        <div class="mobile-menu-panel">
            <div class="mobile-menu-header">
                <a href="${indexPath}" style="text-decoration:none; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-seedling" style="color:var(--verde-oscuro); font-size:1.5rem;"></i>
                    <span style="font-size:1.3rem; font-weight:800;"><span style="color:var(--amarillo);">Mil</span><span style="color:var(--verde-oscuro);">Agro</span></span>
                </a>
                <button class="mobile-menu-close" aria-label="Cerrar menú"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <nav class="mobile-menu-nav">
                <a href="${indexPath}"><i class="fa-solid fa-house"></i> Inicio</a>
                <a href="${indexPath}#nosotros"><i class="fa-solid fa-info-circle"></i> Nosotros</a>
                <a href="${prefix}catalogo.html"><i class="fa-solid fa-store"></i> Catálogo</a>
                <a href="${prefix}delivery.html"><i class="fa-solid fa-truck"></i> Domicilios</a>
                <a href="${prefix}contacto.html"><i class="fa-solid fa-envelope"></i> Contacto</a>
                <a href="${prefix}carrito.html"><i class="fa-solid fa-cart-shopping"></i> Mi Carrito</a>
            </nav>
            <div class="mobile-menu-footer">
                <a href="${authHref}" class="mobile-auth-btn" id="mobileAuthBtn">${authText}</a>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // ---- Toggle Logic ----
    const panel = overlay.querySelector('.mobile-menu-panel');
    const closeBtn = overlay.querySelector('.mobile-menu-close');

    const openMenu = () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMenu();
    });

    // Cerrar al hacer click en un link del menú
    overlay.querySelectorAll('.mobile-menu-nav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ---- Sincronizar auth state con el menú móvil ----
    const syncMobileAuth = () => {
        const mobileAuth = document.getElementById('mobileAuthBtn');
        const mainAuth = document.getElementById('btnAuthGlobal');
        if (mobileAuth && mainAuth) {
            mobileAuth.href = mainAuth.href;
            mobileAuth.innerHTML = mainAuth.innerHTML;
        }
    };

    // Ejecutar después de que auth.js actualice la UI
    setTimeout(syncMobileAuth, 200);
});
