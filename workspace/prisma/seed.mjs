import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import {
  InquiryStatus,
  MediaOrigin,
  MediaType,
  PrismaClient,
  PublishStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function loadAdminCredentials() {
  const defaults = {
    publicUrl: "http://localhost:3000",
    adminUrl: "http://localhost:3000/admin/login",
    name: "BL Audiovisual Admin",
    email: "admin@bl-audiovisual.local",
    password: "change-me-local-admin",
  };
  const credentialsPath = path.join(process.cwd(), "runtime", "ADMIN_LOCAL_CREDENTIALS.txt");

  try {
    const raw = await readFile(credentialsPath, "utf8");
    const values = new Map();

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }
      const [key, ...rest] = trimmed.split("=");
      values.set(key, rest.join("=").trim());
    }

    const legacyAdminUrl = values.get("ADMIN_URL") || defaults.adminUrl;
    const publicUrl = values.get("PUBLIC_URL") || normalizePublicUrl(legacyAdminUrl);
    const credentials = {
      publicUrl,
      adminUrl: values.get("ADMIN_URL") || `${publicUrl}/admin/login`,
      name: values.get("ADMIN_NAME") || defaults.name,
      email: values.get("ADMIN_EMAIL") || defaults.email,
      password: values.get("ADMIN_PASSWORD") || defaults.password,
    };

    if (!values.has("PUBLIC_URL") || !values.has("ADMIN_URL")) {
      await writeAdminCredentials(credentialsPath, credentials);
    }

    return credentials;
  } catch {
    await writeAdminCredentials(credentialsPath, defaults);
    return defaults;
  }
}

function normalizePublicUrl(rawUrl) {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return rawUrl.replace(/\/admin\/login\/?$/, "").replace(/\/+$/, "");
  }
}

async function writeAdminCredentials(credentialsPath, credentials) {
  await mkdir(path.dirname(credentialsPath), { recursive: true });
  await writeFile(
    credentialsPath,
    [
      "# Credenciales locales de desarrollo generadas para seed idempotente.",
      "# No usar en producción.",
      `PUBLIC_URL=${credentials.publicUrl}`,
      `ADMIN_URL=${credentials.adminUrl}`,
      `ADMIN_NAME=${credentials.name}`,
      `ADMIN_EMAIL=${credentials.email}`,
      `ADMIN_PASSWORD=${credentials.password}`,
      "",
    ].join("\n"),
    "utf8",
  );
}

const heroPosterUrl = "/assets/generated/bl-cinematic-hero.png";

async function seedAdmin() {
  const admin = await loadAdminCredentials();
  const passwordHash = await bcrypt.hash(admin.password, 12);

  return prisma.user.upsert({
    where: { email: admin.email },
    update: {
      name: admin.name,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      deletedAt: null,
      deletedBy: null,
    },
    create: {
      name: admin.name,
      email: admin.email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
}

async function main() {
  const admin = await seedAdmin();

  await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: {
      heroPosterUrl,
      whatsapp: "+5491112345678",
    },
    create: {
      id: "site",
      siteName: "BL Audiovisual",
      heroEyebrowEs: "Lanzamiento destacado",
      heroEyebrowEn: "Featured release",
      heroTitle: "BL AUDIOVISUAL",
      heroTextEs:
        "Historias que se ven, marcas que se sienten. Produccion audiovisual y fotografia con pulso cinematografico.",
      heroTextEn:
        "Stories you can see, brands you can feel. Film-led video production and photography.",
      aboutEs:
        "Somos una productora audiovisual enfocada en piezas comerciales, videoclips, contenido para marcas y fotografia editorial. Combinamos direccion creativa, produccion tecnica y postproduccion cuidada para que cada pieza tenga una identidad clara.",
      aboutEn:
        "We are an audiovisual studio focused on commercial films, music videos, branded content and editorial photography. We combine creative direction, technical production and refined post-production so every piece has a clear identity.",
      email: "contacto@bl-audiovisual.local",
      phone: "+54 9 11 1234 5678",
      whatsapp: "+5491112345678",
      instagram: "https://instagram.com/bl.audiovisual",
      youtube: "https://youtube.com/@blaudiovisual",
      locationEs: "Buenos Aires, Argentina",
      locationEn: "Buenos Aires, Argentina",
      heroPosterUrl,
      defaultLocale: "es",
    },
  });

  await prisma.mediaAsset.upsert({
    where: { id: "seed-hero-poster" },
    update: { url: heroPosterUrl, active: true, deletedAt: null },
    create: {
      id: "seed-hero-poster",
      type: MediaType.IMAGE,
      origin: MediaOrigin.LOCAL,
      url: heroPosterUrl,
      mimeType: "image/png",
      altEs: "Set cinematografico oscuro con camara y luz amarilla",
      altEn: "Dark cinematic set with camera and yellow accent light",
    },
  });

  const categories = [
    ["music-video", "Videoclips", "Music videos"],
    ["brand-film", "Contenido de marca", "Brand films"],
    ["photography", "Fotografia", "Photography"],
  ];

  const categoryBySlug = new Map();
  for (const [slug, nameEs, nameEn] of categories) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { nameEs, nameEn, status: PublishStatus.PUBLISHED },
      create: { slug, nameEs, nameEn, status: PublishStatus.PUBLISHED },
    });
    categoryBySlug.set(slug, category);
  }

  const projects = [
    {
      slug: "nocturna-reel",
      titleEs: "Nocturna Reel",
      titleEn: "Nocturna Reel",
      client: "BL Originals",
      category: "brand-film",
      descriptionEs:
        "Pieza manifiesto con luces practicas, movimiento de camara y montaje de alto impacto.",
      descriptionEn:
        "Manifesto film with practical lights, camera movement and a high-impact edit.",
      featured: true,
      year: 2026,
      sortOrder: 1,
    },
    {
      slug: "pulso-urbano",
      titleEs: "Pulso Urbano",
      titleEn: "Urban Pulse",
      client: "Demo Artist",
      category: "music-video",
      descriptionEs:
        "Videoclip con contraste nocturno, performance y ritmo visual orientado a redes.",
      descriptionEn:
        "Night contrast music video with performance-driven pacing for social channels.",
      featured: true,
      year: 2026,
      sortOrder: 2,
    },
    {
      slug: "marca-en-foco",
      titleEs: "Marca en Foco",
      titleEn: "Brand in Focus",
      client: "Studio Client",
      category: "photography",
      descriptionEs:
        "Sesion fotografica editorial para campana comercial con look premium.",
      descriptionEn:
        "Editorial photo session for a commercial campaign with a premium look.",
      featured: false,
      year: 2025,
      sortOrder: 3,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        titleEs: project.titleEs,
        titleEn: project.titleEn,
        descriptionEs: project.descriptionEs,
        descriptionEn: project.descriptionEn,
        client: project.client,
        featured: project.featured,
        sortOrder: project.sortOrder,
        posterUrl: heroPosterUrl,
        status: PublishStatus.PUBLISHED,
        deletedAt: null,
      },
      create: {
        slug: project.slug,
        titleEs: project.titleEs,
        titleEn: project.titleEn,
        descriptionEs: project.descriptionEs,
        descriptionEn: project.descriptionEn,
        client: project.client,
        year: project.year,
        videoProvider: "youtube",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        posterUrl: heroPosterUrl,
        posterAltEs: "Fotograma cinematografico de produccion audiovisual",
        posterAltEn: "Cinematic frame from an audiovisual production",
        featured: project.featured,
        sortOrder: project.sortOrder,
        status: PublishStatus.PUBLISHED,
        categoryId: categoryBySlug.get(project.category).id,
      },
    });
  }

  const services = [
    [
      "Produccion audiovisual",
      "Video production",
      "Direccion, rodaje y entrega de piezas comerciales, videoclips y contenido de campana.",
      "Creative direction, production and delivery for brand films, music videos and campaign content.",
    ],
    [
      "Fotografia",
      "Photography",
      "Retratos, producto, backstage y fotografia editorial para marcas y artistas.",
      "Portraits, product imagery, backstage coverage and editorial photography for brands and artists.",
    ],
    [
      "Edicion y postproduccion",
      "Editing and post-production",
      "Montaje, color, motion, sonido y adaptaciones para redes y pauta.",
      "Editing, color, motion, sound and format adaptations for social channels and media buys.",
    ],
    [
      "Eventos y marcas",
      "Events and brands",
      "Coberturas premium, aftermovies y contenidos verticales para activaciones.",
      "Premium event coverage, aftermovies and vertical content for brand activations.",
    ],
  ];

  for (const [titleEs, titleEn, descriptionEs, descriptionEn = descriptionEs] of services) {
    await prisma.service.upsert({
      where: { id: `service-${titleEn.toLowerCase().replaceAll(" ", "-")}` },
      update: { titleEs, titleEn, descriptionEs, descriptionEn, status: PublishStatus.PUBLISHED },
      create: {
        id: `service-${titleEn.toLowerCase().replaceAll(" ", "-")}`,
        titleEs,
        titleEn,
        descriptionEs,
        descriptionEn,
        icon: "play",
        status: PublishStatus.PUBLISHED,
      },
    });
  }

  const steps = [
    ["Preproduccion", "Pre-production", "Idea, guion, moodboard, plan de rodaje y equipo tecnico."],
    ["Rodaje", "Production", "Direccion en set, fotografia, sonido y control de material."],
    ["Postproduccion", "Post-production", "Edicion, color, sonido, motion y versiones por formato."],
    ["Entrega", "Delivery", "Master final, piezas sociales y acompanamiento para publicacion."],
  ];

  for (const [index, step] of steps.entries()) {
    const [titleEs, titleEn, descriptionEs] = step;
    await prisma.processStep.upsert({
      where: { id: `step-${index + 1}` },
      update: { titleEs, titleEn, descriptionEs, descriptionEn: descriptionEs, sortOrder: index + 1 },
      create: {
        id: `step-${index + 1}`,
        titleEs,
        titleEn,
        descriptionEs,
        descriptionEn: descriptionEs,
        sortOrder: index + 1,
      },
    });
  }

  for (const [index, name] of ["North Studio", "Luma Records", "Frame Lab", "Onda Club"].entries()) {
    await prisma.client.upsert({
      where: { id: `client-${index + 1}` },
      update: { name, sortOrder: index + 1, status: PublishStatus.PUBLISHED },
      create: { id: `client-${index + 1}`, name, sortOrder: index + 1 },
    });
  }

  await prisma.testimonial.upsert({
    where: { id: "testimonial-1" },
    update: { status: PublishStatus.PUBLISHED },
    create: {
      id: "testimonial-1",
      author: "Camila Torres",
      role: "Brand Manager",
      company: "North Studio",
      quoteEs:
        "El equipo entendio la identidad de la marca y la llevo a una pieza visual potente, lista para campana.",
      quoteEn:
        "The team understood the brand identity and turned it into a strong visual piece ready for campaign use.",
      sortOrder: 1,
    },
  });

  await prisma.contactInquiry.upsert({
    where: { id: "demo-inquiry-1" },
    update: { status: InquiryStatus.NEW },
    create: {
      id: "demo-inquiry-1",
      name: "Consulta Demo",
      email: "demo@cliente.local",
      service: "Produccion audiovisual",
      message: "Necesitamos cotizar un video comercial con entrega para redes.",
      locale: "es",
      status: InquiryStatus.NEW,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_FULL_CONTENT",
      entity: "Workspace",
      details: "Seeded admin, public content, settings, media and demo inquiry.",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
