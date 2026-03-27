import "server-only";
import { notFound, redirect } from "next/navigation";

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

export default async function AdminChatLogsRedirectPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    const normalizedValue = getSingleValue(value);

    if (normalizedValue.trim()) {
      search.set(key, normalizedValue);
    }
  }

  const queryString = search.toString();
  redirect(queryString ? `/admin/dashboard?${queryString}` : "/admin/dashboard");
}
