export default function Navbar() {
  return (
    <header className="container-page pt-12 md:pt-16">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">
          <span className="font-semibold text-white/90">JasonD</span>
          <span className="text-white/50"> / portfolio</span>
        </div>

        <nav className="flex items-center gap-2">
          <a className="chip hover-lift" href="#projects">
            Projects
          </a>
          <a className="chip hover-lift" href="#achievements">
            Achievements
          </a>
          <a className="chip hover-lift" href="#contact">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}