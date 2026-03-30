import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await isAdminAuthenticated();

  return NextResponse.json(
    { authenticated },
    {
      status: authenticated ? 200 : 401,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
