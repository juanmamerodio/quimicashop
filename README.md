# QuimicaShop · Hub & Teams

> Centro de documentación y entorno privado de trabajo del proyecto **Esencia Técnica**.
> **E.E.S.T N°1 Luciano Reyes** · Campana, Buenos Aires · 7mo Año Programación 2026.

---

## 🧭 Alcance de este repositorio

Este repo contiene **solamente el Hub y el Teams**:

- `index.html` — Hub de documentación: DER/DCU/DFD, informe, prototipo, progreso del sprint, minutas.
- `tasks.html` + `tasks.js` — Entorno privado Teams: login tipo Netflix, Kanban, reuniones, bandeja, minutas.
- `style.css` — Sistema de diseño M3 Expressive + iOS 26/27.
- `diagrams/` — Diagramas, SQL de Supabase, minutas y documentación de cátedra.
- `config.js` — Configuración pública (Supabase URL + anon key + endpoint de notificaciones).

El **e-commerce** (tienda, checkout, `/admin`, APIs) vive en el repo
[`esenciatecnica`](https://github.com/juanmamerodio/esenciatecnica). No agregues acá código Next.js,
`package.json`, `src/` ni tablas de productos/pedidos.

```
quimicashop/
├── index.html                 ← Hub
├── tasks.html                 ← Teams
├── tasks.js                   ← Lógica de Teams + Supabase Realtime
├── style.css                  ← Diseño compartido
├── config.js                  ← Supabase (anon key) y API de notificaciones
├── diagrams/
│   ├── 2209D/                 ← DER, DCU, DFD 1/2/3
│   ├── minutas/               ← Actas oficiales
│   ├── supabase_teams_schema.sql
│   ├── create_team_discussions.sql
│   └── prototype1.html
├── .github/workflows/pages.yml ← Deploy a GitHub Pages
└── AGENTS.md / README.md
```

---

## 🚀 Cómo abrirlo

El Hub y Teams son HTML/CSS/JS estático. Para que Supabase y los `fetch` funcionen igual que en
producción, serví la carpeta por HTTP:

```bash
npx serve .
# o
python -m http.server 5500
```

- Hub: `http://localhost:3000/`
- Teams: `http://localhost:3000/tasks.html`

Abrir `index.html` con doble clic también funciona para navegar, pero el login y la sincronización
con Supabase pueden quedar bloqueados por CORS según el navegador.

---

## 🔑 Configuración y claves

Todo lo público está en `config.js`:

```js
window.QUIMICASHOP_CONFIG = {
  supabaseUrl: "https://...supabase.co",
  supabaseAnonKey: "eyJ...",              // anon key: pública por diseño
  notificationsApi: "https://.../api/notifications",
};
```

Reglas:

- **Nunca** pongas la `service_role` key, la API key de Resend ni contraseñas en `config.js`.
- La `anon key` es pública; la protección real depende de las políticas RLS de Supabase.
- Cuando se cree el proyecto Supabase exclusivo de Teams, reemplazá `supabaseUrl` y
  `supabaseAnonKey` en `config.js`. El proyecto actual queda para el e-commerce.
- El endpoint de notificaciones sigue viviendo en el deploy del ecomm (`/api/notifications`).
  Si el ecomm cambia de dominio, actualizá `notificationsApi`.
- Si se migra Teams a su propio backend de emails, borrá `notificationsApi` y apuntá `tasks.js`
  a la nueva función.

El runbook completo está en [`diagrams/SEPARACION.md`](./diagrams/SEPARACION.md).

---

## 🗄️ Supabase de Teams

Tablas complementarias (no pertenecen al e-commerce):

| Tabla | Uso |
|---|---|
| `team_members` | Perfiles, DNI, rol, badge, email y preferencias |
| `team_tasks` | Sprint backlog y Kanban |
| `task_notes` | Bitácoras por tarea |
| `task_audit_logs` | Auditoría de cambios |
| `team_meetings` | Reuniones, votos 4/4, minutas inmutables |
| `team_discussions` | Bandeja de avances, bloqueos, ayudas y debates |
| `team_discussion_comments` | Hilos de respuesta |

El DDL está en `diagrams/supabase_teams_schema.sql` y `diagrams/create_team_discussions.sql`.

> ⚠️ Las políticas RLS actuales son permisivas (`USING (true)`). Para producción hay que restringir
> la escritura a los perfiles del equipo; la anon key está publicada en `config.js` y en el JS.

---

## 👥 Equipo y gobernanza

| Integrante | Rol |
|---|---|
| Juan Manuel Merodio | Frontend & JS Lead |
| Isabella Infante | Database & SQL Architecture |
| Celeste Cáceres | Diseño UX/UI & Testing QA |
| Enzo Queipo | Backend, Admin Panel & Relaciones |

- Reunión presencial: **jueves 13:00–15:00** (Aula Taller).
- Reuniones virtuales: domingos 20:00 y jueves 21:00.
- Apertura y cierre de reunión: **unanimidad 4/4**.
- Las minutas cerradas son inmutables y se archivan en Supabase.

---

## ☁️ Deploy

GitHub Pages, con el workflow `.github/workflows/pages.yml`:

1. GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push a `main` (o ejecutar el workflow manualmente).
3. El sitio queda en `https://juanmamerodio.github.io/quimicashop/`.

El workflow publica solo `index.html`, `tasks.html`, `tasks.js`, `style.css`, `config.js` y `diagrams/`.
No publica README, AGENTS ni configuración del repo.
