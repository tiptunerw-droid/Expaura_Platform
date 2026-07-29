"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxImage {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface Props {
  images: LightboxImage[];
  startIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, startIndex, onClose }: Props) {
  const [idx, setIdx] = React.useState(startIndex);
  const img = images[idx];

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === "ArrowRight") setIdx((i) => (i < images.length - 1 ? i + 1 : 0));
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  if (!img) return null;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i > 0 ? i - 1 : images.length - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i < images.length - 1 ? i + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      {/* Floating close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <span className="text-xs sm:text-sm text-gray-400 font-tabular bg-black/60 px-2.5 py-1 rounded-full">
          {idx + 1} / {images.length}
        </span>
      </div>

      {/* Image area — fills all remaining space */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-0 sm:px-12" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.imageUrl}
            alt={img.caption || ""}
            className="max-w-full max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Side arrows — overlay on image edges */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* Bottom: dots + caption */}
      <div className="shrink-0 flex flex-col items-center gap-2 pb-4 sm:pb-6 pt-2 px-4">
        {images.length > 1 && (
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-emerald-400 w-5" : "bg-gray-600 hover:bg-gray-400"}`}
              />
            ))}
          </div>
        )}
        {img.caption && (
          <p className="text-xs sm:text-sm text-gray-400 text-center max-w-lg">{img.caption}</p>
        )}
      </div>
    </div>
  );
}
