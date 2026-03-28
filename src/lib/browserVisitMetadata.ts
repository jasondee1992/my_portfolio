export type BrowserVisitMetadata = {
  sessionId: string | null;
  visitorId: string | null;
  pageUrl: string | null;
  userAgent: string | null;
  referrer: string | null;
  timeZone: string | null;
};

export type BrowserGeoDebugHeaders = Record<string, string>;

const VISITOR_ID_STORAGE_KEY = "portfolio-chat-visitor-id";
const SESSION_ID_STORAGE_KEY = "portfolio-chat-session-id";
const VISITED_PAGE_SET_STORAGE_KEY = "portfolio-visited-pages";
const VISIT_DEDUP_WINDOW_MS = 30 * 1000;

function createClientIdentifier(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toPublicEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getOrCreateStoredIdentifier(storage: Storage, key: string, prefix: string) {
  const existingValue = storage.getItem(key)?.trim();

  if (existingValue) {
    return existingValue;
  }

  const nextValue = createClientIdentifier(prefix);
  storage.setItem(key, nextValue);
  return nextValue;
}

export function getBrowserVisitMetadata(): BrowserVisitMetadata {
  if (typeof window === "undefined") {
    return {
      sessionId: null,
      visitorId: null,
      pageUrl: null,
      userAgent: null,
      referrer: null,
      timeZone: null,
    };
  }

  let visitorId: string | null = null;
  let sessionId: string | null = null;

  try {
    visitorId = getOrCreateStoredIdentifier(
      window.localStorage,
      VISITOR_ID_STORAGE_KEY,
      "visitor"
    );
  } catch {
    visitorId = null;
  }

  try {
    sessionId = getOrCreateStoredIdentifier(
      window.sessionStorage,
      SESSION_ID_STORAGE_KEY,
      "session"
    );
  } catch {
    sessionId = null;
  }

  return {
    sessionId,
    visitorId,
    pageUrl: window.location.href,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    timeZone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || null
        : null,
  };
}

export function getBrowserGeoDebugHeaders(): BrowserGeoDebugHeaders {
  if (process.env.NODE_ENV !== "development") {
    return {};
  }

  const countryCode = toPublicEnvValue(process.env.NEXT_PUBLIC_DEV_GEO_COUNTRY_CODE);
  const countryName = toPublicEnvValue(process.env.NEXT_PUBLIC_DEV_GEO_COUNTRY_NAME);
  const region = toPublicEnvValue(process.env.NEXT_PUBLIC_DEV_GEO_REGION);
  const city = toPublicEnvValue(process.env.NEXT_PUBLIC_DEV_GEO_CITY);
  const timeZone = toPublicEnvValue(process.env.NEXT_PUBLIC_DEV_GEO_TIME_ZONE);

  return {
    ...(countryCode ? { "x-dev-viewer-country": countryCode } : {}),
    ...(countryName ? { "x-dev-viewer-country-name": countryName } : {}),
    ...(region ? { "x-dev-viewer-region": region } : {}),
    ...(city ? { "x-dev-viewer-city": city } : {}),
    ...(timeZone ? { "x-dev-viewer-time-zone": timeZone } : {}),
  };
}

export function markPageVisitAsSeen(pageUrl: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const visitedPages = window.sessionStorage.getItem(VISITED_PAGE_SET_STORAGE_KEY);
    const parsedPages = visitedPages ? JSON.parse(visitedPages) : {};
    const pageVisitMap =
      parsedPages && typeof parsedPages === "object" && !Array.isArray(parsedPages)
        ? (parsedPages as Record<string, number>)
        : {};
    const lastSeenAt = typeof pageVisitMap[pageUrl] === "number" ? pageVisitMap[pageUrl] : 0;

    if (Date.now() - lastSeenAt < VISIT_DEDUP_WINDOW_MS) {
      return false;
    }

    pageVisitMap[pageUrl] = Date.now();
    window.sessionStorage.setItem(VISITED_PAGE_SET_STORAGE_KEY, JSON.stringify(pageVisitMap));
    return true;
  } catch {
    return true;
  }
}
