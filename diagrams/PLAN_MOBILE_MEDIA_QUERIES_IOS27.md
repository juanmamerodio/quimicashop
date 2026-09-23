# Plan de Implementación Frontend Senior: Optimización Mobile & Media Queries iOS 27
> **Proyecto:** QuimicaShop (Esencia Técnica) · E.E.S.T N°1 Luciano Reyes  
> **Alcance:** Estrategia integral de diseño responsive para smartphones y tablets  
> **Estándar Visual:** Material 3 Expressive + iOS 26/27 (Glassmorphism & Depth)  
> **Autor:** Senior Full-Stack Lead & UI/UX Engineer  
> **Fecha:** 2026-09-22

---

## 1. Diagnóstico Actual de Responsive Design

- Actualmente, `style.css` cuenta con soporte para pantallas intermedias (`g3`, `g2`, wrap en navbar y modales adaptables).
- No obstante, para alcanzar una **experiencia nativa iOS 27** ("App-like feel") en Safari Mobile y Chrome Android, se requiere una reingeniería en 4 áreas críticas:
  1. Ergonomía táctil de una sola mano (Thumb Zone).
  2. Transformación de tableros anchos (Kanban horizontal snap carousel).
  3. Controles flotantes inferiores en reemplazo del navbar superior congestionado.
  4. Modales centrales transformados a Bottom Sheets con soporte de gestos táctiles.

---

## 2. Pilares de la "Agencia de Media Queries iOS 27"

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA MOBILE                      │
├───────────────────────────────┬─────────────────────────────┤
│ 1. Dynamic Safe Area Insets   │ env(safe-area-inset-*)      │
│ 2. Ergonomía de Pulgar        │ Floating Island Bottom Bar  │
│ 3. Kanban Horizontal Snap     │ scroll-snap-type: x         │
│ 4. Haptic / Microinteracción  │ active scale, spring easing │
│ 5. Glassmorphism Avanzado     │ saturate(190%) blur(28px)   │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 3. Especificación Técnica de Transformaciones

### A. Breakpoints Oficiales
```css
/* Mobile Compact (iPhone SE, Galaxy Mini) */
@media (max-width: 480px) { ... }

/* Mobile Standard / Large (iPhone 15/16/Pro Max, Pixel 8) */
@media (max-width: 768px) { ... }

/* Tablets / iPads (Portrait & Landscape) */
@media (min-width: 769px) and (max-width: 1024px) { ... }
```

### B. Floating Bottom Bar (Barra Flotante Inferior estilo Isla Dinámica)
En pantallas móviles (`<= 768px`), el navbar superior pierde los botones pesados y se añade una barra flotante en el borde inferior:
```css
@media (max-width: 768px) {
  .mobile-bottom-dock {
    position: fixed;
    bottom: max(16px, env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 420px;
    height: 60px;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 900;
  }
}
```

### C. Kanban Horizontal Snap Carousel (Desplazamiento Suave sin Colapso Vertical)
En vez de apilar las 4 columnas verticalmente forzando un scroll infinito molesto, se transforma en un carrusel por gestos:
```css
@media (max-width: 768px) {
  .kanban-board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 14px;
    padding-bottom: 20px;
    margin: 0 -16px;
    padding: 0 16px 20px 16px;
  }
  .kanban-col {
    min-width: 84vw;
    scroll-snap-align: center;
    flex-shrink: 0;
  }
}
```

### D. Modales como Bottom Sheets de iOS
```css
@media (max-width: 640px) {
  .modal {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 100%;
    border-radius: 28px 28px 0 0;
    max-height: 90vh;
    animation: slideUpModal 280ms cubic-bezier(0.16, 1, 0.3, 1);
    padding: 24px 20px max(24px, env(safe-area-inset-bottom)) 20px;
  }
  .modal::before {
    content: '';
    display: block;
    width: 38px;
    height: 5px;
    background: rgba(0, 0, 0, 0.18);
    border-radius: 10px;
    margin: 0 auto 16px auto;
  }
}
```

---

## 4. Hoja de Ruta para la Fase de Ejecución (Día de Mañana)

1. **Paso 1:** Inyectar los tokens Safe Area en `:root` de `style.css`.
2. **Paso 2:** Aplicar los media queries de `.kanban-board` para convertirlo en carrusel swipe.
3. **Paso 3:** Implementar el bottom sheet táctil para modales (`#taskModal`, `#meetingModal`, `#editRoleModal`).
4. **Paso 4:** Testeo exhaustivo en emuladores Chrome DevTools (iPhone 14/15/16 Pro, iPad Mini, Pixel 7) asegurando cero desbordes horizontales.
