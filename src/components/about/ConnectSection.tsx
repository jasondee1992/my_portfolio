"use client";

const links = [
  {
    title: "Email",
    value: "jasond.worked@gmail.com",
    href: "mailto:jasond.worked@gmail.com",
  },
  {
    title: "GitHub",
    value: "jasondee1992",
    href: "https://github.com/jasondee1992",
  },
  {
    title: "LinkedIn",
    value: "Jasond Delos Santos",
    href: "https://www.linkedin.com/in/jasond-delos-santos-94978a111/",
  },
  {
    title: "Let's Talk",
    value: "Open portfolio chatbot",
    action: "chatbot" as const,
  },
];

export default function ConnectSection() {
  function handleChatbotOpen() {
    window.dispatchEvent(new Event("open-chatbot"));
  }

  return (
    <section className="container-page section-shell">
      <div className="section-panel soft-hover mx-auto max-w-5xl p-8 md:p-10">
        <div className="section-header">
          <div className="section-eyebrow">Connect</div>
          <h2 className="text-3xl font-normal text-white/95">Let’s connect</h2>
          <p className="mt-1 max-w-2xl text-white/60">
            Open to thoughtful opportunities, collaborations, and conversations around software, automation, and practical product work.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {links.map((link) =>
            "href" in link ? (
              <a
                key={link.title}
                href={link.href}
                target={link.title === "GitHub" || link.title === "LinkedIn" ? "_blank" : undefined}
                rel={link.title === "GitHub" || link.title === "LinkedIn" ? "noopener noreferrer" : undefined}
                className="premium-card p-5 text-left transition hover:-translate-y-0.5"
              >
                <div className="text-lg font-normal text-white/90">{link.title}</div>
                <div className="mt-1 text-white/55">{link.value}</div>
              </a>
            ) : (
              <button
                key={link.title}
                type="button"
                onClick={handleChatbotOpen}
                className="premium-card p-5 text-left transition hover:-translate-y-0.5"
              >
                <div className="text-lg font-normal text-white/90">{link.title}</div>
                <div className="mt-1 text-white/55">{link.value}</div>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
