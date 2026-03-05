type Project = {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  stack: string[];
  image?: string;
  links?: { live?: string; source?: string };
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="panel panel-inner hover-lift">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white/90">{project.name}</h3>
          <p className="mt-2 muted-2">{project.description}</p>
        </div>

        <a
          href={project.links?.live ?? "#"}
          className="chip hover-lift"
          aria-label={`Open ${project.name}`}
        >
          Live ↗
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span key={s} className="chip" style={{ opacity: 0.85 }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}