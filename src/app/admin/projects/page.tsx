import "server-only";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminProjectsManager from "@/components/admin/AdminProjectsManager";
import { requireAdminPageAuth } from "@/lib/adminAuth";
import { getProjects } from "@/lib/projects/projectStorage";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdminPageAuth("/admin/projects");

  let readError: string | null = null;
  let projects = await Promise.resolve([] as Awaited<ReturnType<typeof getProjects>>);

  try {
    projects = await getProjects();
  } catch (error) {
    readError = error instanceof Error ? error.message : "Unable to read project data.";
  }

  return (
    <AdminPageShell activeView="projects">
      {readError ? (
        <div className="admin-grid-section pb-0">
          <div className="admin-grid-empty">{readError}</div>
        </div>
      ) : (
        <AdminProjectsManager initialProjects={projects} />
      )}
    </AdminPageShell>
  );
}
