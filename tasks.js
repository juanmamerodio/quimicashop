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

// CONFIGURACIÓN DE PERFILES Y CREDENCIALES (DNI) CON ROLES PERSISTENTES
const ROLES_STORAGE_KEY = "quimicashop_team_roles_v1";
const DEFAULT_USERS = {
  Juanma: { name: "Juan Manuel Merodio", pass: "48134318", role: "Full-Stack & Arquitectura", badge: "Next.js / Supabase / CI-CD", avatar: "JM", color: "#0284c7", bg: "#e0f2fe" },
  Isabella: { name: "Isabella Infante", pass: "96131444", role: "Diseño UX/UI & Frontend", badge: "M3 / Tailwind / Vistas", avatar: "II", color: "#db2777", bg: "#fce7f3" },
  Celeste: { name: "Celeste Cáceres", pass: "48021520", role: "Lógica de Stock & QA", badge: "Reglas de Stock / Testing", avatar: "CC", color: "#d97706", bg: "#fef3c7" },
  Enzo: { name: "Enzo Queipo", pass: "48290048", role: "Base de Datos & Remitos", badge: "SQL 13 Tablas / Resend", avatar: "EQ", color: "#16a34a", bg: "#dcfce7" }
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

  render();
  updateTrashBadge();

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
  });
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
  } else {
    if (btnCreateMeeting) btnCreateMeeting.style.display = "inline-flex";
    if (btnCreateTask) btnCreateTask.style.display = "inline-flex";
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
    id: "meeting-" + Date.now(),
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
      await supabaseClient.from("team_meetings").insert([{
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
      }]);
    } catch (err) {
      console.warn("No se pudo guardar la reunión en Supabase:", err);
    }
  }

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
  if (!currentMeeting || currentMeeting.status === "closed") {
    if (banner) banner.classList.remove("active");
    if (countdownTimer) clearInterval(countdownTimer);
    return;
  }

  banner.classList.add("active");
  document.getElementById("meetingReasonBadge").textContent = currentMeeting.reason.toUpperCase();
  document.getElementById("meetingTitleDisplay").textContent = currentMeeting.title;

  const schedDate = new Date(currentMeeting.scheduled_at);
  document.getElementById("meetingTimeDisplay").textContent = `Programada: ${schedDate.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'short' })} · ${schedDate.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })} hs`;

  const votersEl = document.getElementById("meetingVotersList");
  votersEl.innerHTML = "";
  let votedCount = 0;

  Object.keys(USERS).forEach(key => {
    const hasVoted = currentMeeting.votes[key] === true;
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
  actionBtns.innerHTML = "";

  const userAlreadyVoted = currentUser && USERS[currentUser.key] && currentMeeting.votes[currentUser.key] === true;
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

  if (supabaseClient) {
    try {
      await supabaseClient.from("team_meetings").delete().eq("id", meetingIdToCancel);
    } catch (e) {
      console.warn("Error borrando reunión de Supabase:", e);
    }
  }

  renderMeetingBanner();
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
// HISTORIAL Y ARCHIVO DE MINUTAS
// ==========================================
const MINUTES_ARCHIVE_KEY = "quimicashop_meetings_archive_v1";

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
      }
    ];
  }

  if (countBadge) countBadge.textContent = `${meetingsList.length} Minutas Registradas`;

  meetingsList.forEach(m => {
    const d = new Date(m.scheduled_at);
    const card = document.createElement("div");
    card.className = "minute-card";
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
        <span style="color:var(--accent);font-weight:700">🔒 Minuta Archivada</span>
      </div>
    `;
    grid.appendChild(card);
  });
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
      const { data, error } = await supabaseClient
        .from("team_meetings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        currentMeeting = {
          id: data[0].id.toString(),
          title: data[0].title,
          reason: data[0].reason,
          scheduled_at: data[0].scheduled_at,
          meet_url: data[0].meet_url,
          created_by: data[0].created_by,
          status: data[0].status,
          votes: data[0].votes || { Juanma: false, Isabella: false, Celeste: false, Enzo: false },
          close_votes: data[0].close_votes || { Juanma: false, Isabella: false, Celeste: false, Enzo: false },
          minutes: data[0].minutes || "",
          closed_at: data[0].closed_at || null
        };
        localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(currentMeeting));
      }
    } catch (err) {
      console.warn("Sync meetings offline:", err);
    }
  }

  renderMeetingBanner();
  renderMinutesHistory();
}

// Iniciar componentes
init();
checkAuth();
renderTeamCards();
updatePresencialCountdown();
setInterval(updatePresencialCountdown, 60000);
syncMeetingsWithSupabase();
