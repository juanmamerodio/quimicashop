/**
 * Configuración PÚBLICA del Hub y del entorno Teams.
 *
 * Solo contiene la anon key de Supabase, que es pública por diseño.
 * NUNCA agregues acá la service role key, la API key de Resend ni contraseñas.
 *
 * Cuando se cree el proyecto Supabase exclusivo de Teams, reemplazá
 * supabaseUrl y supabaseAnonKey por los de ese proyecto.
 * El proyecto actual (uchyattzuhaltsaxazce) queda para el e-commerce.
 */
window.QUIMICASHOP_CONFIG = {
  supabaseUrl: "https://uchyattzuhaltsaxazce.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHlhdHR6dWhhbHRzYXhhemNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Njg1MzgsImV4cCI6MjA5MTA0NDUzOH0.uEDBFqcqMcUaI_QdcMj0HsvF4ZUvWntFu_CcTMTdY-I",

  // Endpoint de notificaciones por email. Vive temporalmente en el deploy del ecomm.
  // Si el ecomm cambia de dominio, actualizá esta URL.
  notificationsApi: "https://quimicashop.vercel.app/api/notifications",
};
