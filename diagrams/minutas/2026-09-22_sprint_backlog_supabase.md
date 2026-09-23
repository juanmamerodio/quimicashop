# Minuta de Reunión: Sincronización Sprint Backlog & Supabase Setup
> **Proyecto:** QuimicaShop (Esencia Técnica) · E.E.S.T N°1 Luciano Reyes  
> **Fecha y Hora:** 2026-09-22 21:00 hs  
> **Lugar:** Sesión Virtual Teams / Google Meet  
> **Tipo:** Semanal (Sprint Review)  
> **Convocó:** Juan Manuel Merodio  
> **Estado:** 🔒 Cerrada & Archivada (Votación Unánime 4/4)

---

## 👥 Asistencia y Participantes
- [x] **Juan Manuel Merodio** (Arquitectura & Full-Stack)
- [x] **Isabella Infante** (Diseño UX/UI & Frontend)
- [x] **Celeste Cáceres** (Lógica de Stock & QA)
- [x] **Enzo Queipo** (Base de Datos & Remitos)

---

## 📝 Temas Tratados y Acuerdos
1. **Sincronización de Base de Datos:**
   - Enzo inicia la migración del script SQL para las 13 tablas en Supabase.
   - Vinculación de tareas a entidades del DER (`Cliente`, `Stock`, `Comprobante`, etc.).
2. **Checkout y Comprobantes:**
   - Isabella avanza con la maqueta de subida de fotos de comprobantes hacia Supabase Storage.
3. **Control de Stock y Reglas de Negocio:**
   - Celeste define los umbrales de advertencia (`cantidad_warning`) y la lógica de reintegro de reservas semanales.
4. **Teams Hub y Seguridad:**
   - Juanma configura el módulo Teams con autenticación tipo Netflix por DNI, gobernanza de llamadas y descarga de minutas en Markdown para Git.

---

## 🚀 Tareas Derivadas
- Despliegue de migraciones en Supabase SQL Editor.
- Pruebas de integración de auditoría de cambios.
