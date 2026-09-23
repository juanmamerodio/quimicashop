---
name: media-queries-ios-pro
description: >-
  Expertise and runbook for advanced responsive design, mobile layout transformation,
  and iOS 26/27 design system engineering for QuimicaShop web applications.
---

# Media Queries & Mobile Engineering — iOS 26/27 Aesthetic Standard

Esta skill dota al agente del conocimiento experto de una agencia frontend especializada en arquitectura responsiva, microinteracciones táctiles y adaptación al lenguaje visual **iOS 26/27** (Dynamic Island aware, Safe Area Insets, Glassmorphism 2.0 y ergonomía de pulgar).

---

## 1. Fundamentos y Tokens de Diseño Mobile

### Breakpoints Oficiales del Proyecto
- **Mobile Compact:** `max-width: 480px` (Smartphones en orientación vertical)
- **Mobile Phablet:** `max-width: 768px` (Smartphones grandes / orientación horizontal)
- **Tablet / Small Laptop:** `769px` a `1024px`
- **Desktop Standard:** `1025px+`

### Variables y Safe Areas (iOS Notch & Home Indicator)
```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --ios-blur: saturate(180%) blur(24px);
  --ios-glass: rgba(255, 255, 255, 0.72);
  --tap-min-h: 44px; /* Estándar Apple Human Interface Guidelines */
}
```

---

## 2. Reglas de Transformación Arquitectónica (Desktop → Mobile)

1. **Navegación Móvil (Bottom Navigation Bar / Floating Island):**
   - En pantallas menores a `768px`, la navegación superior se condensa a un header mínimo (`h: 54px`) con avatar y status pill.
   - Los accesos primarios pasan a una barra inferior flotante translúcida (`backdrop-filter: blur(20px)`), anclada sobre `padding-bottom: max(12px, env(safe-area-inset-bottom))`.

2. **Kanban Responsive (Horizontal Snap Carousel):**
   - En pantallas pequeñas, las 4 columnas del Kanban no se apilan verticalmente de forma infinita.
   - Se transforman en un **carrusel con scroll snap horizontal:**
     ```css
     @media (max-width: 768px) {
       .kanban-board {
         display: flex;
         overflow-x: auto;
         scroll-snap-type: x mandatory;
         -webkit-overflow-scrolling: touch;
         gap: 12px;
         padding: 0 16px 20px 16px;
       }
       .kanban-col {
         min-width: 86vw;
         scroll-snap-align: center;
         flex-shrink: 0;
       }
     }
     ```

3. **Modales y Bottom Sheets Táctiles:**
   - Todo modal de escritorio centrado se transforma en un **Bottom Sheet de iOS**, con manija de arrastre (`sheet-handle`), bordes superiores redondeados (`border-radius: 28px 28px 0 0`) y animación deslizante ascendente (`slide-up`).

4. **Prevención de Zoom Indeseado en iOS:**
   - Todos los `<input>` y `<select>` deben tener como mínimo `font-size: 16px` en mobile para impedir el zoom automático de Safari en iOS.

---

## 3. Checklist de Verificación para Agencias
- [ ] Viewport configurado con `viewport-fit=cover`.
- [ ] Touch targets mayores o iguales a 44x44px.
- [ ] No hay desbordamiento horizontal accidental (`overflow-x: hidden` en el viewport contenedor).
- [ ] Formularios con scroll suave y padding inferior suficiente para el teclado virtual.
