import { createAdminLoginRedirect, isAdminAuthenticated } from "@/lib/adminAuth";
import { getProjects } from "@/lib/projects/projectStorage";
import type { ManagedProject } from "@/lib/projects/types";

export const dynamic = "force-dynamic";

function escapeCsvCell(value: string | null | undefined) {
  const normalized = value ?? "";
  return `"${normalized.replace(/"/g, '""')}"`;
}

function normalizeProjectRows(rows: ManagedProject[]) {
  return rows.map((row) => ({
    title: row.title,
    role: row.role,
    projectType: row.projectType,
    appPlatform: row.appPlatform,
    details: row.details,
    summaryDescription: row.summaryDescription,
    visibility: row.visibility,
    section: row.section,
    techStack: row.techStack.join("; "),
    liveUrl: row.liveUrl ?? "",
    displayOrder: String(row.displayOrder),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

function toCsv(rows: ManagedProject[]) {
  const normalizedRows = normalizeProjectRows(rows);
  const headers = [
    "title",
    "role",
    "project_type",
    "app_platform",
    "details",
    "summary_description",
    "visibility",
    "section",
    "tech_stack",
    "live_url",
    "display_order",
    "created_at",
    "updated_at",
  ];

  const lines = [
    headers.join(","),
    ...normalizedRows.map((row) =>
      [
        row.title,
        row.role,
        row.projectType,
        row.appPlatform,
        row.details,
        row.summaryDescription,
        row.visibility,
        row.section,
        row.techStack,
        row.liveUrl,
        row.displayOrder,
        row.createdAt,
        row.updatedAt,
      ]
        .map((value) => escapeCsvCell(value))
        .join(",")
    ),
  ];

  return lines.join("\n");
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return createAdminLoginRedirect(request);
  }

  try {
    const projects = await getProjects();

    return new Response(toCsv(projects), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="projects.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export projects.";

    return new Response(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
