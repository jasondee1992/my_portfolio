import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

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
};

export type SiteVisitRecord = {
  id: number;
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
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATA_DIR, "chat_logs.sqlite");
const RECENT_DUPLICATE_WINDOW_SECONDS = 30;

function toNullableText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function initializeDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

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
  const columns = database
    .prepare("PRAGMA table_info(site_visits)")
    .all() as Array<{ name: string }>;

  const existingColumnNames = new Set(columns.map((column) => column.name));
  const requiredColumns = [
    "referrer",
    "country_code",
    "country_name",
    "region",
    "city",
    "time_zone",
  ];

  for (const columnName of requiredColumns) {
    if (!existingColumnNames.has(columnName)) {
      database.exec(`ALTER TABLE site_visits ADD COLUMN ${columnName} TEXT`);
    }
  }

  return database;
}

const database = initializeDatabase();
const insertSiteVisitStatement = database.prepare(`
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

const hasRecentSessionVisitStatement = database.prepare(`
  SELECT 1
  FROM site_visits
  WHERE session_id = @sessionId
    AND page_url = @pageUrl
    AND created_at >= datetime('now', @window)
  LIMIT 1
`);

const hasRecentVisitorVisitStatement = database.prepare(`
  SELECT 1
  FROM site_visits
  WHERE visitor_id = @visitorId
    AND page_url = @pageUrl
    AND created_at >= datetime('now', @window)
  LIMIT 1
`);

function hasRecentDuplicateVisit(event: SiteVisitEvent) {
  const pageUrl = toNullableText(event.pageUrl);

  if (!pageUrl) {
    return false;
  }

  const sessionId = toNullableText(event.sessionId);
  const visitorId = toNullableText(event.visitorId);
  const parameters = {
    pageUrl,
    window: `-${RECENT_DUPLICATE_WINDOW_SECONDS} seconds`,
  };

  if (sessionId) {
    return hasRecentSessionVisitStatement.get({
      ...parameters,
      sessionId,
    });
  }

  if (visitorId) {
    return hasRecentVisitorVisitStatement.get({
      ...parameters,
      visitorId,
    });
  }

  return false;
}

function toDateTimeStart(value: string | null | undefined) {
  const trimmed = toNullableText(value);
  return trimmed ? `${trimmed} 00:00:00` : null;
}

function toDateTimeEnd(value: string | null | undefined) {
  const trimmed = toNullableText(value);
  return trimmed ? `${trimmed} 23:59:59` : null;
}

function normalizeLimit(limit?: number) {
  return Math.min(Math.max(limit ?? 50, 1), 200);
}

export function logSiteVisit(event: SiteVisitEvent) {
  try {
    const pageUrl = toNullableText(event.pageUrl);

    if (!pageUrl || hasRecentDuplicateVisit(event)) {
      return;
    }

    insertSiteVisitStatement.run({
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
}

export function getSiteVisits(filters: SiteVisitFilters = {}) {
  const whereClauses: string[] = [];
  const parameters: Record<string, string | number | null> = {
    limit: normalizeLimit(filters.limit),
  };

  const visitorId = toNullableText(filters.visitorId);
  const sessionId = toNullableText(filters.sessionId);
  const pageUrl = toNullableText(filters.pageUrl);
  const dateFrom = toDateTimeStart(filters.dateFrom);
  const dateTo = toDateTimeEnd(filters.dateTo);

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

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const query = `
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
      time_zone
    FROM site_visits
    ${whereSql}
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT @limit
  `;

  return database.prepare(query).all(parameters) as SiteVisitRecord[];
}
