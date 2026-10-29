import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/persistent-rate-limit";
import { getClientIp, rejectUntrustedMutationOrigin } from "@/lib/request-security";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  service: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10).max(2000),
  phone: z.string().trim().max(80).optional().nullable(),
  company: z.string().trim().max(160).optional().nullable(),
  locale: z.string().trim().max(8).optional(),
});

export async function POST(request: Request) {
  const originError = rejectUntrustedMutationOrigin(request);
  if (originError) return originError;
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Completa nombre, email, servicio y mensaje." },
      { status: 422 },
    );
  }

  const ipKey = `contact:ip:${getClientIp(request)}`;
  const emailKey = `contact:email:${parsed.data.email}`;
  const [ipLimit, emailLimit] = await Promise.all([
    consumeRateLimit(ipKey, 10, 60 * 60 * 1000),
    consumeRateLimit(emailKey, 5, 60 * 60 * 1000),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfter, emailLimit.retryAfter);
    return NextResponse.json(
      { error: "Demasiados mensajes. Intentá nuevamente más tarde." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const { name, email, service, message } = parsed.data;
  const phone = parsed.data.phone || null;
  const company = parsed.data.company || null;
  const locale = parsed.data.locale || "es";

  const inquiry = await prisma.contactInquiry.create({
    data: { name, email, phone, company, service, message, locale },
  });

  await audit(null, "CONTACT_INQUIRY_CREATED", "ContactInquiry", inquiry.id);

  return NextResponse.json({ ok: true, id: inquiry.id });
}
