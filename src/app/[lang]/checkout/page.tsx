'use client';

import { useState, use } from 'react';
import { CheckCircle, Info } from 'lucide-react';
import ReceiptUploader from "@/components/ReceiptUploader";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/lib/types";

import esDict from "@/dictionaries/es.json";
import enDict from "@/dictionaries/en.json";

const dicts: Record<string, Dictionary> = { es: esDict, en: enDict };

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = dicts[lang] ?? dicts.es;

  const MOCK_TOTAL = 21800;

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    <div className="max-w-4xl mx-auto">
      {showSuccess ? (
        <div className="card p-8 text-center mt-10">
          <div className="w-20 h-20 bg-accent-lt rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-text mb-4">{dict.checkout.success.title}</h2>
          <p className="text-muted mb-6">
            {dict.checkout.success.message}
          </p>
          <button
            onClick={() => window.location.href = `/${lang}`}
            className="px-6 py-2 bg-gray-lt border border-border rounded-full hover:bg-accent-lt hover:text-accent transition-colors duration-180 cursor-pointer"
          >
            {dict.checkout.success.backToCatalog}
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-text mb-8">
            {dict.checkout.title} <span className="text-accent">{dict.checkout.titleAccent}</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Columna Izquierda: Instrucciones y Resumen */}
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4 text-text">{dict.checkout.transfer.title}</h2>
                <div className="space-y-3 text-sm text-muted font-mono">
                  <p className="flex justify-between">
                    <span>{dict.checkout.transfer.alias}:</span>
                    <span className="text-text">{dict.checkout.transfer.aliasValue}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{dict.checkout.transfer.cbu}:</span>
                    <span className="text-text">{dict.checkout.transfer.cbuValue}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{dict.checkout.transfer.holder}:</span>
                    <span className="text-text">{dict.checkout.transfer.holderValue}</span>
                  </p>
                  <div className="border-t border-border my-3 pt-3 flex justify-between items-center text-base font-sans">
                    <span>{dict.checkout.transfer.totalLabel}:</span>
                    <span className="font-mono text-xl text-accent font-bold">{formatPrice(MOCK_TOTAL)}</span>
                  </div>
                </div>
              </div>

              <div className="card p-4 flex gap-3 items-start border-accent/20">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p
                  className="text-xs text-muted leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: dict.checkout.aiNote }}
                />
              </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">{dict.checkout.form.name}</label>
                <input
                  required
                  type="text"
                  className="input-ios w-full"
                  placeholder={dict.checkout.form.namePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">{dict.checkout.form.email}</label>
                <input
                  required
                  type="email"
                  className="input-ios w-full"
                  placeholder={dict.checkout.form.emailPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">{dict.checkout.form.receipt}</label>
                <ReceiptUploader
                  onFileSelect={(base64, file) => {
                    setImageBase64(base64);
                    setSelectedFile(file);
                  }}
                  texts={dict.checkout.uploader}
                />
              </div>

              <button
                type="submit"
                disabled={!imageBase64 || isSubmitting}
                className={`w-full py-3 px-4 font-semibold rounded-full transition-all duration-180 flex justify-center items-center gap-2 cursor-pointer ${
                  !imageBase64
                    ? 'bg-gray-lt text-muted cursor-not-allowed border border-border'
                    : 'btn-primary'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                    {dict.checkout.form.submitting}
                  </>
                ) : (
                  dict.checkout.form.submit
                )}
              </button>
            </form>

          </div>
        </>
      )}
    </div>
  );
}