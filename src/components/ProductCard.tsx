interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  priceArs: number;
  category: string;
}

export default function ProductCard({ id, name, description, priceArs, category }: ProductCardProps) {
  // Formateador de moneda argentina
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group flex flex-col bg-lab-surface rounded-xl border border-white/10 overflow-hidden hover:border-lab-primary/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,217,160,0.1)]">
      
      {/* Área de Imagen simulada (Placeholder con gradiente) */}
      <div className="aspect-square w-full bg-gradient-to-br from-lab-bg to-lab-surface border-b border-white/10 flex items-center justify-center relative">
        <span className="text-lab-muted text-sm font-mono opacity-50">IMG_{id.substring(0,4)}</span>
        <div className="absolute top-3 left-3 px-2 py-1 bg-lab-bg/80 backdrop-blur text-xs font-mono rounded text-lab-primary border border-lab-primary/20 uppercase">
          {category}
        </div>
      </div>

      {/* Info del Producto */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-lab-text mb-1">{name}</h3>
        <p className="text-sm text-lab-muted line-clamp-2 mb-4 flex-grow">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="font-mono text-xl text-lab-text font-medium">
            {formatPrice(priceArs)}
          </span>
          <button className="px-4 py-2 rounded-lg bg-lab-primary/10 text-lab-primary border border-lab-primary/20 hover:bg-lab-primary hover:text-lab-bg font-semibold transition-colors duration-300">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}