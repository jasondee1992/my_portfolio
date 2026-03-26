export default function Footer() {
  return (
    <footer className="container-page mt-20 pb-10">
      <div className="section-panel px-6 py-7 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-eyebrow">Let&apos;s build</div>
            <div className="mt-4 text-2xl font-normal text-white/94">
              Available for thoughtful full-time roles.
            </div>
            <div className="mt-2 text-sm text-white/52">
              © 2026 Jasond Delos Santos. All rights reserved.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/72">
            <a className="glass-chip rounded-full px-4 py-2" href="mailto:jasond.worked@gmail.com">
              Email
            </a>
            <a
              className="glass-chip rounded-full px-4 py-2"
              href="https://www.linkedin.com/in/jasond-delos-santos-94978a111/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <button className="glass-chip rounded-full px-4 py-2" type="button">
              Portfolio AI
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
