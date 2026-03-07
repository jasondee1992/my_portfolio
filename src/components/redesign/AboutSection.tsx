export default function AboutSection() {
  return (
    <section className="container-page mt-24 grid gap-8 md:grid-cols-2">

      <div className="glass-card soft-hover rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-4">About Me</h2>

        <p className="text-white/70 leading-relaxed">
          I’m a Python Developer and Data Engineer specializing in automation,
          dashboards, and internal tools. I build scalable systems using
          Python, Dash, Snowflake, and modern data workflows.
        </p>

        <p className="text-white/70 mt-4 leading-relaxed">
          My focus is designing automation systems that reduce manual work,
          improve data accuracy, and deliver insights through dashboards and
          analytics platforms.
        </p>

        <p className="text-white/70 mt-4 leading-relaxed">
          I enjoy building tools that combine backend engineering, data
          pipelines, and user-friendly interfaces.
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