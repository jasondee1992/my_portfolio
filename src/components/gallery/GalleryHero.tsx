export default function GalleryHero() {
  return (
    <section className="container-page pt-10 md:pt-14">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-white/95 md:text-7xl">
          Gallery
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/60">
          A collection of photography moments and visual captures. This gallery
          loads dynamically from your image folder, so new images appear
          automatically once added.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <span
            className="rounded-full px-4 py-2 text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.78)",
            }}
          >
            Photography
          </span>
        </div>
      </div>
    </section>
  );
}