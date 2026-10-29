import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { authenticateAdmin, hasTrustedRequestOrigin } from "@/lib/auth";
import { clearRateLimit, consumeRateLimit } from "@/lib/persistent-rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const loginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    username: z.string().trim().email().optional(),
    user: z.string().trim().email().optional(),
    password: z.string().min(1).max(200),
  })
  .transform((value) => ({
    email: value.email ?? value.username ?? value.user ?? "",
    password: value.password,
  }))
  .refine((value) => value.email.length > 0, {
    message: "Email is required",
    path: ["email"],
  });

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}


export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    await audit(null, "LOGIN_ORIGIN_REJECTED", "User", undefined, `ip=${clientIp(request)}`);
    return NextResponse.json({ ok: false, error: "Untrusted request origin" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid login payload" }, { status: 400 });
  }

  const ipKey = `login:ip:${clientIp(request)}`;
  const emailKey = `login:email:${parsed.data.email.toLowerCase()}`;
  const [ipLimit, emailLimit] = await Promise.all([
    consumeRateLimit(ipKey, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS),
    consumeRateLimit(emailKey, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    await audit(null, "LOGIN_RATE_LIMITED", "User", undefined, `email=${parsed.data.email};ip=${clientIp(request)}`);
    const retryAfter = Math.max(ipLimit.retryAfter, emailLimit.retryAfter);
    return NextResponse.json(
      { ok: false, error: "Too many login attempts" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const user = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!user) {
    await audit(null, "LOGIN_FAILED", "User", undefined, `email=${parsed.data.email};ip=${clientIp(request)}`);
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  await Promise.all([clearRateLimit(ipKey), clearRateLimit(emailKey)]);
  await audit(user.id, "LOGIN_API", "User", user.id);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
