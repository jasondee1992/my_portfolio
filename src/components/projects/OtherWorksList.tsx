import type { ManagedProject } from "@/lib/projects/types";

export default function OtherWorksList({ projects }: { projects: ManagedProject[] }) {
  return (
    <section className="container-page section-shell">
      <div className="mb-5 text-sm font-normal uppercase tracking-wider text-white/35">
        Other Works
      </div>

      {projects.length === 0 ? (
        <div className="section-panel soft-hover p-6 text-sm text-white/60">
          No other projects added yet.
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((work, index) => (
            <div key={work.id} className="section-panel soft-hover p-6 md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-3 text-xs text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <h3 className="text-2xl font-normal text-white/95">{work.title}</h3>

                  <div className="mt-4 space-y-1 text-sm text-white/55">
                    <div>
                      <span className="text-white/80">Role:</span> {work.role}
                    </div>
                    <div>
                      <span className="text-white/80">Project Type:</span> {work.projectType}
                    </div>
                  </div>

                  <p className="mt-3 max-w-4xl text-sm leading-7 text-white/60">
                    {work.details}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {work.techStack.map((tag) => (
                      <span key={tag} className="project-tech-item project-tech-label">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
