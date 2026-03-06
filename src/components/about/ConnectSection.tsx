const links = [
  { title: "Email", value: "jasond@example.com" },
  { title: "GitHub", value: "@jasond-dev" },
  { title: "LinkedIn", value: "Jasond Delos Santos" },
  { title: "Let's Talk", value: "Chat with me" },
];

export default function ConnectSection() {
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
            <div
              key={link.title}
              className="rounded-[24px] p-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="text-lg font-semibold text-white/90">{link.title}</div>
              <div className="mt-1 text-white/55">{link.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}