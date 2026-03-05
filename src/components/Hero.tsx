import data from "@/data/portfolio.json";

export default function Hero() {
  return (
    <section className="container-page pt-10 md:pt-14">
      <div className="panel panel-inner hover-lift">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white/90">
          {data.profile.name}
        </h1>

        <p className="mt-4 text-lg text-white/65">
          {data.profile.title}
        </p>

        <div className="mt-6 flex gap-3">
          <button className="rounded-xl bg-white px-6 py-3 text-black font-semibold">
            View Projects
          </button>

          <button className="rounded-xl border border-white/20 px-6 py-3">
            Contact
          </button>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          <span className="chip">Python</span>
          <span className="chip">Dash</span>
          <span className="chip">Snowflake</span>
          <span className="chip">Automation</span>
          <span className="chip">AI</span>
        </div>
      </div>
    </section>
  );
}