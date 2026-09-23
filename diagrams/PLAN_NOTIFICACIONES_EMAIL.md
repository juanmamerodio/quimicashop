# Plan de Implementación: Sistema de Notificaciones por Email (Resend)
> **Proyecto:** QuimicaShop (Esencia Técnica) · E.E.S.T N°1 Luciano Reyes  
> **Área:** Notificaciones Transaccionales & Alertas de Gobernanza (Teams + E-Commerce)  
> **Autor:** Senior Full-Stack Engineer  
> **Fecha:** 2026-09-22

---

## 1. Visión y Objetivos

El sistema de notificaciones por email tiene dos propósitos centrales en QuimicaShop:
1. **Flujo de Negocio (E-Commerce Escolar):**
   - Confirmación de recepción de pedido y subida de comprobante al cliente.
   - Envío del **Remito de Venta PDF/HTML** cuando el Administrador valida el comprobante bancario.
   - Aviso de cancelación / liberación de reserva si no se abonó antes del viernes.
2. **Gobernanza y Sincronización del Equipo (Teams):**
   - Notificación a los 4 integrantes (Juanma, Isabella, Celeste, Enzo) cuando se convoca una reunión (link de votación).
   - Aviso de confirmación de Meet una vez alcanzada la unanimidad (4/4).
   - Envío de minutas archivadas y tareas asignadas.

---

## 2. Proveedor Seleccionado: Resend + React Email

- **¿Por qué Resend?**
  - SDK nativo para TypeScript / Next.js (`resend`).
  - Nivel gratuito generoso (3.000 emails/mes, 100/día), ideal para escuelas técnicas.
  - Templates declarativos con `@react-email/components` para mantener la estética M3 + iOS.
  - Tasa de entregabilidad superior sin configuración compleja de servidores SMTP propios.

---

## 3. Modelo de Datos y Campos de Contacto en Supabase

Dado que actualmente no se disponen los emails personales de los chicos, se implementará un registro escalonado en base de datos:

### A. Extensión de la Tabla `team_members`
```sql
ALTER TABLE IF EXISTS team_members 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS notify_on_meetings BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_tasks BOOLEAN DEFAULT true;
```

### B. Fallback y Modal de Solicitud de Email
- En `tasks.html`, cuando un integrante inicia sesión con su perfil (ej. Enzo) y su campo `email` está vacío en Supabase / `localStorage`, aparecerá un banner o modal amigable:
  > *"Configura tu correo electrónico institucional o personal para recibir las alertas de reuniones Meet y asignación de tareas."*

---

## 4. Arquitectura de Endpoints (Next.js 15 App Router)

```
src/
└── app/
    └── api/
        ├── emails/
        │   ├── order-receipt/route.ts       # Envío de remito al cliente
        │   ├── meeting-invite/route.ts      # Convocatoria a votación unánime
        │   └── meeting-confirmed/route.ts   # Enlace Meet habilitado (4/4)
        └── ...
```

### Ejemplo de Implementación en Endpoint (`api/emails/meeting-invite/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { meetingTitle, scheduledAt, meetUrl, creatorName, recipients } = await req.json();

    // Filtramos receptores con email válido
    const validEmails = recipients.filter((r: { email?: string }) => r.email && r.email.includes('@'));
    if (validEmails.length === 0) {
      return NextResponse.json({ message: "Sin emails configurados. Notificación omitida." });
    }

    const { data, error } = await resend.emails.send({
      from: 'QuimicaShop Teams <notificaciones@esenciatecnica.edu.ar>',
      to: validEmails.map((r: { email: string }) => r.email),
      subject: `📢 Convocatoria a Reunión: ${meetingTitle}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; background: #f5f5f3; padding: 24px;">
          <div style="background: #ffffff; border-radius: 16px; padding: 24px; max-width: 520px; margin: 0 auto; border: 1px solid rgba(0,0,0,0.08);">
            <span style="background: #e8f3ef; color: #3d8c6e; font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 6px;">QUIMICASHOP TEAMS</span>
            <h2 style="color: #1c1c1e; margin-top: 12px;">${meetingTitle}</h2>
            <p style="color: #3a3a3c; font-size: 14px;"><strong>${creatorName}</strong> ha convocado una nueva reunión para el <strong>${new Date(scheduledAt).toLocaleString("es-AR")}</strong>.</p>
            <p style="color: #8e8e93; font-size: 13px;">Se requiere tu voto en el Teams Hub para habilitar el enlace de Google Meet.</p>
            <a href="https://quimicashop.vercel.app/tasks.html" style="display: inline-block; background: #3d8c6e; color: #ffffff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 14px;">Ingresar y Votar</a>
          </div>
        </div>
      `
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

## 5. Fases de Ejecución

1. **Fase 1 (Recolección de Emails):** Agregar el input opcional de email en el modal "Editar Mi Rol" de cada integrante.
2. **Fase 2 (Variables de Entorno):** Configurar `RESEND_API_KEY` en `.env.local` y Vercel.
3. **Fase 3 (Disparadores Automáticos):** Conectar `handleSaveMeeting()` y `voteForMeeting()` para invocar la API interna cuando se completen los votos.
