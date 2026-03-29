import Link from "next/link";
import { getHomepageProjects } from "@/lib/projects/projectStorage";

function getCollapsedText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  const visibleText = text.slice(0, maxLength);
  const lastSpace = visibleText.lastIndexOf(" ");

  return `${visibleText.slice(0, lastSpace > 0 ? lastSpace : visibleText.length).trim()}...`;
}

function ExpandableDescription({ text, maxLength = 120 }: { text: string; maxLength?: number }) {
  if (text.length <= maxLength) {
    return <p className="type-card-body leading-8 text-white/68">{text}</p>;
  }

  return (
    <details className="group">
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        <p className="type-card-body leading-8 text-white/68">{getCollapsedText(text, maxLength)}</p>
        <span className="mt-3 inline-flex text-sm font-medium text-white/70 transition hover:text-white group-open:hidden">
          See more
        </span>
        <span className="mt-3 hidden text-sm font-medium text-white/70 transition hover:text-white group-open:inline-flex">
          See less
        </span>
      </summary>

      <p className="type-card-body mt-3 leading-8 text-white/68">{text}</p>
    </details>
  );
}

export default async function FeaturedProjects() {
  const projects = await getHomepageProjects(4);

  return (
    <section className="container-page section-shell">
      <div className="section-panel p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="section-eyebrow">Projects</div>
            <h2
              className="section-title mt-3 font-normal tracking-[-0.02em] text-white/95"
              style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
            >
              Selected work with practical impact
            </h2>
          </div>

          <Link href="/projects" prefetch={false} className="premium-button-secondary hidden md:inline-flex">
            View All
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="premium-card p-6 text-sm text-white/60">
            No homepage projects selected yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="premium-card p-6 transition hover:border-white/15 hover:bg-white/[0.03]"
              >
                <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-[#8fb8ff] to-transparent" />

                <h3 className="type-card-title font-semibold tracking-[-0.02em] text-white/95">
                  {project.title}
                </h3>

                <div className="mt-3 text-xs uppercase tracking-[0.16em] text-white/35">
                  {project.section === "enterprise" ? "Enterprise" : "Other"} · {project.visibility}
                </div>

                <div className="mt-5">
                  <ExpandableDescription text={project.summaryDescription} maxLength={125} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {project.techStack.map((item) => (
                    <span key={item} className="project-tech-item project-tech-label">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <Link href="/projects" prefetch={false} className="premium-button-secondary mt-8 inline-flex md:hidden">
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
