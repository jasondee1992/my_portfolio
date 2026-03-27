import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type ChatLogEvent = {
  sessionId?: string | null;
  visitorId?: string | null;
  userMessage: string;
  effectiveMessage?: string | null;
  aiResponse: string;
  responseBranch?: string | null;
  modelUsed?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  region?: string | null;
  city?: string | null;
  timeZone?: string | null;
};

export type ChatLogFilters = {
  visitorId?: string | null;
  sessionId?: string | null;
  responseBranch?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  searchText?: string | null;
  limit?: number;
  offset?: number;
};

export type ChatLogRecord = {
  id: number;
  session_id: string | null;
  visitor_id: string | null;
  user_message: string;
  effective_message: string | null;
  ai_response: string;
  response_branch: string | null;
  model_used: string | null;
  page_url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  time_zone: string | null;
  created_at: string;
};

export type ChatLogBranchSummary = {
  response_branch: string | null;
  total: number;
};

const CHAT_LOGS_DIR = path.join(process.cwd(), "data");
const CHAT_LOGS_DB_PATH = path.join(CHAT_LOGS_DIR, "chat_logs.sqlite");

function toNullableText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function initializeDatabase() {
  fs.mkdirSync(CHAT_LOGS_DIR, { recursive: true });

  const database = new Database(CHAT_LOGS_DB_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      visitor_id TEXT,
      user_message TEXT,
      effective_message TEXT,
      ai_response TEXT,
      response_branch TEXT,
      model_used TEXT,
      page_url TEXT,
      user_agent TEXT,
      ip_address TEXT,
      country_code TEXT,
      country_name TEXT,
      region TEXT,
      city TEXT,
      time_zone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = database
    .prepare("PRAGMA table_info(chat_logs)")
    .all() as Array<{ name: string }>;
  const existingColumnNames = new Set(columns.map((column) => column.name));
  const requiredColumns = [
    "country_code",
    "country_name",
    "region",
    "city",
    "time_zone",
  ];

  for (const columnName of requiredColumns) {
    if (!existingColumnNames.has(columnName)) {
      database.exec(`ALTER TABLE chat_logs ADD COLUMN ${columnName} TEXT`);
    }
  }

  return database;
}

const database = initializeDatabase();
const insertChatLogStatement = database.prepare(`
  INSERT INTO chat_logs (
    session_id,
    visitor_id,
    user_message,
    effective_message,
    ai_response,
    response_branch,
    model_used,
    page_url,
    user_agent,
    ip_address,
    country_code,
    country_name,
    region,
    city,
    time_zone
  ) VALUES (
    @sessionId,
    @visitorId,
    @userMessage,
    @effectiveMessage,
    @aiResponse,
    @responseBranch,
    @modelUsed,
    @pageUrl,
    @userAgent,
    @ipAddress,
    @countryCode,
    @countryName,
    @region,
    @city,
    @timeZone
  )
`);

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

function normalizeOffset(offset?: number) {
  if (!Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(Math.floor(offset ?? 0), 0);
}

function buildChatLogQueryParts(filters: ChatLogFilters = {}) {
  const whereClauses: string[] = [];
  const parameters: Record<string, string | number | null> = {};

  const visitorId = toNullableText(filters.visitorId);
  const sessionId = toNullableText(filters.sessionId);
  const responseBranch = toNullableText(filters.responseBranch);
  const dateFrom = toDateTimeStart(filters.dateFrom);
  const dateTo = toDateTimeEnd(filters.dateTo);
  const searchText = toNullableText(filters.searchText);

  if (visitorId) {
    whereClauses.push("visitor_id = @visitorId");
    parameters.visitorId = visitorId;
  }

  if (sessionId) {
    whereClauses.push("session_id = @sessionId");
    parameters.sessionId = sessionId;
  }

  if (responseBranch) {
    whereClauses.push("response_branch = @responseBranch");
    parameters.responseBranch = responseBranch;
  }

  if (dateFrom) {
    whereClauses.push("created_at >= @dateFrom");
    parameters.dateFrom = dateFrom;
  }

  if (dateTo) {
    whereClauses.push("created_at <= @dateTo");
    parameters.dateTo = dateTo;
  }

  if (searchText) {
    whereClauses.push(`(
      user_message LIKE @searchText OR
      ai_response LIKE @searchText OR
      visitor_id LIKE @searchText OR
      session_id LIKE @searchText
    )`);
    parameters.searchText = `%${searchText}%`;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  return {
    whereSql,
    parameters,
  };
}

export function logChatEvent(event: ChatLogEvent) {
  try {
    insertChatLogStatement.run({
      sessionId: toNullableText(event.sessionId),
      visitorId: toNullableText(event.visitorId),
      userMessage: event.userMessage,
      effectiveMessage: toNullableText(event.effectiveMessage),
      aiResponse: event.aiResponse,
      responseBranch: toNullableText(event.responseBranch),
      modelUsed: toNullableText(event.modelUsed),
      pageUrl: toNullableText(event.pageUrl),
      userAgent: toNullableText(event.userAgent),
      ipAddress: toNullableText(event.ipAddress),
      countryCode: toNullableText(event.countryCode),
      countryName: toNullableText(event.countryName),
      region: toNullableText(event.region),
      city: toNullableText(event.city),
      timeZone: toNullableText(event.timeZone),
    });
  } catch (error) {
    console.error("Chat log write failed:", error);
  }
}

export function getChatLogs(filters: ChatLogFilters = {}) {
  const { whereSql, parameters } = buildChatLogQueryParts(filters);
  parameters.limit = normalizeLimit(filters.limit);
  parameters.offset = normalizeOffset(filters.offset);
  const query = `
    SELECT
      id,
      session_id,
      visitor_id,
      user_message,
      effective_message,
      ai_response,
      response_branch,
      model_used,
      page_url,
      user_agent,
      ip_address,
      country_code,
      country_name,
      region,
      city,
      time_zone,
      created_at
    FROM chat_logs
    ${whereSql}
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT @limit
    OFFSET @offset
  `;

  return database.prepare(query).all(parameters) as ChatLogRecord[];
}

export function getChatLogsCount(filters: ChatLogFilters = {}) {
  const { whereSql, parameters } = buildChatLogQueryParts(filters);
  const query = `
    SELECT COUNT(*) as total
    FROM chat_logs
    ${whereSql}
  `;
  const row = database.prepare(query).get(parameters) as { total?: number } | undefined;

  return row?.total ?? 0;
}

export function getChatLogBranchSummary(filters: ChatLogFilters = {}) {
  const { whereSql, parameters } = buildChatLogQueryParts(filters);
  const query = `
    SELECT
      response_branch,
      COUNT(*) as total
    FROM chat_logs
    ${whereSql}
    GROUP BY response_branch
    ORDER BY total DESC, response_branch ASC
  `;

  return database.prepare(query).all(parameters) as ChatLogBranchSummary[];
}
