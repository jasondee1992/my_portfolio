export default function GalleryHero() {
  return (
    <section className="container-page pt-10 md:pt-14">
      <div className="section-panel mx-auto max-w-5xl px-8 py-10 text-center md:px-12 md:py-14">
        <div className="section-eyebrow mx-auto">Gallery</div>
        <h1 className="type-page-title section-title gradient-text mt-6 font-normal">Gallery</h1>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/60">
          A collection of photography moments and visual captures. This gallery
          loads dynamically from your image folder, so new images appear
          automatically once added.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <span className="glass-chip rounded-full px-4 py-2 text-sm">Photography</span>
        </div>
      </div>
    </section>
  );
}
