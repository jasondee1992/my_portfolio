const groups = [
  {
    title: "Frontend",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    title: "Backend & Data",
    items: ["Python", "FastAPI", "Snowflake", "SQL", "SQLite", "Dash", "ETL"],
  },
  {
    title: "Tools & Platforms",
    items: ["Git", "GitHub", "Linux", "Docker", "Postman", "Vercel"],
  },
  {
    title: "AI / Automation",
    items: ["RAG", "Prompt Engineering", "Automation", "Vector Search", "FAISS"],
  },
];

export default function TechStackSection() {
  return (
    <section className="container-page section-shell">
      <div className="mx-auto max-w-5xl">
        <div className="section-header items-center text-center">
          <div className="section-eyebrow">Capabilities</div>
          <h2 className="type-section-title section-title font-semibold text-white/95">
            Technology stack
          </h2>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.title} className="section-panel p-8">
              <h3 className="text-xl font-semibold uppercase tracking-[0.16em] text-white/90">
                {group.title}
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span key={item} className="glass-chip rounded-full px-4 py-2 text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
