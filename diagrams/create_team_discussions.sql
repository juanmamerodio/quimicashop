-- ==============================================================================
-- DDL SUPABASE: TABLAS PARA BANDEJA DE ENTRADA, AVANCES, TRABAS Y FORO DE DEBATE
-- Proyecto: E-Commerce y Control de Stock · E.E.S.T N°1 Luciano Reyes (7mo Año 2026)
-- ==============================================================================

-- 1. Tabla principal de Notas / Discusiones / Bandeja de Entrada
CREATE TABLE IF NOT EXISTS public.team_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_key TEXT NOT NULL,          -- 'Juanma' | 'Isabella' | 'Celeste' | 'Enzo'
    author_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'AVANCE', -- 'AVANCE' | 'BLOQUEO' | 'AYUDA' | 'DEBATE' | 'IDEA'
    task_id TEXT DEFAULT NULL,         -- ID de la tarea vinculada (opcional)
    read_by JSONB DEFAULT '[]'::jsonb, -- Array de keys de usuarios que leyeron la nota: ["Juanma", "Isabella"]
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Respuestas / Comentarios en el Foro / Hilo de la Nota
CREATE TABLE IF NOT EXISTS public.team_discussion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES public.team_discussions(id) ON DELETE CASCADE,
    author_key TEXT NOT NULL,
    author_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_team_discussions_created ON public.team_discussions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_disc_id ON public.team_discussion_comments (discussion_id);

-- Habilitar RLS con acceso abierto al equipo de desarrollo
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_discussion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select libre a team_discussions" ON public.team_discussions
    FOR SELECT USING (true);

CREATE POLICY "Permitir insert/update a team_discussions" ON public.team_discussions
    FOR ALL USING (true);

CREATE POLICY "Permitir select libre a team_discussion_comments" ON public.team_discussion_comments
    FOR SELECT USING (true);

CREATE POLICY "Permitir insert/update a team_discussion_comments" ON public.team_discussion_comments
    FOR ALL USING (true);
