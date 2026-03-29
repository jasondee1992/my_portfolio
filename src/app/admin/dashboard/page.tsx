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

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const chatPage = getSingleValue(resolvedSearchParams.page);
  const sitePage = getSingleValue(resolvedSearchParams.visit_page);

  if (sitePage.trim()) {
    redirect(
      buildHref("/admin/site-visits", {
        page: sitePage,
      })
    );
  }

  redirect(
    buildHref("/admin/chat-logs", {
      page: chatPage,
    })
  );
}
