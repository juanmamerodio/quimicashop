import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:          '#f7f7f5',   // blanco neutro cálido (base de página)
        surface:     '#ffffff',   // blanco puro (cards, modales)
        glass:       'rgba(255, 255, 255, 0.62)', // superficies translúcidas iOS
        accent:      '#3d8c6e',   // verde salvia / química orgánica
        'accent-lt': '#e8f3ef',   // verde muy suave (fondos de badges, chips)
        gray:        '#6b7280',   // gris neutro (texto secundario, bordes)
        'gray-lt':   '#f0f0ee',   // gris casi blanco (fondos alternativos)
        text:        '#1c1c1e',   // negro suave (no puro)
        muted:       '#8e8e93',   // gris iOS (placeholder, labels)
        border:      'rgba(0, 0, 0, 0.08)', // borde translúcido universal
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
