import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createProject, getProjects, updateProject } from "@/lib/projects/projectStorage";
import type {
  CreateProjectInput,
  ManagedProject,
  ProjectAppPlatform,
  ProjectSection,
  ProjectVisibility,
  UpdateProjectInput,
} from "@/lib/projects/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_HEADERS = [
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
] as const;

function normalizeHeaderCell(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function toNullableText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeProjectAppPlatform(value: string | null | undefined): ProjectAppPlatform {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "phone" || normalized === "phone app" || normalized === "mobile" || normalized === "mobile app") {
    return "phone";
  }

  if (normalized === "desktop" || normalized === "desktop app") {
    return "desktop";
  }

  return "web";
}

function normalizeProjectVisibility(value: string | null | undefined): ProjectVisibility {
  return value?.trim().toLowerCase() === "internal" ? "internal" : "public";
}

function normalizeProjectSection(value: string | null | undefined): ProjectSection {
  return value?.trim().toLowerCase() === "enterprise" ? "enterprise" : "other";
}

function normalizeTechStack(value: string | null | undefined) {
  return (value ?? "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      currentCell = "";

      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function buildRowMap(headers: string[], row: string[]) {
  return headers.reduce<Record<string, string>>((accumulator, header, index) => {
    accumulator[header] = row[index] ?? "";
    return accumulator;
  }, {});
}

function isEmptyRow(row: string[]) {
  return row.every((cell) => cell.trim().length === 0);
}

function getNextDisplayOrder(projects: ManagedProject[]) {
  if (projects.length === 0) {
    return 0;
  }

  return Math.max(...projects.map((project) => project.displayOrder)) + 1;
}

function buildCreateInput(row: Record<string, string>, displayOrder: number): CreateProjectInput {
  return {
    title: toNullableText(row.title) ?? "",
    role: toNullableText(row.role) ?? "",
    projectType: toNullableText(row.project_type) ?? "",
    appPlatform: normalizeProjectAppPlatform(row.app_platform),
    details: toNullableText(row.details) ?? "",
    summaryDescription: toNullableText(row.summary_description) ?? "",
    visibility: normalizeProjectVisibility(row.visibility),
    section: normalizeProjectSection(row.section),
    techStack: normalizeTechStack(row.tech_stack),
    liveUrl: toNullableText(row.live_url),
    showOnHomepage: false,
    displayOrder,
  };
}

function buildUpdateInput(
  existingProject: ManagedProject,
  row: Record<string, string>
): UpdateProjectInput {
  return {
    id: existingProject.id,
    title: toNullableText(row.title) ?? existingProject.title,
    role: toNullableText(row.role) ?? existingProject.role,
    projectType: toNullableText(row.project_type) ?? existingProject.projectType,
    appPlatform: normalizeProjectAppPlatform(row.app_platform),
    details: toNullableText(row.details) ?? existingProject.details,
    summaryDescription:
      toNullableText(row.summary_description) ?? existingProject.summaryDescription,
    visibility: normalizeProjectVisibility(row.visibility),
    section: normalizeProjectSection(row.section),
    techStack: normalizeTechStack(row.tech_stack),
    liveUrl: toNullableText(row.live_url),
    showOnHomepage: existingProject.showOnHomepage,
    displayOrder: existingProject.displayOrder,
  };
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    const content = await file.text();
    const parsedRows = parseCsv(content);

    if (parsedRows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty." }, { status: 400 });
    }

    const [headerRow, ...dataRows] = parsedRows;
    const headers = headerRow.map((cell) => normalizeHeaderCell(cell));

    for (const header of REQUIRED_HEADERS) {
      if (!headers.includes(header)) {
        return NextResponse.json(
          { error: `Missing required CSV column: ${header}` },
          { status: 400 }
        );
      }
    }

    const existingProjects = await getProjects();
    const projectsByTitle = new Map(
      existingProjects.map((project) => [project.title.trim().toLowerCase(), project] as const)
    );
    let nextDisplayOrder = getNextDisplayOrder(existingProjects);
    let createdCount = 0;
    let updatedCount = 0;

    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
      const row = dataRows[rowIndex];

      if (isEmptyRow(row)) {
        continue;
      }

      if (row.length !== headers.length) {
        return NextResponse.json(
          {
            error: `CSV row ${rowIndex + 2} has ${row.length} columns; expected ${headers.length}. Check for unescaped commas or line breaks in that row before importing again.`,
          },
          { status: 400 }
        );
      }

      const mappedRow = buildRowMap(headers, row);
      const title = toNullableText(mappedRow.title);

      if (!title) {
        continue;
      }

      const existingProject = projectsByTitle.get(title.toLowerCase());

      if (existingProject) {
        const updatedProject = await updateProject(buildUpdateInput(existingProject, mappedRow));
        projectsByTitle.set(title.toLowerCase(), updatedProject);
        updatedCount += 1;
      } else {
        const createdProject = await createProject(buildCreateInput(mappedRow, nextDisplayOrder));
        projectsByTitle.set(title.toLowerCase(), createdProject);
        nextDisplayOrder += 1;
        createdCount += 1;
      }
    }

    const projects = await getProjects();

  return NextResponse.json({
      projects,
      createdCount,
      updatedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import projects.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
