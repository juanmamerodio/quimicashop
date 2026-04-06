import CartSummary from "@/components/CartSummary";
import { getDictionary, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { Trash2 } from "lucide-react";

// ⚠️ MOCK DATA: Simulamos lo que habría en el localStorage
const MOCK_CART_ITEMS = [
  {
    id: "uuid-1",
    nombre_es: "Vaso de Precipitados 250ml",
    nombre_en: "Beaker 250ml",
    precio_ars: 4500,
    cantidad: 2,
  },
  {
    id: "uuid-2",
    nombre_es: "Ácido Clorhídrico 37% (1L)",
    nombre_en: "Hydrochloric Acid 37% (1L)",
    precio_ars: 12800,
    cantidad: 1,
  },
];

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <h1 className="text-3xl font-bold text-text mb-8">
        {dict.cart.title} <span className="text-accent">{dict.cart.titleAccent}</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Lista de Items */}
        <div className="flex-grow space-y-4">
          {MOCK_CART_ITEMS.map((item) => {
            const name = lang === 'en' ? item.nombre_en : item.nombre_es;

            return (
              <div key={item.id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {/* Imagen Placeholder pequeña */}
                  <div className="w-16 h-16 bg-gray-lt rounded-xl flex items-center justify-center border border-border">
                    <span className="text-[10px] text-muted font-mono opacity-50">IMG</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{name}</h3>
                    <p className="text-sm font-mono text-muted">
                      {formatPrice(item.precio_ars)} {dict.cart.each}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Controles de Cantidad */}
                  <div className="flex items-center bg-gray-lt rounded-full border border-border p-1">
                    <button className="w-8 h-8 flex items-center justify-center text-muted hover:text-accent transition-colors duration-180 cursor-pointer rounded-full hover:bg-surface">-</button>
                    <span className="font-mono text-sm px-2 w-8 text-center">{item.cantidad}</span>
                    <button className="w-8 h-8 flex items-center justify-center text-muted hover:text-accent transition-colors duration-180 cursor-pointer rounded-full hover:bg-surface">+</button>
                  </div>

                  {/* Total del Item */}
                  <div className="w-24 text-right font-mono font-medium text-text">
                    {formatPrice(item.precio_ars * item.cantidad)}
                  </div>

                  {/* Botón Eliminar */}
                  <button className="p-2 text-muted hover:text-red-500 transition-colors duration-180 cursor-pointer" title={dict.cart.remove}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen Lateral */}
        <div className="w-full lg:w-96">
          <CartSummary
            items={MOCK_CART_ITEMS}
            lang={lang}
            dict={dict}
          />
        </div>

      </div>
    </>
  );
}