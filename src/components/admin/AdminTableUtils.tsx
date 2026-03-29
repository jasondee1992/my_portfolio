type SearchParamsValue = string | string[] | undefined;

export type AdminSearchParamsPageProps = {
  searchParams?: Promise<Record<string, SearchParamsValue>>;
};

export const PHILIPPINE_TIME_ZONE = "Asia/Manila";
export const ADMIN_TABLE_PAGE_SIZE = 8;

export function getSingleValue(value: SearchParamsValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function parsePage(value: string) {
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

export function formatPhilippineDateTime(value: string) {
  return formatDateTime(value, PHILIPPINE_TIME_ZONE);
}

export function formatLocation(
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

export function formatSiteVisitLocation({
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

export function buildHref(basePath: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value.trim()) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function renderPaginationControls({
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
