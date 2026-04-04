import NavBar from "@/components/NavBar";
import ProductCard from "@/components/ProductCard";

// Tipado básico para los parámetros de la página
interface PageProps {
  params: {
    lang: string;
  };
}

// ⚠️ MOCK DATA: Solo para la demostración inicial. 
// Luego esto vendrá de Supabase (/api/products)
const MOCK_PRODUCTS = [
  {
    id: "uuid-1",
    name: "Vaso de Precipitados 250ml",
    description: "Vaso de vidrio borosilicato resistente a altas temperaturas. Graduado.",
    priceArs: 4500,
    category: "materiales"
  },
  {
    id: "uuid-2",
    name: "Ácido Clorhídrico 37% (1L)",
    description: "Reactivo grado analítico. Venta exclusiva con autorización docente.",
    priceArs: 12800,
    category: "reactivos"
  },
  {
    id: "uuid-3",
    name: "Microscopio Binocular",
    description: "Aumentos 40x a 1000x. Iluminación LED regulable.",
    priceArs: 350000,
    category: "equipos"
  },
  {
    id: "uuid-4",
    name: "Tubos de Ensayo (x10)",
    description: "Pack de 10 tubos de vidrio neutro 16x150mm sin borde.",
    priceArs: 2100,
    category: "materiales"
  }
];

export default function CatalogPage({ params }: PageProps) {
  const { lang } = params;

  return (
    <>
      <NavBar lang={lang} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        
        {/* Cabecera del catálogo */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold text-lab-text mb-2">
            Catálogo de <span className="text-lab-primary">Insumos</span>
          </h1>
          <p className="text-lab-muted">
            Seleccioná los materiales necesarios para tus prácticas de laboratorio.
          </p>
        </div>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              priceArs={product.priceArs}
              category={product.category}
            />
          ))}
        </div>

      </main>
      
      {/* Footer simple para cerrar el diseño */}
      <footer className="border-t border-white/10 bg-lab-surface py-6 mt-12 text-center text-sm text-lab-muted">
        <p>E.E.S.T N°1 Luciano Reyes - Departamento de Química © 2026</p>
      </footer>
    </>
  );
}