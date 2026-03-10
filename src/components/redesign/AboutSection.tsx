export default function AboutSection() {
  return (
    <section className="container-page mt-24 grid gap-8 md:grid-cols-2">

      <div className="glass-card soft-hover rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-2">About Me</h2>

        <p className="text-white/70 leading-relaxed">
          I’m a Python Developer specializing in building end-to-end internal
          applications for enterprise environments. My work focuses on automating
          business processes by developing full-stack Python solutions, from backend
          APIs to interactive dashboards used by internal teams.
        </p>

        <p className="text-white/70 mt-3 leading-relaxed">
          I design and develop backend services using Python and REST APIs, while
          building frontend applications using Dash and Bootstrap. I typically manage
          the full development lifecycle including requirements analysis, API design,
          UI development, backend logic, testing, and deployment to AWS in
          collaboration with DevOps teams.
        </p>

        <p className="text-white/70 mt-3 leading-relaxed">
          I also maintain and enhance the applications I build by delivering
          production updates, performance improvements, and new features. This
          hands-on ownership allows me to deeply understand both technical systems
          and business workflows across multiple projects.
        </p>

        <p className="text-white/70 mt-3 leading-relaxed">
          Currently, I continue to expand my skills in backend architecture, data
          engineering, and AI-driven systems to build scalable and impactful
          automation platforms.
        </p>
      </div>

      <div
        className="rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 className="text-2xl font-semibold mb-6">
          Achievements & Certificates
        </h2>

        <div className="space-y-4">

          <div className="flex items-center justify-between rounded-2xl p-4 border border-white/10">
            <div>
              <p className="font-medium">Automation Systems Development</p>
              <p className="text-white/50 text-sm">Internal Platform</p>
            </div>
            <span className="text-sm text-white/40">2025</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl p-4 border border-white/10">
            <div>
              <p className="font-medium">AI & RAG Systems Study</p>
              <p className="text-white/50 text-sm">Self Learning</p>
            </div>
            <span className="text-sm text-white/40">2026</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl p-4 border border-white/10">
            <div>
              <p className="font-medium">Data Engineering Automation</p>
              <p className="text-white/50 text-sm">Enterprise Projects</p>
            </div>
            <span className="text-sm text-white/40">2024</span>
          </div>

        </div>
      </div>

    </section>
  );
}