import { internalProjects } from "@/data/projects";

export default function FeaturedProjectsGrid() {
  return (
    <section className="container-page mt-12">
      <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/35">
        Internal Projects
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {internalProjects.map((project) => (
          <div
            key={project.title}
            className="rounded-[28px] p-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.30)",
            }}
          >
            <div className="mb-3 text-xs font-medium tracking-[0.18em] text-white/35">
              {project.no}
            </div>

            <h3 className="text-xl font-semibold leading-8 text-white/95">
              {project.title}
            </h3>

            <div className="mt-4 space-y-1 text-sm text-white/55">
              <div>
                <span className="text-white/80">Role:</span> {project.role}
              </div>
              <div>
                <span className="text-white/80">Project Type:</span> {project.type}
              </div>
            </div>

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

            {project.note && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/45">
                {project.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
