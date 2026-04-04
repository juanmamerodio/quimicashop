import Link from "next/link";

export default function NavBar({ lang }: { lang: string }) {
  // Nota: Más adelante usaremos el diccionario real. Por ahora, textos fijos.
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-lab-bg/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo / Título */}
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-lab-surface border border-lab-primary/30 flex items-center justify-center group-hover:border-lab-primary transition-colors">
            <span className="text-lab-primary font-mono font-bold">Q1</span>
          </div>
          <span className="font-semibold tracking-wide">
            EEST N°1 <span className="text-lab-primary">Shop</span>
          </span>
        </Link>

        {/* Acciones (Idioma y Carrito) */}
        <div className="flex items-center gap-6">
          <div className="flex gap-2 text-sm font-mono text-lab-muted">
            <Link href="/es" className={lang === 'es' ? 'text-lab-primary' : 'hover:text-lab-text transition-colors'}>ES</Link>
            <span>/</span>
            <Link href="/en" className={lang === 'en' ? 'text-lab-primary' : 'hover:text-lab-text transition-colors'}>EN</Link>
          </div>

          <Link 
            href={`/${lang}/cart`} 
            className="relative p-2 rounded-md hover:bg-lab-surface transition-colors border border-transparent hover:border-white/10"
          >
            {/* Icono de carrito SVG simple */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            
            {/* Badge simulado */}
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-lab-secondary text-[10px] font-bold text-white">
              3
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}