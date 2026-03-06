{selectedImage && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
    onClick={closeLightbox}
  >
    <div
      className="relative w-full max-w-6xl"
      onClick={(e) => e.stopPropagation()}
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
        className="absolute right-4 top-4 rounded-full px-4 py-2 text-sm font-semibold text-white"
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
        <div className="text-lg font-medium text-white/85">
          {selectedImage.alt.replace(/\.[^/.]+$/, "")}
        </div>

        <div className="mt-1 text-sm text-white/50">
          {selectedIndex! + 1} / {images.length}
        </div>
      </div>
    </div>
  </div>
)}