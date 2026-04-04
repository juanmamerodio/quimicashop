// Este layout agrupa todas las páginas que están dentro de un idioma (/es o /en)
export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simplemente renderiza el contenido de las páginas hijas (page, cart, checkout, etc)
  return (
    <div className="flex flex-col min-h-screen w-full">
      {children}
    </div>
  );
}