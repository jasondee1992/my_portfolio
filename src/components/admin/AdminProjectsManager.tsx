"use client";

import { useState } from "react";
import type { ManagedProject, ProjectSection, ProjectVisibility } from "@/lib/projects/types";

type AdminProjectsManagerProps = {
  initialProjects: ManagedProject[];
};

type ProjectFormState = {
  title: string;
  role: string;
  projectType: string;
  details: string;
  summaryDescription: string;
  visibility: ProjectVisibility;
  section: ProjectSection;
  techStack: string;
  showOnHomepage: boolean;
  displayOrder: string;
};

const DEFAULT_FORM_STATE: ProjectFormState = {
  title: "",
  role: "",
  projectType: "",
  details: "",
  summaryDescription: "",
  visibility: "public",
  section: "other",
  techStack: "",
  showOnHomepage: false,
  displayOrder: "0",
};

function sortProjects(projects: ManagedProject[]) {
  const sectionWeight = { enterprise: 0, other: 1 } as const;

  return [...projects].sort(
    (left, right) =>
      sectionWeight[left.section] - sectionWeight[right.section] ||
      left.displayOrder - right.displayOrder ||
      left.title.localeCompare(right.title)
  );
}

function formatTechStack(value: string[]) {
  return value.length > 0 ? value.join(", ") : "n/a";
}

function createFormStateFromProject(project: ManagedProject): ProjectFormState {
  return {
    title: project.title,
    role: project.role,
    projectType: project.projectType,
    details: project.details,
    summaryDescription: project.summaryDescription,
    visibility: project.visibility,
    section: project.section,
    techStack: project.techStack.join(", "),
    showOnHomepage: project.showOnHomepage,
    displayOrder: String(project.displayOrder),
  };
}

export default function AdminProjectsManager({
  initialProjects,
}: AdminProjectsManagerProps) {
  const [projects, setProjects] = useState(() => sortProjects(initialProjects));
  const [formState, setFormState] = useState<ProjectFormState>(DEFAULT_FORM_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const homepageProjectsCount = projects.filter((project) => project.showOnHomepage).length;
  const isEditing = editingId !== null;

  function resetForm() {
    setEditingId(null);
    setFormState(DEFAULT_FORM_STATE);
  }

  function handleEdit(project: ManagedProject) {
    setError(null);
    setFeedback(null);
    setEditingId(project.id);
    setFormState(createFormStateFromProject(project));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/projects", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...formState,
          techStack: formState.techStack,
          displayOrder: Number(formState.displayOrder),
        }),
      });

      const result = (await response.json()) as {
        project?: ManagedProject;
        error?: string;
      };

      if (!response.ok || !result.project) {
        throw new Error(result.error || `Unable to ${isEditing ? "update" : "create"} project.`);
      }

      setProjects((current) =>
        sortProjects(
          isEditing
            ? current.map((project) => (project.id === result.project!.id ? result.project! : project))
            : [...current, result.project!]
        )
      );
      resetForm();
      setFeedback(isEditing ? "Project updated." : "Project added.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Unable to ${isEditing ? "update" : "create"} project.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const targetProject = projects.find((project) => project.id === id);

    if (!targetProject) {
      return;
    }

    const confirmed = window.confirm(`Delete "${targetProject.title}"?`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setFeedback(null);
    setDeletingId(id);

    try {
      const response = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to delete project.");
      }

      if (editingId === id) {
        resetForm();
      }

      setProjects((current) => current.filter((project) => project.id !== id));
      setFeedback("Project deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section id="projects" className="admin-grid-section">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white/95">Projects</h2>
        <p className="mt-2 text-sm text-white/55">
          Add, edit, and manage projects that feed both the homepage and the full projects page.
          Homepage shows up to 4 projects with `Show on homepage` enabled, ordered by
          `Display order`.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-grid-toolbar">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="admin-grid-filter">
            <span className="admin-grid-filter-label">Title</span>
            <input
              className="admin-grid-input"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>

          <label className="admin-grid-filter">
            <span className="admin-grid-filter-label">Role</span>
            <input
              className="admin-grid-input"
              value={formState.role}
              onChange={(event) =>
                setFormState((current) => ({ ...current, role: event.target.value }))
              }
              required
            />
          </label>

          <label className="admin-grid-filter">
            <span className="admin-grid-filter-label">Project Type</span>
            <input
              className="admin-grid-input"
              value={formState.projectType}
              onChange={(event) =>
                setFormState((current) => ({ ...current, projectType: event.target.value }))
              }
              required
            />
          </label>

          <label className="admin-grid-filter xl:col-span-3">
            <span className="admin-grid-filter-label">Summary Description</span>
            <textarea
              className="admin-grid-input min-h-28"
              value={formState.summaryDescription}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  summaryDescription: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="admin-grid-filter xl:col-span-3">
            <span className="admin-grid-filter-label">Details</span>
            <textarea
              className="admin-grid-input min-h-36"
              value={formState.details}
              onChange={(event) =>
                setFormState((current) => ({ ...current, details: event.target.value }))
              }
              required
            />
          </label>

          <label className="admin-grid-filter">
            <span className="admin-grid-filter-label">Section</span>
            <select
              className="admin-grid-input admin-grid-select"
              value={formState.section}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  section: event.target.value as ProjectSection,
                }))
              }
            >
              <option value="enterprise">Enterprise</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="admin-grid-filter">
            <span className="admin-grid-filter-label">Visibility</span>
            <select
              className="admin-grid-input admin-grid-select"
              value={formState.visibility}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  visibility: event.target.value as ProjectVisibility,
                }))
              }
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </label>

          <label className="admin-grid-filter">
            <span className="admin-grid-filter-label">Display Order</span>
            <input
              className="admin-grid-input"
              type="number"
              min="0"
              value={formState.displayOrder}
              onChange={(event) =>
                setFormState((current) => ({ ...current, displayOrder: event.target.value }))
              }
            />
          </label>

          <label className="admin-grid-filter xl:col-span-2">
            <span className="admin-grid-filter-label">Tech Stack</span>
            <input
              className="admin-grid-input"
              value={formState.techStack}
              onChange={(event) =>
                setFormState((current) => ({ ...current, techStack: event.target.value }))
              }
              placeholder="Comma-separated values"
            />
          </label>

          <label className="admin-grid-filter justify-end xl:col-span-1">
            <span className="admin-grid-filter-label">Homepage Display</span>
            <label className="inline-flex min-h-[42px] items-center gap-3 rounded-[10px] border border-white/10 bg-[#1f1f1f] px-3 text-sm text-white/82">
              <input
                type="checkbox"
                checked={formState.showOnHomepage}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    showOnHomepage: event.target.checked,
                  }))
                }
              />
              Show on homepage
            </label>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" className="admin-grid-button" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Project"}
          </button>
          {isEditing ? (
            <button
              type="button"
              className="admin-grid-button admin-grid-button-secondary"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel Edit
            </button>
          ) : null}
          <div className="text-sm text-white/55">
            Homepage-ready projects: {homepageProjectsCount}
          </div>
          {feedback ? <div className="text-sm text-emerald-300">{feedback}</div> : null}
          {error ? <div className="text-sm text-rose-300">{error}</div> : null}
        </div>
      </form>

      <div className="admin-grid-table-wrap mt-6">
        <table className="admin-grid-table min-w-full text-left text-sm text-white/80">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Section</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Project Type</th>
              <th className="px-4 py-3 font-medium">Homepage</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Tech Stack</th>
              <th className="px-4 py-3 font-medium">Summary</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="align-top">
                <td className="px-4 py-3 min-w-56 text-white/92">{project.title}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">{project.section}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">{project.visibility}</td>
                <td className="px-4 py-3 min-w-52 text-white/65">{project.role}</td>
                <td className="px-4 py-3 min-w-48 text-white/65">{project.projectType}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {project.showOnHomepage ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {project.displayOrder}
                </td>
                <td className="px-4 py-3 min-w-64 text-white/65">
                  {formatTechStack(project.techStack)}
                </td>
                <td className="px-4 py-3 min-w-80 whitespace-pre-wrap leading-6 text-white/70">
                  {project.summaryDescription}
                </td>
                <td className="px-4 py-3 min-w-96 whitespace-pre-wrap leading-6 text-white/70">
                  {project.details}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    className="admin-grid-button admin-grid-button-secondary mr-2"
                    onClick={() => handleEdit(project)}
                    disabled={isSubmitting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-grid-button admin-grid-button-secondary"
                    onClick={() => void handleDelete(project.id)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
