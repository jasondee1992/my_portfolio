"use client";

import { useState } from "react";
import Link from "next/link";
import { aboutParagraphs } from "@/data/aboutContent";

const profileStats = [
  "10 years in IT",
  "5 years in programming",
  "5 years in Python",
];

const aboutHighlights = [
  {
    label: "Current focus",
    value: "Python automation, internal platforms, reporting workflows, and AI-assisted solutions.",
  },
  {
    label: "What I build",
    value: "Dashboards, internal tools, backend services, and practical software that reduces manual work.",
  },
  {
    label: "Working style",
    value: "Hands-on from requirements to deployment, with a strong focus on usability, clarity, and business value.",
  },
];

export default function AboutHero() {
  const [expanded, setExpanded] = useState(false);
  const previewCount = 2;
  const visibleParagraphs = expanded ? aboutParagraphs : aboutParagraphs.slice(0, previewCount);
  const hasMoreContent = aboutParagraphs.length > previewCount;

  return (
    <section className="container-page relative pt-10 md:pt-14">
      <div className="section-panel mx-auto max-w-5xl px-8 py-10 md:px-12 md:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)] lg:gap-10">
          <div>
            <div className="section-eyebrow">About</div>
            <h1 className="type-page-title section-title gradient-text mt-6 font-semibold">
              About Jasond
            </h1>

            <p className="type-page-subtitle mt-4 max-w-2xl text-white/70">
              Building systems that simplify work and turn ideas into usable tools.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {profileStats.map((item) => (
                <span
                  key={item}
                  className="glass-chip rounded-full px-4 py-2 text-[0.78rem] tracking-[0.01em] text-white/78"
                >
                  {item}
                </span>
              ))}
            </div>

            <div
              className={`type-page-body mt-8 max-w-3xl text-left leading-9 text-white/65 ${
                !expanded && hasMoreContent ? "about-copy-collapsed" : ""
              }`}
            >
              {visibleParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {hasMoreContent ? (
              <div className="mt-6 flex justify-start">
                <button
                  type="button"
                  onClick={() => setExpanded((current) => !current)}
                  className="about-toggle-button"
                >
                  {expanded ? "Show less" : "Read more"}
                  <span aria-hidden="true">{expanded ? "\u2191" : "\u2193"}</span>
                </button>
              </div>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/resume/Jasond_Delos_Santos_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button"
              >
                Resume
                <span aria-hidden="true">↗</span>
              </a>

              <Link href="/projects" className="premium-button-secondary">
                View Projects
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:pt-1">
            <div className="premium-card p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Snapshot
              </div>
              <div className="mt-4 space-y-3">
                {profileStats.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-[0.84rem] text-white/80">{item}</span>
                    <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[#cfe0ff]">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Profile highlights
              </div>
              <div className="mt-5 space-y-4">
                {aboutHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-white/8 bg-black/16 px-4 py-4"
                  >
                    <div className="text-[0.74rem] uppercase tracking-[0.16em] text-white/42">
                      {item.label}
                    </div>
                    <p className="mt-2 text-[0.9rem] leading-7 text-white/72">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
