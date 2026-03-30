import "server-only";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminTableScroller from "@/components/admin/AdminTableScroller";
import {
  ADMIN_TABLE_PAGE_SIZE,
  buildHref,
  formatLocation,
  formatPhilippineDateTime,
  getSingleValue,
  parsePage,
  renderPaginationControls,
  type AdminSearchParamsPageProps,
} from "@/components/admin/AdminTableUtils";
import { requireAdminPageAuth } from "@/lib/adminAuth";
import { getChatLogs, getChatLogsCount } from "@/lib/chatbot/chatLogging";

export const dynamic = "force-dynamic";

const CHAT_LOCATION_HELP_TEXT =
  "Chat log location remains approximate and IP-based, so mobile data, VPNs, and carrier gateways can resolve to a nearby city.";

function buildExportHref(format: "csv" | "json", page: number) {
  return buildHref("/admin/chat-logs/export", {
    format,
    limit: String(ADMIN_TABLE_PAGE_SIZE),
    page: String(page),
  });
}

export default async function AdminChatLogsPage({ searchParams }: AdminSearchParamsPageProps) {
  await requireAdminPageAuth("/admin/chat-logs");

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedPage = parsePage(getSingleValue(resolvedSearchParams.page));

  let readError: string | null = null;
  let totalMatchedChatRows = 0;
  let chatLogs = await Promise.resolve([] as Awaited<ReturnType<typeof getChatLogs>>);
  let chatPage = 1;
  let totalChatPages = 1;

  try {
    totalMatchedChatRows = await getChatLogsCount({});
    totalChatPages = Math.max(1, Math.ceil(totalMatchedChatRows / ADMIN_TABLE_PAGE_SIZE));
    chatPage = Math.min(requestedPage, totalChatPages);
    chatLogs = await getChatLogs({
      limit: ADMIN_TABLE_PAGE_SIZE,
      offset: (chatPage - 1) * ADMIN_TABLE_PAGE_SIZE,
    });
  } catch (error) {
    readError = error instanceof Error ? error.message : "Unable to read chat log data.";
  }

  return (
    <AdminPageShell activeView="chat-logs">
      {readError ? (
        <div className="admin-grid-section pb-0">
          <div className="admin-grid-empty">{readError}</div>
        </div>
      ) : (
        <section className="admin-grid-section">
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
                href={buildExportHref("csv", chatPage)}
                className="admin-grid-button admin-grid-button-secondary"
              >
                Export CSV
              </a>
              <a
                href={buildExportHref("json", chatPage)}
                className="admin-grid-button admin-grid-button-secondary"
              >
                Export JSON
              </a>
            </div>
          </div>

          {chatLogs.length === 0 ? (
            <div className="admin-grid-empty">No chat logs found.</div>
          ) : (
            <>
              <AdminTableScroller>
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
              </AdminTableScroller>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/55">
                  Page {chatPage} of {totalChatPages}
                </div>

                {renderPaginationControls({
                  currentPage: chatPage,
                  totalPages: totalChatPages,
                  hrefFactory: (page) => buildHref("/admin/chat-logs", { page: String(page) }),
                })}
              </div>
            </>
          )}
        </section>
      )}
    </AdminPageShell>
  );
}
