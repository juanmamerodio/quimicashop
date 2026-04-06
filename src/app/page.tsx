import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-black/[0.05] max-w-md">
        <h1 className="text-3xl font-bold text-[#1c1c1e] mb-4">
          E.E.S.T N°1 Quimica Shop
        </h1>
        <p className="text-[#6b7280] mb-8">
          El motor de la tienda está listo. Próximo paso: Configurar diccionarios e idiomas.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-[#e8f3ef] text-[#3d8c6e] rounded-full text-sm font-medium">
          Deploy Status: Online 🟢
        </div>
      </div>
    </div>
  );
}