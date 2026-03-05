import data from "@/data/portfolio.json";

export default function Contact() {
  const c = data.contact;

  return (
    <footer id="contact" className="container-page pb-16">
      <div className="panel panel-inner">
        <h2 className="text-2xl font-semibold text-white/90">Get in touch</h2>
        <p className="mt-2 muted max-w-2xl">
          Open for collaboration & freelance. Let’s build something clean and useful.
        </p>

        <div className="mt-6 grid gap-3 text-sm text-white/70">
          <a className="chip hover-lift w-fit" href={`mailto:${c.email}`}>
            📧 {c.email}
          </a>
          <a className="chip hover-lift w-fit" href={c.linkedin} target="_blank" rel="noreferrer">
            💼 LinkedIn ↗
          </a>
          <a className="chip hover-lift w-fit" href={c.github} target="_blank" rel="noreferrer">
            🐙 GitHub ↗
          </a>
        </div>

        <div className="mt-8 text-xs text-white/45">
          © {new Date().getFullYear()} JasonD. Built with Next.js.
        </div>
      </div>
    </footer>
  );
}