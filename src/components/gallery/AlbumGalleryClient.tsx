"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type AlbumImage = {
  src: string;
  alt: string;
};

type Album = {
  slug: string;
  name: string;
  cover: string | null;
  images: AlbumImage[];
};

export default function AlbumGalleryClient({
  albums,
}: {
  albums: Album[];
}) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const closeAlbum = useCallback(() => {
    setSelectedAlbum(null);
    setSelectedIndex(0);
  }, []);

  function openAlbum(album: Album) {
    setSelectedAlbum(album);
    setSelectedIndex(0);
  }

  const showPrev = useCallback(() => {
    if (!selectedAlbum) return;
    setSelectedIndex((prev) => (prev - 1 + selectedAlbum.images.length) % selectedAlbum.images.length);
  }, [selectedAlbum]);

  const showNext = useCallback(() => {
    if (!selectedAlbum) return;
    setSelectedIndex((prev) => (prev + 1) % selectedAlbum.images.length);
  }, [selectedAlbum]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedAlbum) return;

      if (e.key === "Escape") closeAlbum();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAlbum, selectedAlbum, showNext, showPrev]);

  const currentImage =
    selectedAlbum && selectedAlbum.images.length > 0
      ? selectedAlbum.images[selectedIndex]
      : null;

  return (
    <>
      <section className="container-page section-shell">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <button
              key={album.slug}
              type="button"
              onClick={() => openAlbum(album)}
              className="group section-panel overflow-hidden text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {album.cover ? (
                  <Image
                    src={album.cover}
                    alt={album.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}

                <div className="absolute inset-0 bg-black/15 transition duration-300 group-hover:bg-black/35" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xl font-normal capitalize text-white">{album.name}</div>
                  <div className="mt-1 text-sm text-white/70">{album.images.length} photos</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedAlbum && currentImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={closeAlbum}
        >
          <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative mx-auto overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="relative aspect-[16/10] w-full">
                <Image src={currentImage.src} alt={currentImage.alt} fill className="object-contain" sizes="100vw" priority />
              </div>
            </div>

            <button
              type="button"
              onClick={closeAlbum}
              className="premium-button-secondary absolute right-4 top-4"
            >
              Close
            </button>

            {selectedAlbum.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="premium-button-secondary absolute left-4 top-1/2 -translate-y-1/2"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  className="premium-button-secondary absolute right-4 top-1/2 -translate-y-1/2"
                >
                  →
                </button>
              </>
            )}

            <div className="mt-4 text-center">
              <div className="text-lg font-medium capitalize text-white/85">{selectedAlbum.name}</div>
              <div className="mt-1 text-sm text-white/50">
                {selectedIndex + 1} / {selectedAlbum.images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
