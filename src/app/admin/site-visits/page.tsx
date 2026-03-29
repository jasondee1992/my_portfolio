import "server-only";
import AdminPageShell from "@/components/admin/AdminPageShell";
import {
  ADMIN_TABLE_PAGE_SIZE,
  buildHref,
  formatPhilippineDateTime,
  formatSiteVisitLocation,
  getSingleValue,
  parsePage,
  renderPaginationControls,
  type AdminSearchParamsPageProps,
} from "@/components/admin/AdminTableUtils";
import { requireAdminPageAuth } from "@/lib/adminAuth";
import { getSiteVisits, getSiteVisitsCount } from "@/lib/siteVisitLogging";

export const dynamic = "force-dynamic";

const SITE_LOCATION_HELP_TEXT =
  "Site visit location is based on the best available stored data and may still be approximate on mobile data, VPNs, and carrier gateways.";

export default async function AdminSiteVisitsPage({ searchParams }: AdminSearchParamsPageProps) {
  await requireAdminPageAuth("/admin/site-visits");

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedPage = parsePage(getSingleValue(resolvedSearchParams.page));

  let readError: string | null = null;
  let totalMatchedSiteRows = 0;
  let siteVisits = await Promise.resolve([] as Awaited<ReturnType<typeof getSiteVisits>>);
  let sitePage = 1;
  let totalSitePages = 1;

  try {
    totalMatchedSiteRows = await getSiteVisitsCount({});
    totalSitePages = Math.max(1, Math.ceil(totalMatchedSiteRows / ADMIN_TABLE_PAGE_SIZE));
    sitePage = Math.min(requestedPage, totalSitePages);
    siteVisits = await getSiteVisits({
      limit: ADMIN_TABLE_PAGE_SIZE,
      offset: (sitePage - 1) * ADMIN_TABLE_PAGE_SIZE,
    });
  } catch (error) {
    readError = error instanceof Error ? error.message : "Unable to read site visit data.";
  }

  return (
    <AdminPageShell activeView="site-visits">
      {readError ? (
        <div className="admin-grid-section pb-0">
          <div className="admin-grid-empty">{readError}</div>
        </div>
      ) : (
        <section className="admin-grid-section">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-white/95">Site Visits</h2>
            <p className="mt-2 text-sm text-white/55">
              Showing {siteVisits.length} of {totalMatchedSiteRows} rows. Displayed in Philippine
              time. {SITE_LOCATION_HELP_TEXT}
            </p>
          </div>

          {siteVisits.length === 0 ? (
            <div className="admin-grid-empty">No site visits found.</div>
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
                  hrefFactory: (page) => buildHref("/admin/site-visits", { page: String(page) }),
                })}
              </div>
            </>
          )}
        </section>
      )}
    </AdminPageShell>
  );
}
