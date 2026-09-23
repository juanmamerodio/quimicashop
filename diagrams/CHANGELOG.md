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
