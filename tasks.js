// ==========================================
// QUIMICASHOP · TEAMS SCRIPT (tasks.js)
// Gestión de tareas, autenticación Netflix,
// gobernanza de reuniones, roles y minutas.
// ==========================================

// CREDENCIALES DE SUPABASE DEL PROYECTO
const SUPABASE_URL = "https://uchyattzuhaltsaxazce.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHlhdHR6dWhhbHRzYXhhemNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Njg1MzgsImV4cCI6MjA5MTA0NDUzOH0.uEDBFqcqMcUaI_QdcMj0HsvF4ZUvWntFu_CcTMTdY-I";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// BASE DE DATOS INICIAL DEL EQUIPO (Fallback / Seed)
const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Migración de 13 Tablas en Supabase SQL",
    desc: "Crear DDL con llaves foráneas para Cliente, Pedido, Detalle_del_pedido, Stock, Comprobante y remitos según DER-quimica.csv.",
    assignee: "Enzo",
    status: "in_progress",
    tag: "DATABASE",
    prio: "ALTA"
  },
  {
    id: "task-2",
    title: "Pantalla de Carga y Validación de Comprobantes",
    desc: "Formulario para subida de foto de transferencia bancaria hacia Supabase Storage en el checkout.",
    assignee: "Isabella",
    status: "in_progress",
    tag: "FRONTEND",
    prio: "ALTA"
  },
  {
    id: "task-3",
    title: "Lógica de Reintegro de Stock Semanal (Viernes)",
    desc: "Implementar función o Cron Job que libere 'cantidad_reservada' si el pedido no fue ejecutado/aprobado.",
    assignee: "Celeste",
    status: "backlog",
    tag: "STOCK",
    prio: "MEDIA"
  },
  {
    id: "task-4",
    title: "Panel /admin: Inspección de Comprobantes",
    desc: "Módulo administrativo para ver foto de comprobante, aprobar o rechazar y generar el remito de entrega.",
    assignee: "Juanma",
    status: "backlog",
    tag: "ADMIN",
    prio: "ALTA"
  },
  {
    id: "task-5",
    title: "Generación y Despacho de Remitos vía Resend",
    desc: "Envío automatizado de remito de venta y confirmación formal al email del comprador al aprobar el pago.",
    assignee: "Enzo",
    status: "backlog",
    tag: "BACKEND",
    prio: "MEDIA"
  },
  {
    id: "task-6",
    title: "Alineación de Relevamiento con Informe de Cátedra",
    desc: "Garantizar que los alcances, exclusiones y manuales concuerden con la entrega para Leibouski, Maldonado y Nieva.",
    assignee: "Juanma",
    status: "done",
    tag: "DOCS",
    prio: "ALTA"
  }
];

const STORAGE_KEY = "quimicashop_team_tasks_v1";
let tasks = [];
let currentFilter = "ALL";

const AVATAR_COLORS = {
  Juanma: { bg: "#0284c7", txt: "#fff" },
  Isabella: { bg: "#db2777", txt: "#fff" },
  Celeste: { bg: "#d97706", txt: "#fff" },
  Enzo: { bg: "#16a34a", txt: "#fff" }
};

const TAG_COLORS = {
  DATABASE: { bg: "#fef3c7", txt: "#b45309" },
  FRONTEND: { bg: "#ede9fe", txt: "#6d28d9" },
  BACKEND: { bg: "#e0f2fe", txt: "#0369a1" },
  STOCK: { bg: "#f0fdf4", txt: "#15803d" },
  ADMIN: { bg: "#ffe4e6", txt: "#be123c" },
  DOCS: { bg: "#f0fdfa", txt: "#0f766e" }
};

// GENERADOR DE UUID SEGURO PARA SUPABASE
function generateUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// CONFIGURACIÓN DE PERFILES Y CREDENCIALES (DNI) CON ROLES PERSISTENTES
const ROLES_STORAGE_KEY = "quimicashop_team_roles_v1";
const DEFAULT_USERS = {
  Juanma: { name: "Juan Manuel Merodio", pass: "48134318", role: "Frontend & JS Lead", badge: "Next.js 15 / React / UI Logic", avatar: "JM", color: "#0284c7", bg: "#e0f2fe" },
  Isabella: { name: "Isabella Infante", pass: "96131444", role: "Database & SQL Architecture", badge: "Supabase / PostgreSQL 13 Tablas / DDL", avatar: "II", color: "#db2777", bg: "#fce7f3" },
  Celeste: { name: "Celeste Cáceres", pass: "48021520", role: "Diseño UX/UI & Testing QA", badge: "Figma / M3 Expressive / Test Cases", avatar: "CC", color: "#d97706", bg: "#fef3c7" },
  Enzo: { name: "Enzo Queipo", pass: "48290048", role: "Backend, Admin Panel & Relaciones", badge: "APIs / RBAC / Automatizaciones", avatar: "EQ", color: "#16a34a", bg: "#dcfce7" }
};

let USERS = { ...DEFAULT_USERS };
try {
  const storedRoles = localStorage.getItem(ROLES_STORAGE_KEY);
  if (storedRoles) {
    const parsed = JSON.parse(storedRoles);
    Object.keys(parsed).forEach(k => {
      if (USERS[k]) {
        USERS[k].role = parsed[k].role || USERS[k].role;
        USERS[k].badge = parsed[k].badge || USERS[k].badge;
      }
    });
  }
} catch (e) { }

const AUTH_STORAGE_KEY = "quimicashop_logged_user_v1";
let currentUser = null; // { key, name, isGuest, avatar, color, bg }
let pendingProfileKey = null;

// ESTADO DE MEETINGS Y LLAMADAS
const MEETINGS_STORAGE_KEY = "quimicashop_current_meeting_v1";
let currentMeeting = null;
let countdownTimer = null;

const NOTES_STORAGE_KEY = "quimicashop_team_notes_v1";
let taskNotes = {};
let activeTaskId = null;

// ESTADO DE PAPELERA DE TAREAS (TRASH / ARCHIVE)
const TRASH_STORAGE_KEY = "quimicashop_team_trash_v1";
let trashTasks = [];

// ESTADO DE BANDEJA DE ENTRADA, AVANCES & FORO DE DEBATE
const DISCUSSIONS_STORAGE_KEY = "quimicashop_team_discussions_v1";
const DISCUSSION_COMMENTS_STORAGE_KEY = "quimicashop_team_disc_comments_v1";
const TRASH_DISCUSSIONS_STORAGE_KEY = "quimicashop_team_trash_discussions_v1";
let teamDiscussions = [];
let discussionComments = [];
let trashDiscussions = [];
let selectedDiscussionId = null;
let currentDiscussionFilter = "ALL"; // ALL | UNREAD | BLOQUEO | AYUDA | AVANCE | DEBATE
let discussionSearchQuery = "";

const INITIAL_DISCUSSIONS = [
  {
    id: "disc-seed-1",
    title: "Traba con las claves foráneas de Comprobante y Estados_comprobante",
    content: "Hola equipo! Al revisar el DER-quimica.csv noté que Comprobante y Estados_comprobante comparten id_pedido como relación fuerte. ¿Les parece si id_estado en Estados_comprobante es un id propio y dejamos id_pedido como FK? Necesito que Isabella y Enzo me confirmen esto antes de cerrar el script SQL.",
    author_key: "Juanma",
    author_name: "Juan Manuel Merodio",
    category: "BLOQUEO",
    task_id: "task-1",
    read_by: ["Juanma"],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "disc-seed-2",
    title: "Avance: Pantalla de checkout y previsualización de imagen",
    content: "Ya dejé listo el dropzone para arrastrar el comprobante de transferencia y la compresión previa a enviar a Supabase Storage. Solo falta definir si aceptamos únicamente JPG/PNG o también PDF.",
    author_key: "Isabella",
    author_name: "Isabella Infante",
    category: "AVANCE",
    task_id: "task-2",
    read_by: ["Isabella"],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "disc-seed-3",
    title: "Debate: Política de horario para la liberación de stock semanal",
    content: "El informe de cátedra fija la liberación de stock reservado los días viernes. Propongo que se ejecute a las 18:00 hs al finalizar el horario lectivo del taller de Química para no interferir con las compras del mediodía. ¿Opiniones?",
    author_key: "Celeste",
    author_name: "Celeste Cáceres",
    category: "DEBATE",
    task_id: "task-3",
    read_by: ["Celeste"],
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const INITIAL_COMMENTS = [
  {
    id: "comm-seed-1",
    discussion_id: "disc-seed-1",
    author_key: "Isabella",
    author_name: "Isabella Infante",
    comment: "Coincido totalmente Juanma. En el DDL puse id_estado como PK serial y id_pedido como FK para que podamos registrar el historial de estados de un mismo comprobante sin colisión.",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

async function init() {
  // 1. Carga local inmediata
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (storedTasks) {
    try { tasks = JSON.parse(storedTasks); } catch (e) { tasks = INITIAL_TASKS; }
  } else {
    tasks = INITIAL_TASKS;
  }

  const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  if (storedNotes) {
    try { taskNotes = JSON.parse(storedNotes); } catch (e) { taskNotes = {}; }
  }

  const storedTrash = localStorage.getItem(TRASH_STORAGE_KEY);
  if (storedTrash) {
    try { trashTasks = JSON.parse(storedTrash); } catch (e) { trashTasks = []; }
  }

  const storedDiscussions = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
  if (storedDiscussions) {
    try { teamDiscussions = JSON.parse(storedDiscussions); } catch (e) { teamDiscussions = INITIAL_DISCUSSIONS; }
  } else {
    teamDiscussions = INITIAL_DISCUSSIONS;
  }

  const storedComments = localStorage.getItem(DISCUSSION_COMMENTS_STORAGE_KEY);
  if (storedComments) {
    try { discussionComments = JSON.parse(storedComments); } catch (e) { discussionComments = INITIAL_COMMENTS; }
  } else {
    discussionComments = INITIAL_COMMENTS;
  }

  const storedTrashDiscussions = localStorage.getItem(TRASH_DISCUSSIONS_STORAGE_KEY);
  if (storedTrashDiscussions) {
    try { trashDiscussions = JSON.parse(storedTrashDiscussions); } catch (e) { trashDiscussions = []; }
  } else {
    trashDiscussions = [];
  }

  render();
  updateTrashBadge();
  updateDiscussionsTrashBadge();
  renderDiscussions();

  // 2. Sincronización con Supabase (team_members, team_tasks, task_notes y Realtime)
  if (supabaseClient) {
    try {
      // Sincronizar perfiles y roles oficiales desde team_members
      const { data: membersData, error: membersError } = await supabaseClient
        .from("team_members")
        .select("*");

      if (!membersError && membersData && membersData.length > 0) {
        membersData.forEach(m => {
          if (USERS[m.key]) {
            USERS[m.key].role = m.role || USERS[m.key].role;
            USERS[m.key].badge = m.badge || USERS[m.key].badge;
            USERS[m.key].email = m.email || USERS[m.key].email || "";
            if (m.name) USERS[m.key].name = m.name;
          }
        });
        renderTeamCards();
      }

      // Cargar tareas ordenadas cronológicamente
      const { data, error } = await supabaseClient
        .from("team_tasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        tasks = data.map(item => ({
          id: (item.id || Date.now()).toString(),
          title: item.title || "",
          desc: item.description || item.desc || "",
          assignee: item.assignee || "Juanma",
          status: item.status || "backlog",
          tag: item.tag || "DATABASE",
          prio: item.priority || item.prio || "MEDIA",
          der_entity: item.der_entity || "General",
          estimated_hours: item.estimated_hours || 2,
          completed_at: item.completed_at || null,
          created_at: item.created_at || null
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        render();
        const badge = document.getElementById("db-status-badge");
        if (badge) badge.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block"></span> Supabase Conectado`;
      } else if (!error && data && data.length === 0) {
        for (const t of INITIAL_TASKS) {
          await supabaseClient.from("team_tasks").insert([{
            title: t.title,
            description: t.desc,
            assignee: t.assignee,
            status: t.status,
            tag: t.tag,
            priority: t.prio,
            der_entity: t.der_entity || "General",
            estimated_hours: t.estimated_hours || 2.0,
            completed_at: t.status === 'done' ? new Date().toISOString() : null
          }]);
        }
        const badge = document.getElementById("db-status-badge");
        if (badge) badge.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block"></span> Supabase Conectado`;
      } else if (error) {
        const badge = document.getElementById("db-status-badge");
        if (badge) badge.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;display:inline-block"></span> Modo Local (Offline)`;
      }

      // Cargar notas desde Supabase si la tabla existe
      const { data: notesData, error: notesError } = await supabaseClient
        .from("task_notes")
        .select("*")
        .order("created_at", { ascending: true });

      if (!notesError && notesData) {
        taskNotes = {};
        notesData.forEach(n => {
          const tid = n.task_id.toString();
          if (!taskNotes[tid]) taskNotes[tid] = [];
          taskNotes[tid].push({
            id: n.id,
            author: n.author,
            text: n.content,
            date: n.created_at ? new Date(n.created_at).toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' }) : "Hoy"
          });
        });
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(taskNotes));
        render();
      }

      // Cargar team_discussions desde Supabase si existe
      try {
        const { data: discData, error: discError } = await supabaseClient
          .from("team_discussions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!discError && discData && discData.length > 0) {
          teamDiscussions = discData.map(d => ({
            id: d.id.toString(),
            title: d.title,
            content: d.content,
            author_key: d.author_key,
            author_name: d.author_name,
            category: d.category || "AVANCE",
            task_id: d.task_id || "none",
            read_by: Array.isArray(d.read_by) ? d.read_by : (typeof d.read_by === "string" ? JSON.parse(d.read_by) : []),
            created_at: d.created_at,
            updated_at: d.updated_at
          }));
          localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));
        }

        const { data: commData, error: commError } = await supabaseClient
          .from("team_discussion_comments")
          .select("*")
          .order("created_at", { ascending: true });

        if (!commError && commData && commData.length > 0) {
          discussionComments = commData.map(c => ({
            id: c.id.toString(),
            discussion_id: c.discussion_id.toString(),
            author_key: c.author_key,
            author_name: c.author_name,
            comment: c.comment,
            created_at: c.created_at
          }));
          localStorage.setItem(DISCUSSION_COMMENTS_STORAGE_KEY, JSON.stringify(discussionComments));
        }
        renderDiscussions();
      } catch (errDisc) {
        console.warn("Discussions offline/table not ready:", errDisc);
      }

      // Suscripción Realtime (PostgreSQL Changes)
      if (typeof supabaseClient.channel === "function") {
        supabaseClient.channel('realtime_teams_hub')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, async () => {
            const { data: freshTasks } = await supabaseClient
              .from("team_tasks")
              .select("*")
              .order("created_at", { ascending: true });
            if (freshTasks) {
              tasks = freshTasks.map(item => ({
                id: (item.id || Date.now()).toString(),
                title: item.title || "",
                desc: item.description || item.desc || "",
                assignee: item.assignee || "Juanma",
                status: item.status || "backlog",
                tag: item.tag || "DATABASE",
                prio: item.priority || item.prio || "MEDIA",
                der_entity: item.der_entity || "General",
                estimated_hours: item.estimated_hours || 2,
                completed_at: item.completed_at || null,
                created_at: item.created_at || null
              }));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
              render();
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'team_meetings' }, async () => {
            syncMeetingsWithSupabase();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, async () => {
            const { data: freshMembers } = await supabaseClient.from("team_members").select("*");
            if (freshMembers) {
              freshMembers.forEach(m => {
                if (USERS[m.key]) {
                  USERS[m.key].role = m.role || USERS[m.key].role;
                  USERS[m.key].badge = m.badge || USERS[m.key].badge;
                  USERS[m.key].email = m.email || USERS[m.key].email || "";
                }
              });
              renderTeamCards();
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'team_discussions' }, async () => {
            syncDiscussionsFromSupabase();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'team_discussion_comments' }, async () => {
            syncDiscussionsFromSupabase();
          })
          .subscribe();
      }
    } catch (err) {
      console.warn("Supabase sync offline, usando almacenamiento local:", err);
      const badge = document.getElementById("db-status-badge");
      if (badge) badge.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;display:inline-block"></span> Modo Local (Offline)`;
    }
  }
}

async function save(taskItem = null, previousTaskState = null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  if (supabaseClient && taskItem) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskItem.id);
      const modifier = (currentUser && !currentUser.isGuest) ? currentUser.key : "Juanma";
      
      // Payload base compatible con la estructura básica de team_tasks
      const basePayload = {
        title: taskItem.title,
        description: taskItem.desc,
        assignee: taskItem.assignee,
        status: taskItem.status,
        tag: taskItem.tag,
        priority: taskItem.prio,
        updated_at: new Date().toISOString()
      };

      // Campos extendidos de gobernanza y DER (se incorporan de forma adaptativa)
      const extendedPayload = {
        ...basePayload,
        der_entity: taskItem.der_entity || "General",
        estimated_hours: parseFloat(taskItem.estimated_hours) || 2.0,
        last_modified_by: modifier,
        completed_at: taskItem.status === 'done' ? (taskItem.completed_at || new Date().toISOString()) : null
      };

      if (isUuid) {
        // Intentar actualización completa; si la columna extendida no existe aún en DB, degradar al basePayload
        let updateRes = await supabaseClient.from("team_tasks").update(extendedPayload).eq("id", taskItem.id);
        if (updateRes.error && updateRes.error.code === 'PGRST204') {
          updateRes = await supabaseClient.from("team_tasks").update(basePayload).eq("id", taskItem.id);
        }

        if (updateRes.error) {
          console.error("Error al actualizar tarea en Supabase:", updateRes.error);
        } else {
          // Registro de Auditoría de Cambios (Change Data Capture) si la tabla existe
          try {
            await supabaseClient.from("task_audit_logs").insert([{
              task_id: taskItem.id,
              action: previousTaskState && previousTaskState.status !== taskItem.status ? 'STATUS_CHANGE' : 'UPDATE',
              changed_by: modifier,
              previous_state: previousTaskState || null,
              new_state: extendedPayload,
              diff_summary: `Actualizado por ${modifier} (Estado: ${taskItem.status}, DER: ${taskItem.der_entity || 'General'})`
            }]);
          } catch (auditErr) {
            // Tabla task_audit_logs opcional
          }
        }
      } else {
        // Tarea nueva o proveniente del seed local con ID no-UUID
        let insertRes = await supabaseClient.from("team_tasks").insert([{
          ...extendedPayload,
          created_by: modifier
        }]).select();

        if (insertRes.error && insertRes.error.code === 'PGRST204') {
          // Degradación a columnas estándar si el esquema no tiene der_entity
          insertRes = await supabaseClient.from("team_tasks").insert([basePayload]).select();
        }

        if (insertRes.error) {
          console.error("Error al insertar tarea en Supabase:", insertRes.error);
        } else if (insertRes.data && insertRes.data[0]) {
          taskItem.id = insertRes.data[0].id.toString();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

          try {
            await supabaseClient.from("task_audit_logs").insert([{
              task_id: insertRes.data[0].id,
              action: 'CREATE',
              changed_by: modifier,
              previous_state: null,
              new_state: extendedPayload,
              diff_summary: `Tarea creada por ${modifier} para ${taskItem.assignee}`
            }]);
          } catch (auditErr) { }
        }
      }
    } catch (e) {
      console.error("Error crítico guardando tarea en Supabase:", e);
    }
  }
}

function render() {
  const statuses = ["backlog", "in_progress", "review", "done"];
  const counts = { backlog: 0, in_progress: 0, review: 0, done: 0 };
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  statuses.forEach(s => {
    const listEl = document.getElementById(`list-${s}`);
    if (listEl) listEl.innerHTML = "";
  });

  // Filtro de tareas: si está en 'done' hace más de 7 días, se oculta automáticamente
  const activeTasks = tasks.filter(task => {
    if (task.status === "done" && task.completed_at) {
      const completedTime = new Date(task.completed_at).getTime();
      if (now - completedTime > ONE_WEEK_MS) {
        return false;
      }
    }
    return true;
  });

  const filtered = currentFilter === "ALL"
    ? activeTasks
    : activeTasks.filter(t => {
      if (!t.assignee) return false;
      const a = t.assignee.toLowerCase().trim();
      const f = currentFilter.toLowerCase().trim();
      return a === f || a.includes(f) || f.includes(a);
    });

  filtered.forEach(task => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    const colEl = document.getElementById(`list-${task.status}`);
    if (!colEl) return;

    const tagStyle = TAG_COLORS[task.tag] || { bg: "#f3f4f6", txt: "#374151" };
    const normKey = Object.keys(AVATAR_COLORS).find(k => k.toLowerCase() === (task.assignee || '').toLowerCase()) || "Enzo";
    const avStyle = AVATAR_COLORS[normKey] || { bg: "#16a34a", txt: "#fff" };
    const notes = taskNotes[task.id] || [];

    const card = document.createElement("div");
    card.className = "task-card";
    card.onclick = () => openEditModal(task.id);
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="task-tag" style="background:${tagStyle.bg};color:${tagStyle.txt}">${task.tag}</span>
        ${notes.length > 0 ? `<span style="font-size:.67rem;font-family:'DM Mono',monospace;color:var(--muted);background:rgba(0,0,0,.04);padding:2px 6px;border-radius:6px">💬 ${notes.length}</span>` : ''}
      </div>
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-desc">${escapeHtml(task.desc)}</div>
      <div class="task-meta">
        <div class="task-assignee">
          <span class="task-avatar-sm" style="background:${avStyle.bg};color:${avStyle.txt}">${(task.assignee || 'EQ').substring(0, 2).toUpperCase()}</span>
          <span>${task.assignee}</span>
        </div>
        <span class="task-prio" style="color:${task.prio === 'ALTA' ? 'var(--rose)' : 'var(--muted)'}">● ${task.prio}</span>
      </div>
    `;
    colEl.appendChild(card);
  });

  statuses.forEach(s => {
    const cEl = document.getElementById(`count-${s}`);
    if (cEl) cEl.textContent = counts[s];
    const mcEl = document.getElementById(`m-cnt-${s}`);
    if (mcEl) mcEl.textContent = counts[s];
  });
}

function scrollToColumn(status) {
  const col = document.getElementById(`col-${status}`);
  const board = document.querySelector(".kanban-board");
  if (col && board) {
    const left = col.offsetLeft - board.offsetLeft - 16;
    board.scrollTo({ left, behavior: "smooth" });
  }
  document.querySelectorAll(".m-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-col") === status);
  });
}

function initMobileKanbanSwipeObserver() {
  const board = document.querySelector(".kanban-board");
  if (!board) return;

  let isTicking = false;
  board.addEventListener("scroll", () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        const cols = ["backlog", "in_progress", "review", "done"];
        const boardCenter = board.scrollLeft + (board.offsetWidth / 2);
        let closestCol = cols[0];
        let minDiff = Infinity;

        cols.forEach(status => {
          const col = document.getElementById(`col-${status}`);
          if (col) {
            const colCenter = col.offsetLeft + (col.offsetWidth / 2);
            const diff = Math.abs(boardCenter - colCenter);
            if (diff < minDiff) {
              minDiff = diff;
              closestCol = status;
            }
          }
        });

        document.querySelectorAll(".m-tab").forEach(tab => {
          tab.classList.toggle("active", tab.getAttribute("data-col") === closestCol);
        });
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });
}

function filterTasks(assignee) {
  currentFilter = assignee;
  document.querySelectorAll(".f-btn").forEach(b => {
    b.classList.toggle("active", b.textContent.includes(assignee) || (assignee === "ALL" && b.textContent === "Todas"));
  });
  render();
}

function openCreateModal() {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado es de solo lectura. No puedes crear tareas.");
    return;
  }
  document.getElementById("modalTitle").textContent = "Nueva Tarea de Desarrollo";
  document.getElementById("taskId").value = "";
  document.getElementById("taskForm").reset();
  const entityEl = document.getElementById("taskEntity");
  if (entityEl) entityEl.value = "General";
  const hoursEl = document.getElementById("taskEstHours");
  if (hoursEl) hoursEl.value = "2";
  const trashBtn = document.getElementById("btn-trash-current-task");
  if (trashBtn) trashBtn.style.display = "none";
  document.getElementById("taskNotesSection").style.display = "none";
  activeTaskId = null;
  if (currentUser && USERS[currentUser.key]) {
    document.getElementById("taskAssignee").value = currentUser.key;
  }
  document.getElementById("taskModal").classList.add("open");
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  activeTaskId = task.id;
  document.getElementById("modalTitle").textContent = "Editar Tarea";
  document.getElementById("taskId").value = task.id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.desc;
  document.getElementById("taskAssignee").value = task.assignee;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskTag").value = task.tag;
  document.getElementById("taskPrio").value = task.prio;
  const entityEl = document.getElementById("taskEntity");
  if (entityEl) entityEl.value = task.der_entity || "General";
  const hoursEl = document.getElementById("taskEstHours");
  if (hoursEl) hoursEl.value = task.estimated_hours || 2;
  const trashBtn = document.getElementById("btn-trash-current-task");
  if (trashBtn) {
    trashBtn.style.display = (currentUser && currentUser.isGuest) ? "none" : "inline-flex";
  }

  renderTaskNotes(task.id);
  const authorHidden = document.getElementById("newNoteAuthor");
  const authorAvatar = document.getElementById("noteAuthorAvatar");
  const authorName = document.getElementById("noteAuthorName");
  if (authorHidden && currentUser && USERS[currentUser.key]) {
    authorHidden.value = currentUser.key;
    if (authorAvatar) {
      authorAvatar.textContent = currentUser.avatar;
      authorAvatar.style.background = currentUser.bg;
      authorAvatar.style.color = currentUser.color;
    }
    if (authorName) {
      authorName.textContent = currentUser.name.split(" ")[0];
    }
  }
  document.getElementById("taskNotesSection").style.display = "block";
  document.getElementById("taskModal").classList.add("open");
}

function renderTaskNotes(taskId) {
  const listEl = document.getElementById("taskNotesList");
  const countEl = document.getElementById("notesCount");
  listEl.innerHTML = "";
  const notes = taskNotes[taskId] || [];
  countEl.textContent = `${notes.length} notas`;

  if (notes.length === 0) {
    listEl.innerHTML = `<div style="font-size:.76rem;color:var(--muted);text-align:center;padding:12px">No hay notas registradas. Agrega requerimientos o avances del equipo.</div>`;
    return;
  }

  notes.forEach(n => {
    const item = document.createElement("div");
    item.className = "note-bubble";
    item.innerHTML = `
      <div class="note-header">
        <span class="note-author">● ${escapeHtml(n.author)}</span>
        <span class="note-date">${escapeHtml(n.date)}</span>
      </div>
      <div class="note-content">${escapeHtml(n.text)}</div>
    `;
    listEl.appendChild(item);
  });
}

async function handleAddNote() {
  if (!activeTaskId) return;
  const author = document.getElementById("newNoteAuthor").value;
  const textInput = document.getElementById("newNoteText");
  const text = textInput.value.trim();
  if (!text) return;

  const newNote = {
    id: "note-" + Date.now(),
    author,
    text,
    date: new Date().toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' })
  };

  if (!taskNotes[activeTaskId]) taskNotes[activeTaskId] = [];
  taskNotes[activeTaskId].push(newNote);
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(taskNotes));

  if (supabaseClient) {
    try {
      await supabaseClient.from("task_notes").insert([{
        task_id: activeTaskId,
        author: author,
        content: text
      }]);
    } catch (e) {
      console.warn("No se pudo guardar la nota en Supabase:", e);
    }
  }

  textInput.value = "";
  renderTaskNotes(activeTaskId);
  render();

  // Notificación Resend: Bitácora / avance en tarea
  const currentTask = tasks.find(t => t.id === activeTaskId);
  sendTeamEmailNotification({
    eventType: "TASK_NOTE_ADDED",
    title: currentTask ? currentTask.title : "Tarea de Sprint",
    details: `${author} agregó un avance/bitácora:\n\n"${text}"`,
    link: "https://quimicashop.vercel.app/tasks.html",
    category: "BITACORA"
  });
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("open");
  activeTaskId = null;
}

async function handleSaveTask(e) {
  e.preventDefault();
  const id = document.getElementById("taskId").value;
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const assignee = document.getElementById("taskAssignee").value;
  const status = document.getElementById("taskStatus").value;
  const tag = document.getElementById("taskTag").value;
  const prio = document.getElementById("taskPrio").value;
  const der_entity = document.getElementById("taskEntity") ? document.getElementById("taskEntity").value : "General";
  const estimated_hours = document.getElementById("taskEstHours") ? (parseFloat(document.getElementById("taskEstHours").value) || 2.0) : 2.0;

  if (!title) return;

  let savedItem = null;
  let previousTaskState = null;
  if (id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      previousTaskState = { ...tasks[index] };
      const wasDone = tasks[index].status === 'done';
      const isNowDone = status === 'done';
      const completed_at = isNowDone ? (wasDone ? tasks[index].completed_at : new Date().toISOString()) : null;

      tasks[index] = {
        ...tasks[index],
        title,
        desc,
        assignee,
        status,
        tag,
        prio,
        der_entity,
        estimated_hours,
        completed_at
      };
      savedItem = tasks[index];
    }
  } else {
    const newTask = {
      id: "task-" + Date.now(),
      title,
      desc,
      assignee,
      status,
      tag,
      prio,
      der_entity,
      estimated_hours,
      completed_at: status === 'done' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };
    tasks.unshift(newTask);
    savedItem = newTask;
  }

  render();
  closeModal();

  if (savedItem) {
    await save(savedItem, previousTaskState);

    // Notificación Resend: Si fue completada o creada nueva
    if (savedItem.status === 'done' && (!previousTaskState || previousTaskState.status !== 'done')) {
      sendTeamEmailNotification({
        eventType: "TASK_COMPLETED",
        title: savedItem.title,
        details: `Responsable: ${savedItem.assignee}\nMódulo: ${savedItem.tag}\nEntidad DER: ${savedItem.der_entity || "General"}\nDescripción: ${savedItem.desc || "Sin descripción"}`,
        link: "https://quimicashop.vercel.app/tasks.html",
        category: "COMPLETADA"
      });
    } else if (!id) {
      sendTeamEmailNotification({
        eventType: "TASK_CREATED",
        title: savedItem.title,
        details: `Asignado a: ${savedItem.assignee}\nPrioridad: ${savedItem.prio}\nMódulo: ${savedItem.tag}\nDetalle: ${savedItem.desc || "Sin descripción"}`,
        link: "https://quimicashop.vercel.app/tasks.html",
        category: "NUEVA_TAREA"
      });
    }
  }
}

// ==========================================
// MÓDULO DE PAPELERA DE TAREAS (TRASH / ARCHIVE)
// ==========================================
function updateTrashBadge() {
  const badge = document.getElementById("trashCountBadge");
  if (badge) {
    badge.textContent = trashTasks.length.toString();
  }
  const dockBadge = document.getElementById("dockTrashBadge");
  if (dockBadge) {
    dockBadge.textContent = trashTasks.length.toString();
  }
}

function openTrashModal() {
  renderTrashTasks();
  document.getElementById("trashModal").classList.add("open");
}

function closeTrashModal() {
  document.getElementById("trashModal").classList.remove("open");
}

function renderTrashTasks() {
  const container = document.getElementById("trashTasksList");
  if (!container) return;
  updateTrashBadge();

  if (trashTasks.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:36px 16px;color:var(--muted)">
        <div style="font-size:2rem;margin-bottom:8px">🗑️</div>
        <div style="font-size:.9rem;font-weight:600">La papelera está vacía</div>
        <div style="font-size:.76rem;margin-top:4px">Las tareas que descartes o envíes a papelera aparecerán aquí para restaurarlas cuando quieras.</div>
      </div>
    `;
    const btnEmpty = document.getElementById("btn-empty-trash");
    if (btnEmpty) btnEmpty.style.display = "none";
    return;
  }

  const btnEmpty = document.getElementById("btn-empty-trash");
  if (btnEmpty) btnEmpty.style.display = "inline-flex";

  container.innerHTML = "";
  trashTasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "trash-item-card";
    const tagStyle = TAG_COLORS[task.tag] || { bg: "#f3f4f6", txt: "#374151" };
    const trashedDate = task.trashed_at ? new Date(task.trashed_at).toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : "Reciente";

    card.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span class="task-tag" style="background:${tagStyle.bg};color:${tagStyle.txt}">${task.tag}</span>
          <span style="font-size:.72rem;font-weight:700;color:var(--text-2)">● ${task.assignee}</span>
          <span style="font-size:.68rem;color:var(--muted);font-family:'DM Mono',monospace">${trashedDate}</span>
        </div>
        <div style="font-size:.88rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${escapeHtml(task.title)}
        </div>
        ${task.desc ? `<div style="font-size:.74rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px">${escapeHtml(task.desc)}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button type="button" class="f-btn" onclick="handleRestoreTask('${task.id}')" title="Restaurar al tablero" style="display:inline-flex;align-items:center;gap:4px">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Restaurar
        </button>
        <button type="button" class="btn-delete-task" onclick="handlePermanentDeleteTask('${task.id}')" title="Eliminar definitivamente" style="padding:6px 10px">
          ✕
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function handleTrashCurrentTask() {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado es de solo lectura. No puedes descartar tareas.");
    return;
  }
  if (!activeTaskId) return;

  const taskIndex = tasks.findIndex(t => t.id === activeTaskId);
  if (taskIndex === -1) return;

  const [removedTask] = tasks.splice(taskIndex, 1);
  removedTask.trashed_at = new Date().toISOString();
  removedTask.trashed_by = (currentUser && !currentUser.isGuest) ? currentUser.key : "Juanma";

  trashTasks.unshift(removedTask);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashTasks));

  closeModal();
  render();
  updateTrashBadge();

  // Si existe en Supabase y es UUID, lo eliminamos de team_tasks para limpiar el backlog
  if (supabaseClient) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(removedTask.id);
      if (isUuid) {
        await supabaseClient.from("team_tasks").delete().eq("id", removedTask.id);
        
        try {
          await supabaseClient.from("task_audit_logs").insert([{
            task_id: removedTask.id,
            action: 'DELETE',
            changed_by: removedTask.trashed_by,
            previous_state: removedTask,
            new_state: null,
            diff_summary: `Tarea movida a la papelera por ${removedTask.trashed_by}`
          }]);
        } catch (e) { }
      }
    } catch (e) {
      console.warn("No se pudo reflejar el borrado de tarea en Supabase:", e);
    }
  }
}

async function handleRestoreTask(taskId) {
  const trashIndex = trashTasks.findIndex(t => t.id === taskId);
  if (trashIndex === -1) return;

  const [restoredTask] = trashTasks.splice(trashIndex, 1);
  delete restoredTask.trashed_at;
  delete restoredTask.trashed_by;

  tasks.unshift(restoredTask);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashTasks));

  render();
  renderTrashTasks();
  updateTrashBadge();

  // Guardar nuevamente en Supabase
  await save(restoredTask);
}

async function handlePermanentDeleteTask(taskId) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado es de solo lectura.");
    return;
  }
  const trashIndex = trashTasks.findIndex(t => t.id === taskId);
  if (trashIndex === -1) return;

  const [deletedTask] = trashTasks.splice(trashIndex, 1);
  localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashTasks));
  renderTrashTasks();
  updateTrashBadge();

  if (supabaseClient) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deletedTask.id);
      if (isUuid) {
        await supabaseClient.from("team_tasks").delete().eq("id", deletedTask.id);
      }
    } catch (e) { }
  }
}

async function handleEmptyTrash() {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado es de solo lectura.");
    return;
  }
  if (!confirm("¿Estás seguro de que deseas vaciar toda la papelera definitivamente? Esta acción no se puede deshacer.")) {
    return;
  }

  const idsToDelete = trashTasks.filter(t => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id)).map(t => t.id);
  trashTasks = [];
  localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashTasks));
  renderTrashTasks();
  updateTrashBadge();

  if (supabaseClient && idsToDelete.length > 0) {
    try {
      await supabaseClient.from("team_tasks").delete().in("id", idsToDelete);
    } catch (e) { }
  }
}

function exportBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `quimicashop_backlog_${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchor.click();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ==========================================
// AUTENTICACIÓN TIPO NETFLIX & SESIÓN
// ==========================================
function checkAuth() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      applyUserSession();
      return;
    } catch (e) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  showAuthOverlay();
}

function showAuthOverlay() {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.remove("hidden");
  document.getElementById("profilesView").style.display = "flex";
  document.getElementById("passView").style.display = "none";
}

function selectProfile(key, name, pass, bg, color, avatar) {
  pendingProfileKey = key;
  document.getElementById("profilesView").style.display = "none";
  const passView = document.getElementById("passView");
  passView.style.display = "flex";

  const avatarEl = document.getElementById("passAvatar");
  avatarEl.textContent = avatar;
  avatarEl.style.background = bg;
  avatarEl.style.color = color;

  document.getElementById("passUserName").textContent = name;
  const passInput = document.getElementById("passInput");
  passInput.value = "";
  document.getElementById("passError").style.display = "none";
  passInput.focus();
}

function cancelProfileSelection() {
  pendingProfileKey = null;
  document.getElementById("passView").style.display = "none";
  document.getElementById("profilesView").style.display = "flex";
}

function handlePasswordSubmit(e) {
  e.preventDefault();
  if (!pendingProfileKey) return;
  const passInput = document.getElementById("passInput");
  const entered = passInput.value.trim();
  const userDef = USERS[pendingProfileKey];

  if (userDef && entered === userDef.pass) {
    currentUser = {
      key: pendingProfileKey,
      name: userDef.name,
      role: userDef.role,
      avatar: userDef.avatar,
      bg: userDef.bg,
      color: userDef.color,
      isGuest: false
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    applyUserSession();
  } else {
    const errEl = document.getElementById("passError");
    errEl.style.display = "block";
    passInput.select();
  }
}

function loginAsGuest() {
  currentUser = {
    key: "Invitado",
    name: "Invitado (Solo Lectura)",
    role: "Visitante",
    avatar: "👁",
    bg: "#f3f4f6",
    color: "#4b5563",
    isGuest: true
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
  applyUserSession();
}

function applyUserSession() {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.add("hidden");

  // Actualizar Navbar
  const pill = document.getElementById("logged-user-pill");
  const badgeAvatar = document.getElementById("user-badge-avatar");
  const badgeName = document.getElementById("user-badge-name");
  if (pill && currentUser) {
    pill.style.display = "inline-flex";
    badgeAvatar.textContent = currentUser.avatar;
    badgeAvatar.style.background = currentUser.bg;
    badgeAvatar.style.color = currentUser.color;
    badgeName.textContent = currentUser.key === "Invitado" ? "Invitado" : currentUser.name.split(" ")[0];
  }

  // Restricciones modo Invitado (Solo Lectura)
  const btnCreateMeeting = document.getElementById("btn-create-meeting");
  const btnCreateTask = document.getElementById("btn-create-task");
  if (currentUser.isGuest) {
    if (btnCreateMeeting) btnCreateMeeting.style.display = "none";
    if (btnCreateTask) btnCreateTask.style.display = "none";
    const dockBtnMeeting = document.getElementById("dock-btn-meeting");
    if (dockBtnMeeting) dockBtnMeeting.style.display = "none";
  } else {
    if (btnCreateMeeting) btnCreateMeeting.style.display = "inline-flex";
    if (btnCreateTask) btnCreateTask.style.display = "inline-flex";
    const dockBtnMeeting = document.getElementById("dock-btn-meeting");
    if (dockBtnMeeting) dockBtnMeeting.style.display = "flex";
    const authorHidden = document.getElementById("newNoteAuthor");
    const authorBadge = document.getElementById("noteAuthorBadge");
    const authorAvatar = document.getElementById("noteAuthorAvatar");
    const authorName = document.getElementById("noteAuthorName");
    if (authorHidden && currentUser && USERS[currentUser.key]) {
      authorHidden.value = currentUser.key;
      if (authorAvatar) {
        authorAvatar.textContent = currentUser.avatar;
        authorAvatar.style.background = currentUser.bg;
        authorAvatar.style.color = currentUser.color;
      }
      if (authorName) {
        authorName.textContent = currentUser.name.split(" ")[0];
      }
    }
  }

  renderTeamCards();
  renderMeetingBanner();
  renderDiscussions();
}

function handleLogout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  currentUser = null;
  window.location.reload();
}

// ==========================================
// SISTEMA DE MEETINGS, VOTACIÓN & MINUTAS
// ==========================================
function openCreateMeetingModal(defaultReason = null) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede programar reuniones.");
    return;
  }
  const now = new Date();
  now.setHours(now.getHours() + 2);
  now.setMinutes(0, 0, 0);
  const defaultDate = now.toISOString().slice(0, 16);
  document.getElementById("mDate").value = defaultDate;
  document.getElementById("mUrl").value = "https://meet.google.com/new";
  if (defaultReason) {
    document.getElementById("mTitle").value = defaultReason === 'Auditoría Presencial' ? 'Reunión Presencial de Cátedra & Equipo (Aula Taller)' : '';
  }
  document.getElementById("meetingModal").classList.add("open");
}

function closeMeetingModal() {
  document.getElementById("meetingModal").classList.remove("open");
}

async function handleSaveMeeting(e) {
  e.preventDefault();
  const title = document.getElementById("mTitle").value.trim();
  const reason = document.getElementById("mReason").value;
  const scheduledAt = document.getElementById("mDate").value;
  let meetUrl = document.getElementById("mUrl").value.trim() || "https://meet.google.com/new";

  const newMeeting = {
    id: generateUuid(),
    title,
    reason,
    scheduled_at: scheduledAt,
    meet_url: meetUrl,
    created_by: currentUser ? currentUser.key : "Juanma",
    status: "pending_vote",
    votes: {
      Juanma: currentUser && currentUser.key === "Juanma",
      Isabella: currentUser && currentUser.key === "Isabella",
      Celeste: currentUser && currentUser.key === "Celeste",
      Enzo: currentUser && currentUser.key === "Enzo"
    },
    close_votes: {
      Juanma: false,
      Isabella: false,
      Celeste: false,
      Enzo: false
    },
    minutes: ""
  };

  currentMeeting = newMeeting;
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("team_meetings").insert([{
        id: newMeeting.id,
        title: newMeeting.title,
        reason: newMeeting.reason,
        scheduled_at: newMeeting.scheduled_at,
        meet_url: newMeeting.meet_url,
        created_by: newMeeting.created_by,
        status: newMeeting.status,
        votes: newMeeting.votes,
        close_votes: newMeeting.close_votes,
        minutes: newMeeting.minutes
      }]).select();

      if (error) {
        console.error("Error al guardar reunión en Supabase:", error);
      }
    } catch (err) {
      console.warn("No se pudo guardar la reunión en Supabase:", err);
    }
  }

  // Notificación Resend: Convocatoria a reunión
  sendTeamEmailNotification({
    eventType: "MEETING_CREATED",
    title: title,
    details: `Motivo: ${reason}\nFecha y Hora: ${new Date(scheduledAt).toLocaleString("es-AR")}\nEnlace tentativo: ${meetUrl}\n\n* Se requiere la aprobación unánime de los 4 integrantes para confirmar la sesión.`,
    link: "https://quimicashop.vercel.app/tasks.html",
    category: reason
  });

  closeMeetingModal();
  renderMeetingBanner();
}

async function voteForMeeting() {
  if (!currentMeeting || !currentUser || currentUser.isGuest) return;
  if (!USERS[currentUser.key]) return;

  currentMeeting.votes[currentUser.key] = true;

  const allApproved = Object.keys(USERS).every(k => currentMeeting.votes[k] === true);
  if (allApproved) {
    currentMeeting.status = "confirmed";

    // Notificación Resend: Reunión Confirmada (4/4) con enlace Google Meet activo
    sendTeamEmailNotification({
      eventType: "MEETING_CONFIRMED",
      title: currentMeeting.title,
      details: `¡Todos los integrantes han votado a favor!\n\nFecha Programada: ${new Date(currentMeeting.scheduled_at).toLocaleString("es-AR")}\nEnlace Directo Meet: ${currentMeeting.meet_url}`,
      link: currentMeeting.meet_url || "https://quimicashop.vercel.app/tasks.html",
      category: "CONFIRMADA"
    });
  }

  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));

  if (supabaseClient) {
    try {
      await supabaseClient.from("team_meetings")
        .update({ votes: currentMeeting.votes, status: currentMeeting.status })
        .eq("id", currentMeeting.id);
    } catch (e) {
      console.warn("Error actualizando voto en Supabase:", e);
    }
  }

  renderMeetingBanner();
}

function renderMeetingBanner() {
  const banner = document.getElementById("meetingBanner");
  if (!banner) return;

  if (!currentMeeting || currentMeeting.status === "closed" || currentMeeting.status === "cancelled") {
    banner.classList.remove("active");
    if (countdownTimer) clearInterval(countdownTimer);
    return;
  }

  banner.classList.add("active");
  const badgeEl = document.getElementById("meetingReasonBadge");
  if (badgeEl) badgeEl.textContent = (currentMeeting.reason || "SEMANAL").toUpperCase();
  const titleEl = document.getElementById("meetingTitleDisplay");
  if (titleEl) titleEl.textContent = currentMeeting.title || "Reunión de Equipo";

  const schedDate = new Date(currentMeeting.scheduled_at);
  const timeEl = document.getElementById("meetingTimeDisplay");
  if (timeEl) {
    timeEl.textContent = `Programada: ${schedDate.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'short' })} · ${schedDate.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })} hs`;
  }

  const votersEl = document.getElementById("meetingVotersList");
  if (votersEl) {
    votersEl.innerHTML = "";
    let votedCount = 0;

    Object.keys(USERS).forEach(key => {
      const hasVoted = currentMeeting.votes && currentMeeting.votes[key] === true;
      if (hasVoted) votedCount++;
      const pill = document.createElement("span");
      pill.className = `voter-pill ${hasVoted ? 'voted' : 'pending'}`;
      pill.innerHTML = `
        <span>${hasVoted ? '✓' : '⏳'}</span>
        <span>${key}</span>
      `;
      votersEl.appendChild(pill);
    });

    const actionBtns = document.getElementById("meetingActionBtns");
    if (actionBtns) {
      actionBtns.innerHTML = "";

      const userAlreadyVoted = currentUser && USERS[currentUser.key] && currentMeeting.votes && currentMeeting.votes[currentUser.key] === true;
      const isUnanimous = votedCount === 4;

      if (!isUnanimous) {
        if (currentUser && !currentUser.isGuest && !userAlreadyVoted) {
          const voteBtn = document.createElement("button");
          voteBtn.className = "btn-create";
          voteBtn.innerHTML = `✓ Votar a Favor (${votedCount}/4)`;
          voteBtn.onclick = voteForMeeting;
          actionBtns.appendChild(voteBtn);
        } else {
          const waitPill = document.createElement("span");
          waitPill.className = "nav-pill";
          waitPill.style.color = "#b45309";
          waitPill.style.fontWeight = "700";
          waitPill.textContent = `Esperando votación (${votedCount}/4)`;
          actionBtns.appendChild(waitPill);
        }
      } else {
        const meetBtn = document.createElement("a");
        meetBtn.href = currentMeeting.meet_url;
        meetBtn.target = "_blank";
        meetBtn.className = "btn-meeting";
        meetBtn.style.textDecoration = "none";
        meetBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          Unirse a Meet
        `;
        actionBtns.appendChild(meetBtn);

        const hubBtn = document.createElement("button");
        hubBtn.className = "btn-create";
        hubBtn.innerHTML = `📺 Abrir Pizarra & Minutas`;
        hubBtn.onclick = openMeetingFullscreen;
        actionBtns.appendChild(hubBtn);
      }

      if (currentUser && !currentUser.isGuest) {
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn-export";
        cancelBtn.style.background = "#fee2e2";
        cancelBtn.style.color = "#991b1b";
        cancelBtn.style.borderColor = "rgba(239,68,68,.3)";
        cancelBtn.title = "Cancelar y descartar esta reunión";
        cancelBtn.innerHTML = `✕ Cancelar`;
        cancelBtn.onclick = cancelCurrentMeeting;
        actionBtns.appendChild(cancelBtn);
      }
    }
  }

  startCountdown(schedDate);
}

function startCountdown(targetDate) {
  if (countdownTimer) clearInterval(countdownTimer);

  const updateCounter = () => {
    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;
    const countBox = document.getElementById("meetingCountdown");
    if (!countBox) return;

    if (diff <= 0) {
      countBox.textContent = "EN CURSO";
      countBox.style.color = "#16a34a";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    countBox.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  updateCounter();
  countdownTimer = setInterval(updateCounter, 1000);
}

// ==========================================
// HUB DE MEETING EN PANTALLA COMPLETA & MINUTAS
// ==========================================
function openMeetingFullscreen() {
  if (!currentMeeting) return;
  const fs = document.getElementById("meetingFullscreen");
  fs.classList.add("open");

  document.getElementById("hubMeetingReason").textContent = currentMeeting.reason.toUpperCase();
  document.getElementById("hubMeetingTitle").textContent = currentMeeting.title;
  document.getElementById("hubMeetLink").href = currentMeeting.meet_url;
  const d = new Date(currentMeeting.scheduled_at);
  document.getElementById("hubMeetingDate").textContent = `Programada: ${d.toLocaleString("es-AR")}`;

  document.getElementById("hubMinutesText").value = currentMeeting.minutes || "";
  renderHubCloseVotes();
  renderHubTasks();

  if (currentUser && currentUser.isGuest) {
    document.getElementById("hubMinutesText").disabled = true;
    document.getElementById("btn-save-minutes").style.display = "none";
  } else {
    document.getElementById("hubMinutesText").disabled = false;
    document.getElementById("btn-save-minutes").style.display = "block";
  }
}

function closeMeetingFullscreen() {
  document.getElementById("meetingFullscreen").classList.remove("open");
}

function renderHubCloseVotes() {
  if (!currentMeeting) return;
  const listEl = document.getElementById("hubCloseVotersList");
  listEl.innerHTML = "";
  let count = 0;

  Object.keys(USERS).forEach(k => {
    const hasVotedClose = currentMeeting.close_votes && currentMeeting.close_votes[k] === true;
    if (hasVotedClose) count++;
    const pill = document.createElement("span");
    pill.className = `voter-pill ${hasVotedClose ? 'voted' : 'pending'}`;
    pill.innerHTML = `<span>${hasVotedClose ? '✓' : '⏳'}</span><span>${k}</span>`;
    listEl.appendChild(pill);
  });

  document.getElementById("closeVotesCount").textContent = `${count}/4`;
}

function renderHubTasks() {
  const el = document.getElementById("hubTasksSummary");
  el.innerHTML = "";

  const completed = tasks.filter(t => t.status === "done").slice(0, 5);
  const inProgress = tasks.filter(t => t.status === "in_progress").slice(0, 5);

  const makeSection = (title, items, color) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div style="font-size:.72rem;font-weight:700;color:${color};margin-bottom:6px;text-transform:uppercase">${title}</div>`;
    items.forEach(t => {
      const item = document.createElement("div");
      item.style.padding = "8px 12px";
      item.style.background = "var(--bg)";
      item.style.borderRadius = "10px";
      item.style.marginBottom = "6px";
      item.style.fontSize = ".78rem";
      item.innerHTML = `<strong>${escapeHtml(t.title)}</strong> · <span style="color:var(--muted)">${escapeHtml(t.assignee)}</span>`;
      wrapper.appendChild(item);
    });
    return wrapper;
  };

  if (completed.length > 0) el.appendChild(makeSection("Tareas Completadas Recientes", completed, "var(--accent)"));
  if (inProgress.length > 0) el.appendChild(makeSection("En Desarrollo Activo", inProgress, "#d97706"));
}

async function saveMeetingMinutes() {
  if (!currentMeeting || (currentUser && currentUser.isGuest)) return;
  const text = document.getElementById("hubMinutesText").value.trim();
  currentMeeting.minutes = text;
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));

  if (supabaseClient) {
    try {
      await supabaseClient.from("team_meetings")
        .update({ minutes: text })
        .eq("id", currentMeeting.id);
    } catch (e) {
      console.warn("Error guardando minuta:", e);
    }
  }

  const statusEl = document.getElementById("hubMinutesStatus");
  statusEl.textContent = "✓ Guardado";
  setTimeout(() => { statusEl.textContent = "● En Vivo"; }, 2000);
}

async function voteToCloseMeeting() {
  if (!currentMeeting || !currentUser || currentUser.isGuest) return;
  if (!USERS[currentUser.key]) return;

  if (!currentMeeting.close_votes) {
    currentMeeting.close_votes = { Juanma: false, Isabella: false, Celeste: false, Enzo: false };
  }

  currentMeeting.close_votes[currentUser.key] = true;
  renderHubCloseVotes();

  const allClosed = Object.keys(USERS).every(k => currentMeeting.close_votes[k] === true);

  if (allClosed) {
    currentMeeting.status = "closed";
    currentMeeting.closed_at = new Date().toISOString();
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));

    document.getElementById("hubMinutesText").disabled = true;
    document.getElementById("btn-save-minutes").style.display = "none";
    alert("¡Votación unánime completada! La reunión ha finalizado y la minuta queda archivada e inmutable.");

    // Notificación Resend: Cierre de reunión y Minuta archivada
    sendTeamEmailNotification({
      eventType: "MEETING_CLOSED",
      title: currentMeeting.title,
      details: `La reunión ha finalizado y los 4 integrantes votaron su cierre.\n\nMinuta y Acuerdos Registrados:\n${currentMeeting.minutes || "Sin minuta redactada."}`,
      link: "https://quimicashop.vercel.app/tasks.html#minutesHistorySection",
      category: "MINUTA"
    });

    if (supabaseClient) {
      try {
        await supabaseClient.from("team_meetings")
          .update({
            close_votes: currentMeeting.close_votes,
            status: "closed",
            closed_at: currentMeeting.closed_at
          })
          .eq("id", currentMeeting.id);
      } catch (e) {
        console.warn("Error archivando reunión:", e);
      }
    }

    closeMeetingFullscreen();
    renderMeetingBanner();
    renderMinutesHistory();
  } else {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));
    if (supabaseClient) {
      try {
        await supabaseClient.from("team_meetings")
          .update({ close_votes: currentMeeting.close_votes })
          .eq("id", currentMeeting.id);
      } catch (e) {
        console.warn("Error en voto de cierre:", e);
      }
    }
    alert(`Tu voto de cierre ha sido registrado (${document.getElementById("closeVotesCount").textContent}). Se requiere el voto de todos los miembros para archivar.`);
  }
}

// ==========================================
// CANCELACIÓN DE REUNIÓN / VOTACIÓN POR EL CREADOR
// ==========================================
async function cancelCurrentMeeting() {
  if (!currentMeeting) return;
  if (!currentUser || currentUser.isGuest) {
    alert("Los invitados no pueden cancelar reuniones.");
    return;
  }
  if (currentUser.key !== currentMeeting.created_by && currentUser.name !== currentMeeting.created_by) {
    if (!confirm(`Esta reunión fue convocada por "${currentMeeting.created_by}". ¿Deseas cancelarla de todos modos como integrante del equipo?`)) {
      return;
    }
  } else {
    if (!confirm("¿Estás seguro de que deseas cancelar la convocatoria de esta reunión?")) {
      return;
    }
  }

  const meetingIdToCancel = currentMeeting.id;
  currentMeeting = null;
  localStorage.removeItem(MEETINGS_STORAGE_KEY);

  if (countdownTimer) clearInterval(countdownTimer);

  // Limpiar también del archivo local de minutas si estuviera
  try {
    const local = localStorage.getItem(MINUTES_ARCHIVE_KEY);
    if (local) {
      const list = JSON.parse(local).filter(m => m.id !== meetingIdToCancel);
      localStorage.setItem(MINUTES_ARCHIVE_KEY, JSON.stringify(list));
    }
  } catch (e) { }

  if (supabaseClient) {
    try {
      // 1. Eliminar la reunión de la base de datos
      const { error: delErr } = await supabaseClient.from("team_meetings").delete().eq("id", meetingIdToCancel);
      if (delErr) {
        console.warn("Error en delete de team_meetings, intentando marcar como cancelled:", delErr);
        await supabaseClient.from("team_meetings").update({ status: "cancelled" }).eq("id", meetingIdToCancel);
      }
    } catch (e) {
      console.warn("Error cancelando reunión de Supabase:", e);
    }
  }

  renderMeetingBanner();
  renderMinutesHistory();
  alert("La convocatoria de la reunión ha sido cancelada.");
}

// ==========================================
// GESTIÓN Y EDICIÓN DE ROLES DE EQUIPO
// ==========================================
function renderTeamCards() {
  const grid = document.getElementById("teamGridSection");
  if (!grid) return;
  grid.innerHTML = "";

  Object.keys(USERS).forEach(key => {
    const u = USERS[key];
    const isOwner = currentUser && !currentUser.isGuest && currentUser.key === key;
    const card = document.createElement("div");
    card.className = "member-card";
    card.innerHTML = `
      <div class="member-avatar" style="background:${u.bg};color:${u.color}">${u.avatar}</div>
      <div class="member-info" style="flex:1">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h3>${escapeHtml(u.name)}</h3>
          ${isOwner ? `<button class="btn-edit-role" onclick="openEditRoleModal('${key}')" title="Editar mi rol">✏️ Editar Mi Rol</button>` : ''}
        </div>
        <p>${escapeHtml(u.role)}</p>
        <span class="role-badge" style="background:${u.bg};color:${u.color}">${escapeHtml(u.badge)}</span>
        ${u.email ? `<div style="font-size:.68rem;color:var(--muted);margin-top:6px;font-family:'DM Mono',monospace">📧 ${escapeHtml(u.email)}</div>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

function openEditRoleModal(userKey) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede modificar roles de equipo.");
    return;
  }
  if (!currentUser || currentUser.key !== userKey) {
    alert("Acción denegada: Cada integrante sólo puede editar su propio rol.");
    return;
  }
  const u = USERS[userKey];
  if (!u) return;

  document.getElementById("editRoleUserKey").value = userKey;
  document.getElementById("editRoleUserName").value = u.name;
  document.getElementById("editRoleTitleInput").value = u.role;
  document.getElementById("editRoleBadgeInput").value = u.badge;
  const emailInput = document.getElementById("editRoleEmailInput");
  if (emailInput) emailInput.value = u.email || "";
  document.getElementById("editRoleModalTitle").textContent = `Editar Mi Rol (${u.name.split(" ")[0]})`;

  document.getElementById("editRoleModal").classList.add("open");
}

function closeEditRoleModal() {
  document.getElementById("editRoleModal").classList.remove("open");
}

async function handleSaveRole(e) {
  e.preventDefault();
  const userKey = document.getElementById("editRoleUserKey").value;
  const newRole = document.getElementById("editRoleTitleInput").value.trim();
  const newBadge = document.getElementById("editRoleBadgeInput").value.trim();
  const emailInput = document.getElementById("editRoleEmailInput");
  const newEmail = emailInput ? emailInput.value.trim() : "";

  if (!currentUser || currentUser.key !== userKey) {
    alert("Operación rechazada: No tienes permisos para alterar roles de otros integrantes.");
    return;
  }

  if (!USERS[userKey]) return;

  USERS[userKey].role = newRole;
  USERS[userKey].badge = newBadge;
  USERS[userKey].email = newEmail;

  // 1. Persistencia local
  const rolesToStore = {};
  Object.keys(USERS).forEach(k => {
    rolesToStore[k] = { role: USERS[k].role, badge: USERS[k].badge, email: USERS[k].email || "" };
  });
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(rolesToStore));

  // 2. Persistencia en Supabase (team_members)
  if (supabaseClient) {
    try {
      await supabaseClient
        .from("team_members")
        .update({
          role: newRole,
          badge: newBadge,
          email: newEmail || null,
          updated_at: new Date().toISOString(),
          updated_by: userKey
        })
        .eq("key", userKey);
    } catch (dbErr) {
      console.warn("No se pudo actualizar team_members en Supabase:", dbErr);
    }
  }

  renderTeamCards();
  closeEditRoleModal();
}

// ==========================================
// REUNIÓN PRESENCIAL FIJA (JUEVES 13:00 - 15:00)
// ==========================================
const PRESENCIAL_MINUTES_KEY = "quimicashop_presencial_minutes_v1";

function isPresencialMeetingToday() {
  const now = new Date();
  // Día 4 = Jueves
  return now.getDay() === 4;
}

function openPresencialMinuteModal() {
  const now = new Date();
  const isThursday = isPresencialMeetingToday();
  const modal = document.getElementById("presencialMinuteModal");
  if (!modal) return;

  const lockedNotice = document.getElementById("presencialLockedNotice");
  const activeNotice = document.getElementById("presencialActiveNotice");
  const textArea = document.getElementById("presencialMinuteText");
  const saveBtn = document.getElementById("btnSavePresencialMinute");
  const dateInput = document.getElementById("presencialSessionDate");

  dateInput.value = `Jueves · Sesión de Cátedra E.E.S.T N°1 (13:00 - 15:00 hs)`;

  // Cargar minuta existente
  const savedMinutes = localStorage.getItem(PRESENCIAL_MINUTES_KEY) || "";
  textArea.value = savedMinutes;

  if (isThursday && currentUser && !currentUser.isGuest) {
    lockedNotice.style.display = "none";
    activeNotice.style.display = "block";
    textArea.disabled = false;
    saveBtn.style.display = "inline-flex";
  } else {
    lockedNotice.style.display = "block";
    activeNotice.style.display = "none";
    textArea.disabled = true;
    saveBtn.style.display = "none";
  }

  modal.classList.add("open");
}

function closePresencialMinuteModal() {
  const modal = document.getElementById("presencialMinuteModal");
  if (modal) modal.classList.remove("open");
}

async function handleSavePresencialMinute(e) {
  e.preventDefault();
  if (!isPresencialMeetingToday()) {
    alert("Las minutas presenciales sólo pueden editarse los días de cátedra (Jueves).");
    return;
  }
  if (!currentUser || currentUser.isGuest) {
    alert("El modo invitado no puede guardar minutas.");
    return;
  }

  const text = document.getElementById("presencialMinuteText").value.trim();
  localStorage.setItem(PRESENCIAL_MINUTES_KEY, text);

  // También sincronizar con Supabase si está disponible como minuta presencial cerrada/activa
  if (supabaseClient) {
    try {
      await supabaseClient.from("team_meetings").upsert([{
        id: "presencial-jueves-actual",
        title: "Reunión Presencial de Cátedra & Taller (Jueves 13-15hs)",
        reason: "Auditoría Presencial",
        scheduled_at: new Date().toISOString(),
        meet_url: "Presencial · Aula Taller E.E.S.T N°1",
        created_by: currentUser.key,
        status: "closed",
        minutes: text,
        closed_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("No se pudo sincronizar minuta presencial en Supabase:", err);
    }
  }

  // Notificación Resend: Minuta presencial de cátedra
  sendTeamEmailNotification({
    eventType: "PRESENCIAL_SAVED",
    title: "Minuta Presencial de Cátedra & Taller (Jueves)",
    details: `Acuerdos y temas asentados en el aula taller con los profesores:\n\n${text}`,
    link: "https://quimicashop.vercel.app/tasks.html#presencialMinuteModal",
    category: "PRESENCIAL"
  });

  alert("Minuta presencial guardada y archivada con éxito.");
  closePresencialMinuteModal();
  renderMinutesHistory();
}
function updatePresencialCountdown() {
  const now = new Date();
  const nextThursday = new Date(now.getTime());
  const dayOfWeek = now.getDay();
  let daysToAdd = (4 - dayOfWeek + 7) % 7;

  if (daysToAdd === 0 && now.getHours() >= 15) {
    daysToAdd = 7;
  }

  nextThursday.setDate(now.getDate() + daysToAdd);
  nextThursday.setHours(13, 0, 0, 0);

  const diff = nextThursday.getTime() - now.getTime();
  const el = document.getElementById("presencialCountdown");
  if (!el) return;

  if (dayOfWeek === 4 && now.getHours() >= 13 && now.getHours() < 15) {
    el.textContent = "● EN CURSO AHORA (Aula Taller 7mo)";
    el.style.background = "#dcfce7";
    el.style.color = "#15803d";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  el.textContent = `Próxima sesión en: ${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m`;
}

// ==========================================
// HISTORIAL Y ARCHIVO DE MINUTAS (CON EDICIÓN Y PAPELERA)
// ==========================================
const MINUTES_ARCHIVE_KEY = "esencia_tecnica_meetings_archive_v1";

async function renderMinutesHistory() {
  const grid = document.getElementById("minutesHistoryGrid");
  const countBadge = document.getElementById("minutesCountBadge");
  if (!grid) return;
  grid.innerHTML = "";

  let meetingsList = [];

  const localArchive = localStorage.getItem(MINUTES_ARCHIVE_KEY);
  if (localArchive) {
    try { meetingsList = JSON.parse(localArchive); } catch (e) { }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("team_meetings")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (!error && data && data.length > 0) {
        meetingsList = data;
        localStorage.setItem(MINUTES_ARCHIVE_KEY, JSON.stringify(data));
      }
    } catch (e) { }
  }

  if (currentMeeting && (currentMeeting.status === "closed" || (currentMeeting.minutes && currentMeeting.minutes.trim()))) {
    if (!meetingsList.some(m => m.id === currentMeeting.id)) {
      meetingsList.unshift(currentMeeting);
    }
  }

  if (meetingsList.length === 0) {
    meetingsList = [
      {
        id: "m-seed-1",
        title: "Auditoría Presencial de Relevamiento & DER",
        reason: "Auditoría Presencial",
        scheduled_at: "2026-09-17T13:00:00",
        status: "closed",
        minutes: "- Revisión conjunta con los profesores Leibouski y Maldonado.\n- Se acordó el descarte de validación bancaria automática por IA (Gemini) en favor de la aprobación manual por el Administrador escolar.\n- El prototipo mobile en React Native queda deprecado para concentrar el esfuerzo en Next.js 15 Web App.\n- Se consolidan las 13 entidades relacionales con integridad referencial.",
        created_by: "Juanma"
      },
      {
        id: "m-seed-2",
        title: "Sincronización Sprint Backlog & Supabase Setup",
        reason: "Semanal",
        scheduled_at: "2026-09-22T21:00:00",
        status: "closed",
        minutes: "- Enzo inicia la migración del script SQL para las 13 tablas en Supabase.\n- Isabella avanza con la maqueta de subida de comprobantes en el checkout.\n- Celeste define los umbrales de stock warning y reintegro semanal de stock no ejecutado los viernes.\n- Juanma configura el Teams Hub con autenticación Netflix y sistema unánime de llamadas.",
        created_by: "Juanma"
      },
      {
        id: "a2892026-0928-4000-8000-000000000028",
        title: "Sincronización Técnica, Casos de Uso & Notificaciones Resend",
        reason: "Semanal",
        scheduled_at: "2026-09-28T18:56:00",
        status: "closed",
        minutes: "- Revisión técnica del proyecto con organización y planificación de entregas.\n- Plataforma automatizada de minutas: adoptada para generación y seguimiento en Teams Hub.\n- Tareas en ciclos semanales: registro los días lunes para control de tiempos y auditoría de horas.\n- Producción oficial: fijado el dominio quimicashop.vercel.app para reflejar todas las actualizaciones.\n- Prototipo Stitch: congelado como plantilla estática de referencia visual sin modificaciones adicionales.\n- Documentación activa: cada integrante debe registrar sus avances, trabas y resoluciones en notas del panel.\n- Repositorio unificado: uso exclusivo del repositorio central de GitHub para evitar caos de versiones.\n- Casos de uso y diagramas: Isabella finaliza el diagrama de clases para el jueves; Celeste avanza con las planillas de casos de uso estructuradas en tablas (2 ejemplos por actor).\n- Automatizaciones y alertas con Resend: Juanma y Enzo integran alertas por email para reuniones, tareas y bloqueo técnico.\n- Términos y condiciones: Celeste redactará el documento formal HTML ajustado a normativas.\n- Reuniones periódicas fijadas: Domingos 20:00 hs y Jueves 21:00 hs, además de la sesión presencial de taller de los jueves 13 a 15 hs.\n- Expo Escobar (29 de octubre): asistencia obligatoria coordinada con la profesora Cecilia Maldonado.",
        created_by: "Juanma"
      }
    ];
  }

  // Filtrar las que fueron enviadas a la papelera (soft delete) o canceladas
  const activeMinutes = meetingsList.filter(m => !m.is_trashed && m.status !== "trashed" && m.status !== "cancelled");

  if (countBadge) countBadge.textContent = `${activeMinutes.length} Minutas Registradas`;

  activeMinutes.forEach(m => {
    const d = new Date(m.scheduled_at || Date.now());
    const card = document.createElement("div");
    card.className = "minute-card";
    card.id = `minute-card-${m.id}`;
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <span style="background:#fef3c7;color:#b45309;font-weight:700;font-size:.68rem;padding:2px 7px;border-radius:6px;border:1px solid #fde68a">
          ${escapeHtml(m.reason || 'Reunión')}
        </span>
        <span style="font-family:'DM Mono',monospace;font-size:.7rem;color:var(--muted)">
          ${d.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      </div>
      <h4 style="font-size:.9rem;font-weight:700;color:var(--text);line-height:1.35">${escapeHtml(m.title)}</h4>
      <div style="font-size:.78rem;color:var(--text-2);background:var(--bg);padding:10px 12px;border-radius:10px;white-space:pre-wrap;line-height:1.5;max-height:160px;overflow-y:auto;border:1px solid var(--border-2)">${escapeHtml(m.minutes || "Sin minuta registrada aún.")}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:.7rem;color:var(--muted);border-top:1px solid var(--border-2);padding-top:8px">
        <span>Convocó: <strong>${escapeHtml(m.created_by || 'Equipo')}</strong></span>
        <div class="minute-actions-row">
          <button class="btn-minute-action edit" onclick="openEditMinuteModal('${m.id}')" title="Corregir Acta">
            ✏️ Editar
          </button>
          <button class="btn-minute-action trash" onclick="handleTrashMeeting('${m.id}')" title="Mover a Papelera">
            🗑️ Papelera
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// CORRECCIÓN / EDICIÓN DE MINUTA ARCHIVADA
function openEditMinuteModal(meetingId) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no tiene permisos para editar minutas.");
    return;
  }

  let meetingsList = [];
  try {
    const local = localStorage.getItem(MINUTES_ARCHIVE_KEY);
    if (local) meetingsList = JSON.parse(local);
  } catch (e) { }

  let target = meetingsList.find(m => m.id === meetingId);
  if (!target && currentMeeting && currentMeeting.id === meetingId) {
    target = currentMeeting;
  }
  if (!target) {
    alert("No se encontró el registro de la minuta.");
    return;
  }

  document.getElementById("editMinuteId").value = target.id;
  document.getElementById("editMinuteTitle").value = target.title || "";
  document.getElementById("editMinuteReason").value = target.reason || "";
  document.getElementById("editMinuteContent").value = target.minutes || "";

  document.getElementById("editMinuteModal").classList.add("open");
}

function closeEditMinuteModal() {
  const modal = document.getElementById("editMinuteModal");
  if (modal) modal.classList.remove("open");
}

async function handleSaveEditedMinute(e) {
  e.preventDefault();
  if (currentUser && currentUser.isGuest) {
    alert("Modo invitado: Acción no permitida.");
    return;
  }

  const id = document.getElementById("editMinuteId").value;
  const title = document.getElementById("editMinuteTitle").value.trim();
  const reason = document.getElementById("editMinuteReason").value.trim();
  const content = document.getElementById("editMinuteContent").value.trim();

  let meetingsList = [];
  try {
    const local = localStorage.getItem(MINUTES_ARCHIVE_KEY);
    if (local) meetingsList = JSON.parse(local);
  } catch (e) { }

  const index = meetingsList.findIndex(m => m.id === id);
  if (index !== -1) {
    meetingsList[index].title = title;
    meetingsList[index].reason = reason;
    meetingsList[index].minutes = content;
    localStorage.setItem(MINUTES_ARCHIVE_KEY, JSON.stringify(meetingsList));
  }

  if (currentMeeting && currentMeeting.id === id) {
    currentMeeting.title = title;
    currentMeeting.reason = reason;
    currentMeeting.minutes = content;
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));
  }

  // Guardar en Supabase si está disponible
  if (supabaseClient) {
    try {
      await supabaseClient
        .from("team_meetings")
        .update({
          title: title,
          reason: reason,
          minutes: content
        })
        .eq("id", id);
    } catch (err) {
      console.warn("No se pudo actualizar la minuta en Supabase:", err);
    }
  }

  closeEditMinuteModal();
  renderMinutesHistory();
  alert("Minuta corregida y actualizada en la base de datos.");
}

// MOVER MINUTA A LA PAPELERA
async function handleTrashMeeting(meetingId) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede enviar minutas a la papelera.");
    return;
  }

  if (!confirm("¿Deseas enviar esta minuta a la papelera?")) return;

  let meetingsList = [];
  try {
    const local = localStorage.getItem(MINUTES_ARCHIVE_KEY);
    if (local) meetingsList = JSON.parse(local);
  } catch (e) { }

  const index = meetingsList.findIndex(m => m.id === meetingId);
  if (index !== -1) {
    meetingsList[index].is_trashed = true;
    meetingsList[index].status = "trashed";
    localStorage.setItem(MINUTES_ARCHIVE_KEY, JSON.stringify(meetingsList));
  }

  if (currentMeeting && currentMeeting.id === meetingId) {
    currentMeeting.is_trashed = true;
    currentMeeting.status = "trashed";
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));
  }

  if (supabaseClient) {
    try {
      await supabaseClient
        .from("team_meetings")
        .update({ status: "trashed" })
        .eq("id", meetingId);
    } catch (err) {
      console.warn("No se pudo enviar a papelera en Supabase:", err);
    }
  }

  renderMinutesHistory();
}

// ==========================================
// SINCRONIZACIÓN Y ARRANQUE GENERAL
// ==========================================
async function syncMeetingsWithSupabase() {
  const storedMeeting = localStorage.getItem(MEETINGS_STORAGE_KEY);
  if (storedMeeting) {
    try { currentMeeting = JSON.parse(storedMeeting); } catch (e) { currentMeeting = null; }
  }

  if (supabaseClient) {
    try {
      // Buscar la última reunión que no esté cancelada ni en papelera
      const { data, error } = await supabaseClient
        .from("team_meetings")
        .select("*")
        .not("status", "eq", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const m = data[0];
        // Si el estado es 'cancelled' o 'trashed', no debe figurar como activa
        if (m.status === "cancelled" || m.status === "trashed") {
          currentMeeting = null;
          localStorage.removeItem(MEETINGS_STORAGE_KEY);
        } else {
          currentMeeting = {
            id: m.id.toString(),
            title: m.title,
            reason: m.reason,
            scheduled_at: m.scheduled_at,
            meet_url: m.meet_url,
            created_by: m.created_by,
            status: m.status,
            votes: m.votes || { Juanma: false, Isabella: false, Celeste: false, Enzo: false },
            close_votes: m.close_votes || { Juanma: false, Isabella: false, Celeste: false, Enzo: false },
            minutes: m.minutes || "",
            closed_at: m.closed_at || null,
            is_trashed: m.status === "trashed"
          };
          localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));
        }
      } else if (!error && data && data.length === 0) {
        // No hay reuniones en la base de datos
        currentMeeting = null;
        localStorage.removeItem(MEETINGS_STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Sync meetings offline:", err);
    }
  }

  renderMeetingBanner();
  renderMinutesHistory();
}

// ==========================================
// MÓDULO BANDEJA DE ENTRADA: NOTAS, AVANCES & FORO DE DEBATE
// ==========================================

async function syncDiscussionsFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data: discData, error: discError } = await supabaseClient
      .from("team_discussions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!discError && discData) {
      teamDiscussions = discData.map(d => ({
        id: d.id.toString(),
        title: d.title,
        content: d.content,
        author_key: d.author_key,
        author_name: d.author_name,
        category: d.category || "AVANCE",
        task_id: d.task_id || "none",
        read_by: Array.isArray(d.read_by) ? d.read_by : (typeof d.read_by === "string" ? JSON.parse(d.read_by) : []),
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
      localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));
    }

    const { data: commData, error: commError } = await supabaseClient
      .from("team_discussion_comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (!commError && commData) {
      discussionComments = commData.map(c => ({
        id: c.id.toString(),
        discussion_id: c.discussion_id.toString(),
        author_key: c.author_key,
        author_name: c.author_name,
        comment: c.comment,
        created_at: c.created_at
      }));
      localStorage.setItem(DISCUSSION_COMMENTS_STORAGE_KEY, JSON.stringify(discussionComments));
    }

    renderDiscussions();
  } catch (e) {
    console.warn("Sync discussions error:", e);
  }
}

function setDiscussionCategoryFilter(category) {
  currentDiscussionFilter = category;
  document.querySelectorAll(".inbox-chip").forEach(chip => {
    chip.classList.toggle("active", chip.getAttribute("data-filter") === category);
  });
  renderDiscussions();
}

function handleFilterDiscussions() {
  const input = document.getElementById("inboxSearchInput");
  discussionSearchQuery = input ? input.value.trim().toLowerCase() : "";
  renderDiscussions();
}

function updateUnreadBadge() {
  const badge = document.getElementById("unreadNotesBadge");
  const dockBadge = document.getElementById("dockUnreadBadge");
  if (!badge) return;

  const currentKey = currentUser ? currentUser.key : "Guest";
  const unreadCount = teamDiscussions.filter(d => {
    const readers = Array.isArray(d.read_by) ? d.read_by : [];
    return !readers.includes(currentKey);
  }).length;

  badge.textContent = `${unreadCount} a visualizar`;
  badge.style.background = unreadCount > 0 ? "#eff6ff" : "var(--bg)";
  badge.style.color = unreadCount > 0 ? "#1d4ed8" : "var(--muted)";
  badge.style.borderColor = unreadCount > 0 ? "#bfdbfe" : "var(--border)";

  if (dockBadge) {
    dockBadge.textContent = unreadCount;
    dockBadge.style.display = unreadCount > 0 ? "inline-block" : "none";
  }
}

function renderDiscussions() {
  const listEl = document.getElementById("inboxItemsList");
  if (!listEl) return;

  updateUnreadBadge();

  const currentKey = currentUser ? currentUser.key : "Guest";

  // Filtrado de notas
  let filtered = teamDiscussions.filter(d => {
    const isUnread = !(Array.isArray(d.read_by) && d.read_by.includes(currentKey));

    if (currentDiscussionFilter === "UNREAD" && !isUnread) return false;
    if (currentDiscussionFilter !== "ALL" && currentDiscussionFilter !== "UNREAD") {
      if (d.category !== currentDiscussionFilter) return false;
    }

    if (discussionSearchQuery) {
      const matchTitle = (d.title || "").toLowerCase().includes(discussionSearchQuery);
      const matchAuthor = (d.author_name || "").toLowerCase().includes(discussionSearchQuery);
      const matchContent = (d.content || "").toLowerCase().includes(discussionSearchQuery);
      return matchTitle || matchAuthor || matchContent;
    }

    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="padding:40px 20px;text-align:center;color:var(--muted);font-size:.8rem">
        No hay notas en esta vista
      </div>
    `;
    return;
  }

  // Si no hay seleccionada y hay elementos, pre-seleccionar la primera
  if (!selectedDiscussionId && filtered.length > 0) {
    selectedDiscussionId = filtered[0].id;
  }

  listEl.innerHTML = filtered.map(d => {
    const isSelected = d.id === selectedDiscussionId;
    const isUnread = !(Array.isArray(d.read_by) && d.read_by.includes(currentKey));
    const authorUser = USERS[d.author_key] || { avatar: "EQ", color: "#16a34a", bg: "#dcfce7" };
    
    // Categoría visual sin emojis (con colores)
    const catClass = `cat-${(d.category || "avance").toLowerCase()}`;
    
    // Fecha formateada
    const dDate = d.created_at ? new Date(d.created_at) : new Date();
    const timeStr = dDate.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' }) + ' ' + 
                    dDate.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' });

    // Tarea vinculada si existe
    let taskSnippet = "";
    if (d.task_id && d.task_id !== "none") {
      const linkedTask = tasks.find(t => t.id === d.task_id);
      if (linkedTask) {
        taskSnippet = `<span class="task-link-badge" title="${linkedTask.title}"># ${linkedTask.title}</span>`;
      }
    }

    // Cantidad de comentarios
    const commentsCount = discussionComments.filter(c => c.discussion_id === d.id).length;
    const commBadge = commentsCount > 0 
      ? `<span style="font-size:.68rem;font-family:'DM Mono',monospace;color:var(--muted);margin-left:auto">${commentsCount} resp.</span>` 
      : "";

    return `
      <div class="inbox-item ${isSelected ? 'selected' : ''} ${isUnread ? 'unread' : ''}" onclick="selectDiscussion('${d.id}')">
        <div class="inbox-item-top">
          <div class="inbox-item-author-wrap">
            <span class="inbox-unread-dot" title="A visualizar"></span>
            <span style="width:20px;height:20px;border-radius:6px;background:${authorUser.bg};color:${authorUser.color};display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700">
              ${authorUser.avatar}
            </span>
            <span class="inbox-item-author">${d.author_name}</span>
          </div>
          <span class="inbox-item-time">${timeStr}</span>
        </div>
        <div class="inbox-item-title">${d.title}</div>
        <div class="inbox-item-preview">${d.content}</div>
        <div class="inbox-item-badges">
          <span class="cat-pill ${catClass}">${d.category}</span>
          ${taskSnippet}
          ${commBadge}
        </div>
      </div>
    `;
  }).join("");

  renderReaderView();
}

function selectDiscussion(discId) {
  selectedDiscussionId = discId;
  const container = document.querySelector(".inbox-container");
  if (container) {
    container.classList.add("mobile-reading");
  }

  const disc = teamDiscussions.find(d => d.id === discId);
  const currentKey = currentUser ? currentUser.key : "Guest";

  if (disc && Array.isArray(disc.read_by) && !disc.read_by.includes(currentKey)) {
    disc.read_by.push(currentKey);
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));

    if (supabaseClient) {
      try {
        supabaseClient
          .from("team_discussions")
          .update({ read_by: disc.read_by })
          .eq("id", disc.id)
          .then();
      } catch (err) { }
    }
  }

  renderDiscussions();
}

function closeMobileReaderView() {
  const container = document.querySelector(".inbox-container");
  if (container) {
    container.classList.remove("mobile-reading");
  }
}

function toggleMarkAsRead(discId) {
  const disc = teamDiscussions.find(d => d.id === discId);
  if (!disc) return;
  const currentKey = currentUser ? currentUser.key : "Guest";

  if (!Array.isArray(disc.read_by)) disc.read_by = [];

  if (disc.read_by.includes(currentKey)) {
    disc.read_by = disc.read_by.filter(k => k !== currentKey);
  } else {
    disc.read_by.push(currentKey);
  }

  localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));

  if (supabaseClient) {
    try {
      supabaseClient
        .from("team_discussions")
        .update({ read_by: disc.read_by })
        .eq("id", disc.id)
        .then();
    } catch (err) { }
  }

  renderDiscussions();
}

function renderReaderView() {
  const readerEl = document.getElementById("inboxReaderView");
  if (!readerEl) return;

  const disc = teamDiscussions.find(d => d.id === selectedDiscussionId);
  if (!disc) {
    readerEl.innerHTML = `
      <div class="inbox-empty-view">
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <div style="font-weight:600;font-size:.9rem">Selecciona una nota para ver el detalle</div>
        <p style="font-size:.76rem;max-width:300px">Explora los avances y bloqueos de tus compañeros o redacta una nota para abrir un nuevo debate.</p>
      </div>
    `;
    return;
  }

  const currentKey = currentUser ? currentUser.key : "Guest";
  const isReadByMe = Array.isArray(disc.read_by) && disc.read_by.includes(currentKey);
  const authorUser = USERS[disc.author_key] || { avatar: "EQ", color: "#16a34a", bg: "#dcfce7" };
  const catClass = `cat-${(disc.category || "avance").toLowerCase()}`;

  const dDate = disc.created_at ? new Date(disc.created_at) : new Date();
  const dateStr = dDate.toLocaleDateString("es-AR", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) + 
                  ' a las ' + dDate.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' }) + ' hs';

  // Tarea vinculada
  let taskInfo = "Sin tarea vinculada";
  if (disc.task_id && disc.task_id !== "none") {
    const linkedTask = tasks.find(t => t.id === disc.task_id);
    if (linkedTask) {
      taskInfo = `Tarea: <strong>${linkedTask.title}</strong> (${linkedTask.status})`;
    }
  }

  // Comentarios del hilo
  const threadComments = discussionComments.filter(c => c.discussion_id === disc.id);
  const commentsHtml = threadComments.length > 0 
    ? threadComments.map(c => {
        const u = USERS[c.author_key] || { avatar: "US", color: "var(--accent)", bg: "var(--accent-lt)" };
        const cDate = c.created_at ? new Date(c.created_at) : new Date();
        const cTimeStr = cDate.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="thread-comment-card">
            <div class="thread-comment-header">
              <div style="display:flex;align-items:center;gap:7px">
                <span style="width:20px;height:20px;border-radius:6px;background:${u.bg};color:${u.color};display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700">
                  ${u.avatar}
                </span>
                <span style="font-size:.78rem;font-weight:700;color:var(--text)">${c.author_name}</span>
              </div>
              <span style="font-size:.68rem;font-family:'DM Mono',monospace;color:var(--muted)">${cTimeStr}</span>
            </div>
            <div class="thread-comment-content">${c.comment}</div>
          </div>
        `;
      }).join("")
    : `<div style="text-align:center;padding:16px;color:var(--muted);font-size:.78rem">Aún no hay comentarios en este hilo. ¡Sé el primero en responder!</div>`;

  readerEl.innerHTML = `
    <div class="inbox-reader-header">
      <button class="btn-inbox-back-mobile" onclick="closeMobileReaderView()">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Volver a la bandeja
      </button>

      <div class="inbox-reader-title-row">
        <div>
          <span class="cat-pill ${catClass}" style="margin-bottom:6px">${disc.category}</span>
          <h3 class="inbox-reader-title">${disc.title}</h3>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn-export" style="font-size:.74rem;padding:4px 10px" onclick="toggleMarkAsRead('${disc.id}')" title="Alternar estado de lectura">
            ${isReadByMe ? 'Marcar como no leído' : 'Marcar como leído'}
          </button>
          <button class="btn-trash-note" onclick="handleTrashDiscussion('${disc.id}')" title="Mover nota a la papelera">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Papelera
          </button>
        </div>
      </div>

      <div class="inbox-reader-meta">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:26px;height:26px;border-radius:8px;background:${authorUser.bg};color:${authorUser.color};display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700">
            ${authorUser.avatar}
          </span>
          <div>
            <div style="font-size:.82rem;font-weight:700;color:var(--text)">${disc.author_name}</div>
            <div style="font-size:.7rem;color:var(--muted)">${dateStr}</div>
          </div>
        </div>
        <div style="font-size:.74rem;color:var(--muted)">${taskInfo}</div>
      </div>
    </div>

    <!-- CUERPO DE LA NOTA -->
    <div class="inbox-reader-body">${disc.content}</div>

    <!-- HILO DE COMENTARIOS / FORO -->
    <div class="inbox-thread-section">
      <div style="font-size:.78rem;font-weight:700;color:var(--muted);letter-spacing:.02em;text-transform:uppercase">
        Hilo de Debate & Aportes (${threadComments.length})
      </div>
      ${commentsHtml}
    </div>

    <!-- INPUT DE RESPUESTA DIRECTA -->
    <form class="inbox-reply-box" onsubmit="handleAddDiscussionComment(event, '${disc.id}')">
      <input type="text" id="replyCommentInput" class="form-input" style="font-size:.82rem"
        placeholder="Responder a ${disc.author_name} o aportar una solución..." required />
      <button type="submit" class="btn-create" style="white-space:nowrap;font-size:.78rem;padding:8px 14px">
        Responder
      </button>
    </form>
  `;
}

// CREACIÓN DE NUEVA NOTA / AVANCE / DEBATE
function openNewDiscussionModal() {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede publicar notas. Por favor inicia sesión con tu perfil.");
    return;
  }

  // Poblar tareas disponibles en el select
  const select = document.getElementById("discTaskId");
  if (select) {
    let optionsHtml = `<option value="none">Sin tarea vinculada (General / Debate libre)</option>`;
    tasks.forEach(t => {
      optionsHtml += `<option value="${t.id}">[${t.status.toUpperCase()}] ${t.title}</option>`;
    });
    select.innerHTML = optionsHtml;
  }

  const modal = document.getElementById("newDiscussionModal");
  if (modal) modal.classList.add("active");
}

function closeNewDiscussionModal() {
  const modal = document.getElementById("newDiscussionModal");
  if (modal) modal.classList.remove("active");
  const form = document.getElementById("newDiscussionForm");
  if (form) form.reset();
}

async function handleSaveDiscussion(event) {
  event.preventDefault();

  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede publicar notas.");
    return;
  }

  const title = document.getElementById("discTitle").value.trim();
  const content = document.getElementById("discContent").value.trim();
  const category = document.getElementById("discCategory").value;
  const taskId = document.getElementById("discTaskId").value;

  const currentAuthorKey = currentUser ? currentUser.key : "Juanma";
  const currentAuthorName = currentUser ? currentUser.name : "Juan Manuel Merodio";
  const newId = generateUuid();
  const nowIso = new Date().toISOString();

  const newDiscussion = {
    id: newId,
    title: title,
    content: content,
    author_key: currentAuthorKey,
    author_name: currentAuthorName,
    category: category,
    task_id: taskId,
    read_by: [currentAuthorKey], // Quien la escribe ya la leyó
    created_at: nowIso,
    updated_at: nowIso
  };

  teamDiscussions.unshift(newDiscussion);
  selectedDiscussionId = newId;
  localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));

  if (supabaseClient) {
    try {
      await supabaseClient.from("team_discussions").insert([{
        id: newId,
        title: title,
        content: content,
        author_key: currentAuthorKey,
        author_name: currentAuthorName,
        category: category,
        task_id: taskId,
        read_by: [currentAuthorKey]
      }]);
    } catch (err) {
      console.warn("No se pudo guardar la nota en Supabase:", err);
    }
  }

  closeNewDiscussionModal();
  renderDiscussions();

  // Notificación Resend: Nueva Nota / Avance / Bloqueo / Debate
  let linkedTaskSnippet = "";
  if (taskId && taskId !== "none") {
    const lTask = tasks.find(t => t.id === taskId);
    if (lTask) linkedTaskSnippet = `\nTarea Vinculada: #${lTask.title}`;
  }

  sendTeamEmailNotification({
    eventType: "DISCUSSION_CREATED",
    title: title,
    details: `${content}${linkedTaskSnippet}`,
    link: "https://quimicashop.vercel.app/tasks.html#teamDiscussionsSection",
    category: category
  });
}

async function handleAddDiscussionComment(event, discId) {
  event.preventDefault();

  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede comentar notas.");
    return;
  }

  const input = document.getElementById("replyCommentInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const currentAuthorKey = currentUser ? currentUser.key : "Juanma";
  const currentAuthorName = currentUser ? currentUser.name : "Juan Manuel Merodio";
  const commentId = generateUuid();
  const nowIso = new Date().toISOString();

  const newComment = {
    id: commentId,
    discussion_id: discId,
    author_key: currentAuthorKey,
    author_name: currentAuthorName,
    comment: text,
    created_at: nowIso
  };

  discussionComments.push(newComment);
  localStorage.setItem(DISCUSSION_COMMENTS_STORAGE_KEY, JSON.stringify(discussionComments));

  // Al haber un nuevo comentario, desmarcar 'read_by' para los demás para que vuelvan a tenerlo en negrita
  const disc = teamDiscussions.find(d => d.id === discId);
  if (disc) {
    disc.read_by = [currentAuthorKey];
    disc.updated_at = nowIso;
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));

    if (supabaseClient) {
      try {
        await supabaseClient
          .from("team_discussions")
          .update({ read_by: [currentAuthorKey], updated_at: nowIso })
          .eq("id", discId);
      } catch (e) { }
    }
  }

  if (supabaseClient) {
    try {
      await supabaseClient.from("team_discussion_comments").insert([{
        id: commentId,
        discussion_id: discId,
        author_key: currentAuthorKey,
        author_name: currentAuthorName,
        comment: text
      }]);
    } catch (err) {
      console.warn("No se pudo guardar el comentario en Supabase:", err);
    }
  }

  input.value = "";
  renderDiscussions();

  // Notificación Resend: Respuesta en hilo de debate
  if (disc) {
    sendTeamEmailNotification({
      eventType: "DISCUSSION_COMMENT",
      title: disc.title,
      details: `${currentAuthorName} respondió:\n\n"${text}"`,
      link: "https://quimicashop.vercel.app/tasks.html#teamDiscussionsSection",
      category: "DEBATE"
    });
  }
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ==========================================
// MÓDULO DE PAPELERA DE NOTAS Y DEBATES
// ==========================================

function updateDiscussionsTrashBadge() {
  const badge = document.getElementById("discussionsTrashCount");
  if (badge) {
    badge.textContent = trashDiscussions.length.toString();
  }
}

function openDiscussionsTrashModal() {
  renderTrashDiscussions();
  const modal = document.getElementById("discussionsTrashModal");
  if (modal) modal.classList.add("open");
}

function closeDiscussionsTrashModal() {
  const modal = document.getElementById("discussionsTrashModal");
  if (modal) modal.classList.remove("open");
}

function renderTrashDiscussions() {
  const container = document.getElementById("trashDiscussionsList");
  if (!container) return;

  updateDiscussionsTrashBadge();

  if (trashDiscussions.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 16px;color:var(--muted);font-size:.82rem">
        La papelera de notas está vacía.
      </div>
    `;
    return;
  }

  container.innerHTML = trashDiscussions.map(disc => {
    const u = USERS[disc.author_key] || { avatar: "US", color: "#16a34a", bg: "#dcfce7" };
    const trashedDate = disc.trashed_at ? new Date(disc.trashed_at).toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' }) : "Reciente";
    const catClass = `cat-${(disc.category || "avance").toLowerCase()}`;

    return `
      <div class="trash-task-card" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border:1px solid var(--border);border-radius:12px;background:var(--surface)">
        <div style="flex:1;min-width:0;padding-right:12px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span class="cat-pill ${catClass}">${disc.category || 'NOTA'}</span>
            <span style="font-size:.72rem;color:var(--muted)">Descartada: ${trashedDate} por ${disc.trashed_by || 'Equipo'}</span>
          </div>
          <div style="font-size:.86rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${disc.title}</div>
          <div style="font-size:.74rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${disc.content}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn-restore-task" onclick="handleRestoreDiscussion('${disc.id}')" title="Restaurar a la bandeja" style="padding:6px 12px;font-size:.74rem">
            Restaurar
          </button>
          <button class="btn-delete-task" onclick="handlePermanentDeleteDiscussion('${disc.id}')" title="Eliminar definitivamente" style="padding:6px 10px;font-size:.74rem">
            ✕
          </button>
        </div>
      </div>
    `;
  }).join("");
}

async function handleTrashDiscussion(discId) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede descartar notas.");
    return;
  }

  const index = teamDiscussions.findIndex(d => d.id === discId);
  if (index === -1) return;

  const [removedDisc] = teamDiscussions.splice(index, 1);
  removedDisc.trashed_at = new Date().toISOString();
  removedDisc.trashed_by = currentUser ? currentUser.key : "Juanma";

  trashDiscussions.unshift(removedDisc);

  if (selectedDiscussionId === discId) {
    selectedDiscussionId = teamDiscussions.length > 0 ? teamDiscussions[0].id : null;
  }

  localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));
  localStorage.setItem(TRASH_DISCUSSIONS_STORAGE_KEY, JSON.stringify(trashDiscussions));

  closeMobileReaderView();
  renderDiscussions();
  updateDiscussionsTrashBadge();

  if (supabaseClient) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(removedDisc.id);
      if (isUuid) {
        await supabaseClient.from("team_discussions").delete().eq("id", removedDisc.id);
      }
    } catch (e) {
      console.warn("No se pudo reflejar en Supabase el descarte de nota:", e);
    }
  }
}

async function handleRestoreDiscussion(discId) {
  const index = trashDiscussions.findIndex(d => d.id === discId);
  if (index === -1) return;

  const [restored] = trashDiscussions.splice(index, 1);
  delete restored.trashed_at;
  delete restored.trashed_by;

  teamDiscussions.unshift(restored);
  selectedDiscussionId = restored.id;

  localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(teamDiscussions));
  localStorage.setItem(TRASH_DISCUSSIONS_STORAGE_KEY, JSON.stringify(trashDiscussions));

  renderDiscussions();
  renderTrashDiscussions();
  updateDiscussionsTrashBadge();

  if (supabaseClient) {
    try {
      await supabaseClient.from("team_discussions").insert([{
        id: restored.id,
        title: restored.title,
        content: restored.content,
        author_key: restored.author_key,
        author_name: restored.author_name,
        category: restored.category || "AVANCE",
        task_id: restored.task_id || "none",
        read_by: Array.isArray(restored.read_by) ? restored.read_by : [restored.author_key]
      }]);
    } catch (e) { }
  }
}

async function handlePermanentDeleteDiscussion(discId) {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede borrar notas permanentemente.");
    return;
  }
  const index = trashDiscussions.findIndex(d => d.id === discId);
  if (index === -1) return;

  trashDiscussions.splice(index, 1);
  localStorage.setItem(TRASH_DISCUSSIONS_STORAGE_KEY, JSON.stringify(trashDiscussions));
  renderTrashDiscussions();
  updateDiscussionsTrashBadge();
}

async function handleEmptyDiscussionsTrash() {
  if (currentUser && currentUser.isGuest) {
    alert("El modo invitado no puede vaciar la papelera.");
    return;
  }
  if (trashDiscussions.length === 0) return;
  if (!confirm("¿Estás seguro de que deseas vaciar definitivamente todas las notas de la papelera?")) return;

  trashDiscussions = [];
  localStorage.setItem(TRASH_DISCUSSIONS_STORAGE_KEY, JSON.stringify(trashDiscussions));
  renderTrashDiscussions();
  updateDiscussionsTrashBadge();
}

// ==========================================
// SERVICIO DE NOTIFICACIONES POR EMAIL (RESEND)
// ==========================================

/**
 * Consulta la API y Supabase para obtener los emails oficiales del equipo
 */
async function syncTeamMembersEmails() {
  try {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      if (data && data.members && Array.isArray(data.members)) {
        data.members.forEach(m => {
          if (USERS[m.key]) {
            if (m.email) USERS[m.key].email = m.email;
            if (m.role) USERS[m.key].role = m.role;
          }
        });
        renderTeamCards();
      }
    }
  } catch (err) {
    console.warn("No se pudo sincronizar correos con /api/notifications (modo offline o estático):", err);
  }
}

/**
 * Dispara una notificación por correo electrónico vía Resend mediante Next.js API
 */
async function sendTeamEmailNotification(payload) {
  try {
    const actorKey = currentUser ? currentUser.key : "Equipo";
    const actorName = currentUser ? currentUser.name : "Integrante de Equipo";

    const fullPayload = {
      actorKey,
      actorName,
      ...payload
    };

    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload)
    });

    if (res.ok) {
      const resData = await res.json();
      console.log(`[Resend Email] Notificación ${payload.eventType} enviada con éxito:`, resData);
      showEmailToast(`Notificación por email enviada (${payload.title})`);
    } else {
      console.warn(`[Resend Email] Error en respuesta de notificación:`, await res.text());
    }
  } catch (err) {
    console.warn(`[Resend Email] No se pudo enviar el correo de notificación:`, err);
  }
}

/**
 * Toast flotante visual no intrusivo para confirmar el envío de email
 */
function showEmailToast(msg) {
  let toast = document.getElementById("team-email-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "team-email-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.right = "24px";
    toast.style.background = "var(--text)";
    toast.style.color = "#fff";
    toast.style.padding = "10px 18px";
    toast.style.borderRadius = "12px";
    toast.style.fontSize = ".78rem";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
    toast.style.zIndex = "99999";
    toast.style.transition = "all .25s ease";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:#10b981;font-size:.9rem">✉</span> ${msg}`;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    if (toast) {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
    }
  }, 4000);
}

// Iniciar componentes
init();
checkAuth();
renderTeamCards();
updatePresencialCountdown();
setInterval(updatePresencialCountdown, 60000);
syncMeetingsWithSupabase();
syncTeamMembersEmails();
initMobileKanbanSwipeObserver();

