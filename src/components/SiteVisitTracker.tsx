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
  session_id?: string | null;
  visitor_id?: string | null;
  page_url?: string | null;
  user_agent?: string | null;
  referrer_url?: string | null;
  time_zone?: string | null;
};

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const metadata = getBrowserVisitMetadata();
    const pageUrl = metadata.pageUrl;

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
      session_id: metadata.sessionId,
      visitor_id: metadata.visitorId,
      page_url: pageUrl,
      user_agent: metadata.userAgent,
      referrer_url: metadata.referrer,
      time_zone: metadata.timeZone,
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
