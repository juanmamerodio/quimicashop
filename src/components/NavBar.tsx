"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Beaker } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import esDict from "@/dictionaries/es.json";
import enDict from "@/dictionaries/en.json";
import type { Dictionary } from "@/lib/types";
import { useEffect, useState } from "react";

const dicts: Record<string, Dictionary> = { es: esDict, en: enDict };

export default function NavBar() {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Hook de scroll para efecto de transparencia dinámica
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const segments = pathname.split('/').filter(Boolean);
  const lang = (segments[0] === 'en') ? 'en' : 'es';
  const dict = dicts[lang] ?? dicts.es;
  const locales = ['es', 'en'];

  const getTransformedPath = (newLang: string) => {
    const newSegments = [...segments];
    if (locales.includes(newSegments[0])) {
      newSegments[0] = newLang;
    } else {
      newSegments.unshift(newLang);
    }
    return `/${newSegments.join('/')}`;
  };

  const itemCount = mounted ? getTotalItems() : 0;

  return (
    <motion.header
      animate={{
        backgroundColor: isScrolled ? "rgba(247, 247, 245, 0.8)" : "rgba(247, 247, 245, 0)",
        backdropFilter: isScrolled ? "blur(32px) saturate(180%)" : "blur(0px) saturate(100%)",
        borderBottomColor: isScrolled ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0)",
        y: isScrolled ? 0 : -10,
        opacity: isScrolled ? 1 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 z-50 w-full border-b transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LOGO SECTION */}
        <div className="flex items-center gap-8">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl bg-accent text-surface flex items-center justify-center shadow-lg shadow-accent/20 cursor-pointer"
            >
              <span className="font-mono font-bold text-sm">Q1</span>
            </motion.div>

            <div className="hidden sm:flex flex-col leading-tight">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-text tracking-tight text-lg"
              >
                {dict.nav.title} <span className="text-accent">{dict.nav.titleAccent}</span>
              </motion.span>
            </div>
          </Link>

          {/* NAV LINKS con indicador deslizante */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: dict.catalog.titleAccent, path: `/${lang}/catalog` },
              { name: "About", path: `/${lang}/about` },
            ].map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className="relative px-4 py-2 text-sm font-medium transition-colors group"
                >
                  <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-accent' : 'text-muted group-hover:text-text'}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-accent-lt rounded-full -z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-4">

          {/* LANGUAGE SWITCHER - Efecto de deslizamiento físico */}
          <div className="relative flex items-center p-1 bg-gray-lt rounded-full border border-border overflow-hidden">
            <motion.div
              className="absolute h-[calc(100%-8px)] top-1 rounded-full bg-white shadow-sm"
              animate={{
                x: lang === 'es' ? 0 : '100%',
                width: '50%'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />

            <Link
              href={getTransformedPath('es')}
              className={`relative z-10 px-3 py-1 text-[10px] font-bold rounded-full transition-colors duration-300 ${lang === 'es' ? 'text-accent' : 'text-muted hover:text-text'
                }`}
            >
              ES
            </Link>
            <Link
              href={getTransformedPath('en')}
              className={`relative z-10 px-3 py-1 text-[10px] font-bold rounded-full transition-colors duration-300 ${lang === 'en' ? 'text-accent' : 'text-muted hover:text-text'
                }`}
            >
              EN
            </Link>
          </div>

          {/* CART BUTTON - iOS Glassmorphism */}
          <Link
            href={`/${lang}/cart`}
            className="relative p-2.5 rounded-full bg-surface/50 border border-border text-text hover:bg-surface hover:shadow-soft transition-all duration-300 group"
          >
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 group-hover:text-accent transition-colors" />
            </motion.div>

            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  key={itemCount}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-surface text-[10px] font-bold shadow-md border-2 border-bg"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

      </div>
    </motion.header>
  );
}