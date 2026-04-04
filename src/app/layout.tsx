import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css"; // Asegurate de que este archivo tenga las directivas de Tailwind

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "Química Shop - E.E.S.T N°1",
  description: "Insumos de laboratorio para la E.E.S.T N°1 Luciano Reyes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-lab-bg text-lab-text antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}