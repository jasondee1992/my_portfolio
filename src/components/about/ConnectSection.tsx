"use client";

const links = [
  {
    title: "Email",
    value: "Jason.worked@gmail.com",
    href: "mailto:Jason.worked@gmail.com",
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
    <section className="container-page mt-20">
      <div
        className="mx-auto max-w-5xl rounded-[32px] p-8 md:p-10"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <h2 className="text-3xl font-semibold text-white/95">Let’s Connect</h2>
        <p className="mt-3 text-white/60">
          I’m always interested in new opportunities and collaborations.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            "href" in link ? (
              <a
                key={link.title}
                href={link.href}
                target={link.title === "GitHub" ? "_blank" : undefined}
                rel={link.title === "GitHub" ? "noopener noreferrer" : undefined}
                className="rounded-[24px] p-5 text-left transition hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-lg font-semibold text-white/90">{link.title}</div>
                <div className="mt-1 text-white/55">{link.value}</div>
              </a>
            ) : (
              <button
                key={link.title}
                type="button"
                onClick={handleChatbotOpen}
                className="rounded-[24px] p-5 text-left transition hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-lg font-semibold text-white/90">{link.title}</div>
                <div className="mt-1 text-white/55">{link.value}</div>
              </button>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
