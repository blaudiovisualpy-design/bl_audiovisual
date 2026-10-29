import { prisma } from "@/lib/prisma";

export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details: details?.slice(0, 500),
    },
  });
}
