"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, ScanEye, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ReceiptUploaderProps {
  pedidoId: string;
  totalEsperado: number;
  onSuccess: () => void;
  texts: {
    clickToUpload: string;
    dragHint: string;
    formats: string;
    change: string;
  };
}

export default function ReceiptUploader({ pedidoId, totalEsperado, onSuccess, texts }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Para el efecto visual de escaneo
  const [isSubmitting, setIsSubmitting] = useState(false); // Para la llamada a la API
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setError("Por favor, subí una imagen válida (JPG, PNG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande. Máximo 5MB.");
      return;
    }

    setError(null);
    setFileType(file.type);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);

      // Efecto visual de escaneo de IA
      setTimeout(() => setIsProcessing(false), 2000);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    setError(null);
  };

  const uploadReceipt = async () => {
    if (!preview) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: preview, // Enviamos el dataURL completo
          mimeType: fileType,
          pedidoId,
          totalEsperado
        }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        onSuccess();
      } else {
        setError(result.reason || "El comprobante no pudo ser validado. Por favor, revisá el monto y la fecha.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.div
        layout
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[280px] rounded-[32px] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden",
          isDragging
            ? "border-accent bg-accent-lt scale-[1.01] shadow-lg shadow-accent/10"
            : "border-border bg-gray-lt/50 hover:border-accent/40 hover:bg-gray-lt",
          preview && "border-solid border-border bg-surface"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-8 text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-white shadow-soft text-muted transition-colors">
                <Upload className={cn("w-10 h-10 transition-transform duration-500", isDragging && "translate-y-[-5px]")} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text">
                  <span className="font-bold text-accent">{texts.clickToUpload}</span> {texts.dragHint}
                </p>
                <p className="text-xs text-muted font-mono">{texts.formats}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-full p-4 flex items-center justify-center"
            >
              <div className="relative group max-w-xs max-h-64 rounded-2xl overflow-hidden border border-border shadow-sm">
                <img src={preview} alt="Comprobante" className="max-h-64 w-auto object-contain block" />

                {/* EFECTO DE ESCANEO IA */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent z-10 shadow-[0_0_15px_rgba(61,140,110,0.8)]"
                    />
                  )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <span className="text-white text-sm font-bold px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
                    {texts.change}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeFile}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/90 backdrop-blur-md text-red-500 shadow-soft border border-red-100 z-30"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md border border-border text-[10px] font-bold text-muted flex items-center gap-2 shadow-sm">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-accent" />
                    <span className="text-accent uppercase tracking-widest">Analizando con Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <ScanEye className="w-3 h-3 text-accent" />
                    <span className="uppercase tracking-widest">Imagen Cargada</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ERROR ALERT */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="chip flex items-center gap-3 bg-red-50 text-red-600 border-red-200 p-4 rounded-2xl shadow-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBMIT BUTTON */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={uploadReceipt}
        disabled={!preview || isSubmitting}
        className={cn(
          "btn-primary w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg",
          (!preview || isSubmitting) && "opacity-50 cursor-not-allowed grayscale"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Validando Pago...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirmar y Finalizar Pedido</span>
          </>
        )}
      </motion.button>
    </div>
  );
}