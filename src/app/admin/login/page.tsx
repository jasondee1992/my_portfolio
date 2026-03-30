import "server-only";
import { redirect } from "next/navigation";
import {
  getAdminRedirectTarget,
  isAdminAuthConfigured,
  isAdminAuthenticated,
} from "@/lib/adminAuth";

type SearchParamsValue = string | string[] | undefined;
type PageProps = {
  searchParams?: Promise<Record<string, SearchParamsValue>>;
};

function getSingleValue(value: SearchParamsValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "invalid":
      return "Invalid admin passcode.";
    case "config":
      return "Admin passcode is not configured.";
    default:
      return "";
  }
}

function UserAvatarGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9">
      <path
        d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z"
        fill="currentColor"
      />
      <path
        d="M5 19.5c0-3.1 3.15-5.25 7-5.25s7 2.15 7 5.25"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M8.25 12h7.5M12.75 7.5 17.25 12l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = getAdminRedirectTarget(getSingleValue(resolvedSearchParams.next));
  const errorCode = getSingleValue(resolvedSearchParams.error);
  const loggedOut = getSingleValue(resolvedSearchParams.logged_out) === "1";
  const errorMessage = getErrorMessage(errorCode);
  const isConfigured = isAdminAuthConfigured();

  if (isConfigured && (await isAdminAuthenticated())) {
    redirect(nextPath);
  }

  return (
    <main className="admin-auth-screen">
      <section className="admin-auth-panel">
        <div className="admin-auth-avatar">
          <UserAvatarGlyph />
        </div>

        {loggedOut ? (
          <div className="admin-auth-message">Admin session cleared.</div>
        ) : null}

        {errorMessage ? (
          <div className="admin-auth-message" data-tone="error">
            {errorMessage}
          </div>
        ) : null}

        {!isConfigured ? (
          <div className="admin-auth-message">
            Set `ADMIN_PASSCODE` in your environment before using admin login.
          </div>
        ) : null}

        <form action="/admin/login/submit" method="post" className="admin-auth-form">
          <input type="hidden" name="next" value={nextPath} />

          <div className="admin-auth-input-shell">
            <input
              type="password"
              name="passcode"
              required
              disabled={!isConfigured}
              className="admin-auth-input"
              placeholder="Admin passcode"
            />
            <button
              type="submit"
              className="admin-auth-submit"
              disabled={!isConfigured}
              aria-label="Unlock admin dashboard"
            >
              <ArrowGlyph />
            </button>
          </div>
        </form>

        <p className="admin-auth-note admin-auth-note-prominent">
          Enter the admin passcode to unlock the dashboard.
        </p>
      </section>
    </main>
  );
}
