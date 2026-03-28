import "server-only";
import { requireAdminPageAuth } from "@/lib/adminAuth";
import { getChatLogs, getChatLogsCount } from "@/lib/chatbot/chatLogging";
import { getSiteVisits, getSiteVisitsCount } from "@/lib/siteVisitLogging";

export const dynamic = "force-dynamic";
const PHILIPPINE_TIME_ZONE = "Asia/Manila";
const ADMIN_TABLE_PAGE_SIZE = 8;
const CHAT_LOCATION_HELP_TEXT =
  "Chat log location remains approximate and IP-based, so mobile data, VPNs, and carrier gateways can resolve to a nearby city.";
const SITE_LOCATION_HELP_TEXT =
  "Site visit location is based on the best available stored data and may still be approximate on mobile data, VPNs, and carrier gateways.";

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

function parsePage(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseStoredUtcDateTime(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return new Date(Number.NaN);
  }

  if (/[zZ]$/.test(normalizedValue) || /[+-]\d{2}:\d{2}$/.test(normalizedValue)) {
    return new Date(normalizedValue);
  }

  return new Date(`${normalizedValue.replace(" ", "T")}Z`);
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

function formatLegacyCoordinates(
  latitude: number | null,
  longitude: number | null,
  locationAccuracyMeters: number | null
) {
  if (latitude === null || longitude === null) {
    return null;
  }

  const coordinates = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  if (locationAccuracyMeters === null) {
    return coordinates;
  }

  return `${coordinates} (+/- ${Math.round(locationAccuracyMeters)}m)`;
}

function formatSiteVisitLocation({
  countryName,
  region,
  city,
  latitude,
  longitude,
  locationAccuracyMeters,
}: {
  countryName: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMeters: number | null;
}) {
  if (latitude !== null && longitude !== null) {
    return formatLegacyCoordinates(latitude, longitude, locationAccuracyMeters) ?? "n/a";
  }

  return formatLocation(countryName, region, city);
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

function buildSectionHref(basePath: string, params: Record<string, string>, sectionId: string) {
  return `${buildHref(basePath, params)}#${sectionId}`;
}

function buildExportHref(format: "csv" | "json", params: Record<string, string>) {
  return buildHref("/admin/chat-logs/export", {
    ...params,
    format,
  });
}

function renderPaginationControls({
  currentPage,
  totalPages,
  hrefFactory,
}: {
  currentPage: number;
  totalPages: number;
  hrefFactory: (page: number) => string;
}) {
  const previousPage = Math.max(currentPage - 1, 1);
  const nextPage = Math.min(currentPage + 1, totalPages);
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;
  const navButtonClass =
    "inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/85 transition hover:border-white/18 hover:bg-white/[0.07]";
  const disabledClass = "pointer-events-none opacity-40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={hrefFactory(previousPage)}
        aria-disabled={isPreviousDisabled}
        className={`${navButtonClass} ${isPreviousDisabled ? disabledClass : ""}`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          ←
        </span>
      </a>

      <div className="inline-flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <span className="font-medium text-white/92">{currentPage}</span>
        <span className="text-white/28">/</span>
        <span>{totalPages}</span>
      </div>

      <a
        href={hrefFactory(nextPage)}
        aria-disabled={isNextDisabled}
        className={`${navButtonClass} ${isNextDisabled ? disabledClass : ""}`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          →
        </span>
      </a>
    </div>
  );
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  await requireAdminPageAuth("/admin/dashboard");

  const resolvedSearchParams = (await searchParams) ?? {};

  const chatLimit = ADMIN_TABLE_PAGE_SIZE;
  const requestedChatPage = parsePage(getSingleValue(resolvedSearchParams.page));

  const siteLimit = ADMIN_TABLE_PAGE_SIZE;
  const requestedSitePage = parsePage(getSingleValue(resolvedSearchParams.visit_page));

  const chatExportFilterParams = {
    limit: String(chatLimit),
    page: String(requestedChatPage),
  };

  const chatFilters = {};
  const siteFilters = {};

  let readError: string | null = null;
  let totalMatchedChatRows = 0;
  let chatLogs = await Promise.resolve([] as Awaited<ReturnType<typeof getChatLogs>>);
  let siteVisits = await Promise.resolve([] as Awaited<ReturnType<typeof getSiteVisits>>);
  let chatPage = 1;
  let totalChatPages = 1;
  let totalMatchedSiteRows = 0;
  let sitePage = 1;
  let totalSitePages = 1;

  try {
    totalMatchedChatRows = await getChatLogsCount(chatFilters);
    totalChatPages = Math.max(1, Math.ceil(totalMatchedChatRows / chatLimit));
    chatPage = Math.min(requestedChatPage, totalChatPages);
    chatLogs = await getChatLogs({
      ...chatFilters,
      limit: chatLimit,
      offset: (chatPage - 1) * chatLimit,
    });
    totalMatchedSiteRows = await getSiteVisitsCount(siteFilters);
    totalSitePages = Math.max(1, Math.ceil(totalMatchedSiteRows / siteLimit));
    sitePage = Math.min(requestedSitePage, totalSitePages);
    siteVisits = await getSiteVisits({
      ...siteFilters,
      limit: siteLimit,
      offset: (sitePage - 1) * siteLimit,
    });
  } catch (error) {
    readError = error instanceof Error ? error.message : "Unable to read log data.";
  }

  const siteQueryParams = { visit_page: String(sitePage) };

  const chatPageParams = {
    page: String(chatPage),
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

        {readError ? (
          <div className="admin-grid-section pb-0">
            <div className="admin-grid-empty">{readError}</div>
          </div>
        ) : null}

        <section id="chat-logs" className="admin-grid-section">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium text-white/95">Chat Logs</h2>
              <p className="mt-2 text-sm text-white/55">
                Showing {chatLogs.length} of {totalMatchedChatRows} matched row
                {totalMatchedChatRows === 1 ? "" : "s"}. Newest first. Displayed in Philippine
                time. {CHAT_LOCATION_HELP_TEXT}
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

                {renderPaginationControls({
                  currentPage: chatPage,
                  totalPages: totalChatPages,
                  hrefFactory: (page) =>
                    buildSectionHref(
                      "/admin/dashboard",
                      {
                        ...siteQueryParams,
                        ...chatPageParams,
                        page: String(page),
                      },
                      "chat-logs"
                    ),
                })}
              </div>
            </>
          )}
        </section>

        <div className="my-6 h-px w-full bg-white/8" />

        <section id="site-visits" className="admin-grid-section">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-white/95">Site Visits</h2>
            <p className="mt-2 text-sm text-white/55">
              Displayed in Philippine time. {SITE_LOCATION_HELP_TEXT}
            </p>
          </div>

          {siteVisits.length === 0 ? (
            <div className="admin-grid-empty">
              No site visits matched the current filters.
            </div>
          ) : (
            <>
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
                      <th className="px-4 py-3 font-medium">Approx. Location (IP)</th>
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
                          {formatSiteVisitLocation({
                            countryName: visit.country_name,
                            region: visit.region,
                            city: visit.city,
                            latitude: visit.latitude,
                            longitude: visit.longitude,
                            locationAccuracyMeters: visit.location_accuracy_meters,
                          })}
                        </td>
                        <td className="px-4 py-3 min-w-44 break-all text-white/65">
                          {visit.time_zone ?? "n/a"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/55">
                  Page {sitePage} of {totalSitePages}
                </div>

                {renderPaginationControls({
                  currentPage: sitePage,
                  totalPages: totalSitePages,
                  hrefFactory: (page) =>
                    buildSectionHref(
                      "/admin/dashboard",
                      {
                        ...chatPageParams,
                        ...siteQueryParams,
                        visit_page: String(page),
                      },
                      "site-visits"
                    ),
                })}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
