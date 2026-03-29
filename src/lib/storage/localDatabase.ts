import "server-only";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const SQLITE_DATABASE_PATH = path.join(DATA_DIR, "portfolio.sqlite");

const loadModule = createRequire(import.meta.url);

let sqliteDatabase: import("better-sqlite3").Database | null = null;

function requireSqliteModule() {
  return loadModule("better-sqlite3") as typeof import("better-sqlite3");
}

function hasTable(database: import("better-sqlite3").Database, tableName: string) {
  const row = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName) as { name?: string } | undefined;

  return Boolean(row?.name);
}

function getTableRowCount(database: import("better-sqlite3").Database, tableName: string) {
  if (!hasTable(database, tableName)) {
    return 0;
  }

  const row = database
    .prepare(`SELECT COUNT(*) as total FROM ${tableName}`)
    .get() as { total?: number } | undefined;

  return row?.total ?? 0;
}

export function importLegacySqliteTable({
  database,
  tableName,
  sourcePath,
}: {
  database: import("better-sqlite3").Database;
  tableName: string;
  sourcePath: string;
}) {
  if (!fs.existsSync(sourcePath) || path.resolve(sourcePath) === path.resolve(SQLITE_DATABASE_PATH)) {
    return false;
  }

  if (getTableRowCount(database, tableName) > 0) {
    return false;
  }

  const Database = requireSqliteModule();
  const sourceDatabase = new Database(sourcePath);

  try {
    if (!hasTable(sourceDatabase, tableName)) {
      return false;
    }

    if (!hasTable(database, tableName)) {
      const tableDefinition = sourceDatabase
        .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
        .get(tableName) as { sql?: string } | undefined;

      if (!tableDefinition?.sql) {
        return false;
      }

      database.exec(tableDefinition.sql);
    }

    const rows = sourceDatabase.prepare(`SELECT * FROM ${tableName}`).all() as Record<string, unknown>[];

    if (rows.length === 0) {
      return false;
    }

    const columns = Object.keys(rows[0]);
    const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
    const placeholders = columns.map((column) => `@${column}`).join(", ");
    const insertStatement = database.prepare(
      `INSERT INTO ${tableName} (${quotedColumns}) VALUES (${placeholders})`
    );
    const insertMany = database.transaction((records: Record<string, unknown>[]) => {
      for (const row of records) {
        insertStatement.run(row);
      }
    });

    insertMany(rows);
    return true;
  } finally {
    sourceDatabase.close();
  }
}

export function getLocalSqliteDatabase() {
  if (sqliteDatabase) {
    return sqliteDatabase;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const Database = requireSqliteModule();
  const database = new Database(SQLITE_DATABASE_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");

  sqliteDatabase = database;
  return database;
}

export { DATA_DIR, SQLITE_DATABASE_PATH };
