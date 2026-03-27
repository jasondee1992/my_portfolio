import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login?logged_out=1", request.url), {
    status: 303,
  });
  clearAdminSessionCookie(response);
  return response;
}
