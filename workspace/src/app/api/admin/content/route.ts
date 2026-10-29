import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma, PublishStatus, UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getAdminData } from "@/lib/content";
import { hasCapability, invalidateUserSessions, requireAdminMutation, requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TranslationProviderError, translateSpanishToEnglish } from "@/lib/translation";

type Resource =
  | "project"
  | "service"
  | "category"
  | "processStep"
  | "client"
  | "testimonial"
  | "inquiry"
  | "user"
  | "settings";

type TranslationPair = { es: string; en: string };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanString(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

function nullableString(value: unknown, max = 2000) {
  if (value === undefined) return undefined;
  return cleanString(value, max) || null;
}

function safeContentUrl(value: string | undefined) {
  if (value === undefined) return undefined;
  if (!value) return "";

  if (value.startsWith("/uploads/") || value.startsWith("/assets/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return value;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function safeExternalUrl(value: string | undefined) {
  if (value === undefined) return undefined;
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return value;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function safeVideoUrl(value: string | undefined) {
  const cleaned = safeContentUrl(value);
  if (cleaned === undefined || cleaned === "" || cleaned.startsWith("/uploads/")) {
    return cleaned;
  }

  try {
    const url = new URL(cleaned);
    const host = url.hostname.toLowerCase();
    const isYoutube =
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "youtu.be" ||
      host.endsWith(".youtube.com");
    const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(url.pathname);

    if (isYoutube || isDirectVideo) {
      return cleaned;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function cleanStatus(value: unknown) {
  return value === "DRAFT" || value === "PUBLISHED" || value === "INACTIVE"
    ? value
    : PublishStatus.PUBLISHED;
}

const resourceSchema = z.enum([
  "project",
  "service",
  "category",
  "processStep",
  "client",
  "testimonial",
  "inquiry",
  "user",
  "settings",
]);
const postResourceSchema = z.enum(["project", "service", "category", "processStep", "testimonial", "user"]);
const dataSchema = z.record(z.string(), z.unknown()).default({});
const postSchema = z.object({
  resource: postResourceSchema,
  data: dataSchema,
});
const patchSchema = z.object({
  resource: resourceSchema,
  id: z.string().trim().max(160).optional(),
  action: z.enum(["soft-delete", "restore"]).optional(),
  data: dataSchema,
});
const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "INACTIVE"]).optional();
const userRoleSchema = z.enum(["ADMIN", "EDITOR"]).optional();
const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"]).optional();
const inquiryStatusSchema = z.enum(["NEW", "REVIEWING", "CONTACTED", "CLOSED"]);
const optionalText = (max = 2000) => z.string().trim().max(max).optional();
const requiredText = (max = 2000) => z.string().trim().min(1).max(max);
const optionalContentUrl = (max = 500) =>
  optionalText(max).transform((value, context) => {
    if (value === undefined) return undefined;

    const cleaned = safeContentUrl(value);
    if (cleaned !== undefined) return cleaned;

    context.addIssue({
      code: "custom",
      message: "La URL debe ser http(s) o una ruta interna permitida.",
    });
    return z.NEVER;
  });
const optionalExternalUrl = (max = 500) =>
  optionalText(max).transform((value, context) => {
    if (value === undefined) return undefined;

    const cleaned = safeExternalUrl(value);
    if (cleaned !== undefined) return cleaned;

    context.addIssue({
      code: "custom",
      message: "La URL debe usar http(s).",
    });
    return z.NEVER;
  });
const optionalVideoUrl = (max = 500) =>
  optionalText(max).transform((value, context) => {
    if (value === undefined) return undefined;

    const cleaned = safeVideoUrl(value);
    if (cleaned !== undefined) return cleaned;

    context.addIssue({
      code: "custom",
      message: "El video debe ser de YouTube, una ruta interna permitida o un archivo mp4/webm/ogg.",
    });
    return z.NEVER;
  });
const optionalPassword = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres.")
  .max(120)
  .optional();

const categoryDataSchema = z.object({
  nameEs: optionalText(160),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional(),
  status: publishStatusSchema,
});

const categoryCreateDataSchema = categoryDataSchema.extend({
  nameEs: requiredText(160),
});

const projectDataSchema = z.object({
  titleEs: optionalText(180),
  descriptionEs: optionalText(),
  client: optionalText(160),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  categoryId: optionalText(120),
  videoProvider: optionalText(40),
  videoUrl: optionalVideoUrl(500),
  posterUrl: optionalContentUrl(500),
  removePoster: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional(),
  status: publishStatusSchema,
});

const projectCreateDataSchema = projectDataSchema.extend({
  titleEs: requiredText(180),
  descriptionEs: requiredText(),
});

const serviceDataSchema = z.object({
  titleEs: optionalText(160),
  descriptionEs: optionalText(),
  imageUrl: optionalContentUrl(500),
  removeImage: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional(),
  status: publishStatusSchema,
});

const serviceCreateDataSchema = serviceDataSchema.extend({
  titleEs: requiredText(160),
  descriptionEs: requiredText(),
});

const processStepDataSchema = z.object({
  titleEs: optionalText(160),
  descriptionEs: optionalText(),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional(),
  status: publishStatusSchema,
});

const processStepCreateDataSchema = processStepDataSchema.extend({
  titleEs: requiredText(160),
  descriptionEs: requiredText(),
});

const testimonialDataSchema = z.object({
  author: optionalText(160),
  role: optionalText(160),
  company: optionalText(160),
  quoteEs: optionalText(),
  photoUrl: optionalContentUrl(500),
  removePhoto: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional(),
  status: publishStatusSchema,
});

const testimonialCreateDataSchema = testimonialDataSchema.extend({
  author: requiredText(160),
  role: requiredText(160),
  company: requiredText(160),
  quoteEs: requiredText(),
});

const userCreateDataSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(120),
  role: userRoleSchema.default("EDITOR"),
  status: userStatusSchema.default("ACTIVE"),
});

const userUpdateDataSchema = z.object({
  name: optionalText(160),
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()).optional(),
  password: optionalPassword,
  role: userRoleSchema,
  status: userStatusSchema,
});

const settingsDataSchema = z.object({
  siteName: optionalText(160),
  heroEyebrowEs: optionalText(180),
  heroTitle: optionalText(180),
  heroTextEs: optionalText(),
  aboutEs: optionalText(),
  locationEs: optionalText(180),
  email: z.string().trim().email().max(180).optional(),
  phone: optionalText(80),
  whatsapp: optionalText(80),
  instagram: optionalExternalUrl(500),
  youtube: optionalExternalUrl(500),
  logoUrl: optionalContentUrl(500),
  heroPosterUrl: optionalContentUrl(500),
  removeLogo: z.boolean().optional(),
  removeHeroPoster: z.boolean().optional(),
});

function validationError() {
  return NextResponse.json({ error: "Los datos enviados no son válidos." }, { status: 400 });
}

function apiError(error: unknown, fallback: string, status = 400) {
  if (error instanceof TranslationProviderError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  const message = error instanceof z.ZodError ? "Los datos enviados no son válidos." : fallback;
  return NextResponse.json({ error: message }, { status });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function translatedPair(sourceEs: string, max = 2000): Promise<TranslationPair> {
  const es = cleanString(sourceEs, max);
  if (!es) throw new TranslationProviderError("El texto en español no puede estar vacío. No se guardaron cambios.");
  return { es, en: await translateSpanishToEnglish(es) };
}

async function translatedIfChanged(sourceEs: string | undefined, currentEs: string, currentEn: string, max = 2000) {
  const es = cleanString(sourceEs, max);
  if (es === undefined) return undefined;
  if (!es) throw new TranslationProviderError("El texto en español no puede estar vacío. No se guardaron cambios.");
  if (es === currentEs) return { es, en: currentEn };
  return { es, en: await translateSpanishToEnglish(es) };
}

function ensureCanManageUsers(actorRole: UserRole) {
  if (!hasCapability(actorRole, "USER_MANAGE")) {
    return NextResponse.json({ error: "Solo un administrador puede modificar usuarios." }, { status: 403 });
  }
  return null;
}

function ensureCanManageResource(actorRole: UserRole, resource: Resource) {
  if (resource === "user") return ensureCanManageUsers(actorRole);
  if (resource === "settings" && !hasCapability(actorRole, "SENSITIVE_SETTINGS")) {
    return NextResponse.json(
      { error: "Solo un administrador puede modificar la configuración del sitio." },
      { status: 403 },
    );
  }
  return null;
}

async function assertNotLastAdmin(id: string, nextStatus?: UserStatus, nextRole?: UserRole) {
  const removesAdmin =
    nextStatus === UserStatus.INACTIVE || (nextRole !== undefined && nextRole !== UserRole.ADMIN);
  if (!removesAdmin) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== UserRole.ADMIN) return null;

  const activeAdmins = await prisma.user.count({
    where: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      deletedAt: null,
      NOT: { id },
    },
  });

  if (activeAdmins === 0) {
    return NextResponse.json(
      { error: "No se puede inhabilitar el último administrador activo." },
      { status: 409 },
    );
  }
  return null;
}

export async function GET() {
  const actor = await requireAdminUser();
  if (!actor) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const data = await getAdminData(actor.role);
  await audit(actor.id, "READ", "AdminContent");
  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
  const actor = await requireAdminMutation(request);
  if (!actor) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return validationError();
  const { resource } = parsed.data;
  const inputData = parsed.data.data;
  const permission = ensureCanManageResource(actor.role, resource);
  if (permission) return permission;

  try {
    let result: { id: string };

    if (resource === "category") {
      const data = categoryCreateDataSchema.parse(inputData);
      const name = await translatedPair(data.nameEs, 160);
      result = await prisma.category.create({
        data: {
          slug: `${slugify(name.en || name.es)}-${Date.now()}`,
          nameEs: name.es,
          nameEn: name.en,
          sortOrder: data.sortOrder ?? 0,
          status: cleanStatus(data.status),
        },
      });
    } else if (resource === "project") {
      const data = projectCreateDataSchema.parse(inputData);
      const title = await translatedPair(data.titleEs, 180);
      const description = await translatedPair(data.descriptionEs);
      const categoryId =
        cleanString(data.categoryId, 120) ||
        (await prisma.category.findFirst({ orderBy: { sortOrder: "asc" } }))?.id;
      if (!categoryId) return NextResponse.json({ error: "Debe existir una categoría para crear proyectos." }, { status: 400 });

      result = await prisma.project.create({
        data: {
          slug: `${slugify(title.en || title.es)}-${Date.now()}`,
          titleEs: title.es,
          titleEn: title.en,
          descriptionEs: description.es,
          descriptionEn: description.en,
          client: cleanString(data.client, 160) || "Cliente sin especificar",
          year: data.year ?? new Date().getFullYear(),
          videoProvider: cleanString(data.videoProvider, 40) || "youtube",
          videoUrl: cleanString(data.videoUrl, 500) || "",
          posterUrl: cleanString(data.posterUrl, 500) || null,
          featured: Boolean(data.featured),
          sortOrder: data.sortOrder ?? 0,
          status: cleanStatus(data.status),
          categoryId,
        },
      });
    } else if (resource === "service") {
      const data = serviceCreateDataSchema.parse(inputData);
      const title = await translatedPair(data.titleEs, 160);
      const description = await translatedPair(data.descriptionEs);
      result = await prisma.service.create({
        data: {
          titleEs: title.es,
          titleEn: title.en,
          descriptionEs: description.es,
          descriptionEn: description.en,
          imageUrl: cleanString(data.imageUrl, 500) || null,
          sortOrder: data.sortOrder ?? 0,
          status: cleanStatus(data.status),
        },
      });
    } else if (resource === "processStep") {
      const data = processStepCreateDataSchema.parse(inputData);
      const title = await translatedPair(data.titleEs, 160);
      const description = await translatedPair(data.descriptionEs);
      result = await prisma.processStep.create({
        data: {
          titleEs: title.es,
          titleEn: title.en,
          descriptionEs: description.es,
          descriptionEn: description.en,
          sortOrder: data.sortOrder ?? 0,
          status: cleanStatus(data.status),
        },
      });
    } else if (resource === "testimonial") {
      const data = testimonialCreateDataSchema.parse(inputData);
      const quote = await translatedPair(data.quoteEs);
      result = await prisma.testimonial.create({
        data: {
          author: data.author,
          role: data.role,
          company: data.company,
          quoteEs: quote.es,
          quoteEn: quote.en,
          photoUrl: cleanString(data.photoUrl, 500) || null,
          sortOrder: data.sortOrder ?? 0,
          status: cleanStatus(data.status),
        },
      });
    } else if (resource === "user") {
      const data = userCreateDataSchema.parse(inputData);
      result = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: await bcrypt.hash(data.password, 12),
          role: data.role === "ADMIN" ? UserRole.ADMIN : UserRole.EDITOR,
          status: data.status === "INACTIVE" ? UserStatus.INACTIVE : UserStatus.ACTIVE,
        },
      });
      await audit(actor.id, "USER_CREATE", "User", result.id, `role=${data.role};status=${data.status}`);
    } else {
      return NextResponse.json({ error: "Recurso no soportado." }, { status: 400 });
    }

    if (resource !== "user") {
      await audit(actor.id, "CREATE", resource, result.id);
    }
    return NextResponse.json({ ok: true, id: result.id, resource: result, item: result });
  } catch (error) {
    return apiError(error, "No se pudo crear el registro.");
  }
}

export async function PATCH(request: Request) {
  const actor = await requireAdminMutation(request);
  if (!actor) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError();
  const { resource, action } = parsed.data;
  const id = cleanString(parsed.data.id, 160);
  const inputData = parsed.data.data;
  const permission = ensureCanManageResource(actor.role, resource);
  if (permission) return permission;

  try {
    let result: { id: string } | null = null;

    if (resource === "settings") {
      const data = settingsDataSchema.parse(inputData);
      const current = await prisma.siteSetting.findUnique({ where: { id: "site" } });
      const heroEyebrow = current
        ? await translatedIfChanged(data.heroEyebrowEs, current.heroEyebrowEs, current.heroEyebrowEn, 180)
        : data.heroEyebrowEs
          ? await translatedPair(data.heroEyebrowEs, 180)
          : undefined;
      const heroText = current
        ? await translatedIfChanged(data.heroTextEs, current.heroTextEs, current.heroTextEn)
        : data.heroTextEs
          ? await translatedPair(data.heroTextEs)
          : undefined;
      const about = current
        ? await translatedIfChanged(data.aboutEs, current.aboutEs, current.aboutEn)
        : data.aboutEs
          ? await translatedPair(data.aboutEs)
          : undefined;
      const location = current
        ? await translatedIfChanged(data.locationEs, current.locationEs, current.locationEn, 180)
        : data.locationEs
          ? await translatedPair(data.locationEs, 180)
          : undefined;

      result = await prisma.siteSetting.upsert({
        where: { id: "site" },
        update: {
          siteName: cleanString(data.siteName, 160),
          heroEyebrowEs: heroEyebrow?.es,
          heroEyebrowEn: heroEyebrow?.en,
          heroTitle: cleanString(data.heroTitle, 180),
          heroTextEs: heroText?.es,
          heroTextEn: heroText?.en,
          aboutEs: about?.es,
          aboutEn: about?.en,
          locationEs: location?.es,
          locationEn: location?.en,
          email: cleanString(data.email, 180),
          phone: cleanString(data.phone, 80),
          whatsapp: cleanString(data.whatsapp, 80),
          instagram: nullableString(data.instagram, 500),
          youtube: nullableString(data.youtube, 500),
          logoUrl: data.removeLogo ? null : cleanString(data.logoUrl, 500),
          heroPosterUrl: data.removeHeroPoster ? null : cleanString(data.heroPosterUrl, 500),
        },
        create: {
          id: "site",
          siteName: cleanString(data.siteName, 160) || "BL Audiovisual",
          heroEyebrowEs: heroEyebrow?.es || "Lanzamiento destacado",
          heroEyebrowEn: heroEyebrow?.en || "Featured release",
          heroTitle: cleanString(data.heroTitle, 180) || "BL AUDIOVISUAL",
          heroTextEs: heroText?.es || "Contenido principal pendiente de configurar.",
          heroTextEn: heroText?.en || "Main content pending configuration.",
          aboutEs: about?.es || "Descripción institucional pendiente de configurar.",
          aboutEn: about?.en || "Institutional description pending configuration.",
          email: cleanString(data.email, 180) || "contacto@bl-audiovisual.local",
          phone: cleanString(data.phone, 80) || "",
          whatsapp: cleanString(data.whatsapp, 80) || "",
          instagram: cleanString(data.instagram, 500) || null,
          youtube: cleanString(data.youtube, 500) || null,
          logoUrl: cleanString(data.logoUrl, 500) || null,
          heroPosterUrl: cleanString(data.heroPosterUrl, 500) || null,
          locationEs: location?.es || "Buenos Aires, Argentina",
          locationEn: location?.en || "Buenos Aires, Argentina",
        },
      });
    } else if (!id) {
      return NextResponse.json({ error: "Falta el identificador del registro." }, { status: 400 });
    } else if (action === "soft-delete" || action === "restore") {
      const deletedAt = action === "soft-delete" ? new Date() : null;
      const deletedBy = action === "soft-delete" ? actor.id : null;
      const status = action === "soft-delete" ? PublishStatus.INACTIVE : PublishStatus.PUBLISHED;
      const update = { deletedAt, deletedBy, status };
      result = await updateSoftState(resource, id, update);
    } else if (resource === "category") {
      const data = categoryDataSchema.parse(inputData);
      const current = await prisma.category.findUniqueOrThrow({ where: { id } });
      const name = await translatedIfChanged(data.nameEs, current.nameEs, current.nameEn, 160);
      result = await prisma.category.update({
        where: { id },
        data: {
          nameEs: name?.es,
          nameEn: name?.en,
          sortOrder: data.sortOrder,
          status: data.status ? cleanStatus(data.status) : undefined,
        },
      });
    } else if (resource === "project") {
      const data = projectDataSchema.parse(inputData);
      const current = await prisma.project.findUniqueOrThrow({ where: { id } });
      const title = await translatedIfChanged(data.titleEs, current.titleEs, current.titleEn, 180);
      const description = await translatedIfChanged(data.descriptionEs, current.descriptionEs, current.descriptionEn);
      result = await prisma.project.update({
        where: { id },
        data: {
          titleEs: title?.es,
          titleEn: title?.en,
          descriptionEs: description?.es,
          descriptionEn: description?.en,
          client: cleanString(data.client, 160),
          year: data.year,
          videoProvider: cleanString(data.videoProvider, 40),
          videoUrl: cleanString(data.videoUrl, 500),
          posterUrl: data.removePoster ? null : cleanString(data.posterUrl, 500),
          featured: data.featured === undefined ? undefined : Boolean(data.featured),
          sortOrder: data.sortOrder,
          status: data.status ? cleanStatus(data.status) : undefined,
          categoryId: cleanString(data.categoryId, 120),
        },
      });
    } else if (resource === "service") {
      const data = serviceDataSchema.parse(inputData);
      const current = await prisma.service.findUniqueOrThrow({ where: { id } });
      const title = await translatedIfChanged(data.titleEs, current.titleEs, current.titleEn, 160);
      const description = await translatedIfChanged(data.descriptionEs, current.descriptionEs, current.descriptionEn);
      result = await prisma.service.update({
        where: { id },
        data: {
          titleEs: title?.es,
          titleEn: title?.en,
          descriptionEs: description?.es,
          descriptionEn: description?.en,
          imageUrl: data.removeImage ? null : cleanString(data.imageUrl, 500),
          sortOrder: data.sortOrder,
          status: data.status ? cleanStatus(data.status) : undefined,
        },
      });
    } else if (resource === "processStep") {
      const data = processStepDataSchema.parse(inputData);
      const current = await prisma.processStep.findUniqueOrThrow({ where: { id } });
      const title = await translatedIfChanged(data.titleEs, current.titleEs, current.titleEn, 160);
      const description = await translatedIfChanged(data.descriptionEs, current.descriptionEs, current.descriptionEn);
      result = await prisma.processStep.update({
        where: { id },
        data: {
          titleEs: title?.es,
          titleEn: title?.en,
          descriptionEs: description?.es,
          descriptionEn: description?.en,
          sortOrder: data.sortOrder,
          status: data.status ? cleanStatus(data.status) : undefined,
        },
      });
    } else if (resource === "testimonial") {
      const data = testimonialDataSchema.parse(inputData);
      const current = await prisma.testimonial.findUniqueOrThrow({ where: { id } });
      const quote = await translatedIfChanged(data.quoteEs, current.quoteEs, current.quoteEn);
      result = await prisma.testimonial.update({
        where: { id },
        data: {
          author: cleanString(data.author, 160),
          role: cleanString(data.role, 160),
          company: cleanString(data.company, 160),
          quoteEs: quote?.es,
          quoteEn: quote?.en,
          photoUrl: data.removePhoto ? null : cleanString(data.photoUrl, 500),
          sortOrder: data.sortOrder,
          status: data.status ? cleanStatus(data.status) : undefined,
        },
      });
    } else if (resource === "inquiry") {
      const inquiryData = z.object({ status: inquiryStatusSchema }).parse(inputData);
      result = await prisma.contactInquiry.update({
        where: { id },
        data: { status: inquiryData.status },
      });
    } else if (resource === "user") {
      const permission = ensureCanManageUsers(actor.role);
      if (permission) return permission;
      const data = userUpdateDataSchema.parse(inputData);
      const nextStatus = data.status === "INACTIVE" ? UserStatus.INACTIVE : data.status === "ACTIVE" ? UserStatus.ACTIVE : undefined;
      const nextRole = data.role === "ADMIN" ? UserRole.ADMIN : data.role === "EDITOR" ? UserRole.EDITOR : undefined;
      const lastAdminError = await assertNotLastAdmin(id, nextStatus, nextRole);
      if (lastAdminError) return lastAdminError;
      const currentUser = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: { role: true, status: true },
      });
      result = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          role: nextRole,
          status: nextStatus,
          passwordHash: data.password ? await bcrypt.hash(data.password, 12) : undefined,
          deletedAt: nextStatus === UserStatus.ACTIVE ? null : undefined,
          deletedBy: nextStatus === UserStatus.INACTIVE ? actor.id : null,
        },
      });
      const losesAdminAccess =
        nextStatus === UserStatus.INACTIVE ||
        (nextRole !== undefined && nextRole !== UserRole.ADMIN && currentUser.role === UserRole.ADMIN) ||
        data.password !== undefined;

      if (losesAdminAccess) {
        await invalidateUserSessions(id);
      }
      await audit(
        actor.id,
        "USER_UPDATE",
        "User",
        result.id,
        `role=${nextRole ?? currentUser.role};status=${nextStatus ?? currentUser.status};passwordChanged=${Boolean(data.password)}`,
      );
    } else {
      return NextResponse.json({ error: "Recurso no soportado." }, { status: 400 });
    }

    if (resource !== "user") {
      await audit(actor.id, action === "soft-delete" ? "SOFT_DELETE" : "UPDATE", resource || "", result?.id);
    }
    return NextResponse.json({ ok: true, id: result?.id, resource: result, item: result });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "El registro solicitado no existe." }, { status: 404 });
    }
    return apiError(error, "No se pudo actualizar el registro.");
  }
}

async function updateSoftState(
  resource: Resource | undefined,
  id: string,
  data: { deletedAt: Date | null; deletedBy: string | null; status: PublishStatus },
) {
  if (resource === "project") return prisma.project.update({ where: { id }, data });
  if (resource === "service") return prisma.service.update({ where: { id }, data });
  if (resource === "category") return prisma.category.update({ where: { id }, data });
  if (resource === "processStep") return prisma.processStep.update({ where: { id }, data });
  if (resource === "client") return prisma.client.update({ where: { id }, data });
  if (resource === "testimonial") return prisma.testimonial.update({ where: { id }, data });
  throw new Error("Recurso no soportado para borrado lógico.");
}
