"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type GalleryImage = {
  src: string;
  alt: string;
};

type GalleryLightboxClientProps = {
  images: GalleryImage[];
};

export default function GalleryLightboxClient({
  images,
}: GalleryLightboxClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedImage =
    selectedIndex === null ? null : images[selectedIndex] ?? null;

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  function openLightbox(index: number) {
    setSelectedIndex(index);
  }

  const showPrev = useCallback(() => {
    if (selectedIndex === null || images.length === 0) return;

    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  }, [images.length, selectedIndex]);

  const showNext = useCallback(() => {
    if (selectedIndex === null || images.length === 0) return;

    setSelectedIndex((selectedIndex + 1) % images.length);
  }, [images.length, selectedIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (selectedIndex === null) return;

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, selectedIndex, showNext, showPrev]);

  if (images.length === 0) {
    return (
      <section className="container-page mt-12">
        <div
          className="rounded-[28px] px-6 py-10 text-center text-white/60"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          No gallery images found yet.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container-page mt-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => openLightbox(index)}
              className="group overflow-hidden rounded-[28px] text-left"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                <div className="absolute inset-0 bg-black/15 transition duration-300 group-hover:bg-black/35" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="type-card-title text-white">
                    {image.alt.replace(/\.[^/.]+$/, "")}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative mx-auto overflow-hidden rounded-[30px] border border-white/10"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 25px 80px rgba(0,0,0,0.55)",
              }}
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 rounded-full px-4 py-2 text-sm font-normal text-white"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              Close ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full px-4 py-3 text-white"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full px-4 py-3 text-white"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  →
                </button>
              </>
            )}

            <div className="mt-4 text-center">
              <div className="type-card-title text-white/85">
                {selectedImage.alt.replace(/\.[^/.]+$/, "")}
              </div>

              <div className="type-card-body mt-1 text-white/50">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
