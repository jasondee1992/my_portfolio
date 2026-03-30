import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE_NAME = "portfolio_admin_session_v2";
const LEGACY_ADMIN_SESSION_COOKIE_NAME = "portfolio_admin_session";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 8;
const DEFAULT_ADMIN_REDIRECT_PATH = "/admin/chat-logs";

type AdminSessionPayload = {
  role: "admin";
  exp: number;
};

function getAdminCookieDomain() {
  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    return undefined;
  }

  try {
    const hostname = new URL(siteUrl).hostname.trim().toLowerCase();

    if (!hostname || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return undefined;
    }

    return hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getAdminPasscode() {
  return process.env.ADMIN_PASSCODE?.trim() ?? "";
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || getAdminPasscode();
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  return crypto.createHmac("sha256", getAdminSessionSecret()).update(value).digest("base64url");
}

function getCookieOptions() {
  const domain = getAdminCookieDomain();

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
    ...(domain ? { domain } : {}),
  };
}

function getLegacyAdminCookieOptions() {
  return {
    ...getCookieOptions(),
    path: "/admin",
  };
}

function getAdminCookieClearOptionVariants() {
  const baseOptions = getCookieOptions();
  const legacyOptions = getLegacyAdminCookieOptions();

  return [
    baseOptions,
    legacyOptions,
    { ...baseOptions, path: "/admin/chat-logs" },
    { ...baseOptions, path: "/admin/site-visits" },
    { ...baseOptions, path: "/admin/projects" },
    { ...baseOptions, path: "/admin/dashboard" },
    { ...baseOptions, path: "/admin/login" },
  ];
}

function clearCookieByName(
  response: NextResponse,
  name: string,
  options: ReturnType<typeof getCookieOptions>
) {
  response.cookies.set(name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

function getSafeNextPath(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || !trimmed.startsWith("/admin") || trimmed.startsWith("//")) {
    return DEFAULT_ADMIN_REDIRECT_PATH;
  }

  return trimmed;
}

function timingSafeEqualString(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionPayload(): AdminSessionPayload {
  return {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS,
  };
}

function createAdminSessionToken() {
  const encodedPayload = encodeBase64Url(JSON.stringify(createSessionPayload()));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseAdminSessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (!timingSafeEqualString(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AdminSessionPayload;

    if (
      payload.role !== "admin" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isAdminAuthConfigured() {
  return getAdminPasscode().length > 0;
}

export function getAdminLoginUrl(nextPath?: string | null) {
  const searchParams = new URLSearchParams();
  const safeNextPath = getSafeNextPath(nextPath);

  if (safeNextPath !== DEFAULT_ADMIN_REDIRECT_PATH) {
    searchParams.set("next", safeNextPath);
  }

  const queryString = searchParams.toString();
  return queryString ? `/admin/login?${queryString}` : "/admin/login";
}

export function createRelativeRedirectResponse(path: string, status = 307) {
  return new NextResponse(null, {
    status,
    headers: {
      Location: path,
    },
  });
}

export function createAdminLoginRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const nextPath = `${requestUrl.pathname}${requestUrl.search}`;
  return createRelativeRedirectResponse(getAdminLoginUrl(nextPath));
}

export async function isAdminAuthenticated() {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const tokens = cookieStore.getAll(ADMIN_SESSION_COOKIE_NAME).map((cookie) => cookie.value);

  return tokens.some((token) => parseAdminSessionToken(token) !== null);
}

export async function requireAdminPageAuth(nextPath: string) {
  if (!(await isAdminAuthenticated())) {
    redirect(getAdminLoginUrl(nextPath));
  }
}

export async function validateAdminPasscode(passcode: string) {
  const expectedPasscode = getAdminPasscode();

  if (!expectedPasscode) {
    return false;
  }

  return timingSafeEqualString(passcode, expectedPasscode);
}

export function applyAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken(), getCookieOptions());
  clearCookieByName(response, LEGACY_ADMIN_SESSION_COOKIE_NAME, getCookieOptions());
  clearCookieByName(response, LEGACY_ADMIN_SESSION_COOKIE_NAME, getLegacyAdminCookieOptions());
}

export function clearAdminSessionCookie(response: NextResponse) {
  for (const options of getAdminCookieClearOptionVariants()) {
    clearCookieByName(response, ADMIN_SESSION_COOKIE_NAME, options);
    clearCookieByName(response, LEGACY_ADMIN_SESSION_COOKIE_NAME, options);
  }
}

export async function clearAdminSessionAndRedirect(path = "/admin/login?logged_out=1"): Promise<never> {
  const cookieStore = await cookies();

  for (const options of getAdminCookieClearOptionVariants()) {
    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
      ...options,
      maxAge: 0,
      expires: new Date(0),
    });
    cookieStore.set(LEGACY_ADMIN_SESSION_COOKIE_NAME, "", {
      ...options,
      maxAge: 0,
      expires: new Date(0),
    });
  }

  redirect(path);
}

export function getAdminRedirectTarget(value: string | null | undefined) {
  return getSafeNextPath(value);
}
