import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const live = {
  status: "PUBLISHED" as const,
  deletedAt: null,
};

export async function getPublicContent() {
  const [settings, categories, projects, services, processSteps, clients, testimonials] =
    await Promise.all([
      prisma.siteSetting.findUnique({ where: { id: "site" } }),
      prisma.category.findMany({
        where: live,
        orderBy: [{ sortOrder: "asc" }, { nameEs: "asc" }],
      }),
      prisma.project.findMany({
        where: live,
        include: { category: true },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.service.findMany({
        where: live,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.processStep.findMany({
        where: live,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.client.findMany({
        where: live,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.testimonial.findMany({
        where: live,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

  return {
    settings,
    categories,
    projects,
    services,
    processSteps,
    clients,
    testimonials,
  };
}

export async function getAdminData(role: UserRole) {
  const canReadSensitiveAdminData = role === UserRole.ADMIN;
  const [
    settings,
    categories,
    projects,
    services,
    processSteps,
    clients,
    testimonials,
    inquiries,
    users,
    auditLogs,
  ] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: "site" } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { nameEs: "asc" }] }),
    prisma.project.findMany({
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
    prisma.processStep.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
    prisma.client.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
    prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" } }),
    canReadSensitiveAdminData
      ? prisma.user.findMany({
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        })
      : Promise.resolve([]),
    canReadSensitiveAdminData
      ? prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    settings,
    categories,
    projects,
    services,
    processSteps,
    clients,
    testimonials,
    inquiries,
    users,
    auditLogs,
  };
}
