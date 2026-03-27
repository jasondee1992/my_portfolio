import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE_NAME = "portfolio_admin_session";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 8;
const DEFAULT_ADMIN_REDIRECT_PATH = "/admin/dashboard";

type AdminSessionPayload = {
  role: "admin";
  exp: number;
};

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
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  };
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
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return parseAdminSessionToken(token) !== null;
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
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}

export function getAdminRedirectTarget(value: string | null | undefined) {
  return getSafeNextPath(value);
}
