/**
 * MILAGRO - Lógica de Auth Dinámica
 * Maneja Registro de Usuarios, Login Cliente y Admin
 */

const initUsersDB = () => {
    if(!localStorage.getItem('milagro_db_users')) {
        const defaultUsers = [
            { phone: 'admin', pass: 'milagro123', name: 'Administrador', role: 'admin', points: 0, cedula: 'admin' },
            { phone: 'caja', pass: 'milagro123', name: 'Caja Punto de Venta', role: 'cajero', points: 0, cedula: 'caja' }
        ];
        localStorage.setItem('milagro_db_users', JSON.stringify(defaultUsers));
    } else {
        let users = JSON.parse(localStorage.getItem('milagro_db_users'));
        let changed = false;

        // Purga de clientes viejos sin cédula (solo clientes, nunca staff)
        const before = users.length;
        users = users.filter(u => u.role === 'admin' || u.role === 'cajero' || (u.role === 'client' && u.cedula));
        if (users.length !== before) changed = true;

        // Asegurar que admin tiene campo cedula para uniformidad
        const adminIdx = users.findIndex(u => u.role === 'admin');
        if (adminIdx > -1 && !users[adminIdx].cedula) {
            users[adminIdx].cedula = 'admin';
            changed = true;
        }

        // Asegurar que caja existe y tiene campo cedula
        let cajaIdx = users.findIndex(u => u.role === 'cajero');
        if (cajaIdx === -1) {
            users.push({ phone: 'caja', pass: 'milagro123', name: 'Caja Punto de Venta', role: 'cajero', points: 0, cedula: 'caja' });
            changed = true;
        } else if (!users[cajaIdx].cedula) {
            users[cajaIdx].cedula = 'caja';
            changed = true;
        }

        if (changed) {
            localStorage.setItem('milagro_db_users', JSON.stringify(users));
        }
    }
};

const getUsers = () => JSON.parse(localStorage.getItem('milagro_db_users')) || [];
const saveUsers = (users) => localStorage.setItem('milagro_db_users', JSON.stringify(users));

document.addEventListener('DOMContentLoaded', () => {
    initUsersDB();
    checkAdminGuard();
    updateAuthUI();
});

const getCurrentUser = () => {
    const userStr = localStorage.getItem('milagro_user');
    if(userStr) return JSON.parse(userStr);
    return null;
};

// ===================================
// Registro de Cliente Nuevo
// ===================================
window.handleRegister = (e) => {
    e.preventDefault();
    const cedula = String(document.getElementById('regCedula').value).trim();
    const phone = String(document.getElementById('regPhone').value).trim();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;

    let users = getUsers();

    // Verificar duplicados por cédula
    if(users.find(u => String(u.cedula) === cedula)) {
        alert("Esta cédula ya está registrada.");
        return;
    }

    const newUser = {
        cedula: cedula,
        phone: phone,
        email: email,
        name: name,
        pass: pass,
        role: 'client',
        points: 0
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto-login
    localStorage.setItem('milagro_user', JSON.stringify(newUser));
    window.location.href = 'mi-cuenta.html';
};

// ===================================
// Inicio de Sesión
// ===================================
window.handleLogin = (e) => {
    e.preventDefault();
    const input = document.getElementById('phoneInput').value.trim();
    const pass = document.getElementById('passInput').value;
    
    const users = getUsers();
    // Busca por cedula O por phone (para admin/caja que usan 'admin'/'caja' como phone)
    const user = users.find(u => (String(u.cedula) === input || String(u.phone) === input) && u.pass === pass);

    if(user) {
        localStorage.setItem('milagro_user', JSON.stringify(user));
        
        // Redirección por rol
        if(user.role === 'admin' || user.role === 'cajero') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'mi-cuenta.html';
        }
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
};

window.handleLogout = () => {
    localStorage.removeItem('milagro_user');
    // Detectar nivel de profundidad en la ruta
    if (window.location.pathname.includes('/admin/')) {
        window.location.href = '../../index.html';
    } else if (window.location.pathname.includes('/pages/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
};

// ===================================
// Guards y UI
// ===================================

const checkAdminGuard = () => {
    if(window.location.pathname.includes('/admin/')) {
        const user = getCurrentUser();
        if(!user || (user.role !== 'admin' && user.role !== 'cajero')) {
            alert("Acceso denegado: Área privada.");
            window.location.href = '../login.html';
            return;
        }

        // Restricciones de Cajero
        if (user.role === 'cajero') {
            const path = window.location.pathname;
            if (path.includes('inventario.html') || path.includes('clientes.html') || path.includes('reportes.html') || path.includes('configuracion.html')) {
                alert("Acceso denegado: El rol de Cajero no tiene permisos para este módulo.");
                window.location.href = 'dashboard.html';
                return;
            }
        }
    }
};

const updateAuthUI = () => {
    const user = getCurrentUser();
    const loginBtns = document.querySelectorAll('.nav-link[href$="login.html"], .btn[href$="login.html"]'); 
    const authGlobal = document.getElementById('btnAuthGlobal');
    const mobileAuth = document.getElementById('mobileAuthBtn');

    if (user) {

        if(authGlobal) {
            if(user.role === 'admin' || user.role === 'cajero') {
                authGlobal.innerHTML = `<i class="fa-solid fa-shield"></i> Panel Staff`;
                authGlobal.href = window.location.pathname.includes('/pages/') ? (window.location.pathname.includes('/admin/') ? 'dashboard.html' : 'admin/dashboard.html') : 'pages/admin/dashboard.html';
                
                if(mobileAuth) {
                    mobileAuth.innerHTML = `<i class="fa-solid fa-shield"></i> Panel Staff`;
                    mobileAuth.href = authGlobal.href;
                }
            } else {
                // Refrescar puntos del usuario desde la DB
                const freshUsers = getUsers();
                const freshUser = freshUsers.find(u => String(u.cedula) === String(user.cedula));
                const pts = freshUser ? freshUser.points : user.points;

                authGlobal.innerHTML = `<i class="fa-solid fa-user-check"></i> Hola, ${user.name.split(' ')[0]} <b style="color:var(--amarillo); margin-left:5px;">⭐ ${pts} pts</b>`;
                authGlobal.href = window.location.pathname.includes('/pages/') ? (window.location.pathname.includes('/admin/') ? '../mi-cuenta.html' : 'mi-cuenta.html') : 'pages/mi-cuenta.html';
                authGlobal.classList.remove('btn-outline');
                authGlobal.style.border = "none";
                authGlobal.style.background = "var(--verde-claro)";
                authGlobal.style.color = "var(--verde-oscuro)";
                
                if(mobileAuth) {
                    mobileAuth.innerHTML = `<i class="fa-solid fa-user-check"></i> Hola, ${user.name.split(' ')[0]} <b style="color:var(--amarillo); margin-left:5px;">⭐ ${pts} pts</b>`;
                    mobileAuth.href = authGlobal.href;
                    mobileAuth.style.background = "var(--verde-claro)";
                    mobileAuth.style.color = "var(--verde-oscuro)";
                }
            }
        } else {
            loginBtns.forEach(btn => {
                if(user.role === 'admin' || user.role === 'cajero') {
                    btn.innerHTML = `<i class="fa-solid fa-shield"></i> Panel Staff`;
                    btn.href = window.location.pathname.includes('/pages/') ? 'admin/dashboard.html' : 'pages/admin/dashboard.html';
                } else {
                    btn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${user.name}`;
                    btn.href = window.location.pathname.includes('/pages/') ? 'mi-cuenta.html' : 'pages/mi-cuenta.html';
                }
            });
            if(mobileAuth && (user.role === 'admin' || user.role === 'cajero')) {
                mobileAuth.innerHTML = `<i class="fa-solid fa-shield"></i> Panel Staff`;
                mobileAuth.href = window.location.pathname.includes('/pages/') ? 'admin/dashboard.html' : 'pages/admin/dashboard.html';
            } else if (mobileAuth && user.role === 'client') {
                mobileAuth.innerHTML = `<i class="fa-solid fa-user-check"></i> Hola, ${user.name.split(' ')[0]}`;
                mobileAuth.href = window.location.pathname.includes('/pages/') ? 'mi-cuenta.html' : 'pages/mi-cuenta.html';
                mobileAuth.style.background = "var(--verde-claro)";
                mobileAuth.style.color = "var(--verde-oscuro)";
            }
        }
        
        // Llenar vista mi cuenta específica
        const nameEl = document.getElementById('accountName');
        const pointsEl = document.getElementById('accountPoints');
        if (nameEl) nameEl.textContent = user.name;
        if (pointsEl) {
            const freshUsers = getUsers();
            const freshUser = freshUsers.find(u => String(u.cedula) === String(user.cedula));
            pointsEl.textContent = (freshUser ? freshUser.points : user.points) + ' pts';
        }
    } else {
        if(window.location.pathname.includes('mi-cuenta.html')) {
            window.location.href = 'login.html';
        }
    }
};
