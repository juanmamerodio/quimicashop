import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  lang: string;
}

export default function CartSummary({ subtotal, lang }: CartSummaryProps) {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-lab-surface rounded-xl border border-white/10 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-lab-text mb-6">Resumen del Pedido</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-lab-muted">
          <span>Subtotal</span>
          <span className="font-mono">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-lab-muted">
          <span>Envío</span>
          <span className="text-sm italic">Retiro en EEST N°1</span>
        </div>
        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="font-semibold text-lab-text">Total</span>
          <span className="font-mono text-2xl text-lab-primary font-bold">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>

      <Link 
        href={`/${lang}/checkout`}
        className="w-full block text-center py-3 px-4 bg-lab-primary text-lab-bg font-bold rounded-lg hover:bg-lab-primary/90 transition-colors shadow-[0_0_15px_rgba(0,217,160,0.2)] hover:shadow-[0_0_20px_rgba(0,217,160,0.4)]"
      >
        Proceder al Pago
      </Link>
      
      <p className="text-xs text-lab-muted text-center mt-4">
        El pago se realiza mediante transferencia. Se solicitará el comprobante en el siguiente paso.
      </p>
    </div>
  );
}