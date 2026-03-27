import {
  applyAdminSessionCookie,
  createRelativeRedirectResponse,
  getAdminRedirectTarget,
  isAdminAuthConfigured,
  validateAdminPasscode,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const passcode = String(formData.get("passcode") ?? "");
  const nextPath = getAdminRedirectTarget(String(formData.get("next") ?? ""));

  if (!isAdminAuthConfigured()) {
    return createRelativeRedirectResponse(
      `/admin/login?error=config&next=${encodeURIComponent(nextPath)}`,
      303
    );
  }

  const isValid = await validateAdminPasscode(passcode);

  if (!isValid) {
    return createRelativeRedirectResponse(
      `/admin/login?error=invalid&next=${encodeURIComponent(nextPath)}`,
      303
    );
  }

  const response = createRelativeRedirectResponse(nextPath, 303);
  applyAdminSessionCookie(response);
  return response;
}
