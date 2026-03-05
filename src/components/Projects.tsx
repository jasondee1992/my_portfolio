"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import data from "@/data/portfolio.json";
import ProjectCard from "@/components/ProjectCard";

type Project = {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  stack: string[];
  image?: string;
  links?: { live?: string; source?: string };
};

const FILTERS = ["All", "Dash", "Data Engineering", "Automation", "AI"] as const;
type Filter = (typeof FILTERS)[number];

export default function Projects() {
  const projects = data.projects as Project[];
  const [active, setActive] = useState<Filter>("All");

  const filtered = useMemo(() => {
    if (active === "All") return projects;
    return projects.filter((p) => p.tags?.includes(active));
  }, [active, projects]);

  return (
    <section id="projects" className="container-page py-16 md:py-24">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90">
            Projects Gallery
          </h2>
          <p className="mt-2 muted max-w-2xl">
            Filter by category. (Dummy data now — you’ll replace with your real projects later.)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="chip hover-lift"
                style={{
                  borderColor: isActive ? "rgba(34,197,94,0.45)" : undefined,
                  background: isActive ? "rgba(34,197,94,0.10)" : undefined,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22 }}
            >
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 text-sm text-white/50">
        Showing <span className="text-white/80 font-medium">{filtered.length}</span>{" "}
        of <span className="text-white/80 font-medium">{projects.length}</span> projects
      </div>
    </section>
  );
}