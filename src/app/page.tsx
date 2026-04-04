import NavBar from '@/components/NavBar';

export default function Home() {
  // Por ahora simulamos el diccionario para probar visualmente
  const diccionarioPrueba = {
    nav: { home: "Catálogo", cart: "Carrito (0)", admin: "Acceso Docentes" }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <NavBar dict={diccionarioPrueba} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#f1f5f9]">
          Reactivos y Equipamiento
        </h1>
        <p className="mt-4 text-[#64748b]">
          Seleccioná los materiales necesarios para tus prácticas.
        </p>
      </main>
    </div>
  );
}