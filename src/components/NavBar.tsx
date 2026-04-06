'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import esDict from "@/dictionaries/es.json";
import enDict from "@/dictionaries/en.json";
import type { Dictionary } from "@/lib/types";

const dicts: Record<string, Dictionary> = { es: esDict, en: enDict };

export default function NavBar() {
  const pathname = usePathname();

  // Detectar idioma desde la URL: /es/..., /en/...
  const segments = pathname.split('/').filter(Boolean);
  const lang = (segments[0] === 'en') ? 'en' : 'es';
  const dict = dicts[lang] ?? dicts.es;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-3xl saturate-150 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo / Título */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-3 group transition-opacity hover:opacity-80"
        >
          <div className="w-9 h-9 rounded-xl bg-accent text-surface flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <span className="font-mono font-bold text-sm">Q1</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-text tracking-tight">
              {dict.nav.title} <span className="text-accent">{dict.nav.titleAccent}</span>
            </span>
          </div>
        </Link>

        {/* Acciones (Idioma y Carrito) */}
        <div className="flex items-center gap-4">
          {/* Selector de Idioma - Estilo M3 Chip */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-lt rounded-full border border-border">
            <Link
              href="/es"
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                lang === 'es'
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              ES
            </Link>
            <Link
              href="/en"
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              EN
            </Link>
          </div>

          {/* Botón Carrito - Estilo iOS Glass */}
          <Link
            href={`/${lang}/cart`}
            className="relative p-2.5 rounded-full bg-surface/50 border border-border text-text hover:bg-surface hover:shadow-sm transition-all duration-200 group"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />

            {/* Badge de cantidad */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-surface text-[10px] font-bold shadow-sm border-2 border-bg">
              0
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}