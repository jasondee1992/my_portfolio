"use client";

import { useState } from "react";

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
      { name: "Python", icon: "/icons/skills/python.png" },
      { name: "Dash", icon: "/icons/skills/plotly_dash.png" },
      { name: "SQLite", icon: "/icons/skills/SQLite.png" },
      { name: "AWS", icon: "/icons/skills/AWS.png" },
      { name: "Docker", icon: "/icons/skills/Docker.png" },
      { name: "JavaScript", icon: "/icons/skills/JavaScript.png" },
      { name: "Plotly Dash", icon: "/icons/skills/plotly_dash.png" },
      { name: "Pandas", icon: "/icons/skills/Pandas.png" },
      { name: "Snowflakes", icon: "/icons/skills/snowflakes.png" },
      { name: "FastAPI", icon: "/icons/skills/FastAPI.png" },
    ],
  },
  {
    title: "Auto Report Generator",
    description:
      "A reporting workflow that generates and distributes reports from Snowflake data sources to stakeholders. It automates repetitive reporting tasks, standardizes outputs, and ensures timely delivery of operational and management reports.",
    tech: [
      { name: "Python", icon: "/icons/python.svg" },
      { name: "Snowflake", icon: "/icons/snowflake.svg" },
      { name: "SQL", icon: "/icons/sql.svg" },
      { name: "ETL", icon: "/icons/etl.svg" },
    ],
  },
  {
    title: "Portfolio AI Chatbot",
    description:
      "A portfolio chatbot designed to answer questions only about JasonD’s experience, projects, and skills using structured content. The long-term goal is to evolve it into a more intelligent assistant powered by retrieval and AI workflows.",
    tech: [
      { name: "Next.js", icon: "/icons/nextjs.svg" },
      { name: "AI", icon: "/icons/ai.svg" },
      { name: "RAG", icon: "/icons/rag.svg" },
      { name: "FastAPI", icon: "/icons/fastapi.svg" },
    ],
  },
  {
    title: "Ops Monitoring Dashboard",
    description:
      "A dashboard for monitoring workflow status, processing metrics, and operational exceptions in real time. It improves visibility for managers and team leads by consolidating business-critical process health into a single interface.",
    tech: [
      { name: "Dash", icon: "/icons/dash.svg" },
      { name: "Plotly", icon: "/icons/plotly.svg" },
      { name: "Python", icon: "/icons/python.svg" },
      { name: "Analytics", icon: "/icons/analytics.svg" },
    ],
  },
];

function ExpandableDescription({
  text,
  maxLength = 120,
}: {
  text: string;
  maxLength?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > maxLength;
  const visibleText =
    !isLong || expanded ? text : `${text.slice(0, maxLength).trim()}...`;

  return (
    <div>
      <p className="type-card-body leading-8 text-white/68">{visibleText}</p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-sm font-medium text-white/70 transition hover:text-white"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <section className="container-page mt-16">
      <div className="glass-card rounded-[32px] p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="type-section-title font-semibold tracking-[-0.02em] text-white/95">
            Featured Projects
          </h2>

          <button className="type-card-body text-white/55 transition hover:text-white/80">
            View All →
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/15 hover:bg-white/[0.03]"
            >
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
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="project-tech-icon"
                      />
                    </div>
                    <span className="project-tech-label">{item.name}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
