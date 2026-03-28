import { NextResponse } from "next/server";
import { logSiteVisit } from "@/lib/siteVisitLogging";
import { getRequestGeoMetadata } from "@/lib/requestGeo";

export const runtime = "nodejs";

type SiteVisitRequestBody = {
  sessionId?: string;
  session_id?: string;
  visitorId?: string;
  visitor_id?: string;
  pageUrl?: string;
  page_url?: string;
  userAgent?: string;
  user_agent?: string;
  timeZone?: string;
  time_zone?: string;
  ipAddress?: string;
  ip_address?: string;
  referrer?: string;
  referrer_url?: string;
  locationConsentStatus?: string;
  location_consent_status?: string;
  latitude?: number;
  geo_latitude?: number;
  longitude?: number;
  geo_longitude?: number;
  locationAccuracyMeters?: number;
  geo_accuracy_meters?: number;
};

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getNormalizedBodyField(
  body: Partial<SiteVisitRequestBody> | undefined,
  camelCaseKey: keyof SiteVisitRequestBody,
  snakeCaseKey: keyof SiteVisitRequestBody
) {
  return toNullableText(body?.[camelCaseKey]) ?? toNullableText(body?.[snakeCaseKey]);
}

function getIpAddress(headers: Headers) {
  const forwardedFor = toNullableText(headers.get("x-forwarded-for"));

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return toNullableText(headers.get("x-real-ip"));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SiteVisitRequestBody;
    const normalizedTimeZone = getNormalizedBodyField(body, "timeZone", "time_zone");
    const geoMetadata = getRequestGeoMetadata(request.headers, {
      requestedTimeZone: normalizedTimeZone,
      locationConsentStatus:
        getNormalizedBodyField(body, "locationConsentStatus", "location_consent_status"),
      latitude: toNullableNumber(body.latitude) ?? toNullableNumber(body.geo_latitude),
      longitude: toNullableNumber(body.longitude) ?? toNullableNumber(body.geo_longitude),
      locationAccuracyMeters:
        toNullableNumber(body.locationAccuracyMeters) ??
        toNullableNumber(body.geo_accuracy_meters),
    });
    const pageUrl =
      getNormalizedBodyField(body, "pageUrl", "page_url") ??
      toNullableText(request.headers.get("referer"));

    if (!pageUrl) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await logSiteVisit({
      sessionId: getNormalizedBodyField(body, "sessionId", "session_id"),
      visitorId: getNormalizedBodyField(body, "visitorId", "visitor_id"),
      pageUrl,
      userAgent:
        getNormalizedBodyField(body, "userAgent", "user_agent") ??
        toNullableText(request.headers.get("user-agent")),
      ipAddress:
        getIpAddress(request.headers) ??
        getNormalizedBodyField(body, "ipAddress", "ip_address"),
      referrer:
        getNormalizedBodyField(body, "referrer", "referrer_url") ??
        toNullableText(request.headers.get("referer")),
      countryCode: geoMetadata.countryCode,
      countryName: geoMetadata.countryName,
      region: geoMetadata.region,
      city: geoMetadata.city,
      timeZone: geoMetadata.timeZone,
      latitude: geoMetadata.latitude,
      longitude: geoMetadata.longitude,
      locationAccuracyMeters: geoMetadata.locationAccuracyMeters,
      locationConsentStatus: geoMetadata.locationConsentStatus,
      locationSource: geoMetadata.locationSource,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Site visit API error:", error);
    return NextResponse.json({ ok: true });
  }
}
