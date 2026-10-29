import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserForSessionToken, hashSessionToken, SESSION_COOKIE } from "@/lib/session-token";
import { isTrustedMutationOrigin } from "@/lib/request-security";

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.EDITOR] as const;
const SESSION_DAYS = 7;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

// OPENCLAW_PROTOCOL_AWARE_SESSION_COOKIE_V1
function parseSecureOverride(value: string | undefined) {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function protocolFromUrl(value: string | null) {
  if (!value) return null;

  try {
    const protocol = new URL(value).protocol.toLowerCase();

    if (protocol === "https:") return "https";
    if (protocol === "http:") return "http";
  } catch {
    return null;
  }

  return null;
}

// OPENCLAW_ROLE_CAPABILITIES_V1
export type AdminCapability = "ADMIN_ACCESS" | "CONTENT_WRITE" | "USER_MANAGE" | "SENSITIVE_SETTINGS";
const ROLE_CAPABILITIES: Record<UserRole, readonly AdminCapability[]> = {
  [UserRole.ADMIN]: ["ADMIN_ACCESS", "CONTENT_WRITE", "USER_MANAGE", "SENSITIVE_SETTINGS"],
  [UserRole.EDITOR]: ["ADMIN_ACCESS", "CONTENT_WRITE"],
};

export function hasCapability(role: UserRole, capability: AdminCapability) {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export function hasTrustedRequestOrigin(request: Request) {
  return isTrustedMutationOrigin(request);
}

async function shouldUseSecureSessionCookie() {
  const explicit = parseSecureOverride(
    process.env.AUTH_COOKIE_SECURE,
  );

  if (explicit !== null) {
    return explicit;
  }

  const requestHeaders = await headers();

  for (const headerName of ["origin", "referer"]) {
    const protocol = protocolFromUrl(
      requestHeaders.get(headerName),
    );

    if (protocol === "https") return true;
    if (protocol === "http") return false;
  }

  const forwardedProto = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProto === "https") return true;
  if (forwardedProto === "http") return false;

  const forwarded = requestHeaders.get("forwarded");

  if (
    forwarded &&
    /(?:^|[;,]\s*)proto="?https"?/i.test(forwarded)
  ) {
    return true;
  }

  if (
    forwarded &&
    /(?:^|[;,]\s*)proto="?http"?/i.test(forwarded)
  ) {
    return false;
  }

  for (const configuredUrl of [
    process.env.AUTH_PUBLIC_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.PUBLIC_URL,
    process.env.ADMIN_URL,
  ]) {
    const protocol = protocolFromUrl(
      configuredUrl || null,
    );

    if (protocol === "https") return true;
    if (protocol === "http") return false;
  }

  return false;
}

async function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: await shouldUseSecureSessionCookie(),
    path: "/",
    expires,
    maxAge: SESSION_MAX_AGE,
  };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, token: tokenHash, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, await sessionCookieOptions(expiresAt));
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token: hashSessionToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return getUserForSessionToken(token);
}

export function hasAdminRole(role: UserRole, allowedRoles: readonly UserRole[] = ADMIN_ROLES) {
  if (allowedRoles === ADMIN_ROLES) return hasCapability(role, "ADMIN_ACCESS");
  return allowedRoles.includes(role);
}

export async function requireAdminUser(allowedRoles: readonly UserRole[] = ADMIN_ROLES) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasAdminRole(user.role, allowedRoles)) return null;
  return user;
}

export async function requireAdminMutation(
  request: Request,
  allowedRoles: readonly UserRole[] = ADMIN_ROLES,
) {
  if (!hasTrustedRequestOrigin(request)) return null;
  return requireAdminUser(allowedRoles);
}

export async function invalidateUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.status !== "ACTIVE" || user.deletedAt) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  return user;
}
