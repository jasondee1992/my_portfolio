import "server-only";
import { redirect } from "next/navigation";

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

export default async function AdminSiteVisitsRedirectPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = new URLSearchParams();
  const mappings: Record<string, string> = {
    visitor_id: "visit_visitor_id",
    session_id: "visit_session_id",
    page_url: "visit_page_url",
    date_from: "visit_date_from",
    date_to: "visit_date_to",
    limit: "visit_limit",
  };

  for (const [fromKey, toKey] of Object.entries(mappings)) {
    const normalizedValue = getSingleValue(resolvedSearchParams[fromKey]);

    if (normalizedValue.trim()) {
      search.set(toKey, normalizedValue);
    }
  }

  redirect(search.toString() ? `/admin/dashboard?${search.toString()}` : "/admin/dashboard");
}
