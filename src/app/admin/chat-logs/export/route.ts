import { getChatLogs } from "@/lib/chatbot/chatLogging";
import { createAdminLoginRedirect, isAdminAuthenticated } from "@/lib/adminAuth";
import type { ChatLogRecord } from "@/lib/chatbot/chatLogging";

export const dynamic = "force-dynamic";

function toNullableSearchParam(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseLimit(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 50;
  }

  return parsed;
}

function parsePage(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function escapeCsvCell(value: string | null | undefined) {
  const normalized = value ?? "";
  return `"${normalized.replace(/"/g, '""')}"`;
}

function toCsv(rows: ChatLogRecord[]) {
  const headers = [
    "created_at",
    "session_id",
    "visitor_id",
    "user_message",
    "effective_message",
    "ai_response",
    "response_branch",
    "model_used",
    "page_url",
    "user_agent",
    "ip_address",
    "country_code",
    "country_name",
    "region",
    "city",
    "time_zone",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.created_at,
        row.session_id,
        row.visitor_id,
        row.user_message,
        row.effective_message,
        row.ai_response,
        row.response_branch,
        row.model_used,
        row.page_url,
        row.user_agent,
        row.ip_address,
        row.country_code,
        row.country_name,
        row.region,
        row.city,
        row.time_zone,
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

  const { searchParams } = new URL(request.url);
  const visitorId = toNullableSearchParam(searchParams.get("visitor_id"));
  const sessionId = toNullableSearchParam(searchParams.get("session_id"));
  const responseBranch = toNullableSearchParam(searchParams.get("response_branch"));
  const dateFrom = toNullableSearchParam(searchParams.get("date_from"));
  const dateTo = toNullableSearchParam(searchParams.get("date_to"));
  const searchText = toNullableSearchParam(searchParams.get("search"));
  const limit = parseLimit(searchParams.get("limit"));
  const page = parsePage(searchParams.get("page"));
  const format = toNullableSearchParam(searchParams.get("format"))?.toLowerCase() ?? "csv";
  try {
    const logs = await getChatLogs({
      visitorId,
      sessionId,
      responseBranch,
      dateFrom,
      dateTo,
      searchText,
      limit,
      offset: (page - 1) * limit,
    });

    if (format === "json") {
      return new Response(JSON.stringify(logs, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="chat-logs.json"',
          "Cache-Control": "no-store",
        },
      });
    }

    const csv = toCsv(logs);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="chat-logs.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export chat logs.";
    return new Response(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
