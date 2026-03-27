import { clearAdminSessionCookie, createRelativeRedirectResponse } from "@/lib/adminAuth";

export async function POST() {
  const response = createRelativeRedirectResponse("/admin/login?logged_out=1", 303);
  clearAdminSessionCookie(response);
  return response;
}
