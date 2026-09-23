-- ============================================================================
-- DDL & MIGRACIONES COMPLEMENTARIAS: TEAMS, KANBAN, AUDITORÍA & ROLES
-- Proyecto: QuimicaShop (Esencia Técnica) · E.E.S.T N°1 Luciano Reyes (2026)
-- Base de Datos: Supabase (PostgreSQL 15+)
-- ============================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA PRINCIPAL DE INTEGRANTES Y ROLES (RBAC / AUTORIZACIÓN ESTRICTA)
CREATE TABLE IF NOT EXISTS team_members (
    key TEXT PRIMARY KEY,                       -- 'Juanma', 'Isabella', 'Celeste', 'Enzo'
    dni TEXT NOT NULL UNIQUE,                   -- DNI para login Netflix
    name TEXT NOT NULL,
    role TEXT NOT NULL,                         -- Cargo técnico
    badge TEXT NOT NULL,                        -- Especialidad / Tecnologías
    email TEXT,                                 -- Correo electrónico para notificaciones
    avatar TEXT NOT NULL,                       -- Iniciales (ej: 'JM')
    color TEXT NOT NULL,                        -- Color hexadecimal texto
    bg TEXT NOT NULL,                           -- Color hexadecimal fondo
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_by TEXT                             -- Auditoría de quién modificó el rol
);

-- 3. TABLA DE TAREAS (SPRINT BACKLOG) CON VINCULACIÓN A ENTIDADES DER
CREATE TABLE IF NOT EXISTS team_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT NOT NULL REFERENCES team_members(key) ON UPDATE CASCADE,
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),
    tag TEXT NOT NULL DEFAULT 'DATABASE',
    priority TEXT NOT NULL DEFAULT 'MEDIA' CHECK (priority IN ('ALTA', 'MEDIA', 'BAJA')),
    der_entity TEXT DEFAULT 'General',           -- Entidad vinculada del DER (ej: 'Comprobante', 'Stock')
    estimated_hours NUMERIC(4,1) DEFAULT 2.0,    -- Estimación en horas cátedra
    created_by TEXT REFERENCES team_members(key),
    last_modified_by TEXT REFERENCES team_members(key),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Migraciones seguras para instancias existentes de team_tasks:
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS der_entity TEXT DEFAULT 'General';
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(4,1) DEFAULT 2.0;
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 4. TABLA DE BITÁCORA Y NOTAS POR TAREA (FIRMA DE AUTOR INMUTABLE)
CREATE TABLE IF NOT EXISTS task_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES team_tasks(id) ON DELETE CASCADE,
    author TEXT NOT NULL REFERENCES team_members(key) ON UPDATE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA DE AUDITORÍA HISTÓRICA DE CAMBIOS (CDC / TRACKING DE OPERACIONES)
CREATE TABLE IF NOT EXISTS task_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,
    action TEXT NOT NULL,                        -- 'CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE'
    changed_by TEXT NOT NULL REFERENCES team_members(key),
    previous_state JSONB,                        -- Snapshot del estado previo
    new_state JSONB,                             -- Snapshot del nuevo estado
    diff_summary TEXT,                           -- Resumen legible del cambio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA DE REUNIONES (MEETINGS), GOBERNANZA UNÁNIME & ACTAS DE MINUTA
CREATE TABLE IF NOT EXISTS team_meetings (
    id TEXT PRIMARY KEY,                         -- 'meeting-123456789' o 'presencial-jueves-actual'
    title TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT 'Semanal',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meet_url TEXT,
    created_by TEXT NOT NULL REFERENCES team_members(key) ON UPDATE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending_vote' CHECK (status IN ('pending_vote', 'confirmed', 'closed', 'cancelled')),
    votes JSONB DEFAULT '{"Juanma": false, "Isabella": false, "Celeste": false, "Enzo": false}'::jsonb,
    close_votes JSONB DEFAULT '{"Juanma": false, "Isabella": false, "Celeste": false, "Enzo": false}'::jsonb,
    minutes TEXT DEFAULT '',
    markdown_path TEXT,                          -- Ruta relativa a diagrams/minutas/...
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo en Supabase anon
CREATE POLICY "Public Read Access" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON team_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Tasks Full Access" ON team_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Notes Full Access" ON task_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Audit Logs Full Access" ON task_audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Meetings Full Access" ON team_meetings FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SEED DATA: INTEGRANTES OFICIALES DEL EQUIPO (DNI & ROLES)
-- ============================================================================
INSERT INTO team_members (key, dni, name, role, badge, email, avatar, color, bg)
VALUES
    ('Juanma', '48134318', 'Juan Manuel Merodio', 'Frontend & JS Lead', 'Next.js 15 / React / UI Logic', NULL, 'JM', '#0284c7', '#e0f2fe'),
    ('Isabella', '96131444', 'Isabella Infante', 'Database & SQL Architecture', 'Supabase / PostgreSQL 13 Tablas / DDL', NULL, 'II', '#db2777', '#fce7f3'),
    ('Celeste', '48021520', 'Celeste Cáceres', 'Diseño UX/UI & Testing QA', 'Figma / M3 Expressive / Test Cases', NULL, 'CC', '#d97706', '#fef3c7'),
    ('Enzo', '48290048', 'Enzo Queipo', 'Backend, Admin Panel & Relaciones', 'APIs / RBAC / Automatizaciones', NULL, 'EQ', '#16a34a', '#dcfce7')
ON CONFLICT (key) DO UPDATE SET
    dni = EXCLUDED.dni,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    badge = EXCLUDED.badge;
