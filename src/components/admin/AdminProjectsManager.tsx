"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminTableScroller from "@/components/admin/AdminTableScroller";
import type {
  ManagedProject,
  ProjectAppPlatform,
  ProjectSection,
  ProjectVisibility,
} from "@/lib/projects/types";

type AdminProjectsManagerProps = {
  initialProjects: ManagedProject[];
};

type ImportProjectsResult = {
  projects?: ManagedProject[];
  createdCount?: number;
  updatedCount?: number;
  error?: string;
};

type ProjectFormState = {
  title: string;
  role: string;
  projectType: string;
  appPlatform: ProjectAppPlatform;
  details: string;
  summaryDescription: string;
  visibility: ProjectVisibility;
  section: ProjectSection;
  techStack: string;
  liveUrl: string;
  showOnHomepage: boolean;
  displayOrder: string;
};

const DEFAULT_FORM_STATE: ProjectFormState = {
  title: "",
  role: "",
  projectType: "",
  appPlatform: "web",
  details: "",
  summaryDescription: "",
  visibility: "public",
  section: "other",
  techStack: "",
  liveUrl: "",
  showOnHomepage: false,
  displayOrder: "0",
};

const APP_PLATFORM_LABELS: Record<ProjectAppPlatform, string> = {
  web: "Web App",
  phone: "Phone App",
  desktop: "Desktop App",
};

function getNextDisplayOrder(projects: ManagedProject[]) {
  if (projects.length === 0) {
    return 0;
  }

  return Math.max(...projects.map((project) => project.displayOrder)) + 1;
}

function createDefaultFormState(projects: ManagedProject[]): ProjectFormState {
  return {
    ...DEFAULT_FORM_STATE,
    displayOrder: String(getNextDisplayOrder(projects)),
  };
}

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

function normalizeLiveUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function createFormStateFromProject(project: ManagedProject): ProjectFormState {
  return {
    title: project.title,
    role: project.role,
    projectType: project.projectType,
    appPlatform: project.appPlatform,
    details: project.details,
    summaryDescription: project.summaryDescription,
    visibility: project.visibility,
    section: project.section,
    techStack: project.techStack.join(", "),
    liveUrl: project.liveUrl ?? "",
    showOnHomepage: project.showOnHomepage,
    displayOrder: String(project.displayOrder),
  };
}

function ExportGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 4.75v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.75 10.75 12 14l3.25-3.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 18.25h13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ImportGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 19.25v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.25 13.25 12 10l-3.25 3.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 5.75h13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AddGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 5.25v13.5M5.25 12h13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function uploadProjectsCsv(
  file: File,
  onProgress: (value: number) => void
) {
  return new Promise<ImportProjectsResult>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/admin/projects/import");
    request.responseType = "json";

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const nextValue = Math.min(90, Math.max(6, Math.round((event.loaded / event.total) * 90)));
      onProgress(nextValue);
    });

    request.addEventListener("load", () => {
      const rawResponse = request.response;
      const result =
        rawResponse && typeof rawResponse === "object"
          ? (rawResponse as ImportProjectsResult)
          : (() => {
              try {
                return JSON.parse(request.responseText) as ImportProjectsResult;
              } catch {
                return null;
              }
            })();

      if (request.status >= 200 && request.status < 300 && result) {
        resolve(result);
        return;
      }

      reject(
        new Error(
          result?.error ||
            (request.status === 401 ? "Unauthorized." : "Unable to import projects.")
        )
      );
    });

    request.addEventListener("error", () => {
      reject(new Error("Unable to import projects."));
    });

    request.send(formData);
  });
}

export default function AdminProjectsManager({
  initialProjects,
}: AdminProjectsManagerProps) {
  const [projects, setProjects] = useState(() => sortProjects(initialProjects));
  const [formState, setFormState] = useState<ProjectFormState>(() =>
    createDefaultFormState(sortProjects(initialProjects))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importProgressTimerRef = useRef<number | null>(null);
  const isEditing = editingId !== null;

  const stopImportProgressAnimation = useCallback(() => {
    if (importProgressTimerRef.current !== null) {
      window.clearInterval(importProgressTimerRef.current);
      importProgressTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    stopImportProgressAnimation();
  }, [stopImportProgressAnimation]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const resetForm = useCallback((nextProjects = projects) => {
    setEditingId(null);
    setFormState(createDefaultFormState(nextProjects));
  }, [projects]);

  const openAddForm = useCallback(() => {
    setError(null);
    setFeedback(null);
    resetForm(projects);
    setIsFormOpen(true);
  }, [projects, resetForm]);

  const closeForm = useCallback((nextProjects = projects) => {
    setError(null);
    resetForm(nextProjects);
    setIsFormOpen(false);
  }, [projects, resetForm]);

  function handleEdit(project: ManagedProject) {
    setError(null);
    setFeedback(null);
    setEditingId(project.id);
    setFormState(createFormStateFromProject(project));
    setIsFormOpen(true);
  }

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        closeForm();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeForm, isFormOpen, isSubmitting]);

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
          liveUrl: normalizeLiveUrl(formState.liveUrl),
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

      const nextProjects = sortProjects(
        isEditing
          ? projects.map((project) => (project.id === result.project!.id ? result.project! : project))
          : [...projects, result.project!]
      );
      setProjects(nextProjects);
      closeForm(nextProjects);
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

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setFeedback(null);
    setIsImporting(true);
    setImportProgress(4);
    stopImportProgressAnimation();

    try {
      const importPromise = uploadProjectsCsv(file, (value) => {
        setImportProgress((current) => Math.max(current ?? 0, value));
      });

      importProgressTimerRef.current = window.setInterval(() => {
        setImportProgress((current) => {
          if (current === null || current >= 98) {
            return current;
          }

          if (current < 90) {
            return current;
          }

          return current + 1;
        });
      }, 180);

      const result = await importPromise;

      if (!result.projects) {
        throw new Error(result.error || "Unable to import projects.");
      }

      const nextProjects = sortProjects(result.projects);
      setProjects(nextProjects);
      resetForm(nextProjects);
      stopImportProgressAnimation();
      setImportProgress(100);
      setFeedback(
        `Import complete: ${result.createdCount ?? 0} added, ${result.updatedCount ?? 0} updated.`
      );
    } catch (importError) {
      stopImportProgressAnimation();
      setImportProgress(null);
      setError(importError instanceof Error ? importError.message : "Unable to import projects.");
    } finally {
      event.target.value = "";
      window.setTimeout(() => {
        setImportProgress(null);
        setIsImporting(false);
      }, 320);
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
        closeForm();
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white/95">Projects</h2>
          <p className="mt-2 text-sm text-white/55">
            Add, edit, and manage projects for the desktop portfolio experience, including app
            type grouping and optional live links.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/projects/export"
            className="admin-grid-icon-button"
            aria-label="Export projects as CSV"
            title="Export CSV"
          >
            <ExportGlyph />
          </a>

          <button
            type="button"
            className="admin-grid-icon-button"
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
            aria-label="Import projects from CSV"
            title="Import CSV"
          >
            <ImportGlyph />
          </button>

          <button
            type="button"
            className="admin-grid-icon-button admin-grid-icon-button-primary"
            onClick={openAddForm}
            aria-label="Add project"
            title="Add project"
          >
            <AddGlyph />
          </button>

          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      {feedback ? <div className="mb-4 text-sm text-emerald-300">{feedback}</div> : null}
      {error && !isFormOpen ? <div className="mb-4 text-sm text-rose-300">{error}</div> : null}
      {isImporting && importProgress !== null ? (
        <div className="mb-4 max-w-md">
          <div className="mb-2 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.28em] text-white/45">
            <span>Importing projects</span>
            <span>{importProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/6">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(99,102,241,0.88),rgba(56,189,248,0.88))] transition-[width] duration-200 ease-out"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <AdminTableScroller className="mt-6">
        <table className="admin-grid-table min-w-full text-left text-sm text-white/80">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium">Actions</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Section</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Project Type</th>
              <th className="px-4 py-3 font-medium">App Type</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Live URL</th>
              <th className="px-4 py-3 font-medium">Tech Stack</th>
              <th className="px-4 py-3 font-medium">Summary</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="align-top">
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
                <td className="px-4 py-3 min-w-56 text-white/92">{project.title}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">{project.section}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">{project.visibility}</td>
                <td className="px-4 py-3 min-w-52 text-white/65">{project.role}</td>
                <td className="px-4 py-3 min-w-48 text-white/65">{project.projectType}</td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {APP_PLATFORM_LABELS[project.appPlatform]}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {project.displayOrder}
                </td>
                <td className="px-4 py-3 min-w-60 text-white/65">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#9bc2ff] underline-offset-4 hover:text-white hover:underline"
                    >
                      {project.liveUrl}
                    </a>
                  ) : (
                    "n/a"
                  )}
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
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableScroller>

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-[160] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 md:py-10"
          onClick={() => {
            if (!isSubmitting) {
              closeForm();
            }
          }}
        >
          <div
            className="ide-scrollbar max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015)),rgba(19,16,24,0.96)] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-4">
              <div>
                <div className="admin-grid-filter-label">
                  {isEditing ? "Edit project" : "New project"}
                </div>
                <h3 className="mt-2 text-2xl font-medium text-white/94">
                  {isEditing ? "Update project details" : "Add a new project"}
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  Fill out the project information and save it to the admin-managed portfolio list.
                </p>
              </div>
              <button
                type="button"
                className="admin-grid-button admin-grid-button-secondary"
                onClick={() => closeForm()}
                disabled={isSubmitting}
              >
                Close
              </button>
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

                <label className="admin-grid-filter">
                  <span className="admin-grid-filter-label">App Type</span>
                  <select
                    className="admin-grid-input admin-grid-select"
                    value={formState.appPlatform}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        appPlatform: event.target.value as ProjectAppPlatform,
                      }))
                    }
                  >
                    <option value="web">Web App</option>
                    <option value="phone">Phone App</option>
                    <option value="desktop">Desktop App</option>
                  </select>
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
                    readOnly={!isEditing}
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

                <label className="admin-grid-filter xl:col-span-1">
                  <span className="admin-grid-filter-label">Live URL</span>
                  <input
                    className="admin-grid-input"
                    type="text"
                    value={formState.liveUrl}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, liveUrl: event.target.value }))
                    }
                    placeholder="https://example.com"
                  />
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
                <button
                  type="button"
                  className="admin-grid-button admin-grid-button-secondary"
                  onClick={() => closeForm()}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {error ? <div className="text-sm text-rose-300">{error}</div> : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
