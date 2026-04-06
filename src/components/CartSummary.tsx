import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/lib/types";

interface CartItem {
  id: string;
  precio_ars: number;
  cantidad: number;
}

interface CartSummaryProps {
  items: CartItem[];
  lang: string;
  dict: Dictionary;
}

export default function CartSummary({ items, lang, dict }: CartSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.precio_ars * item.cantidad, 0);
  const total = subtotal; // En este proyecto no hay costos de envío adicionales

  return (
    <div className="card p-6 sticky top-24 transition-all duration-300">
      <h2 className="text-xl font-semibold text-text mb-6 tracking-tight">
        {dict.cart.summary.title}
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-muted font-medium">{dict.cart.summary.subtotal}</span>
          <span className="font-mono font-medium text-text">
            ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="flex justify-between items-center">
          <span className="text-text font-bold text-lg">{dict.cart.summary.total}</span>
          <span className="font-mono font-bold text-lg text-accent">
            ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <Link
        href={`/${lang}/checkout`}
        className="btn-primary w-full flex items-center justify-center gap-2 font-semibold transition-transform active:scale-95 hover:shadow-md"
      >
        {dict.cart.summary.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-center text-[11px] text-muted mt-4 leading-relaxed">
        {dict.cart.summary.disclaimer}
      </p>
    </div>
  );
}