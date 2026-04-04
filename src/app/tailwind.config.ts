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
        lab: {
          bg: "#0a0f1e",       // Azul noche profundo
          surface: "#111827",  // Gris carbón
          primary: "#00d9a0",  // Verde neón / cian
          secondary: "#7c3aed",// Violeta científico
          text: "#f1f5f9",     // Texto principal
          muted: "#64748b",    // Texto secundario
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;