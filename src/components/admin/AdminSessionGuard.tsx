"use client";

import { useEffect } from "react";

function buildLoginUrl() {
  const nextPath = `${window.location.pathname}${window.location.search}`;
  const searchParams = new URLSearchParams();

  if (nextPath.startsWith("/admin")) {
    searchParams.set("next", nextPath);
  }

  const queryString = searchParams.toString();
  return queryString ? `/admin/login?${queryString}` : "/admin/login";
}

export default function AdminSessionGuard() {
  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!active) {
          return;
        }

        if (!response.ok) {
          window.location.replace(buildLoginUrl());
        }
      } catch {
        if (active) {
          window.location.replace(buildLoginUrl());
        }
      }
    }

    function handlePageShow() {
      void verifySession();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void verifySession();
      }
    }

    void verifySession();
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
