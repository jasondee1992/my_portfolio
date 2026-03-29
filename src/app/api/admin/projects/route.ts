import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/lib/projects/projectStorage";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/projects/types";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeTechStack(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => toNullableText(item))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeCreateProjectInput(body: Record<string, unknown>): CreateProjectInput {
  return {
    title: toNullableText(body.title) ?? "",
    role: toNullableText(body.role) ?? "",
    projectType: toNullableText(body.projectType) ?? "",
    details: toNullableText(body.details) ?? "",
    summaryDescription: toNullableText(body.summaryDescription) ?? "",
    visibility: body.visibility === "internal" ? "internal" : "public",
    section: body.section === "enterprise" ? "enterprise" : "other",
    techStack: normalizeTechStack(body.techStack),
    showOnHomepage: body.showOnHomepage === true,
    displayOrder:
      typeof body.displayOrder === "number"
        ? body.displayOrder
        : typeof body.displayOrder === "string"
          ? Number(body.displayOrder)
          : 0,
  };
}

function normalizeUpdateProjectInput(body: Record<string, unknown>): UpdateProjectInput {
  return {
    id: toNullableText(body.id) ?? "",
    ...normalizeCreateProjectInput(body),
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load projects.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const project = await createProject(normalizeCreateProjectInput(body));
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = toNullableText(body.id);

    if (!id) {
      return NextResponse.json({ error: "Project id is required." }, { status: 400 });
    }

    await deleteProject(id);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const project = await updateProject(normalizeUpdateProjectInput(body));
    return NextResponse.json({ project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
