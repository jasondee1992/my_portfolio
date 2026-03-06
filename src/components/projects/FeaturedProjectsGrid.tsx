const featuredProjects = [
  {
    title: "Smart Ticket Assignment",
    description:
      "An internal automation tool that assigns tickets based on business rules, team workload, and process logic.",
    tags: ["Python", "Dash", "Automation", "SQLite"],
    button: "Live",
  },
  {
    title: "Auto Report Generator",
    description:
      "A reporting system that generates and distributes business reports from Snowflake and structured datasets.",
    tags: ["Python", "Snowflake", "SQL", "ETL"],
    button: "Live",
  },
  {
    title: "Portfolio AI Chatbot",
    description:
      "A portfolio-focused chatbot that answers only about projects, skills, and experience using structured content.",
    tags: ["Next.js", "AI", "RAG", "FastAPI"],
    button: "Source",
  },
  {
    title: "Ops Monitoring Dashboard",
    description:
      "A dashboard for workflow visibility, operational metrics, queue monitoring, and exception tracking.",
    tags: ["Dash", "Plotly", "Python", "Analytics"],
    button: "Source",
  },
  {
    title: "Daily News Automation",
    description:
      "A lightweight automation concept for collecting and formatting daily updates into structured summaries.",
    tags: ["Python", "Automation", "API", "n8n"],
    button: "View",
  },
  {
    title: "Personal Portfolio",
    description:
      "A modern premium portfolio website built with a dark visual style, structured layout, and AI-ready components.",
    tags: ["Next.js", "Tailwind", "TypeScript", "UI"],
    button: "View",
  },
];

export default function FeaturedProjectsGrid() {
  return (
    <section className="container-page mt-12">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((project, index) => (
          <div
            key={project.title}
            className="rounded-[28px] p-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.30)",
            }}
          >
            <div
              className="mb-5 flex h-56 items-end rounded-[24px] p-4"
              style={{
                background:
                  index % 2 === 0
                    ? "radial-gradient(circle at 50% 20%, rgba(96,165,250,0.22), rgba(255,255,255,0.03) 60%)"
                    : "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.03) 60%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="mx-auto h-36 w-48 rounded-[18px]"
                style={{
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                }}
              />
            </div>

            <h3 className="text-xl font-semibold text-white/95">
              {project.title}
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/60">
              {project.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1.5 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.70)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-7 flex justify-end">
              <button
                className="rounded-full px-5 py-3 text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.92)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
                }}
              >
                {project.button} ↗
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}