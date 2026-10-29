import { NextResponse } from "next/server";

// OPENCLAW_PROJECT_REQUEST_SECURITY_V1
function normalizedOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function configuredOrigins() {
  const origins = new Set<string>();
  for (const value of [
    process.env.AUTH_PUBLIC_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.PUBLIC_URL,
    process.env.ADMIN_URL,
  ]) {
    const origin = normalizedOrigin(value);
    if (origin) origins.add(origin);
  }
  for (const value of (process.env.ALLOWED_ORIGINS || "").split(",")) {
    const origin = normalizedOrigin(value.trim());
    if (origin) origins.add(origin);
  }
  return origins;
}

function requestOrigins(request: Request) {
  const origins = configuredOrigins();
  const requestOrigin = normalizedOrigin(request.url);
  if (requestOrigin) origins.add(requestOrigin);

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (host && (forwardedProto === "http" || forwardedProto === "https")) {
    origins.add(`${forwardedProto}://${host}`.toLowerCase());
  }
  return origins;
}

export function isTrustedMutationOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return false;

  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  let candidate: string | null = null;

  if (originHeader !== null) {
    candidate = normalizedOrigin(originHeader);
    if (!candidate) return false;
  } else if (refererHeader !== null) {
    candidate = normalizedOrigin(refererHeader);
    if (!candidate) return false;
  }

  if (!candidate) return fetchSite === "same-origin";
  return requestOrigins(request).has(candidate);
}

export function rejectUntrustedMutationOrigin(request: Request) {
  if (isTrustedMutationOrigin(request)) return null;
  return NextResponse.json(
    { ok: false, error: "Origen no permitido" },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function requestBodyTooLarge(request: Request, maxBytes: number) {
  const value = request.headers.get("content-length");
  if (!value) return false;
  const length = Number(value);
  return Number.isFinite(length) && length > maxBytes;
}
