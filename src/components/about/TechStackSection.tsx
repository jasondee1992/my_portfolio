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
    <section className="container-page mt-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-4xl font-semibold text-white/95">
          Tech Stack
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.title}
              className="rounded-[28px] p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
              }}
            >
              <h3 className="text-xl font-semibold uppercase tracking-wide text-white/90">
                {group.title}
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full px-4 py-2 text-sm"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
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