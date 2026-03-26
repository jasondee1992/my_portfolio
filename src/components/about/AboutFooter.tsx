export default function AboutFooter() {
  return (
    <footer className="container-page mt-20 pb-10">
      <div className="section-panel mx-auto max-w-5xl px-6 py-7 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-eyebrow">About page</div>
            <div className="mt-4 text-xl font-normal text-white/94">
              Thanks for taking a closer look at my background.
            </div>
            <div className="mt-2 text-sm text-white/52">
              © 2026 Jasond Delos Santos. All rights reserved.
            </div>
          </div>

          <a className="premium-button-secondary" href="mailto:jasond.worked@gmail.com">
            Get in touch
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
