import { otherWorks } from "@/data/projects";

export default function OtherWorksList() {
  return (
    <section className="container-page mt-14">
      <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/35">
        Other Works
      </div>

      <div className="space-y-5">
        {otherWorks.map((work) => (
          <div
            key={work.no}
            className="rounded-[28px] p-6 md:p-7"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-3 text-xs text-white/30">{work.no}</div>

                <h3 className="text-2xl font-semibold text-white/95">
                  {work.title}
                </h3>

                <div className="mt-4 space-y-1 text-sm text-white/55">
                  <div>
                    <span className="text-white/80">Role:</span> {work.role}
                  </div>
                  <div>
                    <span className="text-white/80">Project Type:</span> {work.type}
                  </div>
                </div>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-white/60">
                  {work.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1.5 text-xs"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: "rgba(255,255,255,0.68)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
