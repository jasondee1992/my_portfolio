export default function QuoteBlock() {
  return (
    <section className="container-page mt-10">
      <div
        className="rounded-[32px] px-8 py-14 text-center md:px-12"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div className="text-white/25 text-3xl">”</div>

        <p className="type-page-body mx-auto mt-4 max-w-3xl italic leading-9 text-white/72">
          I enjoy building systems that reduce manual work, improve visibility,
          and turn complexity into something simple and usable.
        </p>

        <div className="type-card-body mt-6 text-white/45">
          — JasonD
        </div>

        <div className="mx-auto mt-10 h-px max-w-3xl bg-white/10" />

        <p className="type-card-body mt-8 text-white/45">
          You’re viewing a premium portfolio prototype built with Next.js.
        </p>
      </div>
    </section>
  );
}
