import Image from "next/image";
import { otherWorks } from "@/data/projects";
import { getProjectTechIcon } from "@/lib/projectTechIcons";

export default function OtherWorksList() {
  return (
    <section className="container-page section-shell">
      <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/35">
        Other Works
      </div>

      <div className="space-y-5">
        {otherWorks.map((work) => (
          <div key={work.no} className="section-panel p-6 md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-3 text-xs text-white/30">{work.no}</div>

                <h3 className="text-2xl font-semibold text-white/95">{work.title}</h3>

                <div className="mt-4 space-y-1 text-sm text-white/55">
                  <div>
                    <span className="text-white/80">Role:</span> {work.role}
                  </div>
                  <div>
                    <span className="text-white/80">Project Type:</span> {work.type}
                  </div>
                </div>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-white/60">{work.description}</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {work.tags.map((tag) => (
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
