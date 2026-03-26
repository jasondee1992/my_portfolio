import Link from "next/link";
import { aboutParagraphs } from "@/data/aboutContent";

export default function AboutHero() {
  const previewCount = 2;
  const previewParagraphs = aboutParagraphs.slice(0, previewCount);
  const remainingParagraphs = aboutParagraphs.slice(previewCount);
  const hasMoreContent = aboutParagraphs.length > previewCount;

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

          <div
            className={`type-page-body mx-auto mt-10 max-w-4xl text-left leading-9 text-white/65 ${
              hasMoreContent ? "about-copy-collapsed" : ""
            }`}
          >
            {previewParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {hasMoreContent ? (
            <details className="group mt-6">
              <summary className="about-toggle-button inline-flex list-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Read more</span>
                <span className="hidden group-open:inline">Show less</span>
                <span aria-hidden="true" className="group-open:hidden">
                  ↓
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  ↑
                </span>
              </summary>

              <div className="type-page-body mx-auto mt-6 grid max-w-4xl gap-6 text-left leading-9 text-white/65">
                {remainingParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ) : null}

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
