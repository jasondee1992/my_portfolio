import { clearAdminSessionCookie, createRelativeRedirectResponse } from "@/lib/adminAuth";

export async function POST() {
  const response = createRelativeRedirectResponse("/admin/login?logged_out=1", 303);
  clearAdminSessionCookie(response);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Clear-Site-Data", "\"cache\", \"cookies\", \"storage\"");
  return response;
}
