"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getBrowserGeoDebugHeaders,
  getBrowserVisitMetadata,
  markPageVisitAsSeen,
} from "@/lib/browserVisitMetadata";

type SiteVisitRequestPayload = {
  sessionId?: string | null;
  visitorId?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  timeZone?: string | null;
  locationConsentStatus?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracyMeters?: number | null;
  session_id?: string | null;
  visitor_id?: string | null;
  page_url?: string | null;
  user_agent?: string | null;
  referrer_url?: string | null;
  time_zone?: string | null;
  location_consent_status?: string | null;
  geo_latitude?: number | null;
  geo_longitude?: number | null;
  geo_accuracy_meters?: number | null;
};

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const metadata = getBrowserVisitMetadata();
    const pageUrl = metadata.pageUrl;
    const locationConsentStatus =
      metadata.locationConsentStatus === "unknown" ? null : metadata.locationConsentStatus;

    if (!pageUrl || !markPageVisitAsSeen(pageUrl)) {
      return;
    }

    const payload: SiteVisitRequestPayload = {
      sessionId: metadata.sessionId,
      visitorId: metadata.visitorId,
      pageUrl,
      userAgent: metadata.userAgent,
      referrer: metadata.referrer,
      timeZone: metadata.timeZone,
      locationConsentStatus,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      locationAccuracyMeters: metadata.locationAccuracyMeters,
      session_id: metadata.sessionId,
      visitor_id: metadata.visitorId,
      page_url: pageUrl,
      user_agent: metadata.userAgent,
      referrer_url: metadata.referrer,
      time_zone: metadata.timeZone,
      location_consent_status: locationConsentStatus,
      geo_latitude: metadata.latitude,
      geo_longitude: metadata.longitude,
      geo_accuracy_meters: metadata.locationAccuracyMeters,
    };

    void fetch("/api/site-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBrowserGeoDebugHeaders(),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Visit logging should never affect the page experience.
    });
  }, [pathname]);

  return null;
}
