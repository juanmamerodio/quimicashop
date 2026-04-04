'use client';

import { useState } from 'react';

interface ReceiptUploaderProps {
  onFileSelect: (base64: string, file: File) => void;
}

export default function ReceiptUploader({ onFileSelect }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convierte el archivo a Base64 usando la API estándar del navegador
  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onFileSelect(base64String, file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <label 
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-lab-primary bg-lab-primary/10' 
            : 'border-white/20 bg-lab-surface hover:border-lab-primary/50 hover:bg-lab-surface/80'
        }`}
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
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          {preview ? (
            <div className="relative w-full h-36 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-full max-w-full rounded border border-white/10 shadow-lg object-contain" />
              <div className="absolute inset-0 flex items-center justify-center bg-lab-bg/60 opacity-0 hover:opacity-100 transition-opacity rounded">
                <span className="text-white font-semibold">Cambiar imagen</span>
              </div>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mb-3 text-lab-muted" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-lab-text"><span className="font-semibold text-lab-primary">Hacé clic para subir</span> o arrastrá el comprobante</p>
              <p className="text-xs text-lab-muted">JPG, PNG o WEBP (Máx. 5MB)</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }} 
        />
      </label>
    </div>
  );
}