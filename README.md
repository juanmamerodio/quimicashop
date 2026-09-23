# Esencia Técnica · QuimicaShop
> Sistema de Ventas de Productos Cosméticos y Control de Stock  
> **E.E.S.T N°1 Luciano Reyes** · Campana, Buenos Aires · 7mo Año Programación 2026

---

## 🌳 Árbol Estructural del Proyecto (Contexto Completo)

```
c:\Users\juanm\OneDrive\Documentos\GitHub\quimicashop\
├── index.html                      ← Hub central de documentación técnica y recursos
├── tasks.html                      ← [NUEVO] Tablero privado "Teams" estilo DevOps / Scrum
├── AGENTS.md                       ← Memoria técnica del sistema y reglas para el asistente
├── README.md                       ← Visión general, árbol de archivos y quickstart
│
├── diagrams/                       ← Documentos técnicos, memorias y diagramas
│   ├── CHANGELOG.md                ← Historial cronológico de cambios y decisiones
│   ├── informe_Escencia_Tecnica.md ← Memoria técnica académica de cátedra
│   ├── prototype1.html             ← Prototipo UX/UI web interactivo de referencia
│   └── 2209D/                      ← Diagramas CSV exportados de Lucidchart
│       ├── DCU-Quimica.csv         ← Casos de Uso (Cliente, Admin, includes/extends)
│       ├── DER-quimica.csv         ← Modelo relacional (13 tablas normalizadas)
│       ├── DFD1-Quimica.csv        ← Flujo de Datos Nivel 1 (Contexto global)
│       ├── DFD2-Quimica.csv        ← Flujo de Datos Nivel 2 (Pedidos, Stock, Alertas)
│       └── DFD3-Quimica.csv        ← Flujo de Datos Nivel 3 (Validación Admin, Cron semanal)
│
├── src/                            ← Código fuente Next.js 15 (App Router + TypeScript)
│   ├── app/                        ← Rutas principales y endpoints de API
│   ├── components/                 ← Componentes modulares React
│   └── lib/                        ← Cliente Supabase y utilidades
├── public/                         ← Activos estáticos, logos y recursos
├── package.json                    ← Dependencias del framework (Next 15, Tailwind)
└── tailwind.config.ts              ← Tokens de diseño M3 Expressive + iOS 26
```

---

## 👥 Equipo de Desarrollo y Roles

| Integrante | Rol Principal | Área de Trabajo |
|---|---|---|
| **Juan Manuel Merodio** | Full-Stack & Arquitectura | Next.js 15, Vercel CI/CD, Hub y Rutas protegidas |
| **Isabella Infante** | Diseño UX/UI & Frontend | Vistas de Catálogo, Carrito, M3 Expressive y CSS |
| **Celeste Caceres** | Lógica de Negocio & QA | Reglas de Stock, Pruebas de Reserva y Alertas |
| **Enzo Queipo** | Base de Datos & Backend | DDL de 13 Tablas en Supabase, Remitos y Resend |

**Docentes de Cátedra:** Ariel Leibouski, Cecilia Maldonado, Alejandro Nieva  
**Materias:** Proy. de Diseño e Implementación de Sistemas, Evaluación de Proyectos, Diseño de Web Dinámico  

---

## 📌 Alcance Técnico Vigente

- **Sin Validación por IA:** Se descartó Google Gemini; la validación de comprobantes bancarios la realiza el **Administrador escolar** a través de su panel privado (`/admin`).
- **Control de Stock y Reservas:** Los pedidos en espera reservan stock (`cantidad_reservada`). Si el comprobante es aprobado, descuenta definitivamente; si no es validado o se cancela, un cron job semanal reintegra automáticamente el stock cada viernes en horario de cierre escolar.
- **Emisión de Remitos:** Generación de `remitos_de_venta` tras la aprobación del pago y despacho por email al cliente vía Resend.
- **Prototipo React Native:** **Inválido / obsoleto**. La referencia interactiva oficial es [`diagrams/prototype1.html`](./diagrams/prototype1.html).

---

## 🗄️ Base de Datos: DER (13 Tablas en Supabase)

1. `Cliente` (id_cliente PK, dni, nombre, email, telefono, id_carrito FK)
2. `Pedido` (id_pedido PK, id_cliente FK, id_estado FK, fecha, total)
3. `Detalle_del_pedido` (id_pedido PK/FK, id_cliente FK, id_producto FK, estado, fecha, total, cantidad, precio_unitario)
4. `Producto` (id_producto PK, id_stock FK, id_detalle_pedido FK, nombre, categoria, tipo, descripcion, precio, tiempo_produccion)
5. `Stock` (id_stock PK, id_producto FK, categoria, tipo, descripcion, cantidad_actual, cantidad_warning, porcentaje, cantidad_reservada)
6. `Alerta_de_estado` (id_alerta PK, id_stock FK, fecha, mes, año, porcentaje, descripcion, email_contacto)
7. `Estados_pedidos` (id_estado PK, id_pedido FK, estado, fecha)
8. `Comprobante` (id_comprobante PK, id_pedido FK, foto_comprobante, fecha, total)
9. `Estados_comprobante` (id_estado PK, id_pedido FK, estado, fecha)
10. `remitos_de_venta` (id_remito PK, id_comprobante FK, id_cliente FK, fecha, total, producto_selec)
11. `Detalle_carrito` (id_carrito PK, id_cliente FK, id_producto FK, dni, nombre, email, cantidad, producto_seleccionado)
12. `Admin` (id_admin PK, dni, nombre, contrasenia)
13. `Roll` (id_rol PK, descripcion_rol)

---

## 🛠️ Panel Privado "Teams" (`tasks.html`)

El archivo [`tasks.html`](./tasks.html) funciona como entorno privado Scrum/Kanban para Juanma, Isabella, Celeste y Enzo:
- **Gestión Visual:** Columnas *Backlog*, *En Progreso*, *En Revisión* y *Completado*.
- **Persistencia Inmediata:** Almacenamiento local mediante `localStorage` con opción de exportación / respaldo en JSON.
- **Filtros por Integrante:** Vista individual por cada miembro del equipo y por etiquetas de módulo (`DATABASE`, `FRONTEND`, `BACKEND`, `STOCK`, `ADMIN`, `DOCS`).

---

## 🚀 Quickstart

```bash
npm install
npm run dev
```

El Hub principal se abre en [`index.html`](./index.html) y el panel privado en [`tasks.html`](./tasks.html).
