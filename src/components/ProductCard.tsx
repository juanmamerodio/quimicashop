import { formatPrice } from "@/lib/format";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  priceArs: number;
  category: string;
  categoryLabel: string;
  addToCartText: string;
}

export default function ProductCard({
  id,
  name,
  description,
  priceArs,
  categoryLabel,
  addToCartText,
}: ProductCardProps) {
  return (
    <div className="card group flex flex-col overflow-hidden">

      {/* Placeholder de imagen */}
      <div className="aspect-square w-full bg-gradient-to-br from-gray-lt to-surface border-b border-border flex items-center justify-center relative">
        <span className="text-muted text-sm font-mono opacity-50">IMG_{id.substring(0, 4)}</span>
        <div className="chip absolute top-3 left-3 uppercase">
          {categoryLabel}
        </div>
      </div>

      {/* Info del Producto */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-text mb-1">{name}</h3>
        <p className="text-sm text-muted line-clamp-2 mb-4 flex-grow">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-mono text-lg text-text font-medium">
            {formatPrice(priceArs)}
          </span>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-lt text-accent border border-accent/20 hover:bg-accent hover:text-surface font-medium text-sm transition-colors duration-180 cursor-pointer">
            <ShoppingCart className="w-4 h-4" />
            {addToCartText}
          </button>
        </div>
      </div>
    </div>
  );
}