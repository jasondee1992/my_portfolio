"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getStoredLocationConsentStatus,
  isPreciseLocationSupported,
  markPreciseLocationSkipped,
  requestPreciseLocationShare,
} from "@/lib/browserVisitMetadata";

export default function LocationConsentPrompt() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      setIsVisible(false);
      return;
    }

    setIsVisible(
      isPreciseLocationSupported() && getStoredLocationConsentStatus() === "unknown"
    );
  }, [pathname]);

  async function handleAllowLocation() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPreciseLocationShare();
    } finally {
      setIsSubmitting(false);
      setIsVisible(false);
    }
  }

  function handleSkipLocation() {
    if (isSubmitting) {
      return;
    }

    markPreciseLocationSkipped();
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        bottom: 84,
        width: "min(360px, calc(100vw - 40px))",
        padding: "16px 16px 14px",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(12,12,13,0.94)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.42)",
        backdropFilter: "blur(20px)",
        color: "white",
        zIndex: 2147483646,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.94)" }}>
        Share precise location?
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.62)",
        }}
      >
        This is optional. If you allow it, the site will use browser geolocation for more accurate
        visit logging. If you skip it, the site will continue using approximate IP-based location.
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          type="button"
          onClick={() => void handleAllowLocation()}
          disabled={isSubmitting}
          style={{
            flex: 1,
            minHeight: 42,
            borderRadius: 9999,
            border: "1px solid rgba(122, 170, 255, 0.28)",
            background: "linear-gradient(180deg, rgba(65,125,255,0.95), rgba(44,96,214,0.92))",
            color: "white",
            fontSize: 13,
            cursor: isSubmitting ? "wait" : "pointer",
            opacity: isSubmitting ? 0.72 : 1,
          }}
        >
          {isSubmitting ? "Requesting..." : "Allow location"}
        </button>

        <button
          type="button"
          onClick={handleSkipLocation}
          disabled={isSubmitting}
          style={{
            flex: 1,
            minHeight: 42,
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.88)",
            fontSize: 13,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
