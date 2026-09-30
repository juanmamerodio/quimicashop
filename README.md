# Esencia Técnica · QuimicaShop
> E-Commerce y Control de Stock para el Departamento de Química  
> **E.E.S.T N°1 Luciano Reyes** · Campana, Buenos Aires · 7mo Año Programación 2026  
> **Dominio Oficial de Producción:** [quimicashop.vercel.app](https://quimicashop.vercel.app)

---

## 🧭 Estado Actual del Proyecto & Dinámica de Cátedra

En base a las auditorías presenciales y la reunión de cátedra del **28 de septiembre de 2026** (con los profesores Ariel Leibouski, Cecilia Maldonado y Alejandro Nieva), el proyecto se encuentra en una **etapa madura y orientada a producción web**:

1. **Entorno de Producción Oficial:** Se ratifica `quimicashop.vercel.app` como el único entorno oficial donde se presentan las actualizaciones. El prototipo inicial de Stitch queda congelado como referencia estática.
2. **Repositorio Centralizado:** Toda la base de código se concentra en este repositorio de GitHub (`juanmamerodio/quimicashop`) para evitar desincronizaciones de versiones.
3. **Flujo de Negocio Real (Sin IA):** Se descartó definitivamente la validación automática financiera por IA (Gemini). La validación de transferencias bancarias la realiza el **Administrador escolar** a través de `/admin` con vista directa de comprobantes de Supabase Storage.
4. **Reserva y Reintegro Semanal de Stock:** El stock de los pedidos pendientes pasa a `cantidad_reservada`. Si el pedido se aprueba, descuenta de forma definitiva; si no se abona o se cancela, un proceso semanal reintegra automáticamente el stock los **viernes al cierre del taller**.
5. **Comunicaciones Transaccionales y Alertas:** Integración con **Resend** para despacho de remitos de venta al cliente y alertas al equipo sobre reuniones, tareas y bloqueos.

---

## 🌳 Árbol Estructural del Proyecto

```
quimicashop/
├── index.html                      ← Hub central de documentación técnica y recursos
├── tasks.html                      ← Panel privado "Teams": Backlog, Reuniones, Bandeja y Minutas
├── style.css                       ← Sistema de diseño unificado M3 Expressive + iOS 26/27
├── tasks.js                        ← Lógica de Teams, Realtime de Supabase y notificaciones Resend
├── AGENTS.md                       ← Memoria técnica del sistema y reglas operativas
├── README.md                       ← Visión general, arquitectura, roles y backlog vigente
│
├── diagrams/                       ← Documentación técnica, acuerdos y diagramas oficiales
│   ├── CHANGELOG.md                ← Historial cronológico de cambios de arquitectura
│   ├── informe_Escencia_Tecnica.md ← Memoria técnica académica de cátedra
│   ├── prototype1.html             ← Prototipo interactivo web de alta fidelidad
│   ├── create_team_discussions.sql ← Script DDL para bandeja de entrada y foros en Supabase
│   ├── minutas/                    ← Actas de reuniones oficiales (28-9_minutas.md, etc.)
│   └── 2209D/                      ← Diagramas relacionales y de flujo (Lucidchart)
│       ├── DCU-Quimica.csv         ← Casos de Uso (Cliente, Administrador)
│       ├── DER-quimica.csv         ← Modelo relacional normalizado (13 entidades)
│       ├── DFD1-Quimica.csv        ← Flujo de Datos Nivel 1 (Contexto global)
│       ├── DFD2-Quimica.csv        ← Flujo de Datos Nivel 2 (Pedidos, Stock, Alertas)
│       └── DFD3-Quimica.csv        ← Flujo de Datos Nivel 3 (Validación Admin, Stock semanal)
│
├── src/                            ← Código fuente Next.js 15 (App Router + TypeScript estricto)
│   ├── app/
│   │   ├── admin/                  ← Panel del Administrador (validación y despacho)
│   │   ├── api/
│   │   │   ├── notifications/      ← Endpoint de despacho de correos vía Resend
│   │   │   ├── orders/             ← Gestión de pedidos y estados
│   │   │   └── verify-payment/     ← Endpoints de comprobantes
│   │   ├── [lang]/                 ← Vistas i18n (Catálogo, Checkout, Carrito)
│   │   └── layout.tsx
│   ├── components/                 ← Componentes modulares React
│   ├── services/                   ← Servicios de negocio (OrderService, etc.)
│   └── lib/                        ← Cliente Supabase y esquemas Zod
│
├── public/                         ← Activos estáticos, logos y recursos
├── package.json                    ← Dependencias (Next.js 15, Supabase, Resend, Tailwind)
└── tailwind.config.ts              ← Paleta mineral y tokens de diseño
```

---

## 👥 Equipo de Desarrollo y Asignación de Roles

| Integrante | Rol Oficial en Teams | Foco de Trabajo & Responsabilidades Actuales |
|---|---|---|
| **Juan Manuel Merodio** | *Frontend & JS Lead* | Arquitectura Next.js 15, Panel `/admin`, despacho de remitos, Hub Teams e integración Resend |
| **Isabella Infante** | *Database & SQL Architecture* | DDL de las 13 entidades en Supabase, diagramas de clases, DFD y validación de checkout |
| **Celeste Cáceres** | *Diseño UX/UI & Testing QA* | Planillas de casos de uso (2 por actor), redacción formal de Términos y Condiciones HTML, pruebas de stock |
| **Enzo Queipo** | *Backend, Admin Panel & Relaciones* | APIs de servicio, control de acceso basado en roles (RBAC) y automatización de alertas de stock |

**Cátedra Docente:** Ariel Leibouski, Cecilia Maldonado, Alejandro Nieva.  
**Cronograma Semanal de Trabajo:**  
- **Reunión Presencial de Taller:** Jueves de 13:00 a 15:00 hs (Aula Taller E.E.S.T N°1).  
- **Reuniones Virtuales de Sincronización:** Domingos 20:00 hs y Jueves 21:00 hs (con votación unánime 4/4 en Teams).  
- **Evento Especial:** Asistencia y presentación en Expo Escobar el **29 de octubre de 2026**.

---

## 🛠️ Entorno Privado "Teams" (`tasks.html`)

El panel privado centraliza el ciclo de vida Scrum/DevOps del equipo:
- **Autenticación tipo Netflix:** Perfiles personales protegidos por clave/DNI con sesión continua y modo Invitado (Solo Lectura).
- **Tablero Kanban:** Control de estados (*Backlog*, *En Progreso*, *En Revisión*, *Listo*) con auditoría de horas cátedra y entidad del DER asociada.
- **Bandeja de Entrada & Foro de Debates:** Espacio tipo mailbox para registrar avances, trabas/bloqueos, pedidos de ayuda y discusiones técnicas con hilos de respuestas y marcado en negrita (*"A visualizar"*).
- **Gobernanza Unánime de Reuniones:** Votación estricta 4/4 para confirmar llamadas Meet, pizarra fullscreen colaborativa y votación unánime para bloquear y archivar actas inmutables.
- **Despacho Automático de Correos (Resend):** Notificaciones instantáneas por email al convocar reuniones, confirmar Meets, archivar minutas, completar tareas o reportar bloqueos técnicos.

---

## 🗄️ Modelo de Datos: 13 Tablas Normalizadas (Supabase)

El sistema implementa la integridad referencial del DER oficial (`diagrams/DER-quimica.csv`):

1. `Cliente` (`id_cliente PK`, `dni`, `nombre`, `email`, `telefono`, `id_carrito FK`)
2. `Pedido` (`id_pedido PK`, `id_cliente FK`, `id_estado FK`, `fecha`, `total`)
3. `Detalle_del_pedido` (`id_pedido PK/FK`, `id_cliente FK`, `id_producto FK`, `estado`, `fecha`, `total`, `cantidad`, `precio_unitario`)
4. `Producto` (`id_producto PK`, `id_stock FK`, `id_detalle_pedido FK`, `nombre`, `categoria`, `tipo`, `descripcion`, `precio`, `tiempo_produccion`)
5. `Stock` (`id_stock PK`, `id_producto FK`, `categoria`, `tipo`, `descripcion`, `cantidad_actual`, `cantidad_warning`, `porcentaje`, `cantidad_reservada`)
6. `Alerta_de_estado` (`id_alerta PK`, `id_stock FK`, `fecha`, `mes`, `año`, `porcentaje`, `descripcion`, `email_contacto`)
7. `Estados_pedidos` (`id_estado PK`, `id_pedido FK`, `estado`, `fecha`)
8. `Comprobante` (`id_comprobante PK`, `id_pedido FK`, `foto_comprobante`, `fecha`, `total`)
9. `Estados_comprobante` (`id_estado PK`, `id_pedido FK`, `estado`, `fecha`)
10. `remitos_de_venta` (`id_remito PK`, `id_comprobante FK`, `id_cliente FK`, `fecha`, `total`, `producto_selec`)
11. `Detalle_carrito` (`id_carrito PK`, `id_cliente FK`, `id_producto FK`, `dni`, `nombre`, `email`, `cantidad`, `producto_seleccionado`)
12. `Admin` (`id_admin PK`, `dni`, `nombre`, `contrasenia`)
13. `Roll` (`id_rol PK`, `descripcion_rol`)

*Tablas auxiliares para el entorno de equipo:* `team_members`, `team_tasks`, `task_notes`, `team_meetings`, `team_discussions` y `team_discussion_comments`.

---

## 📋 Diagnóstico de Orientación: ¿Qué falta crear y cómo estamos orientados?

### ✅ Lo que está completamente consolidado:
- Arquitectura Next.js 15 compilando sin errores (`npm run build`).
- DER de 13 tablas diseñado y normalizado con DFD en 3 niveles.
- Tablero Teams con autenticación, Kanban, bandeja de avances y minutas de gobernanza.
- Integración de Resend operativa con endpoints API y variables de entorno seguras.
- Minuta oficial del 28 de septiembre archivada y sincronizada en Supabase.

### ⏳ Próximos entregables comprometidos en las minutas:
1. **Planillas de Casos de Uso (Celeste):** Estructurar las planillas formales en tablas con al menos 2 casos por actor (Cliente y Administrador).
2. **Diagrama de Clases (Isabella):** Finalizar el diagrama formal de clases que vincule las entidades con la capa de servicios.
3. **Términos y Condiciones Legales (Celeste):** Redacción del documento HTML formal de políticas de compra y uso del sistema.
4. **Panel `/admin` con emisión de Remitos (Juanma & Enzo):** Vista de inspección de comprobantes bancarios, aprobación manual y despacho automático del remito formal PDF/HTML por Resend.
5. **Cron de Liberación de Stock (Viernes):** Rutina programada para devolver a stock disponible las compras no convalidadas.

---

## 🚀 Quickstart Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno en .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# RESEND_API_KEY=...

# 3. Iniciar servidor de desarrollo
npm run dev
```

- **Web App:** [http://localhost:3000](http://localhost:3000)
- **Centro Teams:** [http://localhost:3000/tasks.html](http://localhost:3000/tasks.html) o apertura directa de `tasks.html`.
- **Hub de Documentación:** `index.html`.
