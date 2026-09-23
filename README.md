# Esencia Técnica · QuimicaShop
> Sistema de Ventas de Productos Cosméticos y Control de Stock  
> **E.E.S.T N°1 Luciano Reyes** · Campana, Buenos Aires · 7mo Año Programación 2026

**Integrantes:** Isabella Infante, Juan Manuel Merodio, Celeste Caceres, Enzo Queipo  
**Docentes de Cátedra:** Ariel Leibouski, Cecilia Maldonado, Alejandro Nieva  
**Materias:** Proy. de Diseño e Implementación de Sistemas, Evaluación de Proyectos, Diseño de Web Dinámico  

---

## 📌 Alcance del Sistema Vigente

El proyecto automatiza el proceso de ventas del departamento de Química de la institución escolar:
- **Gestión de Stock e Inventario:** Control de stock disponible, porcentaje de reserva y reingreso de stock reservado no ejecutado (cron semanal de los viernes).
- **Flujo de Pedidos y Validación:** Subida de comprobante bancario por el cliente y **validación manual por parte del Administrador** a través de su panel de gestión (aprobación/rechazo y cambio de estados).
- **Emisión de Remitos:** Generación de remitos de venta tras la validación del comprobante y envío de confirmaciones.
- **Acceso:** Panel de administración autenticado y catálogo público con información de productos químicos y cosméticos.

> [!NOTE]
> **Aclaración sobre IA y Prototipos:**
> - **Sin Validación por IA:** No se utiliza inteligencia artificial para validar comprobantes bancarios; el flujo es 100% supervisado por el administrador humano de la cátedra.
> - **Prototipos:** El prototipo en React Native ha quedado **inválido/obsoleto** debido a cambios de arquitectura y flujos de reserva. El prototipo web funcional y maqueta UX/UI de referencia oficial es [`diagrams/prototype1.html`](./diagrams/prototype1.html).

---

## 📂 Diagramas y Modelos del Sistema

Todos los diagramas técnicos se encuentran en la carpeta `diagrams/` y están anclados con enlaces editables en el **Hub de Documentación** ([`index.html`](./index.html)):

1. **DER (Modelo Relacional):** [`diagrams/DER-quimica.csv`](./diagrams/DER-quimica.csv) — 13 entidades normalizadas (Cliente, Pedido, Detalle_del_pedido, Producto, Stock, Alerta_de_estado, Estados_pedidos, Comprobante, Estados_comprobante, remitos_de_venta, Detalle_carrito, Admin, Roll).
2. **DCU (Casos de Uso UML):** [`diagrams/DCU-Quimica.csv`](./diagrams/DCU-Quimica.csv) — Actores Cliente y Admin, flujos con `<<incluye>>` y `<<extend>>`.
3. **DFD (Flujo de Datos):**
   - Nivel 1: [`diagrams/DFD1-Quimica.csv`](./diagrams/DFD1-Quimica.csv) — Visión de contexto y procesos principales.
   - Nivel 2: [`diagrams/DFD2-Quimica.csv`](./diagrams/DFD2-Quimica.csv) — Descomposición de pedidos, stock y alertas.
   - Nivel 3: [`diagrams/DFD3-Quimica.csv`](./diagrams/DFD3-Quimica.csv) — Validación humana por admin, temporizador semanal y remitos.
4. **Memoria Técnica:** [`diagrams/informe_Escencia_Tecnica.md`](./diagrams/informe_Escencia_Tecnica.md).
5. **Historial de Decisiones:** [`diagrams/CHANGELOG.md`](./diagrams/CHANGELOG.md).

---

## 🚀 Puesta en Marcha (Entorno de Desarrollo)

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.
El hub de documentación estática y diagramas se visualiza abriendo directamente [`index.html`](./index.html).
