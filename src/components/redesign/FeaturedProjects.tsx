const projects = [
  {
    title: "Smart Ticket Assignment",
    description:
      "An internal automation system that assigns tickets based on business rules, workload, and operational logic.",
    tags: ["Python", "Dash", "Automation", "SQLite"],
    cta: "Live",
  },
  {
    title: "Auto Report Generator",
    description:
      "A reporting workflow that generates and distributes reports from Snowflake data sources to stakeholders.",
    tags: ["Python", "Snowflake", "SQL", "ETL"],
    cta: "Live",
  },
  {
    title: "Portfolio AI Chatbot",
    description:
      "A portfolio chatbot designed to answer only about JasonD’s experience, projects, and skills using structured content.",
    tags: ["Next.js", "AI", "RAG", "FastAPI"],
    cta: "Source",
  },
  {
    title: "Ops Monitoring Dashboard",
    description:
      "A dashboard for monitoring workflow status, processing metrics, and operational exceptions in real time.",
    tags: ["Dash", "Plotly", "Python", "Analytics"],
    cta: "Source",
  },
];

export default function FeaturedProjects() {
  return (
    <section className="container-page mt-10">
      <div
        className="rounded-[32px] p-8 md:p-10"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-white/95">
            Featured Projects
          </h2>
          <span className="text-sm text-white/45">View All →</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-[28px] p-7"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <h3 className="text-2xl font-semibold text-white/95">
                {project.title}
              </h3>

              <p className="mt-5 text-[15px] leading-7 text-white/60">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1.5 text-xs"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  className="rounded-full px-5 py-3 text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.9)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.30)",
                  }}
                >
                  {project.cta} ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}