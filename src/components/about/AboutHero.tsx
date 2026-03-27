"use client";

import { useState } from "react";
import Link from "next/link";
import { aboutParagraphs } from "@/data/aboutContent";

export default function AboutHero() {
  const previewCount = 2;
  const previewParagraphs = aboutParagraphs.slice(0, previewCount);
  const remainingParagraphs = aboutParagraphs.slice(previewCount);
  const hasMoreContent = aboutParagraphs.length > previewCount;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="container-page relative pt-10 md:pt-14">
      <div className="section-panel mx-auto max-w-5xl px-8 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="section-eyebrow mx-auto">About</div>
          <h1 className="type-page-title section-title gradient-text mt-6 font-normal">
            About Jasond
          </h1>

          <p className="type-page-subtitle mt-4 text-white/70">
            Building systems that simplify work and turn ideas into usable tools.
          </p>

          <div className="about-copy-shell">
            <div
              className={`type-page-body mx-auto mt-10 max-w-4xl text-left leading-9 text-white/65 ${
                hasMoreContent && !isExpanded ? "about-copy-collapsed" : ""
              }`}
            >
              {previewParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {hasMoreContent ? (
              <div className="mt-6">
                {!isExpanded ? (
                  <button
                    type="button"
                    className="about-toggle-button inline-flex"
                    onClick={() => setIsExpanded(true)}
                    aria-expanded={false}
                  >
                    <span>Read more</span>
                    <span aria-hidden="true">↓</span>
                  </button>
                ) : null}

                {isExpanded ? (
                  <>
                    <div className="type-page-body mx-auto mt-6 grid max-w-4xl gap-6 text-left leading-9 text-white/65">
                      {remainingParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="about-toggle-button mt-6 inline-flex"
                      onClick={() => setIsExpanded(false)}
                      aria-expanded={true}
                    >
                      <span>Show less</span>
                      <span aria-hidden="true">↑</span>
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/resume/Jasond_Delos_Santos_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-button"
            >
              Resume
              <span aria-hidden="true">↗</span>
            </a>

            <Link href="/projects" prefetch={false} className="premium-button-secondary">
              View Projects
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
