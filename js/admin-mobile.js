/**
 * MILAGRO - Sidebar Admin Responsive
 * Inyecta el botón hamburguesa y lógica de apertura/cierre
 * en todas las páginas admin
 */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.admin-sidebar');
    if (!sidebar) return;

    // ---- Crear overlay ----
    const overlay = document.createElement('div');
    overlay.className = 'admin-sidebar-overlay';
    overlay.id = 'adminSidebarOverlay';
    document.body.appendChild(overlay);

    // ---- Crear botón hamburguesa ----
    const btn = document.createElement('button');
    btn.className = 'admin-hamburger';
    btn.setAttribute('aria-label', 'Abrir menú admin');
    btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.appendChild(btn);

    const openSidebar = () => {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    };

    btn.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Cerrar al hacer click en un link del sidebar
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            // Solo cerrar en mobile (cuando el overlay aplica)
            if (window.innerWidth <= 900) closeSidebar();
        });
    });
});
