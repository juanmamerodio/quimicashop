import ProductCard from "@/components/ProductCard";
import { getDictionary, type Locale } from "@/lib/i18n";

// ⚠️ MOCK DATA: Solo para la demostración inicial.
// Cuando Supabase esté configurado, esto se reemplaza por fetch a /api/products
const MOCK_PRODUCTS = [
  {
    id: "uuid-1",
    nombre_es: "Vaso de Precipitados 250ml",
    nombre_en: "Beaker 250ml",
    descripcion_es: "Vaso de vidrio borosilicato resistente a altas temperaturas. Graduado.",
    descripcion_en: "Borosilicate glass beaker resistant to high temperatures. Graduated.",
    precio_ars: 4500,
    categoria: "materiales" as const,
  },
  {
    id: "uuid-2",
    nombre_es: "Ácido Clorhídrico 37% (1L)",
    nombre_en: "Hydrochloric Acid 37% (1L)",
    descripcion_es: "Reactivo grado analítico. Venta exclusiva con autorización docente.",
    descripcion_en: "Analytical grade reagent. Sale only with teacher authorization.",
    precio_ars: 12800,
    categoria: "reactivos" as const,
  },
  {
    id: "uuid-3",
    nombre_es: "Microscopio Binocular",
    nombre_en: "Binocular Microscope",
    descripcion_es: "Aumentos 40x a 1000x. Iluminación LED regulable.",
    descripcion_en: "40x to 1000x magnification. Adjustable LED illumination.",
    precio_ars: 350000,
    categoria: "equipos" as const,
  },
  {
    id: "uuid-4",
    nombre_es: "Tubos de Ensayo (x10)",
    nombre_en: "Test Tubes (x10)",
    descripcion_es: "Pack de 10 tubos de vidrio neutro 16x150mm sin borde.",
    descripcion_en: "Pack of 10 neutral glass tubes 16x150mm without rim.",
    precio_ars: 2100,
    categoria: "materiales" as const,
  },
];

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      {/* Cabecera del catálogo */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-text mb-2">
          {dict.catalog.title} <span className="text-accent">{dict.catalog.titleAccent}</span>
        </h1>
        <p className="text-muted">
          {dict.catalog.subtitle}
        </p>
      </div>

      {/* Grilla de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((product) => {
          const name = lang === 'en' ? product.nombre_en : product.nombre_es;
          const description = lang === 'en' ? product.descripcion_en : product.descripcion_es;
          const categoryLabel =
            dict.catalog.categories[product.categoria] ?? product.categoria;

          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={name}
              description={description}
              priceArs={product.precio_ars}
              category={product.categoria}
              categoryLabel={categoryLabel}
              addToCartText={dict.catalog.addToCart}
            />
          );
        })}
      </div>
    </>
  );
}