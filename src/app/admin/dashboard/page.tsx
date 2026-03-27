import "server-only";
import { notFound } from "next/navigation";
import { requireAdminPageAuth } from "@/lib/adminAuth";
import { getChatLogs, getChatLogsCount } from "@/lib/chatbot/chatLogging";
import { getSiteVisits } from "@/lib/siteVisitLogging";

export const dynamic = "force-dynamic";
const PHILIPPINE_TIME_ZONE = "Asia/Manila";

type SearchParamsValue = string | string[] | undefined;
type PageProps = {
  searchParams?: Promise<Record<string, SearchParamsValue>>;
};

function getSingleValue(value: SearchParamsValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseLimit(value: string) {
  const parsed = Number(value);
  const allowedLimits = new Set([25, 50, 100, 200]);

  if (!allowedLimits.has(parsed)) {
    return 50;
  }

  return parsed;
}

function parsePage(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseStoredUtcDateTime(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`);
}

function formatDateTime(value: string, timeZone?: string | null) {
  const parsed = parseStoredUtcDateTime(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(parsed);
}

function formatPhilippineDateTime(value: string) {
  return formatDateTime(value, PHILIPPINE_TIME_ZONE);
}

function formatLocation(
  countryName: string | null,
  region: string | null,
  city: string | null
) {
  const parts = [city, region, countryName].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "n/a";
}

function buildHref(basePath: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value.trim()) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function buildExportHref(format: "csv" | "json", params: Record<string, string>) {
  return buildHref("/admin/chat-logs/export", {
    ...params,
    format,
  });
}

function renderHiddenParams(params: Record<string, string>) {
  return Object.entries(params)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />);
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  await requireAdminPageAuth("/admin/dashboard");

  const resolvedSearchParams = (await searchParams) ?? {};

  const chatVisitorId = getSingleValue(resolvedSearchParams.visitor_id);
  const chatSessionId = getSingleValue(resolvedSearchParams.session_id);
  const chatResponseBranch = getSingleValue(resolvedSearchParams.response_branch);
  const chatDateFrom = getSingleValue(resolvedSearchParams.date_from);
  const chatDateTo = getSingleValue(resolvedSearchParams.date_to);
  const chatSearchText = getSingleValue(resolvedSearchParams.search);
  const chatLimit = parseLimit(getSingleValue(resolvedSearchParams.limit));
  const requestedChatPage = parsePage(getSingleValue(resolvedSearchParams.page));

  const siteVisitorId = getSingleValue(resolvedSearchParams.visit_visitor_id);
  const siteSessionId = getSingleValue(resolvedSearchParams.visit_session_id);
  const sitePageUrl = getSingleValue(resolvedSearchParams.visit_page_url);
  const siteDateFrom = getSingleValue(resolvedSearchParams.visit_date_from);
  const siteDateTo = getSingleValue(resolvedSearchParams.visit_date_to);
  const siteLimit = parseLimit(getSingleValue(resolvedSearchParams.visit_limit));

  const chatExportFilterParams = {
    visitor_id: chatVisitorId,
    session_id: chatSessionId,
    response_branch: chatResponseBranch,
    date_from: chatDateFrom,
    date_to: chatDateTo,
    search: chatSearchText,
    limit: String(chatLimit),
    page: String(requestedChatPage),
  };

  const chatFilters = {
    visitorId: chatVisitorId,
    sessionId: chatSessionId,
    responseBranch: chatResponseBranch,
    dateFrom: chatDateFrom,
    dateTo: chatDateTo,
    searchText: chatSearchText,
  };

  const siteFilters = {
    visitorId: siteVisitorId,
    sessionId: siteSessionId,
    pageUrl: sitePageUrl,
    dateFrom: siteDateFrom,
    dateTo: siteDateTo,
  };

  const totalMatchedChatRows = getChatLogsCount(chatFilters);
  const totalChatPages = Math.max(1, Math.ceil(totalMatchedChatRows / chatLimit));
  const chatPage = Math.min(requestedChatPage, totalChatPages);
  const chatLogs = getChatLogs({
    ...chatFilters,
    limit: chatLimit,
    offset: (chatPage - 1) * chatLimit,
  });
  const siteVisits = getSiteVisits({
    ...siteFilters,
    limit: siteLimit,
  });

  const siteQueryParams = {
    visit_visitor_id: siteVisitorId,
    visit_session_id: siteSessionId,
    visit_page_url: sitePageUrl,
    visit_date_from: siteDateFrom,
    visit_date_to: siteDateTo,
    visit_limit: String(siteLimit),
  };

  const chatPageParams = {
    visitor_id: chatVisitorId,
    session_id: chatSessionId,
    response_branch: chatResponseBranch,
    date_from: chatDateFrom,
    date_to: chatDateTo,
    search: chatSearchText,
    limit: String(chatLimit),
  };

  return (
    <main className="min-h-screen w-full px-3 pb-8 pt-4 sm:px-4 lg:px-6">
      <section className="admin-grid-page">
        <div className="admin-grid-header">
          <div>
            <div className="admin-grid-kicker">Protected Admin</div>
            <h1 className="section-title mt-2 text-3xl font-normal md:text-4xl">Admin Dashboard</h1>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-grid-button admin-grid-button-secondary">
              Log Out
            </button>
          </form>
        </div>

        <section id="chat-logs" className="admin-grid-section">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium text-white/95">Chat Logs</h2>
              <p className="mt-2 text-sm text-white/55">
                Showing {chatLogs.length} of {totalMatchedChatRows} matched row
                {totalMatchedChatRows === 1 ? "" : "s"}. Newest first. Displayed in Philippine
                time.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={buildExportHref("csv", {
                  ...chatExportFilterParams,
                  page: String(chatPage),
                })}
                className="admin-grid-button admin-grid-button-secondary"
              >
                Export CSV
              </a>
              <a
                href={buildExportHref("json", {
                  ...chatExportFilterParams,
                  page: String(chatPage),
                })}
                className="admin-grid-button admin-grid-button-secondary"
              >
                Export JSON
              </a>
            </div>
          </div>

          <form method="get" className="admin-grid-toolbar grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {renderHiddenParams(siteQueryParams)}

            <label className="admin-grid-filter xl:col-span-2">
              <span className="admin-grid-filter-label">Search</span>
              <input
                type="text"
                name="search"
                defaultValue={chatSearchText}
                className="admin-grid-input"
                placeholder="Search user message, AI response, visitor ID, session ID"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Visitor ID</span>
              <input
                type="text"
                name="visitor_id"
                defaultValue={chatVisitorId}
                className="admin-grid-input"
                placeholder="visitor-..."
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Session ID</span>
              <input
                type="text"
                name="session_id"
                defaultValue={chatSessionId}
                className="admin-grid-input"
                placeholder="session-..."
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Response Branch</span>
              <input
                type="text"
                name="response_branch"
                defaultValue={chatResponseBranch}
                className="admin-grid-input"
                placeholder="openai_generated"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Date From</span>
              <input
                type="date"
                name="date_from"
                defaultValue={chatDateFrom}
                className="admin-grid-input"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Date To</span>
              <input
                type="date"
                name="date_to"
                defaultValue={chatDateTo}
                className="admin-grid-input"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Result Limit</span>
              <select
                name="limit"
                defaultValue={String(chatLimit)}
                className="admin-grid-input admin-grid-select"
              >
                {[25, 50, 100, 200].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 xl:col-span-5 flex flex-wrap gap-3">
              <button type="submit" className="admin-grid-button">
                Apply Chat Filters
              </button>
              <a
                href={buildHref("/admin/dashboard", siteQueryParams)}
                className="admin-grid-button admin-grid-button-secondary"
              >
                Clear Chat Filters
              </a>
            </div>
          </form>

          {chatLogs.length === 0 ? (
            <div className="admin-grid-empty">
              No chat logs matched the current filters.
            </div>
          ) : (
            <>
              <div className="admin-grid-table-wrap">
                <table className="admin-grid-table min-w-full text-left text-sm text-white/80">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Created At (PH)</th>
                      <th className="px-4 py-3 font-medium">Visitor ID</th>
                      <th className="px-4 py-3 font-medium">Session ID</th>
                      <th className="px-4 py-3 font-medium">User Message</th>
                      <th className="px-4 py-3 font-medium">Effective Message</th>
                      <th className="px-4 py-3 font-medium">AI Response</th>
                      <th className="px-4 py-3 font-medium">Response Branch</th>
                      <th className="px-4 py-3 font-medium">Model Used</th>
                      <th className="px-4 py-3 font-medium">Page URL</th>
                      <th className="px-4 py-3 font-medium">User Agent</th>
                      <th className="px-4 py-3 font-medium">IP Address</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Timezone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatLogs.map((log) => (
                      <tr key={log.id} className="align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-white/65">{log.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatPhilippineDateTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3 min-w-44 break-all text-white/65">
                          {log.visitor_id ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-44 break-all text-white/65">
                          {log.session_id ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-80 max-w-xl whitespace-pre-wrap leading-6">
                          {log.user_message}
                        </td>
                        <td className="px-4 py-3 min-w-80 max-w-xl whitespace-pre-wrap leading-6 text-white/70">
                          {log.effective_message ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-80 max-w-xl whitespace-pre-wrap leading-6 text-white/88">
                          {log.ai_response}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.response_branch ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white/65">
                          {log.model_used ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-56 break-all text-white/65">
                          {log.page_url ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-72 break-all text-white/65">
                          {log.user_agent ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-40 break-all text-white/65">
                          {log.ip_address ?? "n/a"}
                        </td>
                        <td className="px-4 py-3 min-w-56 break-all text-white/65">
                          {formatLocation(log.country_name, log.region, log.city)}
                        </td>
                        <td className="px-4 py-3 min-w-44 break-all text-white/65">
                          {log.time_zone ?? "n/a"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/55">
                  Page {chatPage} of {totalChatPages}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={buildHref("/admin/dashboard", {
                      ...siteQueryParams,
                      ...chatPageParams,
                      page: String(Math.max(chatPage - 1, 1)),
                    })}
                    aria-disabled={chatPage <= 1}
                    className={`admin-grid-button admin-grid-button-secondary ${
                      chatPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Previous
                  </a>
                  <a
                    href={buildHref("/admin/dashboard", {
                      ...siteQueryParams,
                      ...chatPageParams,
                      page: String(Math.min(chatPage + 1, totalChatPages)),
                    })}
                    aria-disabled={chatPage >= totalChatPages}
                    className={`admin-grid-button admin-grid-button-secondary ${
                      chatPage >= totalChatPages ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Next
                  </a>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="my-6 h-px w-full bg-white/8" />

        <section id="site-visits" className="admin-grid-section">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-white/95">Site Visits</h2>
            <p className="mt-2 text-sm text-white/55">
              Displayed in Philippine time.
            </p>
          </div>

          <form method="get" className="admin-grid-toolbar grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {renderHiddenParams(chatExportFilterParams)}

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Visitor ID</span>
              <input
                type="text"
                name="visit_visitor_id"
                defaultValue={siteVisitorId}
                className="admin-grid-input"
                placeholder="visitor-..."
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Session ID</span>
              <input
                type="text"
                name="visit_session_id"
                defaultValue={siteSessionId}
                className="admin-grid-input"
                placeholder="session-..."
              />
            </label>

            <label className="admin-grid-filter xl:col-span-2">
              <span className="admin-grid-filter-label">Page URL</span>
              <input
                type="text"
                name="visit_page_url"
                defaultValue={sitePageUrl}
                className="admin-grid-input"
                placeholder="/projects"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Date From</span>
              <input
                type="date"
                name="visit_date_from"
                defaultValue={siteDateFrom}
                className="admin-grid-input"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Date To</span>
              <input
                type="date"
                name="visit_date_to"
                defaultValue={siteDateTo}
                className="admin-grid-input"
              />
            </label>

            <label className="admin-grid-filter">
              <span className="admin-grid-filter-label">Result Limit</span>
              <select
                name="visit_limit"
                defaultValue={String(siteLimit)}
                className="admin-grid-input admin-grid-select"
              >
                {[25, 50, 100, 200].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 xl:col-span-6 flex flex-wrap gap-3">
              <button type="submit" className="admin-grid-button">
                Apply Visit Filters
              </button>
              <a
                href={buildHref("/admin/dashboard", chatExportFilterParams)}
                className="admin-grid-button admin-grid-button-secondary"
              >
                Clear Visit Filters
              </a>
            </div>
          </form>

          {siteVisits.length === 0 ? (
            <div className="admin-grid-empty">
              No site visits matched the current filters.
            </div>
          ) : (
            <div className="admin-grid-table-wrap">
              <table className="admin-grid-table min-w-full text-left text-sm text-white/80">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Visited At (PH)</th>
                    <th className="px-4 py-3 font-medium">Visitor ID</th>
                    <th className="px-4 py-3 font-medium">Session ID</th>
                    <th className="px-4 py-3 font-medium">Page URL</th>
                    <th className="px-4 py-3 font-medium">User Agent</th>
                    <th className="px-4 py-3 font-medium">IP Address</th>
                    <th className="px-4 py-3 font-medium">Referrer</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Timezone</th>
                  </tr>
                </thead>
                <tbody>
                  {siteVisits.map((visit) => (
                    <tr key={visit.id} className="align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-white/65">{visit.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatPhilippineDateTime(visit.visited_at)}
                      </td>
                      <td className="px-4 py-3 min-w-44 break-all text-white/65">
                        {visit.visitor_id ?? "n/a"}
                      </td>
                      <td className="px-4 py-3 min-w-44 break-all text-white/65">
                        {visit.session_id ?? "n/a"}
                      </td>
                      <td className="px-4 py-3 min-w-56 break-all">{visit.page_url}</td>
                      <td className="px-4 py-3 min-w-72 break-all text-white/65">
                        {visit.user_agent ?? "n/a"}
                      </td>
                      <td className="px-4 py-3 min-w-40 break-all text-white/65">
                        {visit.ip_address ?? "n/a"}
                      </td>
                      <td className="px-4 py-3 min-w-56 break-all text-white/65">
                        {visit.referrer ?? "n/a"}
                      </td>
                      <td className="px-4 py-3 min-w-56 break-all text-white/65">
                        {formatLocation(visit.country_name, visit.region, visit.city)}
                      </td>
                      <td className="px-4 py-3 min-w-44 break-all text-white/65">
                        {visit.time_zone ?? "n/a"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
