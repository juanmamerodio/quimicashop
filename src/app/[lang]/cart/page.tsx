import NavBar from "@/components/NavBar";
import Link from "next/link";
import CartSummary from "@/components/CartSummary";

interface PageProps {
  params: {
    lang: string;
  };
}

// ⚠️ MOCK DATA: Simulamos lo que habría en el localStorage
const MOCK_CART_ITEMS = [
  {
    id: "uuid-1",
    name: "Vaso de Precipitados 250ml",
    priceArs: 4500,
    quantity: 2,
  },
  {
    id: "uuid-2",
    name: "Ácido Clorhídrico 37% (1L)",
    priceArs: 12800,
    quantity: 1,
  }
];

export default function CartPage({ params }: PageProps) {
  const { lang } = params;

  // Cálculo rápido para la demo
  const subtotal = MOCK_CART_ITEMS.reduce((acc, item) => acc + (item.priceArs * item.quantity), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <NavBar lang={lang} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-lab-text mb-8">
          Tu <span className="text-lab-primary">Carrito</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Lista de Items */}
          <div className="flex-grow space-y-4">
            {MOCK_CART_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-lab-surface rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                  {/* Imagen Placeholder pequeña */}
                  <div className="w-16 h-16 bg-lab-bg rounded flex items-center justify-center border border-white/5">
                    <span className="text-[10px] text-lab-muted font-mono opacity-50">IMG</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lab-text">{item.name}</h3>
                    <p className="text-sm font-mono text-lab-muted">{formatPrice(item.priceArs)} c/u</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Controles de Cantidad (Visuales) */}
                  <div className="flex items-center bg-lab-bg rounded-lg border border-white/10 p-1">
                    <button className="px-2 text-lab-muted hover:text-lab-primary transition-colors">-</button>
                    <span className="font-mono text-sm px-2 w-8 text-center">{item.quantity}</span>
                    <button className="px-2 text-lab-muted hover:text-lab-primary transition-colors">+</button>
                  </div>
                  
                  {/* Total del Item */}
                  <div className="w-24 text-right font-mono font-medium text-lab-text">
                    {formatPrice(item.priceArs * item.quantity)}
                  </div>
                  
                  {/* Botón Eliminar */}
                  <button className="p-2 text-lab-muted hover:text-red-400 transition-colors" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen Lateral */}
          <div className="w-full lg:w-96">
            <CartSummary 
              subtotal={subtotal} 
              lang={lang} 
            />
          </div>

        </div>
      </main>
    </>
  );
}