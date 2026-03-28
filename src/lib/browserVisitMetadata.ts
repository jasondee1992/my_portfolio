export type BrowserVisitMetadata = {
  sessionId: string | null;
  visitorId: string | null;
  pageUrl: string | null;
  userAgent: string | null;
  referrer: string | null;
  timeZone: string | null;
  locationConsentStatus: LocationConsentStatus;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMeters: number | null;
};

export type BrowserGeoDebugHeaders = Record<string, string>;
export type LocationConsentStatus =
  | "unknown"
  | "accepted"
  | "denied"
  | "skipped"
  | "unsupported";

type StoredPreciseLocation = {
  latitude: number;
  longitude: number;
  locationAccuracyMeters: number | null;
  capturedAt: string;
};

const VISITOR_ID_STORAGE_KEY = "portfolio-chat-visitor-id";
const SESSION_ID_STORAGE_KEY = "portfolio-chat-session-id";
const VISITED_PAGE_SET_STORAGE_KEY = "portfolio-visited-pages";
const LOCATION_CONSENT_STORAGE_KEY = "portfolio-location-consent-status";
const PRECISE_LOCATION_STORAGE_KEY = "portfolio-precise-location";
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

function isLocationConsentStatus(value: unknown): value is LocationConsentStatus {
  return (
    value === "unknown" ||
    value === "accepted" ||
    value === "denied" ||
    value === "skipped" ||
    value === "unsupported"
  );
}

function toFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getStoredPreciseLocation(): StoredPreciseLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(PRECISE_LOCATION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StoredPreciseLocation>;
    const latitude = toFiniteNumber(parsedValue.latitude);
    const longitude = toFiniteNumber(parsedValue.longitude);
    const locationAccuracyMeters = toFiniteNumber(parsedValue.locationAccuracyMeters);
    const capturedAt =
      typeof parsedValue.capturedAt === "string" && parsedValue.capturedAt.trim()
        ? parsedValue.capturedAt
        : null;

    if (latitude === null || longitude === null || !capturedAt) {
      return null;
    }

    return {
      latitude,
      longitude,
      locationAccuracyMeters,
      capturedAt,
    };
  } catch {
    return null;
  }
}

function setStoredPreciseLocation(value: StoredPreciseLocation | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!value) {
      window.localStorage.removeItem(PRECISE_LOCATION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(PRECISE_LOCATION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep analytics best-effort only.
  }
}

export function isPreciseLocationSupported() {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function getStoredLocationConsentStatus(): LocationConsentStatus {
  if (!isPreciseLocationSupported()) {
    return "unsupported";
  }

  if (typeof window === "undefined") {
    return "unknown";
  }

  try {
    const rawValue = window.localStorage.getItem(LOCATION_CONSENT_STORAGE_KEY);
    return isLocationConsentStatus(rawValue) ? rawValue : "unknown";
  } catch {
    return "unknown";
  }
}

function setStoredLocationConsentStatus(value: LocationConsentStatus) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCATION_CONSENT_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures and keep analytics best-effort only.
  }
}

export function markPreciseLocationSkipped() {
  if (!isPreciseLocationSupported()) {
    return "unsupported" as const;
  }

  setStoredLocationConsentStatus("skipped");
  return "skipped" as const;
}

export async function requestPreciseLocationShare() {
  if (!isPreciseLocationSupported()) {
    setStoredPreciseLocation(null);
    return {
      status: "unsupported" as const,
      latitude: null,
      longitude: null,
      locationAccuracyMeters: null,
    };
  }

  return await new Promise<{
    status: LocationConsentStatus;
    latitude: number | null;
    longitude: number | null;
    locationAccuracyMeters: number | null;
  }>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextValue: StoredPreciseLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationAccuracyMeters: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
          capturedAt: new Date().toISOString(),
        };

        setStoredLocationConsentStatus("accepted");
        setStoredPreciseLocation(nextValue);

        resolve({
          status: "accepted",
          latitude: nextValue.latitude,
          longitude: nextValue.longitude,
          locationAccuracyMeters: nextValue.locationAccuracyMeters,
        });
      },
      (error) => {
        const nextStatus: LocationConsentStatus =
          error.code === error.PERMISSION_DENIED ? "denied" : "skipped";

        setStoredLocationConsentStatus(nextStatus);
        setStoredPreciseLocation(null);

        resolve({
          status: nextStatus,
          latitude: null,
          longitude: null,
          locationAccuracyMeters: null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  });
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
      locationConsentStatus: "unknown",
      latitude: null,
      longitude: null,
      locationAccuracyMeters: null,
    };
  }

  let visitorId: string | null = null;
  let sessionId: string | null = null;
  const preciseLocation = getStoredPreciseLocation();
  const locationConsentStatus = getStoredLocationConsentStatus();

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
    locationConsentStatus,
    latitude: preciseLocation?.latitude ?? null,
    longitude: preciseLocation?.longitude ?? null,
    locationAccuracyMeters: preciseLocation?.locationAccuracyMeters ?? null,
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
