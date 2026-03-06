const techStacks = [
  "Python",
  "Dash",
  "Snowflake",
  "SQL",
  "FastAPI",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Automation",
  "AI / RAG",
  "Git",
];

export default function InfoCards() {
  return (
    <section className="container-page mt-8 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div
        className="rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <h2 className="mb-4 text-2xl font-semibold text-white/95">Get in Touch</h2>
        <p className="mb-8 text-white/60">
          Open for collaboration, freelance work, and full-time opportunities.
        </p>

        <div className="space-y-5 text-white/75">
          <div className="flex items-center gap-3">
            <span className="text-white/50">✉</span>
            <span>jasond@example.com</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/50">⌘</span>
            <span>github.com/jasond</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/50">in</span>
            <span>linkedin.com/in/jasond</span>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white/95">Tech Stack</h2>
          <span className="text-sm text-white/45">View All →</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {techStacks.map((tech) => (
            <span
              key={tech}
              className="rounded-full px-4 py-2 text-sm"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}