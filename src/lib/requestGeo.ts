import "server-only";

export type RequestGeoMetadata = {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  timeZone: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMeters: number | null;
  locationConsentStatus: string | null;
  locationSource: "browser_geolocation" | "ip_header" | "unknown";
};

type RequestGeoOptions = {
  requestedTimeZone?: unknown;
  locationConsentStatus?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  locationAccuracyMeters?: unknown;
};

const COUNTRY_HEADER_NAMES = [
  "cloudfront-viewer-country",
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-geo-country",
];

const COUNTRY_NAME_HEADER_NAMES = [
  "cloudfront-viewer-country-name",
  "x-country-name",
  "x-geo-country-name",
];

const REGION_HEADER_NAMES = [
  "cloudfront-viewer-country-region-name",
  "cloudfront-viewer-country-region",
  "x-vercel-ip-country-region",
  "cloudfront-viewer-country-region",
  "x-region-code",
  "x-geo-region",
];

const CITY_HEADER_NAMES = [
  "x-vercel-ip-city",
  "cloudfront-viewer-city",
  "x-city",
  "x-geo-city",
];

const TIMEZONE_HEADER_NAMES = [
  "cloudfront-viewer-time-zone",
  "x-vercel-ip-timezone",
  "x-time-zone",
  "x-geo-timezone",
];

const DEV_COUNTRY_HEADER_NAMES = ["x-dev-viewer-country"];
const DEV_COUNTRY_NAME_HEADER_NAMES = ["x-dev-viewer-country-name"];
const DEV_REGION_HEADER_NAMES = ["x-dev-viewer-region"];
const DEV_CITY_HEADER_NAMES = ["x-dev-viewer-city"];
const DEV_TIMEZONE_HEADER_NAMES = ["x-dev-viewer-time-zone"];

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getFirstHeaderValue(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = toNullableText(headers.get(name));

    if (value) {
      return value;
    }
  }

  return null;
}

function normalizeCountryCode(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

function normalizeFiniteNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function normalizeLatitude(value: unknown) {
  const normalized = normalizeFiniteNumber(value);

  if (normalized === null || normalized < -90 || normalized > 90) {
    return null;
  }

  return normalized;
}

function normalizeLongitude(value: unknown) {
  const normalized = normalizeFiniteNumber(value);

  if (normalized === null || normalized < -180 || normalized > 180) {
    return null;
  }

  return normalized;
}

function normalizeLocationAccuracyMeters(value: unknown) {
  const normalized = normalizeFiniteNumber(value);

  if (normalized === null || normalized < 0) {
    return null;
  }

  return normalized;
}

function normalizeLocationConsentStatus(value: unknown) {
  const normalized = toNullableText(value);

  if (!normalized) {
    return null;
  }

  return ["unknown", "accepted", "denied", "skipped", "unsupported"].includes(normalized)
    ? normalized
    : null;
}

function normalizeTimeZone(value: unknown) {
  const trimmed = toNullableText(value);

  if (!trimmed) {
    return null;
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: trimmed,
    }).format(new Date());

    return trimmed;
  } catch {
    return null;
  }
}

function getCountryName(countryCode: string | null) {
  if (!countryCode) {
    return null;
  }

  try {
    return (
      new Intl.DisplayNames(["en"], {
        type: "region",
      }).of(countryCode) ?? null
    );
  } catch {
    return null;
  }
}

export function getRequestGeoMetadata(headers: Headers, options: RequestGeoOptions = {}): RequestGeoMetadata {
  const normalizedLatitude = normalizeLatitude(options.latitude);
  const normalizedLongitude = normalizeLongitude(options.longitude);
  const normalizedLocationAccuracyMeters = normalizeLocationAccuracyMeters(
    options.locationAccuracyMeters
  );
  const normalizedLocationConsentStatus = normalizeLocationConsentStatus(
    options.locationConsentStatus
  );
  const countryCode =
    normalizeCountryCode(getFirstHeaderValue(headers, COUNTRY_HEADER_NAMES)) ??
    (process.env.NODE_ENV === "development"
      ? normalizeCountryCode(getFirstHeaderValue(headers, DEV_COUNTRY_HEADER_NAMES))
      : null);
  const countryName =
    toNullableText(getFirstHeaderValue(headers, COUNTRY_NAME_HEADER_NAMES)) ??
    (process.env.NODE_ENV === "development"
      ? toNullableText(getFirstHeaderValue(headers, DEV_COUNTRY_NAME_HEADER_NAMES))
      : null) ??
    getCountryName(countryCode);
  const region =
    toNullableText(getFirstHeaderValue(headers, REGION_HEADER_NAMES)) ??
    (process.env.NODE_ENV === "development"
      ? toNullableText(getFirstHeaderValue(headers, DEV_REGION_HEADER_NAMES))
      : null);
  const city =
    toNullableText(getFirstHeaderValue(headers, CITY_HEADER_NAMES)) ??
    (process.env.NODE_ENV === "development"
      ? toNullableText(getFirstHeaderValue(headers, DEV_CITY_HEADER_NAMES))
      : null);
  const timeZone =
    normalizeTimeZone(getFirstHeaderValue(headers, TIMEZONE_HEADER_NAMES)) ??
    (process.env.NODE_ENV === "development"
      ? normalizeTimeZone(getFirstHeaderValue(headers, DEV_TIMEZONE_HEADER_NAMES))
      : null) ??
    normalizeTimeZone(options.requestedTimeZone);
  const locationSource =
    normalizedLocationConsentStatus === "accepted" &&
    normalizedLatitude !== null &&
    normalizedLongitude !== null
      ? "browser_geolocation"
      : countryCode || countryName || region || city || timeZone
        ? "ip_header"
        : "unknown";

  return {
    countryCode,
    countryName,
    region,
    city,
    timeZone,
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    locationAccuracyMeters: normalizedLocationAccuracyMeters,
    locationConsentStatus: normalizedLocationConsentStatus,
    locationSource,
  };
}
