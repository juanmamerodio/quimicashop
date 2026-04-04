import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Configuramos los idiomas soportados
const locales = ['es', 'en'];
const defaultLocale = 'es';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- REGLA 1: RUTAS DEL SISTEMA (No tocarlas) ---
  // Ignoramos las rutas de la API, imágenes, y archivos internos de Next.js (_next)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Ignora archivos como favicon.ico, .css, .js
  ) {
    return NextResponse.next();
  }

  // --- REGLA 2: PROTECCIÓN DEL PANEL DE ADMIN ---
  // Si alguien intenta entrar a /admin, por ahora solo lo dejamos pasar.
  // Más adelante acá leeremos una cookie o header para pedir la ADMIN_PASSWORD.
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // --- REGLA 3: SISTEMA DE IDIOMAS (i18n) ---
  // Verificamos si la ruta actual ya tiene un idioma válido (ej: /es/cart o /en/checkout)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next(); // Ya tiene idioma, dejamos que siga su curso
  }

  // Si llegamos acá, significa que el usuario entró a la raíz (ej: localhost:3000 o localhost:3000/cart)
  // Lo redirigimos al idioma por defecto (español).
  // Nota: Más adelante podemos leer el header 'Accept-Language' del navegador para ser más inteligentes.
  
  // Construimos la nueva URL añadiendo el idioma
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  
  // Hacemos la redirección (ej: de "/" pasa a "/es")
  return NextResponse.redirect(request.nextUrl);
}

// 2. Le decimos a Next.js en qué rutas exactas debe ejecutarse este middleware
export const config = {
  // Coincide con todas las rutas EXCEPTO /api, /_next/static, /_next/image, y favicon.ico
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};