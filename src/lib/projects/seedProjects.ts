import { internalProjects, otherWorks } from "@/data/projects";
import type { ManagedProject } from "@/lib/projects/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_TIMESTAMP = "2026-01-01T00:00:00.000Z";

export const DEFAULT_MANAGED_PROJECTS: ManagedProject[] = [
  ...internalProjects.map((project, index) => ({
    id: `seed-${slugify(project.title)}`,
    title: project.title,
    role: project.role,
    projectType: project.type,
    details: project.description,
    summaryDescription: project.description,
    visibility: "internal" as const,
    section: "enterprise" as const,
    techStack: project.tags,
    showOnHomepage: index < 4,
    displayOrder: index + 1,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  })),
  ...otherWorks.map((project, index) => ({
    id: `seed-${slugify(project.title)}`,
    title: project.title,
    role: project.role,
    projectType: project.type,
    details: project.description,
    summaryDescription: project.description,
    visibility: "public" as const,
    section: "other" as const,
    techStack: project.tags,
    showOnHomepage: false,
    displayOrder: internalProjects.length + index + 1,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  })),
];
