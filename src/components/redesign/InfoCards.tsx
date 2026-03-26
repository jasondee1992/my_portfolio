"use client";

import Image from "next/image";
import { useState } from "react";
import { aboutParagraphs } from "@/data/aboutContent";
import projectHighlights from "@/data/knowledge/project-highlights.json";

type ProjectHighlight = {
  title: string;
  year?: string;
  platform?: string;
  summary: string;
};

const techStackRow1 = [
  { name: "AWS", icon: "/icons/skills/AWS.png" },
  { name: "Css3", icon: "/icons/skills/css3.png" },
  { name: "Django", icon: "/icons/skills/Django.png" },
  { name: "Docker", icon: "/icons/skills/Docker.png" },
  { name: "FastAPI", icon: "/icons/skills/FastAPI.png" },
  { name: "Git", icon: "/icons/skills/Git.png" },
  { name: "React", icon: "/icons/skills/react.png" },
  { name: "Snowflakes", icon: "/icons/skills/snowflakes.png" },
  { name: "SQLite", icon: "/icons/skills/SQLite.png" },
  { name: "TypeScript", icon: "/icons/skills/TypeScript.png" },
];

const techStackRow2 = [
  { name: "HTML5", icon: "/icons/skills/HTML5.png" },
  { name: "JavaScript", icon: "/icons/skills/JavaScript.png" },
  { name: "NoSQL", icon: "/icons/skills/NoSQL.png" },
  { name: "Pandas", icon: "/icons/skills/Pandas.png" },
  { name: "plotly", icon: "/icons/skills/plotly.png" },
  { name: "plotly_dash", icon: "/icons/skills/plotly_dash.png" },
  { name: "PostgreSQL", icon: "/icons/skills/PostgreSQL.png" },
  { name: "Python", icon: "/icons/skills/python.png" },
];

const techStackRow3 = [
  { name: "HTML5", icon: "/icons/skills/HTML5.png" },
  { name: "JavaScript", icon: "/icons/skills/JavaScript.png" },
  { name: "NoSQL", icon: "/icons/skills/NoSQL.png" },
  { name: "Pandas", icon: "/icons/skills/Pandas.png" },
  { name: "plotly", icon: "/icons/skills/plotly.png" },
  { name: "plotly_dash", icon: "/icons/skills/plotly_dash.png" },
  { name: "PostgreSQL", icon: "/icons/skills/PostgreSQL.png" },
  { name: "Python", icon: "/icons/skills/python.png" },
];

const highlightAccents = [
  {
    eyebrow: "Automation",
    icon: "↗",
    gradient: "from-[#8fb8ff]/30 via-[#8fb8ff]/12 to-transparent",
  },
  {
    eyebrow: "AI Workflow",
    icon: "◇",
    gradient: "from-[#9be7c4]/26 via-[#9be7c4]/10 to-transparent",
  },
  {
    eyebrow: "Mapping",
    icon: "◎",
    gradient: "from-[#ffd08f]/26 via-[#ffd08f]/10 to-transparent",
  },
] as const;

function ExpandableHighlightDescription({
  leadSentence,
  details,
  expanded,
}: {
  leadSentence: string;
  details: string;
  expanded: boolean;
}) {
  if (!expanded) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[22px] border border-white/8 bg-black/18 p-4">
      <p className="type-card-body leading-7 text-white/82">
        {leadSentence.endsWith(".") ? leadSentence : `${leadSentence}.`}
      </p>

      {details ? (
        <p className="type-card-body mt-3 border-l border-white/10 pl-4 leading-7 text-white/56">
          {details}
        </p>
      ) : null}
    </div>
  );
}

export default function InfoCards() {
  const highlights = projectHighlights as ProjectHighlight[];
  const [expandedHighlight, setExpandedHighlight] = useState<string | null>(null);

  return (
    <section className="container-page section-shell grid gap-8 md:grid-cols-[minmax(0,1.58fr)_minmax(0,1.02fr)]">
      <div className="section-panel soft-hover p-8 md:p-10">
        <div className="section-header">
          <div className="section-eyebrow">About</div>
          <h2
            className="section-title font-normal text-white/95"
            style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
          >
            Building useful software with clear outcomes
          </h2>
        </div>

        <div className="type-page-body mt-6 space-y-4 leading-8 text-white/72">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex flex-col gap-8">
        <div className="section-panel min-w-0 p-8">
          <div className="section-header">
            <div className="section-eyebrow">Highlights</div>
            <h2
              className="section-title whitespace-nowrap font-normal tracking-[-0.02em] text-white/95"
              style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
            >
              Project highlights
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {highlights.map((item) => {
              const accent = highlightAccents[highlights.indexOf(item) % highlightAccents.length];
              const [leadSentence, ...restSentences] = item.summary.split(". ");
              const details = restSentences.join(". ").trim();
              const itemKey = `${item.title}-${item.year ?? ""}`;
              const isExpanded = expandedHighlight === itemKey;

              return (
                <article
                  key={itemKey}
                  className="premium-card overflow-hidden p-5 transition hover:border-white/15 hover:bg-white/[0.03]"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent.gradient}`}
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-[80%]">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm text-white/80">
                          {accent.icon}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                          {accent.eyebrow}
                        </span>
                      </div>

                      <p className="type-card-title font-normal text-white/92">
                        {item.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2">
                          {item.platform && (
                            <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] text-white/48 md:text-[10px]">
                              {item.platform}
                            </span>
                          )}
                        </div>

                        {details ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHighlight((current) => (current === itemKey ? null : itemKey))
                            }
                            className="shrink-0 whitespace-nowrap text-[0.68rem] font-normal text-white/58 transition hover:text-white/82 md:text-[0.72rem]"
                          >
                            {isExpanded ? "See less" : "See more..."}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {item.year && (
                      <span className="rounded-full border border-[#8fb8ff]/20 bg-[#8fb8ff]/8 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-[#cfe0ff]">
                        {item.year}
                      </span>
                    )}
                  </div>

                  <ExpandableHighlightDescription
                    leadSentence={leadSentence}
                    details={details}
                    expanded={isExpanded}
                  />
                </article>
              );
            })}
          </div>
        </div>

        <div className="section-panel p-8">
          <div className="mb-6">
            <div className="section-eyebrow">Stack</div>
            <h2
              className="section-title mt-3 font-normal tracking-[-0.02em] text-white/95"
              style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
            >
              Core tools
            </h2>
          </div>

          <div className="tech-marquee-wrap">
            <div className="tech-marquee-row tech-marquee-left">
              {[...techStackRow1, ...techStackRow1].map((tech, index) => (
                <div key={`${tech.name}-row1-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <Image src={tech.icon} alt={tech.name} width={50} height={50} className="tech-pill-icon" />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>

            <div className="tech-marquee-row tech-marquee-right">
              {[...techStackRow2, ...techStackRow2].map((tech, index) => (
                <div key={`${tech.name}-row2-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <Image src={tech.icon} alt={tech.name} width={50} height={50} className="tech-pill-icon" />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>

            <div className="tech-marquee-row tech-marquee-left">
              {[...techStackRow3, ...techStackRow3].map((tech, index) => (
                <div key={`${tech.name}-row3-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <Image src={tech.icon} alt={tech.name} width={50} height={50} className="tech-pill-icon" />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
