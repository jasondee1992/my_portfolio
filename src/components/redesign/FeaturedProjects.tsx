import Image from "next/image";
import Link from "next/link";
import { SKILL_ICON_MAP } from "@/lib/skillIconPaths";

type Project = {
  title: string;
  description: string;
  tech: { name: string; icon: string }[];
};

const projects: Project[] = [
  {
    title: "Smart Ticket Assignment",
    description:
      "An internal automation system that assigns tickets based on business rules, workload, and operational logic. It helps teams reduce manual routing effort, improve fairness in assignment, and speed up operational turnaround across internal workflows.",
    tech: [
      { name: "Python", icon: SKILL_ICON_MAP.Python },
      { name: "Dash", icon: SKILL_ICON_MAP.Dash },
      { name: "SQLite", icon: SKILL_ICON_MAP.SQLite },
      { name: "AWS", icon: SKILL_ICON_MAP.AWS },
      { name: "Docker", icon: SKILL_ICON_MAP.Docker },
      { name: "JavaScript", icon: SKILL_ICON_MAP.JavaScript },
      { name: "Plotly Dash", icon: SKILL_ICON_MAP["Plotly Dash"] },
      { name: "Pandas", icon: SKILL_ICON_MAP.Pandas },
      { name: "Snowflakes", icon: SKILL_ICON_MAP.Snowflakes },
      { name: "FastAPI", icon: SKILL_ICON_MAP.FastAPI },
    ],
  },
  {
    title: "Auto Report Generator",
    description:
      "A reporting workflow that generates and distributes reports from Snowflake data sources to stakeholders. It automates repetitive reporting tasks, standardizes outputs, and ensures timely delivery of operational and management reports.",
    tech: [
      { name: "Python", icon: SKILL_ICON_MAP.Python },
      { name: "Snowflake", icon: SKILL_ICON_MAP.Snowflake },
      { name: "SQL", icon: SKILL_ICON_MAP.SQL },
      { name: "ETL", icon: SKILL_ICON_MAP.Pandas },
    ],
  },
  {
    title: "Portfolio AI Chatbot",
    description:
      "A portfolio chatbot designed to answer questions only about JasonD’s experience, projects, and skills using structured content. The long-term goal is to evolve it into a more intelligent assistant powered by retrieval and AI workflows.",
    tech: [
      { name: "Next.js", icon: SKILL_ICON_MAP["Next.js"] },
      { name: "AI", icon: SKILL_ICON_MAP.AI },
      { name: "RAG", icon: SKILL_ICON_MAP.RAG },
      { name: "FastAPI", icon: SKILL_ICON_MAP.FastAPI },
    ],
  },
  {
    title: "Ops Monitoring Dashboard",
    description:
      "A dashboard for monitoring workflow status, processing metrics, and operational exceptions in real time. It improves visibility for managers and team leads by consolidating business-critical process health into a single interface.",
    tech: [
      { name: "Dash", icon: SKILL_ICON_MAP.Dash },
      { name: "Plotly", icon: SKILL_ICON_MAP.Plotly },
      { name: "Python", icon: SKILL_ICON_MAP.Python },
      { name: "Analytics", icon: SKILL_ICON_MAP.Analytics },
    ],
  },
];

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
      <summary className="list-none [&::-webkit-details-marker]:hidden">
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

export default function FeaturedProjects() {
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

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.title}
              className="premium-card p-6 transition hover:border-white/15 hover:bg-white/[0.03]"
            >
              <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-[#8fb8ff] to-transparent" />

              <h3 className="type-card-title font-semibold tracking-[-0.02em] text-white/95">
                {project.title}
              </h3>

              <div className="mt-5">
                <ExpandableDescription text={project.description} maxLength={125} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {project.tech.map((item) => (
                  <div key={item.name} className="project-tech-item">
                    <div className="project-tech-icon-wrap">
                      <Image src={item.icon} alt={item.name} width={20} height={20} className="project-tech-icon" />
                    </div>
                    <span className="project-tech-label">{item.name}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <Link href="/projects" prefetch={false} className="premium-button-secondary mt-8 inline-flex md:hidden">
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
