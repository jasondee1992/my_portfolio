"use client";

import Image from "next/image";
import Link from "next/link";
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
      { name: "Python", icon: "/icons/skills/python.svg" },
      { name: "Dash", icon: "/icons/skills/plotly_dash.svg" },
      { name: "SQLite", icon: "/icons/skills/SQLite.svg" },
      { name: "AWS", icon: "/icons/skills/AWS.svg" },
      { name: "Docker", icon: "/icons/skills/Docker.svg" },
      { name: "JavaScript", icon: "/icons/skills/JavaScript.svg" },
      { name: "Plotly Dash", icon: "/icons/skills/plotly_dash.svg" },
      { name: "Pandas", icon: "/icons/skills/Pandas.svg" },
      { name: "Snowflakes", icon: "/icons/skills/snowflakes.svg" },
      { name: "FastAPI", icon: "/icons/skills/FastAPI.svg" },
    ],
  },
  {
    title: "Auto Report Generator",
    description:
      "A reporting workflow that generates and distributes reports from Snowflake data sources to stakeholders. It automates repetitive reporting tasks, standardizes outputs, and ensures timely delivery of operational and management reports.",
    tech: [
      { name: "Python", icon: "/icons/skills/python.svg" },
      { name: "Snowflake", icon: "/icons/skills/snowflakes.svg" },
      { name: "SQL", icon: "/icons/skills/sql.svg" },
      { name: "ETL", icon: "/icons/skills/Pandas.svg" },
    ],
  },
  {
    title: "Portfolio AI Chatbot",
    description:
      "A portfolio chatbot designed to answer questions only about JasonD’s experience, projects, and skills using structured content. The long-term goal is to evolve it into a more intelligent assistant powered by retrieval and AI workflows.",
    tech: [
      { name: "Next.js", icon: "/icons/skills/react.svg" },
      { name: "AI", icon: "/icons/skills/ai.svg" },
      { name: "RAG", icon: "/icons/skills/rag.svg" },
      { name: "FastAPI", icon: "/icons/skills/FastAPI.svg" },
    ],
  },
  {
    title: "Ops Monitoring Dashboard",
    description:
      "A dashboard for monitoring workflow status, processing metrics, and operational exceptions in real time. It improves visibility for managers and team leads by consolidating business-critical process health into a single interface.",
    tech: [
      { name: "Dash", icon: "/icons/skills/plotly_dash.svg" },
      { name: "Plotly", icon: "/icons/skills/plotly.svg" },
      { name: "Python", icon: "/icons/skills/python.svg" },
      { name: "Analytics", icon: "/icons/skills/Pandas.svg" },
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
  const visibleText = !isLong || expanded ? text : `${text.slice(0, maxLength).trim()}...`;

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

          <Link href="/projects" className="premium-button-secondary hidden md:inline-flex">
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

        <Link href="/projects" className="premium-button-secondary mt-8 inline-flex md:hidden">
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
