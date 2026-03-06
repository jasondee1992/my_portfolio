import Link from "next/link";

export default function Navbar() {
  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
  ];

  return (
    <header className="container-page pt-6 md:pt-8">
      <div
        className="mx-auto flex items-center justify-between rounded-[28px] px-5 py-4 md:px-7"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 18px 60px rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            JD
          </div>
        </div>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition"
              style={{
                color:
                  index === 0
                    ? "rgba(255,255,255,0.96)"
                    : "rgba(255,255,255,0.62)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href="/resume/Jasond_Delos_Santos_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-5 py-3 text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.90)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          Hire Me →
        </a>
      </div>
    </header>
  );
}