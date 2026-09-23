# Historial y Registro Cronológico de Cambios (Changelog de Relevamiento)
> **Proyecto:** Esencia Técnica / QuimicaShop  
> **Institución:** E.E.S.T N°1 Luciano Reyes · 7mo Año Programación 2026  
> **Equipo de Desarrollo:** Isabella Infante, Juan Manuel Merodio, Celeste Caceres, Enzo Queipo

Este documento centraliza el relevamiento histórico de todas las decisiones de diseño, modificaciones en diagramas (DFD, DER, DCU), arquitecturas y documentación técnica.

---

## 📌 Formato Estándar de Registro

Cada cambio registrado sigue esta estructura:

```markdown
### [YYYY-MM-DD] Título del Cambio / Módulo afectado
- **Autor / Responsable:** Nombre del integrante
- **Artefactos Modificados:** Enlaces a Lucidchart, archivos CSV o código fuente
- **¿Por qué se hizo? (Motivo):** Justificación y causa raíz del cambio
- **¿Qué hizo el cambio? (Impacto Técnico):** Detalle de qué entidades, flujos, atributos o endpoints se agregaron o alteraron
- **Efectos Secundarios / Verificación:** Cómo se valida que no rompa el resto del sistema
```

---

## 🕒 Registro de Cambios Cronológicos

### [2026-09-22] Sincronización Realtime con Supabase, Persistencia Remota de Roles y Gestión de Emails
- **Autor / Responsable:** Juan Manuel Merodio (QA & Arquitectura) & Senior Full-Stack Lead
- **Artefactos Modificados:** `tasks.js`, `tasks.html`, `diagrams/CHANGELOG.md`
- **¿Por qué se hizo? (Motivo):** Conectar la interfaz de Teams con las tablas recientemente migradas en Supabase (`team_members`, `team_tasks`, `team_meetings`, `task_notes`), permitiendo persistencia remota de roles con auditoría, recolección de correos electrónicos para Meet y sincronización en vivo mediante WebSockets de PostgreSQL (`supabase.channel`).
- **¿Qué hizo el cambio? (Impacto Técnico):**
  - **Persistencia en `team_members`:** `handleSaveRole()` ahora ejecuta un `UPDATE team_members` con marca de tiempo UTC y usuario autor en Supabase, además de la copia en caché local.
  - **Campo y Display de Email:** Se agregó el input de correo en `editRoleModal` y visualización sutil en las tarjetas de perfil para viabilizar el sistema de notificaciones.
  - **Suscripción Realtime:** Se implementó `supabaseClient.channel('realtime_teams_hub')` escuchando eventos `INSERT`, `UPDATE` y `DELETE` en `team_tasks`, `team_meetings` y `team_members`.
  - **Verificación de Producción:** Se validó la compilación de producción (`npm run build` en Next.js 15) resultando en 0 errores.

---

### [2026-09-22] Auditoría Senior Full-Stack: Seguridad de Roles, Autoría Estricta, Minutas Presenciales y Planes Técnicos
- **Autor / Responsable:** Juan Manuel Merodio (QA & Arquitectura) & Senior Full-Stack Lead
- **Artefactos Modificados:** `tasks.html`, `tasks.js`, `AGENTS.md`, `diagrams/CHANGELOG.md`, `diagrams/PLAN_NOTIFICACIONES_EMAIL.md`, `diagrams/PLAN_MOBILE_MEDIA_QUERIES_IOS27.md`, `.agents/skills/media-queries-ios-pro/SKILL.md`
- **¿Por qué se hizo? (Motivo):** Corregir fallos de control de acceso (cada usuario solo debe editar su propio rol, notas asociadas de forma inmutable al perfil activo sin poder elegir otros integrantes), desvincular la reunión presencial de una llamada virtual habilitando un modal específico que solo se edita en días de clase (Jueves), y formalizar los planes de arquitectura para notificaciones por email y responsive design iOS 27.
- **¿Qué hizo el cambio? (Impacto Técnico):**
  - **Edición de Roles Propios:** El botón "Editar Mi Rol" solo se renderiza en la tarjeta del usuario logueado (`currentUser.key === key`), y la función `handleSaveRole()` bloquea cualquier intento de payload para otros miembros.
  - **Autoría Estricta de Notas:** Se eliminó el `<select>` libre de autor en el modal de tareas; ahora se deriva directamente del perfil autenticado con badge visual y avatar.
  - **Minutas Presenciales (Jueves 13 a 15 hs):** Se desacopló de la creación de Google Meet. Abre un modal dedicado (`#presencialMinuteModal`) que verifica `isPresencialMeetingToday()`; si no es jueves, mantiene el contenido en modo lectura (`disabled`) con aviso explicativo.
  - **Plan de Notificaciones por Email:** Documentado en [`diagrams/PLAN_NOTIFICACIONES_EMAIL.md`](./diagrams/PLAN_NOTIFICACIONES_EMAIL.md) integrando Resend con Supabase.
  - **Plan y Skill Mobile iOS 27:** Documentado en [`diagrams/PLAN_MOBILE_MEDIA_QUERIES_IOS27.md`](./diagrams/PLAN_MOBILE_MEDIA_QUERIES_IOS27.md) y creado el estándar de agencia en [`.agents/skills/media-queries-ios-pro/SKILL.md`](../.agents/skills/media-queries-ios-pro/SKILL.md).

---

### [2026-09-22] Desacople y Modularización Arquitectónica: Extracción de style.css y tasks.js
- **Autor / Responsable:** Juan Manuel Merodio & Equipo de Programación
- **Artefactos Modificados:** `style.css`, `tasks.js`, `index.html`, `tasks.html`, `diagrams/CHANGELOG.md`
- **¿Por qué se hizo? (Motivo):** Reducir drásticamente el peso y la redundancia de código incrustado en los archivos HTML (`tasks.html` tenía 2859 líneas y 970+ líneas de CSS; `index.html` tenía 1929 líneas con estilos duplicados). Mejorar la mantenibilidad, legibilidad y separación de incumbencias (Separation of Concerns).
- **¿Qué hizo el cambio? (Impacto Técnico):**
  - Se creó [`style.css`](./style.css) unificando el design system M3 Expressive + iOS 26, componentes de Hub, Kanban, modales, meetings y tarjetas de equipo.
  - Se vinculó `<link rel="stylesheet" href="./style.css" />` en `index.html` y `tasks.html`, eliminando cerca de 1900 líneas de CSS repetidas.
  - Se extrajo toda la lógica operativa del cliente en [`tasks.js`](./tasks.js) (660 líneas de JS modular) y se enlazó como script externo en `tasks.html`, reduciendo el archivo a solo 636 líneas de marcado semántico limpio.

---

### [2026-09-22] Resolución de Auditoría QA: Cancelación de Llamadas, Edición de Roles, Reunión Presencial y Minutas
- **Autor / Responsable:** Juan Manuel Merodio & Equipo de Programación
- **Artefactos Modificados:** `tasks.html`, `AGENTS.md`, `diagrams/CHANGELOG.md`
- **¿Por qué se hizo? (Motivo):** Resolver las 6 observaciones reportadas en la auditoría de calidad (cancelación de convocatorias, apertura del modal de creación de tareas, apartado visible de historial de minutas, recordatorio y minuta para reunión presencial fija de los jueves de 13 a 15 hs, edición de roles y visualización uniforme de tareas de Enzo).
- **¿Qué hizo el cambio? (Impacto Técnico):**
  - **Cancelación de Votación / Reunión:** Se incorporó el botón "✕ Cancelar" en el banner de la reunión que permite al creador (o integrantes) anular la convocatoria, borrándola de `localStorage` y de la tabla `team_meetings` de Supabase.
  - **Creación de Tareas:** Se reforzó la apertura de `taskModal` con reseteo de campos y asignación automática del perfil activo.
  - **Historial Explayado de Minutas:** Se integró la sección `#minutesHistorySection` con grid de tarjetas de minutas archivadas, fechas, motivos y acuerdos inmutables.
  - **Reunión Presencial de Cátedra:** Tarjeta fija interactiva con temporizador al próximo **Jueves (13:00 - 15:00 hs)** y botón directo para levantar minuta presencial de cátedra.
  - **Edición de Roles Dinámica:** Se añadieron botones de edición en cada tarjeta de integrante (`#editRoleModal`) que permiten actualizar el rol y las tecnologías asociadas con persistencia local (`quimicashop_team_roles_v1`).
  - **Visualización de Tareas de Enzo:** Normalización insensible a mayúsculas/minúsculas y subcadenas para el filtro de asignación, garantizando que las tareas de Enzo Queipo se listen tanto en "Todas" como en el filtro "Enzo".

---

### [2026-09-22] Implementación de Teams Hub: Login Netflix, Módulo Meetings con Votación Unánime y Minutas
- **Autor / Responsable:** Juan Manuel Merodio & Equipo de Programación
- **Artefactos Modificados:** `tasks.html`, `index.html`, `AGENTS.md`, `diagrams/CHANGELOG.md`
- **¿Por qué se hizo? (Motivo):** Proporcionar al equipo un entorno privado y ágil de organización interna (Sprint Backlog, bitácoras) y gobernanza de reuniones, exigiendo el consenso total del grupo antes de convocar y cerrar llamadas.
- **¿Qué hizo el cambio? (Impacto Técnico):**
  - **Login tipo Netflix:** Selector visual de perfiles (Juanma, Isabella, Celeste, Enzo) con autenticación por DNI y persistencia continua en `localStorage`. Opción de acceso para Invitados (read-only estricto).
  - **Módulo Meetings & Cuenta Regresiva:** Botón distintivo "Crear Meeting", banner dinámico con countdown y sistema de votación unánime (4/4) para habilitar el link de Google Meet.
  - **Pizarra Fullscreen & Minutas Inmutables:** Modal en pantalla completa con redacción de minutas colaborativas y tareas del sprint. El cierre requiere votación de todos los integrantes, archivando la minuta de forma permanente e inmutable.
  - **Esquema Supabase:** Diseñado para tabla `team_meetings` y `task_notes`.

---

### [2026-09-22] Ajuste de Alcance Final: Eliminación de Validación por IA y Deprecación de React Native
- **Autor / Responsable:** Juan Manuel Merodio & Equipo de Programación
- **Artefactos Modificados:** `AGENTS.md`, `README.md`, `diagrams/CHANGELOG.md`, `index.html`
- **¿Por qué se hizo? (Motivo):** Se determinó en base al informe final de cátedra que la validación de comprobantes debe ser 100% supervisada y auditada por el Administrador escolar, evitando dependencias externas de IA como Gemini. A su vez, el prototipo mobile en React Native queda formalmente inválido y descartado por desfase con el nuevo modelo relacional.
- **¿Qué hizo el cambio? (Impacto Técnico):**
  - Se eliminaron las referencias a validación bancaria automática con Google Gemini 1.5 Flash.
  - Se formalizó la validación manual por parte del Admin en DFD N3 (`Validar por admin 1.5.2`) y DER (`Estados_comprobante`).
  - Se estableció `diagrams/prototype1.html` como la maqueta funcional web de referencia única.
  - Actualización del Hub de documentación para reflejar el estado real.

---

### [2026-09-22] Incorporación del Informe de Cátedra "Esencia Técnica"
- **Autor / Responsable:** Juan Manuel Merodio & Equipo de Programación
- **Artefactos Modificados:** `index.html`, `diagrams/informe_Escencia_Tecnica.md`, Google Docs oficial
- **¿Por qué se hizo?:** Formalizar y vincular los fundamentos pedagógicos y técnicos del proyecto para las materias de *Proy. de Diseño e Implementación de Sistemas*, *Evaluación de proyectos* y *Diseño de web dinámico*.
- **¿Qué hizo el cambio?:** Se integró la tarjeta de cátedra con acceso al Google Doc interactivo y al markdown local, fijando los objetivos, alcances del sistema (inclusiones y exclusiones) y división de roles.

---

### [2026-09-22] Modelado y Publicación del Diagrama de Casos de Uso (DCU)
- **Autor / Responsable:** Equipo de Programación
- **Artefactos Modificados:** `diagrams/DCU-Quimica.csv`, Lucidchart DCU, `index.html`
- **¿Por qué se hizo?:** Faltaba delimitar formalmente la interacción funcional entre los actores *Cliente* y *Admin* para la subida de comprobantes y validación financiera.
- **¿Qué hizo el cambio?:** Mapeo de casos de uso con relaciones `<<incluye>>` (Generar carrito -> Confirmar pedido -> Cargar comprobante) y `<<extend>>` (Visualizar blog, Cambiar estados de comprobante). Generación de CSV y tarjeta en el hub.

---

### [2026-08-20] Integración de Presentación Gamma & Ruta Crítica (CMP)
- **Autor / Responsable:** Equipo de Programación
- **Artefactos Modificados:** `index.html`, Gamma App Presentation
- **¿Por qué se hizo?:** Proveer una vista de presentación ejecutiva rápida para que docentes y evaluadores comprendan la inversión de tiempos del ciclo lectivo y el método de la ruta crítica (CMP).
- **¿Qué hizo el cambio?:** Tarjeta interactiva con deep link directo a Gamma App en modo presentación.

---

### [2026-08-10] Modelado de Diagramas de Flujo de Datos (DFD N1, N2 y N3)
- **Autor / Responsable:** Equipo de Programación
- **Artefactos Modificados:** `diagrams/DFD1-Quimica.csv`, `diagrams/DFD2-Quimica.csv`, `diagrams/DFD3-Quimica.csv`, Lucidchart
- **¿Por qué se hizo?:** Entender el flujo integral del sistema y definir la factibilidad y complejidad del proyecto: generación de comprobantes, pagos, gestión de pedidos y control de stock con alertas.
- **¿Qué hizo el cambio?:**
  - **Nivel 1:** Contexto general, actores Cliente y Admin, procesos de pedidos, stock, alertas y temporizador.
  - **Nivel 2:** Gestión de pedidos (alta, consulta, pago), modificación de stock y alertas.
  - **Nivel 3:** Registro de comprobantes, validación por admin, emisión y envío de remitos por email, y cron semanal de viernes para reintegrar stock de compras no ejecutadas.

---

### [2026-07-15] Diseño del Modelo Relacional Extendido (DER) de 13 Tablas
- **Autor / Responsable:** Equipo de Programación
- **Artefactos Modificados:** `diagrams/DER-quimica.csv`, Lucidchart DER
- **¿Por qué se hizo?:** Comprender las relaciones integrales de la base de datos relacional y asegurar una auditoría estricta para futuro desarrollo SQL y backend sin acoplamientos.
- **¿Qué hizo el cambio?:** Modelado de las 13 entidades completas (`Cliente`, `Pedido`, `Detalle_del_pedido`, `Producto`, `Stock`, `Alerta_de_estado`, `Estados_pedidos`, `Comprobante`, `Estados_comprobante`, `remitos_de_venta`, `Detalle_carrito`, `Admin`, `Roll`) con sus relaciones y claves foráneas.
