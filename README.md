# MilAgro CS S.A.S - Aplicación Web Comercial

Aplicación web completa, diseñada específica para **MilAgro CS S.A.S** (Montería, Colombia).

## 🌍 Arquitectura y Tecnologías
La aplicación es un sitio web estático (Frontend-Only) construido con una arquitectura "Vanilla" para máxima velocidad y fácil despliegue.

- **Estructura**: HTML5
- **Estilos**: Vanilla CSS3 (Custom Properties, Flexbox, CSS Grid)
- **Lógica**: JavaScript Vanilla (ES6+)
- **Almacenamiento**: `localStorage` (Persistencia de Carrito y Puntos de Fidelización)
- **Librerías Externas**: FontAwesome (Iconos), Chart.js (Gráficas Admin)
- **Pagos Integrados**: Widget oficial de Wompi + Botón directo a WhatsApp

## 📂 Directorios Principales
```text
milagro-app/
├── index.html              (Landing Page Principal)
├── css/                    (Design System: styles, components, animations)
├── js/                     (Archivos de lógica separados por módulo)
├── pages/                  (Interfaces Cliente: carrito, catalogo, etc)
│   └── admin/              (Interfaces Administrador: POS, inventario, etc)
├── assets/images/          (Imágenes UI e IA-Placeholders)
└── data/                   
    └── products.json       (Base de datos local ficticia)
```

## 🛠 Instalación y Despliegue
Esta aplicación no requiere un servidor backend (Node, PHP, Python) para ejecutarse.
Para correrla localmente:
1. Instala en VSCode la extensión "Live Server".
2. Clic derecho en `index.html` → "Open with Live Server".

Para publicarla de verdad en Internet, súbela gratis a plataformas como:
- **Vercel** (`npx vercel`)
- **Netlify**
- **GitHub Pages**

## 💡 Módulos Desarrollados
1. **Público (Mobile-First):**
   - Catálogo interactivo con filtros
   - Carrito funcional y Checkout (WhatsApp)
   - Pasarela Wompi lista para ser activada (modificando la variable Key en `js/checkout.js`).
   - Módulo clientes (Login, Puntos, Niveles).
2. **Administrador:**
   - Dashboard de KPIs (Ventas, Stock, Alertas).
   - Inventario CRUD visual.
   - Panel de Punto de Venta local (POS).
   - Gestión de domicilios/pedidos.

## ⚠️ Tareas Pendientes para Producción Real
1. Reemplazar las imágenes de `assets/images/categorias/` por las fotografías reales del local.
2. Actualizar `data/products.json` con el inventario verdadero exportado de Excel.
3. Si requiere guardar inventario de forma real y compartida entre varias máquinas simultáneas, será necesario migrar a una base de datos (e.g. Firebase o Supabase).
