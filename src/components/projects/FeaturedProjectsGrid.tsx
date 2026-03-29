import type { ManagedProject } from "@/lib/projects/types";

export default function FeaturedProjectsGrid({ projects }: { projects: ManagedProject[] }) {
  return (
    <section className="container-page section-shell">
      <div className="mb-5 text-sm font-normal uppercase tracking-wider text-white/35">
        Selected Enterprise Work
      </div>

      {projects.length === 0 ? (
        <div className="section-panel soft-hover p-6 text-sm text-white/60">
          No enterprise projects added yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <div key={project.id} className="section-panel soft-hover p-5">
              <div className="mb-3 text-xs font-medium tracking-[0.18em] text-white/35">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="text-xl font-normal leading-8 text-white/95">{project.title}</h3>

              <div className="mt-4 space-y-1 text-sm text-white/55">
                <div>
                  <span className="text-white/80">Role:</span> {project.role}
                </div>
                <div>
                  <span className="text-white/80">Project Type:</span> {project.projectType}
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/60">{project.details}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                {project.techStack.map((tag) => (
                  <span key={tag} className="project-tech-item project-tech-label">
                    {tag}
                  </span>
                ))}
              </div>

              {project.visibility === "internal" ? (
                <div className="premium-card mt-6 px-4 py-3 text-sm text-white/45">
                  Internal project. Public demo not available.
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
