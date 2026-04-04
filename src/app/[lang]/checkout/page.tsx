'use client';

import { useState } from 'react';
import NavBar from "@/components/NavBar";
import ReceiptUploader from "@/components/ReceiptUploader";

export default function CheckoutPage({ params }: { params: { lang: string } }) {
  // Simulamos un total a pagar
  const MOCK_TOTAL = 17300; 
  
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBase64) return;
    
    setIsSubmitting(true);
    
    // MOCK: Simulamos la espera de la IA (Gemini) y Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 2500);
  };

  return (
    <>
      <NavBar lang={params.lang} />
      
      <main className="container mx-auto px-4 py-8 flex-grow max-w-4xl">
        {showSuccess ? (
          // Mensaje de éxito (reemplaza al alert() para mejor UX)
          <div className="bg-lab-surface border border-lab-primary rounded-xl p-8 text-center shadow-[0_0_30px_rgba(0,217,160,0.15)] mt-10">
            <div className="w-20 h-20 bg-lab-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-lab-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-lab-text mb-4">¡Comprobante Recibido!</h2>
            <p className="text-lab-muted mb-6">
              La inteligencia artificial está verificando tu pago. Te enviaremos un email de confirmación a la brevedad.
            </p>
            <button 
              onClick={() => window.location.href = `/${params.lang}`}
              className="px-6 py-2 bg-lab-bg border border-white/10 rounded-lg hover:border-lab-primary transition-colors"
            >
              Volver al catálogo
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-lab-text mb-8">
              Finalizar <span className="text-lab-primary">Pedido</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Columna Izquierda: Instrucciones y Resumen */}
              <div className="space-y-6">
                <div className="bg-lab-surface rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold mb-4 text-lab-text">Datos para Transferencia</h2>
                  <div className="space-y-3 text-sm text-lab-muted font-mono">
                    <p className="flex justify-between"><span>Alias:</span> <span className="text-lab-text">quimica.reyes.eest1</span></p>
                    <p className="flex justify-between"><span>CBU:</span> <span className="text-lab-text">0140000000000000000000</span></p>
                    <p className="flex justify-between"><span>Titular:</span> <span className="text-lab-text">Cooperadora E.E.S.T N°1</span></p>
                    <div className="border-t border-white/10 my-3 pt-3 flex justify-between items-center text-base font-sans">
                      <span>Total a transferir:</span>
                      <span className="font-mono text-xl text-lab-primary font-bold">{formatPrice(MOCK_TOTAL)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-lab-surface/50 rounded-xl border border-lab-secondary/30 p-4 flex gap-3 items-start">
                  <svg className="w-6 h-6 text-lab-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-xs text-lab-muted leading-relaxed">
                    Nuestro sistema está impulsado por <strong className="text-lab-text">Google Gemini IA</strong>. 
                    Por favor, asegurate de que la imagen del comprobante sea nítida y muestre claramente el importe y la fecha.
                  </p>
                </div>
              </div>

              {/* Columna Derecha: Formulario */}
              <form onSubmit={handleSubmit} className="bg-lab-surface rounded-xl border border-white/10 p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-lab-text mb-2">Nombre completo</label>
                  <input required type="text" className="w-full bg-lab-bg border border-white/10 rounded-lg px-4 py-2.5 text-lab-text focus:outline-none focus:border-lab-primary transition-colors" placeholder="Ej: Juan Pérez" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-lab-text mb-2">Email estudiantil</label>
                  <input required type="email" className="w-full bg-lab-bg border border-white/10 rounded-lg px-4 py-2.5 text-lab-text focus:outline-none focus:border-lab-primary transition-colors" placeholder="ejemplo@eest1.edu.ar" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-lab-text mb-2">Comprobante de Transferencia</label>
                  <ReceiptUploader onFileSelect={(base64) => setImageBase64(base64)} />
                </div>

                <button 
                  type="submit" 
                  disabled={!imageBase64 || isSubmitting}
                  className={`w-full py-3 px-4 font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${
                    !imageBase64 
                      ? 'bg-lab-bg text-lab-muted cursor-not-allowed border border-white/10' 
                      : 'bg-lab-primary text-lab-bg hover:bg-lab-primary/90 shadow-[0_0_15px_rgba(0,217,160,0.2)]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-lab-bg border-t-transparent rounded-full animate-spin"></div>
                      Verificando con IA...
                    </>
                  ) : (
                    'Finalizar y Enviar'
                  )}
                </button>
              </form>

            </div>
          </>
        )}
      </main>
    </>
  );
}