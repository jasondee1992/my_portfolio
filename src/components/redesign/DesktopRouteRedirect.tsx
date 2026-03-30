"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DESKTOP_WINDOW_REDIRECT_KEY = "desktop-window-redirect";

export default function DesktopRouteRedirect({
  windowId,
}: {
  windowId: "about" | "projects" | "gallery";
}) {
  const router = useRouter();

  useEffect(() => {
    window.sessionStorage.setItem(DESKTOP_WINDOW_REDIRECT_KEY, windowId);
    router.replace("/");
  }, [router, windowId]);

  return null;
}
