import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { getLoggingBackend } from "@/lib/logging/backend";
import { DEFAULT_MANAGED_PROJECTS } from "@/lib/projects/seedProjects";
import { getLocalSqliteDatabase, importLegacySqliteTable } from "@/lib/storage/localDatabase";
import type {
  CreateProjectInput,
  ManagedProject,
  ProjectSection,
  UpdateProjectInput,
  ProjectVisibility,
} from "@/lib/projects/types";

const SQLITE_TABLE_NAME = "projects";
let sqliteInsertStatement: import("better-sqlite3").Statement | null = null;
let dynamoDocumentClient: DynamoDBDocumentClient | null = null;

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toRequiredText(value: unknown, fieldName: string) {
  const normalized = toNullableText(value);

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

function normalizeProjectSection(value: unknown): ProjectSection {
  return value === "enterprise" ? "enterprise" : "other";
}

function normalizeProjectVisibility(value: unknown): ProjectVisibility {
  return value === "internal" ? "internal" : "public";
}

function normalizeTechStack(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => toNullableText(item))
    .filter((item): item is string => Boolean(item))
    .filter((item, index, array) => array.indexOf(item) === index);
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
  }

  return false;
}

function normalizeDisplayOrder(value: unknown) {
  const normalized =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.max(0, Math.floor(normalized));
}

function createTimestamp() {
  return new Date().toISOString();
}

function normalizeManagedProject(
  row: Record<string, unknown>,
  fallbackId?: string
): ManagedProject {
  const techStack =
    Array.isArray(row.techStack)
      ? normalizeTechStack(row.techStack)
      : typeof row.tech_stack_json === "string"
        ? (() => {
            try {
              return normalizeTechStack(JSON.parse(row.tech_stack_json));
            } catch {
              return [];
            }
          })()
        : [];

  return {
    id: toNullableText(row.id) ?? fallbackId ?? randomUUID(),
    title: toRequiredText(row.title, "title"),
    role: toRequiredText(row.role, "role"),
    projectType:
      toNullableText(row.projectType) ??
      toRequiredText(row.project_type, "project_type"),
    details: toRequiredText(row.details, "details"),
    summaryDescription:
      toNullableText(row.summaryDescription) ??
      toRequiredText(row.summary_description, "summary_description"),
    visibility: normalizeProjectVisibility(row.visibility),
    section: normalizeProjectSection(row.section),
    techStack,
    showOnHomepage:
      normalizeBoolean(row.showOnHomepage) || normalizeBoolean(row.show_on_homepage),
    displayOrder:
      typeof row.displayOrder === "number"
        ? normalizeDisplayOrder(row.displayOrder)
        : normalizeDisplayOrder(row.display_order),
    createdAt:
      toNullableText(row.createdAt) ??
      toNullableText(row.created_at) ??
      createTimestamp(),
    updatedAt:
      toNullableText(row.updatedAt) ??
      toNullableText(row.updated_at) ??
      createTimestamp(),
  };
}

function sortProjects(left: ManagedProject, right: ManagedProject) {
  const sectionWeight = { enterprise: 0, other: 1 } as const;
  return (
    sectionWeight[left.section] - sectionWeight[right.section] ||
    left.displayOrder - right.displayOrder ||
    left.title.localeCompare(right.title)
  );
}

function getSqliteDatabase() {
  const database = getLocalSqliteDatabase();
  importLegacySqliteTable({
    database,
    tableName: SQLITE_TABLE_NAME,
    sourcePath: path.join(process.cwd(), "data", "portfolio_content.sqlite"),
  });
  database.exec(`
    CREATE TABLE IF NOT EXISTS ${SQLITE_TABLE_NAME} (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      role TEXT NOT NULL,
      project_type TEXT NOT NULL,
      details TEXT NOT NULL,
      summary_description TEXT NOT NULL,
      visibility TEXT NOT NULL,
      section TEXT NOT NULL,
      tech_stack_json TEXT NOT NULL,
      show_on_homepage INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  ensureSqliteSeedData(database);
  return database;
}

function ensureSqliteSeedData(database: import("better-sqlite3").Database) {
  const row = database
    .prepare(`SELECT COUNT(*) as total FROM ${SQLITE_TABLE_NAME}`)
    .get() as { total?: number } | undefined;

  if ((row?.total ?? 0) > 0) {
    return;
  }

  const insertStatement = database.prepare(`
    INSERT INTO ${SQLITE_TABLE_NAME} (
      id,
      title,
      role,
      project_type,
      details,
      summary_description,
      visibility,
      section,
      tech_stack_json,
      show_on_homepage,
      display_order,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @title,
      @role,
      @projectType,
      @details,
      @summaryDescription,
      @visibility,
      @section,
      @techStackJson,
      @showOnHomepage,
      @displayOrder,
      @createdAt,
      @updatedAt
    )
  `);

  const insertMany = database.transaction((projects: ManagedProject[]) => {
    for (const project of projects) {
      insertStatement.run({
        id: project.id,
        title: project.title,
        role: project.role,
        projectType: project.projectType,
        details: project.details,
        summaryDescription: project.summaryDescription,
        visibility: project.visibility,
        section: project.section,
        techStackJson: JSON.stringify(project.techStack),
        showOnHomepage: project.showOnHomepage ? 1 : 0,
        displayOrder: project.displayOrder,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    }
  });

  insertMany(DEFAULT_MANAGED_PROJECTS);
}

function getSqliteInsertStatement() {
  if (sqliteInsertStatement) {
    return sqliteInsertStatement;
  }

  sqliteInsertStatement = getSqliteDatabase().prepare(`
    INSERT INTO ${SQLITE_TABLE_NAME} (
      id,
      title,
      role,
      project_type,
      details,
      summary_description,
      visibility,
      section,
      tech_stack_json,
      show_on_homepage,
      display_order,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @title,
      @role,
      @projectType,
      @details,
      @summaryDescription,
      @visibility,
      @section,
      @techStackJson,
      @showOnHomepage,
      @displayOrder,
      @createdAt,
      @updatedAt
    )
  `);

  return sqliteInsertStatement;
}

function hasDynamoDbProjectsConfig() {
  return Boolean(
    process.env.DYNAMODB_REGION?.trim() && process.env.DYNAMODB_PROJECTS_TABLE?.trim()
  );
}

function getProjectsBackend() {
  const configuredBackend = getLoggingBackend();

  if (configuredBackend === "dynamodb" && hasDynamoDbProjectsConfig()) {
    return "dynamodb" as const;
  }

  return "sqlite" as const;
}

function getProjectsTableName() {
  const tableName = process.env.DYNAMODB_PROJECTS_TABLE?.trim();

  if (!tableName) {
    throw new Error("Missing DYNAMODB_PROJECTS_TABLE for projects storage.");
  }

  return tableName;
}

function getDynamoDocumentClient() {
  if (dynamoDocumentClient) {
    return dynamoDocumentClient;
  }

  const region = process.env.DYNAMODB_REGION?.trim();

  if (!region) {
    throw new Error("Missing DYNAMODB_REGION for projects storage.");
  }

  dynamoDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region,
    }),
    {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    }
  );

  return dynamoDocumentClient;
}

async function scanAllDynamoProjects() {
  const client = getDynamoDocumentClient();
  const tableName = getProjectsTableName();
  const items: Record<string, unknown>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await client.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    items.push(...((response.Items as Record<string, unknown>[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return items;
}

async function ensureDynamoSeedData() {
  const records = await scanAllDynamoProjects();

  if (records.length > 0) {
    return records;
  }

  const client = getDynamoDocumentClient();
  const tableName = getProjectsTableName();

  for (const project of DEFAULT_MANAGED_PROJECTS) {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          id: project.id,
          title: project.title,
          role: project.role,
          project_type: project.projectType,
          details: project.details,
          summary_description: project.summaryDescription,
          visibility: project.visibility,
          section: project.section,
          techStack: project.techStack,
          showOnHomepage: project.showOnHomepage,
          displayOrder: project.displayOrder,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      })
    );
  }

  return DEFAULT_MANAGED_PROJECTS.map((project) => ({
    ...project,
  }));
}

function toCreateProjectRecord(input: CreateProjectInput): ManagedProject {
  const timestamp = createTimestamp();

  return {
    id: randomUUID(),
    title: toRequiredText(input.title, "title"),
    role: toRequiredText(input.role, "role"),
    projectType: toRequiredText(input.projectType, "projectType"),
    details: toRequiredText(input.details, "details"),
    summaryDescription: toRequiredText(input.summaryDescription, "summaryDescription"),
    visibility: normalizeProjectVisibility(input.visibility),
    section: normalizeProjectSection(input.section),
    techStack: normalizeTechStack(input.techStack),
    showOnHomepage: normalizeBoolean(input.showOnHomepage),
    displayOrder: normalizeDisplayOrder(input.displayOrder),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function toUpdateProjectRecord(input: UpdateProjectInput): ManagedProject {
  const timestamp = createTimestamp();

  return {
    id: toRequiredText(input.id, "id"),
    title: toRequiredText(input.title, "title"),
    role: toRequiredText(input.role, "role"),
    projectType: toRequiredText(input.projectType, "projectType"),
    details: toRequiredText(input.details, "details"),
    summaryDescription: toRequiredText(input.summaryDescription, "summaryDescription"),
    visibility: normalizeProjectVisibility(input.visibility),
    section: normalizeProjectSection(input.section),
    techStack: normalizeTechStack(input.techStack),
    showOnHomepage: normalizeBoolean(input.showOnHomepage),
    displayOrder: normalizeDisplayOrder(input.displayOrder),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function getProjects() {
  if (getProjectsBackend() === "sqlite") {
    const rows = getSqliteDatabase()
      .prepare(
        `
          SELECT
            id,
            title,
            role,
            project_type,
            details,
            summary_description,
            visibility,
            section,
            tech_stack_json,
            show_on_homepage,
            display_order,
            created_at,
            updated_at
          FROM ${SQLITE_TABLE_NAME}
        `
      )
      .all() as Record<string, unknown>[];

    return rows.map((row) => normalizeManagedProject(row)).sort(sortProjects);
  }

  const rows = await ensureDynamoSeedData();
  return rows.map((row) => normalizeManagedProject(row)).sort(sortProjects);
}

export async function getHomepageProjects(limit = 4) {
  const projects = await getProjects();
  return projects
    .filter((project) => project.showOnHomepage)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title))
    .slice(0, limit);
}

export async function createProject(input: CreateProjectInput) {
  const nextProject = toCreateProjectRecord(input);

  if (getProjectsBackend() === "sqlite") {
    getSqliteInsertStatement().run({
      id: nextProject.id,
      title: nextProject.title,
      role: nextProject.role,
      projectType: nextProject.projectType,
      details: nextProject.details,
      summaryDescription: nextProject.summaryDescription,
      visibility: nextProject.visibility,
      section: nextProject.section,
      techStackJson: JSON.stringify(nextProject.techStack),
      showOnHomepage: nextProject.showOnHomepage ? 1 : 0,
      displayOrder: nextProject.displayOrder,
      createdAt: nextProject.createdAt,
      updatedAt: nextProject.updatedAt,
    });

    return nextProject;
  }

  const client = getDynamoDocumentClient();
  await client.send(
    new PutCommand({
      TableName: getProjectsTableName(),
      Item: {
        id: nextProject.id,
        title: nextProject.title,
        role: nextProject.role,
        project_type: nextProject.projectType,
        details: nextProject.details,
        summary_description: nextProject.summaryDescription,
        visibility: nextProject.visibility,
        section: nextProject.section,
        techStack: nextProject.techStack,
        showOnHomepage: nextProject.showOnHomepage,
        displayOrder: nextProject.displayOrder,
        createdAt: nextProject.createdAt,
        updatedAt: nextProject.updatedAt,
      },
    })
  );

  return nextProject;
}

export async function updateProject(input: UpdateProjectInput) {
  const nextProject = toUpdateProjectRecord(input);

  if (getProjectsBackend() === "sqlite") {
    const existingRow = getSqliteDatabase()
      .prepare(
        `SELECT created_at FROM ${SQLITE_TABLE_NAME} WHERE id = ?`
      )
      .get(nextProject.id) as { created_at?: string } | undefined;

    if (!existingRow?.created_at) {
      throw new Error("Project not found.");
    }

    nextProject.createdAt = toNullableText(existingRow.created_at) ?? nextProject.createdAt;

    getSqliteDatabase()
      .prepare(
        `
          UPDATE ${SQLITE_TABLE_NAME}
          SET
            title = @title,
            role = @role,
            project_type = @projectType,
            details = @details,
            summary_description = @summaryDescription,
            visibility = @visibility,
            section = @section,
            tech_stack_json = @techStackJson,
            show_on_homepage = @showOnHomepage,
            display_order = @displayOrder,
            updated_at = @updatedAt
          WHERE id = @id
        `
      )
      .run({
        id: nextProject.id,
        title: nextProject.title,
        role: nextProject.role,
        projectType: nextProject.projectType,
        details: nextProject.details,
        summaryDescription: nextProject.summaryDescription,
        visibility: nextProject.visibility,
        section: nextProject.section,
        techStackJson: JSON.stringify(nextProject.techStack),
        showOnHomepage: nextProject.showOnHomepage ? 1 : 0,
        displayOrder: nextProject.displayOrder,
        updatedAt: nextProject.updatedAt,
      });

    return nextProject;
  }

  const currentProjects = await getProjects();
  const existingProject = currentProjects.find((project) => project.id === nextProject.id);

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  nextProject.createdAt = existingProject.createdAt;

  const client = getDynamoDocumentClient();
  await client.send(
    new PutCommand({
      TableName: getProjectsTableName(),
      Item: {
        id: nextProject.id,
        title: nextProject.title,
        role: nextProject.role,
        project_type: nextProject.projectType,
        details: nextProject.details,
        summary_description: nextProject.summaryDescription,
        visibility: nextProject.visibility,
        section: nextProject.section,
        techStack: nextProject.techStack,
        showOnHomepage: nextProject.showOnHomepage,
        displayOrder: nextProject.displayOrder,
        createdAt: nextProject.createdAt,
        updatedAt: nextProject.updatedAt,
      },
    })
  );

  return nextProject;
}

export async function deleteProject(id: string) {
  const normalizedId = toRequiredText(id, "id");

  if (getProjectsBackend() === "sqlite") {
    getSqliteDatabase()
      .prepare(`DELETE FROM ${SQLITE_TABLE_NAME} WHERE id = ?`)
      .run(normalizedId);

    return normalizedId;
  }

  const client = getDynamoDocumentClient();
  await client.send(
    new DeleteCommand({
      TableName: getProjectsTableName(),
      Key: {
        id: normalizedId,
      },
    })
  );

  return normalizedId;
}
