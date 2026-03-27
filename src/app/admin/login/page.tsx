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
    <main className="container-page section-shell min-h-screen pb-16 pt-12">
      <section className="section-panel mx-auto max-w-xl p-6 md:p-8">
        <div className="section-header">
          <div className="section-eyebrow">Admin Access</div>
          <div>
            <h1 className="section-title text-3xl font-normal md:text-4xl">Admin Login</h1>
            <p className="section-copy mt-3 text-sm md:text-base">
              Protected admin access for portfolio logs. Passcode validation happens server-side
              and authenticated state is stored in an `httpOnly` admin cookie.
            </p>
          </div>
        </div>

        {loggedOut ? (
          <div className="premium-card mt-6 p-4 text-sm text-white/75">
            Admin session cleared.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="premium-card mt-6 border-red-400/20 p-4 text-sm text-red-100/85">
            {errorMessage}
          </div>
        ) : null}

        {!isConfigured ? (
          <div className="premium-card mt-6 p-4 text-sm text-white/75">
            Set `ADMIN_PASSCODE` in your environment before using admin login.
          </div>
        ) : null}

        <form action="/admin/login/submit" method="post" className="mt-8 grid gap-4">
          <input type="hidden" name="next" value={nextPath} />

          <label className="premium-card flex flex-col gap-2 p-4">
            <span className="text-sm text-white/70">Admin Passcode</span>
            <input
              type="password"
              name="passcode"
              required
              disabled={!isConfigured}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              placeholder="Enter admin passcode"
            />
          </label>

          <button type="submit" className="premium-button w-fit" disabled={!isConfigured}>
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
