import Image from "next/image";
import { internalProjects } from "@/data/projects";
import { getProjectTechIcon } from "@/lib/projectTechIcons";

export default function FeaturedProjectsGrid() {
  return (
    <section className="container-page section-shell">
      <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/35">
        Internal Projects
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {internalProjects.map((project) => (
          <div key={project.title} className="section-panel p-5">
            <div className="mb-3 text-xs font-medium tracking-[0.18em] text-white/35">{project.no}</div>

            <h3 className="text-xl font-semibold leading-8 text-white/95">{project.title}</h3>

            <div className="mt-4 space-y-1 text-sm text-white/55">
              <div>
                <span className="text-white/80">Role:</span> {project.role}
              </div>
              <div>
                <span className="text-white/80">Project Type:</span> {project.type}
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/60">{project.description}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {project.tags.map((tag) => (
                <div key={tag} className="project-tech-item">
                  <div className="project-tech-icon-wrap">
                    <Image
                      src={getProjectTechIcon(tag)}
                      alt={tag}
                      width={24}
                      height={24}
                      className="project-tech-icon"
                    />
                  </div>
                  <span className="project-tech-label">{tag}</span>
                </div>
              ))}
            </div>

            {project.note && (
              <div className="premium-card mt-6 px-4 py-3 text-sm text-white/45">{project.note}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
