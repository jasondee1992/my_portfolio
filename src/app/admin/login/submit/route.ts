import { NextResponse } from "next/server";
import {
  applyAdminSessionCookie,
  getAdminRedirectTarget,
  isAdminAuthConfigured,
  validateAdminPasscode,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const passcode = String(formData.get("passcode") ?? "");
  const nextPath = getAdminRedirectTarget(String(formData.get("next") ?? ""));

  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=config&next=${encodeURIComponent(nextPath)}`, request.url),
      { status: 303 }
    );
  }

  const isValid = await validateAdminPasscode(passcode);

  if (!isValid) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=invalid&next=${encodeURIComponent(nextPath)}`, request.url),
      { status: 303 }
    );
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  applyAdminSessionCookie(response);
  return response;
}
