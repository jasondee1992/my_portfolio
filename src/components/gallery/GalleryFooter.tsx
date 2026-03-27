export default function GalleryFooter() {
  return (
    <footer className="container-page mt-20 pb-10">
      <div className="section-panel soft-hover px-6 py-7 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-eyebrow">Gallery page</div>
            <div className="mt-4 text-xl font-normal text-white/94">
              Visual work and moments, presented with the same care as the code.
            </div>
            <div className="mt-2 text-sm text-white/52">
              © 2026 Jasond Delos Santos. All rights reserved.
            </div>
          </div>

          <a className="premium-button-secondary" href="/projects">
            Explore projects
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
