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
  id: string;
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

const CHAT_LOGS_DIR = path.join(process.cwd(), "data");
const CHAT_LOGS_DB_PATH = path.join(CHAT_LOGS_DIR, "chat_logs.sqlite");
const loadModule = createRequire(import.meta.url);

let sqliteDatabase: import("better-sqlite3").Database | null = null;
let sqliteInsertStatement: import("better-sqlite3").Statement | null = null;

function requireSqliteModule() {
  return loadModule("better-sqlite3") as typeof import("better-sqlite3");
}

function getSqliteDatabase() {
  if (sqliteDatabase) {
    return sqliteDatabase;
  }

  fs.mkdirSync(CHAT_LOGS_DIR, { recursive: true });

  const Database = requireSqliteModule();
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

  const columns = database.prepare("PRAGMA table_info(chat_logs)").all() as Array<{ name: string }>;
  const existingColumnNames = new Set(columns.map((column) => column.name));

  for (const columnName of ["country_code", "country_name", "region", "city", "time_zone"]) {
    if (!existingColumnNames.has(columnName)) {
      database.exec(`ALTER TABLE chat_logs ADD COLUMN ${columnName} TEXT`);
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

function buildSqliteQueryParts(filters: ChatLogFilters = {}) {
  const whereClauses: string[] = [];
  const parameters: Record<string, string | number | null> = {};

  const visitorId = toNullableText(filters.visitorId);
  const sessionId = toNullableText(filters.sessionId);
  const responseBranch = toNullableText(filters.responseBranch);
  const dateFrom = toSqliteDateTimeStart(filters.dateFrom);
  const dateTo = toSqliteDateTimeEnd(filters.dateTo);
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

  return {
    whereSql: whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "",
    parameters,
  };
}

function normalizeSqliteChatLogRecord(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    session_id: toNullableText(typeof row.session_id === "string" ? row.session_id : null),
    visitor_id: toNullableText(typeof row.visitor_id === "string" ? row.visitor_id : null),
    user_message: typeof row.user_message === "string" ? row.user_message : "",
    effective_message: toNullableText(
      typeof row.effective_message === "string" ? row.effective_message : null
    ),
    ai_response: typeof row.ai_response === "string" ? row.ai_response : "",
    response_branch: toNullableText(
      typeof row.response_branch === "string" ? row.response_branch : null
    ),
    model_used: toNullableText(typeof row.model_used === "string" ? row.model_used : null),
    page_url: toNullableText(typeof row.page_url === "string" ? row.page_url : null),
    user_agent: toNullableText(typeof row.user_agent === "string" ? row.user_agent : null),
    ip_address: toNullableText(typeof row.ip_address === "string" ? row.ip_address : null),
    country_code: toNullableText(
      typeof row.country_code === "string" ? row.country_code : null
    ),
    country_name: toNullableText(
      typeof row.country_name === "string" ? row.country_name : null
    ),
    region: toNullableText(typeof row.region === "string" ? row.region : null),
    city: toNullableText(typeof row.city === "string" ? row.city : null),
    time_zone: toNullableText(typeof row.time_zone === "string" ? row.time_zone : null),
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  } satisfies ChatLogRecord;
}

function sortChatLogsDescending(left: ChatLogRecord, right: ChatLogRecord) {
  return right.created_at.localeCompare(left.created_at) || right.id.localeCompare(left.id);
}

function normalizeDynamoDbChatLogRecord(item: Record<string, unknown>) {
  return {
    id: String(item.id ?? ""),
    session_id: toNullableText(typeof item.session_id === "string" ? item.session_id : null),
    visitor_id: toNullableText(typeof item.visitor_id === "string" ? item.visitor_id : null),
    user_message: typeof item.user_message === "string" ? item.user_message : "",
    effective_message: toNullableText(
      typeof item.effective_message === "string" ? item.effective_message : null
    ),
    ai_response: typeof item.ai_response === "string" ? item.ai_response : "",
    response_branch: toNullableText(
      typeof item.response_branch === "string" ? item.response_branch : null
    ),
    model_used: toNullableText(typeof item.model_used === "string" ? item.model_used : null),
    page_url: toNullableText(typeof item.page_url === "string" ? item.page_url : null),
    user_agent: toNullableText(typeof item.user_agent === "string" ? item.user_agent : null),
    ip_address: toNullableText(typeof item.ip_address === "string" ? item.ip_address : null),
    country_code: toNullableText(
      typeof item.country_code === "string" ? item.country_code : null
    ),
    country_name: toNullableText(
      typeof item.country_name === "string" ? item.country_name : null
    ),
    region: toNullableText(typeof item.region === "string" ? item.region : null),
    city: toNullableText(typeof item.city === "string" ? item.city : null),
    time_zone: toNullableText(typeof item.time_zone === "string" ? item.time_zone : null),
    created_at: typeof item.created_at === "string" ? item.created_at : "",
  } satisfies ChatLogRecord;
}

function buildDynamoDbChatLogScanInput(filters: ChatLogFilters = {}) {
  const filterExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, string> = {};

  const visitorId = toNullableText(filters.visitorId);
  const sessionId = toNullableText(filters.sessionId);
  const responseBranch = toNullableText(filters.responseBranch);
  const dateFrom = toIsoDateTimeStart(filters.dateFrom);
  const dateTo = toIsoDateTimeEnd(filters.dateTo);
  const searchText = toNullableText(filters.searchText);

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

  if (responseBranch) {
    filterExpressions.push("#response_branch = :responseBranch");
    expressionAttributeNames["#response_branch"] = "response_branch";
    expressionAttributeValues[":responseBranch"] = responseBranch;
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

  if (searchText) {
    filterExpressions.push(`(
      contains(#user_message, :searchText) OR
      contains(#ai_response, :searchText) OR
      contains(#visitor_id, :searchText) OR
      contains(#session_id, :searchText)
    )`);
    expressionAttributeNames["#user_message"] = "user_message";
    expressionAttributeNames["#ai_response"] = "ai_response";
    expressionAttributeNames["#visitor_id"] = "visitor_id";
    expressionAttributeNames["#session_id"] = "session_id";
    expressionAttributeValues[":searchText"] = searchText;
  }

  const scanInput: ScanCommandInput = {
    TableName: getLoggingConfig().chatLogsTableName,
  };

  if (filterExpressions.length > 0) {
    scanInput.FilterExpression = filterExpressions.join(" AND ");
    scanInput.ExpressionAttributeNames = expressionAttributeNames;
    scanInput.ExpressionAttributeValues = expressionAttributeValues;
  }

  return scanInput;
}

async function getSqliteChatLogs(filters: ChatLogFilters = {}) {
  const database = getSqliteDatabase();
  const { whereSql, parameters } = buildSqliteQueryParts(filters);
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

  const rows = database.prepare(query).all({
    ...parameters,
    limit: normalizeLimit(filters.limit),
    offset: normalizeOffset(filters.offset),
  }) as Record<string, unknown>[];

  return rows.map(normalizeSqliteChatLogRecord);
}

async function getSqliteChatLogsCount(filters: ChatLogFilters = {}) {
  const database = getSqliteDatabase();
  const { whereSql, parameters } = buildSqliteQueryParts(filters);
  const row = database
    .prepare(
      `
        SELECT COUNT(*) as total
        FROM chat_logs
        ${whereSql}
      `
    )
    .get(parameters) as { total?: number } | undefined;

  return row?.total ?? 0;
}

async function getDynamoDbMatchingChatLogs(filters: ChatLogFilters = {}) {
  try {
    const records = await scanAllItems<Record<string, unknown>>(buildDynamoDbChatLogScanInput(filters));
    return records.map(normalizeDynamoDbChatLogRecord).sort(sortChatLogsDescending);
  } catch (error) {
    throw toLoggingStorageError(error, "Unable to read chat logs from DynamoDB.");
  }
}

export async function logChatEvent(event: ChatLogEvent) {
  if (isSqliteLoggingBackend()) {
    try {
      getSqliteInsertStatement().run({
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

    return;
  }

  try {
    const { chatLogsTableName } = getLoggingConfig();
    await putItem(chatLogsTableName, {
      id: createLogId(),
      session_id: toNullableText(event.sessionId),
      visitor_id: toNullableText(event.visitorId),
      user_message: event.userMessage,
      effective_message: toNullableText(event.effectiveMessage),
      ai_response: event.aiResponse,
      response_branch: toNullableText(event.responseBranch),
      model_used: toNullableText(event.modelUsed),
      page_url: toNullableText(event.pageUrl),
      user_agent: toNullableText(event.userAgent),
      ip_address: toNullableText(event.ipAddress),
      country_code: toNullableText(event.countryCode),
      country_name: toNullableText(event.countryName),
      region: toNullableText(event.region),
      city: toNullableText(event.city),
      time_zone: toNullableText(event.timeZone),
      created_at: createTimestamp(),
    });
  } catch (error) {
    console.error(toLoggingStorageError(error, "Chat log write failed:").message);
  }
}

export async function getChatLogs(filters: ChatLogFilters = {}) {
  if (getLoggingBackend() === "sqlite") {
    return getSqliteChatLogs(filters);
  }

  const records = await getDynamoDbMatchingChatLogs(filters);
  const offset = normalizeOffset(filters.offset);
  const limit = normalizeLimit(filters.limit);
  return records.slice(offset, offset + limit);
}

export async function getChatLogsCount(filters: ChatLogFilters = {}) {
  if (getLoggingBackend() === "sqlite") {
    return getSqliteChatLogsCount(filters);
  }

  const records = await getDynamoDbMatchingChatLogs(filters);
  return records.length;
}
