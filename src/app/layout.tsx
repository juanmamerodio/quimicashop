import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Configuramos las fuentes oficiales del proyecto
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EEST N°1 - Departamento de Química",
  description: "Sistema de gestión de reactivos e insumos - Luciano Reyes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#0a0f1e] text-[#f1f5f9]">
        {/* El children es donde se van a inyectar tus páginas y la NavBar */}
        {children}
      </body>
    </html>
  );
}