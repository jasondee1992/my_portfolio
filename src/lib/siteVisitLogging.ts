import "server-only";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { getLoggingBackend, isSqliteLoggingBackend } from "@/lib/logging/backend";
import {
  createLogId,
  createTimestamp,
  getLoggingConfig,
  putItem,
  scanAllItems,
  toLoggingStorageError,
  toNullableText,
} from "@/lib/logging/dynamodb";

export type SiteVisitEvent = {
  sessionId?: string | null;
  visitorId?: string | null;
  pageUrl: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  referrer?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  region?: string | null;
  city?: string | null;
  timeZone?: string | null;
};

export type SiteVisitFilters = {
  visitorId?: string | null;
  sessionId?: string | null;
  pageUrl?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  limit?: number;
  offset?: number;
};

export type SiteVisitRecord = {
  id: string;
  visited_at: string;
  session_id: string | null;
  visitor_id: string | null;
  page_url: string;
  user_agent: string | null;
  ip_address: string | null;
  referrer: string | null;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  time_zone: string | null;
  latitude: number | null;
  longitude: number | null;
  location_accuracy_meters: number | null;
  location_source: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATA_DIR, "chat_logs.sqlite");
const RECENT_DUPLICATE_WINDOW_MS = 30 * 1000;
const loadModule = createRequire(import.meta.url);

let sqliteDatabase: import("better-sqlite3").Database | null = null;
let sqliteInsertStatement: import("better-sqlite3").Statement | null = null;

function requireSqliteModule() {
  return loadModule("better-sqlite3") as typeof import("better-sqlite3");
}

function toNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getSqliteDatabase() {
  if (sqliteDatabase) {
    return sqliteDatabase;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const Database = requireSqliteModule();
  const database = new Database(DATABASE_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      visitor_id TEXT,
      page_url TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      referrer TEXT,
      country_code TEXT,
      country_name TEXT,
      region TEXT,
      city TEXT,
      time_zone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = database.prepare("PRAGMA table_info(site_visits)").all() as Array<{ name: string }>;
  const existingColumnNames = new Set(columns.map((column) => column.name));

  for (const [columnName, columnType] of [
    ["referrer", "TEXT"],
    ["country_code", "TEXT"],
    ["country_name", "TEXT"],
    ["region", "TEXT"],
    ["city", "TEXT"],
    ["latitude", "REAL"],
    ["longitude", "REAL"],
    ["location_accuracy_meters", "REAL"],
    ["location_source", "TEXT"],
    ["time_zone", "TEXT"],
  ] as const) {
    if (!existingColumnNames.has(columnName)) {
      database.exec(`ALTER TABLE site_visits ADD COLUMN ${columnName} ${columnType}`);
    }
  }

  sqliteDatabase = database;
  return database;
}

function getSqliteInsertStatement() {
  if (sqliteInsertStatement) {
    return sqliteInsertStatement;
  }

  sqliteInsertStatement = getSqliteDatabase().prepare(`
    INSERT INTO site_visits (
      session_id,
      visitor_id,
      page_url,
      user_agent,
      ip_address,
      referrer,
      country_code,
      country_name,
      region,
      city,
      time_zone
    ) VALUES (
      @sessionId,
      @visitorId,
      @pageUrl,
      @userAgent,
      @ipAddress,
      @referrer,
      @countryCode,
      @countryName,
      @region,
      @city,
      @timeZone
    )
  `);

  return sqliteInsertStatement;
}

function normalizeLimit(limit?: number) {
  return Math.min(Math.max(limit ?? 50, 1), 200);
}

function normalizeOffset(offset?: number) {
  if (!Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(Math.floor(offset ?? 0), 0);
}

function toSqliteDateTimeStart(value: string | null | undefined) {
  const trimmed = toNullableText(value);
  return trimmed ? `${trimmed} 00:00:00` : null;
}

function toSqliteDateTimeEnd(value: string | null | undefined) {
  const trimmed = toNullableText(value);
  return trimmed ? `${trimmed} 23:59:59` : null;
}

function toIsoDateTimeStart(value: string | null | undefined) {
  const trimmed = toNullableText(value);
  return trimmed ? `${trimmed}T00:00:00.000Z` : null;
}

function toIsoDateTimeEnd(value: string | null | undefined) {
  const trimmed = toNullableText(value);
  return trimmed ? `${trimmed}T23:59:59.999Z` : null;
}

function normalizeSqliteSiteVisitRecord(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    visited_at: typeof row.visited_at === "string" ? row.visited_at : "",
    session_id: toNullableText(typeof row.session_id === "string" ? row.session_id : null),
    visitor_id: toNullableText(typeof row.visitor_id === "string" ? row.visitor_id : null),
    page_url: typeof row.page_url === "string" ? row.page_url : "",
    user_agent: toNullableText(typeof row.user_agent === "string" ? row.user_agent : null),
    ip_address: toNullableText(typeof row.ip_address === "string" ? row.ip_address : null),
    referrer: toNullableText(typeof row.referrer === "string" ? row.referrer : null),
    country_code: toNullableText(
      typeof row.country_code === "string" ? row.country_code : null
    ),
    country_name: toNullableText(
      typeof row.country_name === "string" ? row.country_name : null
    ),
    region: toNullableText(typeof row.region === "string" ? row.region : null),
    city: toNullableText(typeof row.city === "string" ? row.city : null),
    time_zone: toNullableText(typeof row.time_zone === "string" ? row.time_zone : null),
    latitude: toNullableNumber(row.latitude),
    longitude: toNullableNumber(row.longitude),
    location_accuracy_meters: toNullableNumber(row.location_accuracy_meters),
    location_source: toNullableText(
      typeof row.location_source === "string" ? row.location_source : null
    ),
  } satisfies SiteVisitRecord;
}

function normalizeDynamoDbSiteVisitRecord(item: Record<string, unknown>) {
  const createdAt = typeof item.created_at === "string" ? item.created_at : "";

  return {
    id: String(item.id ?? ""),
    visited_at: createdAt,
    session_id: toNullableText(typeof item.session_id === "string" ? item.session_id : null),
    visitor_id: toNullableText(typeof item.visitor_id === "string" ? item.visitor_id : null),
    page_url: typeof item.page_url === "string" ? item.page_url : "",
    user_agent: toNullableText(typeof item.user_agent === "string" ? item.user_agent : null),
    ip_address: toNullableText(typeof item.ip_address === "string" ? item.ip_address : null),
    referrer: toNullableText(typeof item.referrer === "string" ? item.referrer : null),
    country_code: toNullableText(
      typeof item.country_code === "string" ? item.country_code : null
    ),
    country_name: toNullableText(
      typeof item.country_name === "string" ? item.country_name : null
    ),
    region: toNullableText(typeof item.region === "string" ? item.region : null),
    city: toNullableText(typeof item.city === "string" ? item.city : null),
    time_zone: toNullableText(typeof item.time_zone === "string" ? item.time_zone : null),
    latitude: toNullableNumber(item.latitude),
    longitude: toNullableNumber(item.longitude),
    location_accuracy_meters: toNullableNumber(item.location_accuracy_meters),
    location_source: toNullableText(
      typeof item.location_source === "string" ? item.location_source : null
    ),
  } satisfies SiteVisitRecord;
}

function sortSiteVisitsDescending(left: SiteVisitRecord, right: SiteVisitRecord) {
  return right.visited_at.localeCompare(left.visited_at) || right.id.localeCompare(left.id);
}

function buildSqliteQueryParts(filters: SiteVisitFilters = {}) {
  const whereClauses: string[] = [];
  const parameters: Record<string, string | number | null> = {
    limit: normalizeLimit(filters.limit),
  };

  const visitorId = toNullableText(filters.visitorId);
  const sessionId = toNullableText(filters.sessionId);
  const pageUrl = toNullableText(filters.pageUrl);
  const dateFrom = toSqliteDateTimeStart(filters.dateFrom);
  const dateTo = toSqliteDateTimeEnd(filters.dateTo);

  if (visitorId) {
    whereClauses.push("visitor_id = @visitorId");
    parameters.visitorId = visitorId;
  }

  if (sessionId) {
    whereClauses.push("session_id = @sessionId");
    parameters.sessionId = sessionId;
  }

  if (pageUrl) {
    whereClauses.push("page_url LIKE @pageUrl");
    parameters.pageUrl = `%${pageUrl}%`;
  }

  if (dateFrom) {
    whereClauses.push("created_at >= @dateFrom");
    parameters.dateFrom = dateFrom;
  }

  if (dateTo) {
    whereClauses.push("created_at <= @dateTo");
    parameters.dateTo = dateTo;
  }

  return {
    whereSql: whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "",
    parameters,
  };
}

function buildDynamoDbSiteVisitScanInput(filters: SiteVisitFilters = {}) {
  const filterExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, string> = {};

  const visitorId = toNullableText(filters.visitorId);
  const sessionId = toNullableText(filters.sessionId);
  const pageUrl = toNullableText(filters.pageUrl);
  const dateFrom = toIsoDateTimeStart(filters.dateFrom);
  const dateTo = toIsoDateTimeEnd(filters.dateTo);

  if (visitorId) {
    filterExpressions.push("#visitor_id = :visitorId");
    expressionAttributeNames["#visitor_id"] = "visitor_id";
    expressionAttributeValues[":visitorId"] = visitorId;
  }

  if (sessionId) {
    filterExpressions.push("#session_id = :sessionId");
    expressionAttributeNames["#session_id"] = "session_id";
    expressionAttributeValues[":sessionId"] = sessionId;
  }

  if (pageUrl) {
    filterExpressions.push("contains(#page_url, :pageUrl)");
    expressionAttributeNames["#page_url"] = "page_url";
    expressionAttributeValues[":pageUrl"] = pageUrl;
  }

  if (dateFrom) {
    filterExpressions.push("#created_at >= :dateFrom");
    expressionAttributeNames["#created_at"] = "created_at";
    expressionAttributeValues[":dateFrom"] = dateFrom;
  }

  if (dateTo) {
    filterExpressions.push("#created_at <= :dateTo");
    expressionAttributeNames["#created_at"] = "created_at";
    expressionAttributeValues[":dateTo"] = dateTo;
  }

  const scanInput: ScanCommandInput = {
    TableName: getLoggingConfig().siteVisitsTableName,
  };

  if (filterExpressions.length > 0) {
    scanInput.FilterExpression = filterExpressions.join(" AND ");
    scanInput.ExpressionAttributeNames = expressionAttributeNames;
    scanInput.ExpressionAttributeValues = expressionAttributeValues;
  }

  return scanInput;
}

function hasRecentSqliteDuplicateVisit(event: SiteVisitEvent) {
  const pageUrl = toNullableText(event.pageUrl);

  if (!pageUrl) {
    return false;
  }

  const sessionId = toNullableText(event.sessionId);
  const visitorId = toNullableText(event.visitorId);
  const parameters = {
    pageUrl,
    window: "-30 seconds",
  };

  if (sessionId) {
    return getSqliteDatabase()
      .prepare(`
        SELECT 1
        FROM site_visits
        WHERE session_id = @sessionId
          AND page_url = @pageUrl
          AND created_at >= datetime('now', @window)
        LIMIT 1
      `)
      .get({
        ...parameters,
        sessionId,
      });
  }

  if (visitorId) {
    return getSqliteDatabase()
      .prepare(`
        SELECT 1
        FROM site_visits
        WHERE visitor_id = @visitorId
          AND page_url = @pageUrl
          AND created_at >= datetime('now', @window)
        LIMIT 1
      `)
      .get({
        ...parameters,
        visitorId,
      });
  }

  return false;
}

async function hasRecentDynamoDbDuplicateVisit(event: SiteVisitEvent) {
  const pageUrl = toNullableText(event.pageUrl);
  const sessionId = toNullableText(event.sessionId);
  const visitorId = toNullableText(event.visitorId);

  if (!pageUrl || (!sessionId && !visitorId)) {
    return false;
  }

  try {
    const records = await scanAllItems<Record<string, unknown>>({
      TableName: getLoggingConfig().siteVisitsTableName,
      FilterExpression: "#page_url = :pageUrl",
      ExpressionAttributeNames: {
        "#page_url": "page_url",
      },
      ExpressionAttributeValues: {
        ":pageUrl": pageUrl,
      },
    });

    const thresholdTime = Date.now() - RECENT_DUPLICATE_WINDOW_MS;

    return records.some((item) => {
      const createdAt = typeof item.created_at === "string" ? Date.parse(item.created_at) : NaN;
      const recordSessionId =
        typeof item.session_id === "string" ? toNullableText(item.session_id) : null;
      const recordVisitorId =
        typeof item.visitor_id === "string" ? toNullableText(item.visitor_id) : null;

      if (!Number.isFinite(createdAt) || createdAt < thresholdTime) {
        return false;
      }

      if (sessionId && recordSessionId === sessionId) {
        return true;
      }

      return Boolean(visitorId && recordVisitorId === visitorId);
    });
  } catch (error) {
    throw toLoggingStorageError(error, "Unable to check recent site visits in DynamoDB.");
  }
}

async function getSqliteSiteVisits(filters: SiteVisitFilters = {}) {
  const { whereSql, parameters } = buildSqliteQueryParts(filters);
  const rows = getSqliteDatabase()
    .prepare(
      `
        SELECT
          id,
          created_at as visited_at,
          session_id,
          visitor_id,
          page_url,
          user_agent,
          ip_address,
          referrer,
          country_code,
          country_name,
          region,
          city,
          time_zone,
          latitude,
          longitude,
          location_accuracy_meters,
          location_source
        FROM site_visits
        ${whereSql}
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT @limit
        OFFSET @offset
      `
    )
    .all({
      ...parameters,
      offset: normalizeOffset(filters.offset),
    }) as Record<string, unknown>[];

  return rows.map(normalizeSqliteSiteVisitRecord);
}

async function getSqliteSiteVisitsCount(filters: SiteVisitFilters = {}) {
  const { whereSql, parameters } = buildSqliteQueryParts(filters);
  const row = getSqliteDatabase()
    .prepare(
      `
        SELECT COUNT(*) as total
        FROM site_visits
        ${whereSql}
      `
    )
    .get(parameters) as { total?: number } | undefined;

  return row?.total ?? 0;
}

async function getDynamoDbSiteVisits(filters: SiteVisitFilters = {}) {
  try {
    const records = await scanAllItems<Record<string, unknown>>(
      buildDynamoDbSiteVisitScanInput(filters)
    );
    return records
      .map(normalizeDynamoDbSiteVisitRecord)
      .sort(sortSiteVisitsDescending)
      .slice(
        normalizeOffset(filters.offset),
        normalizeOffset(filters.offset) + normalizeLimit(filters.limit)
      );
  } catch (error) {
    throw toLoggingStorageError(error, "Unable to read site visits from DynamoDB.");
  }
}

async function getDynamoDbSiteVisitsCount(filters: SiteVisitFilters = {}) {
  try {
    const records = await scanAllItems<Record<string, unknown>>(
      buildDynamoDbSiteVisitScanInput(filters)
    );
    return records.length;
  } catch (error) {
    throw toLoggingStorageError(error, "Unable to read site visits from DynamoDB.");
  }
}

export async function logSiteVisit(event: SiteVisitEvent) {
  if (isSqliteLoggingBackend()) {
    try {
      const pageUrl = toNullableText(event.pageUrl);

      if (!pageUrl || hasRecentSqliteDuplicateVisit(event)) {
        return;
      }

      getSqliteInsertStatement().run({
        sessionId: toNullableText(event.sessionId),
        visitorId: toNullableText(event.visitorId),
        pageUrl,
        userAgent: toNullableText(event.userAgent),
        ipAddress: toNullableText(event.ipAddress),
        referrer: toNullableText(event.referrer),
        countryCode: toNullableText(event.countryCode),
        countryName: toNullableText(event.countryName),
        region: toNullableText(event.region),
        city: toNullableText(event.city),
        timeZone: toNullableText(event.timeZone),
      });
    } catch (error) {
      console.error("Site visit log write failed:", error);
    }

    return;
  }

  try {
    const pageUrl = toNullableText(event.pageUrl);

    if (!pageUrl || (await hasRecentDynamoDbDuplicateVisit(event))) {
      return;
    }

    const { siteVisitsTableName } = getLoggingConfig();
    await putItem(siteVisitsTableName, {
      id: createLogId(),
      session_id: toNullableText(event.sessionId),
      visitor_id: toNullableText(event.visitorId),
      page_url: pageUrl,
      user_agent: toNullableText(event.userAgent),
      ip_address: toNullableText(event.ipAddress),
      referrer: toNullableText(event.referrer),
      country_code: toNullableText(event.countryCode),
      country_name: toNullableText(event.countryName),
      region: toNullableText(event.region),
      city: toNullableText(event.city),
      time_zone: toNullableText(event.timeZone),
      created_at: createTimestamp(),
    });
  } catch (error) {
    console.error(toLoggingStorageError(error, "Site visit log write failed:").message);
  }
}

export async function getSiteVisits(filters: SiteVisitFilters = {}) {
  if (getLoggingBackend() === "sqlite") {
    return getSqliteSiteVisits(filters);
  }

  return getDynamoDbSiteVisits(filters);
}

export async function getSiteVisitsCount(filters: SiteVisitFilters = {}) {
  if (getLoggingBackend() === "sqlite") {
    return getSqliteSiteVisitsCount(filters);
  }

  return getDynamoDbSiteVisitsCount(filters);
}
