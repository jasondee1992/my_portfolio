const galleryItems = [
  "Project Showcase",
  "Dashboard UI",
  "Automation Flow",
  "Data Visualization",
  "AI Workspace",
];

export default function GalleryStrip() {
  return (
    <section className="container-page mt-10">
      <div
        className="rounded-[32px] p-8 md:p-10"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-white/95">Gallery</h2>
          <span className="text-sm text-white/45">View All →</span>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {galleryItems.map((item, index) => (
            <div
              key={item}
              className="flex h-40 items-end rounded-[28px] p-4"
              style={{
                background:
                  index % 2 === 0
                    ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(255,255,255,0.03))"
                    : "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.20)",
              }}
            >
              <span className="text-sm font-medium text-white/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}