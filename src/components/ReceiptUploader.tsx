'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface ReceiptUploaderProps {
  onFileSelect: (base64: string, file: File) => void;
  texts: {
    clickToUpload: string;
    dragHint: string;
    formats: string;
    change: string;
  };
}

export default function ReceiptUploader({ onFileSelect, texts }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-accent bg-accent-lt'
            : 'border-border bg-gray-lt hover:border-accent/50 hover:bg-accent-lt/50'
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
              <img src={preview} alt="Preview" className="max-h-full max-w-full rounded-xl border border-border shadow-sm object-contain" />
              <div className="absolute inset-0 flex items-center justify-center bg-surface/60 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                <span className="text-text font-semibold">{texts.change}</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-3 text-muted" />
              <p className="mb-2 text-sm text-text"><span className="font-semibold text-accent">{texts.clickToUpload}</span> {texts.dragHint}</p>
              <p className="text-xs text-muted">{texts.formats}</p>
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