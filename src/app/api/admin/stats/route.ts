import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const [bySubject, byOrigin, byStatus, reports, pending] = await Promise.all([
      prisma.question.groupBy({ by: ["subject"], _count: true }),
      prisma.question.groupBy({ by: ["origin"], _count: true }),
      prisma.question.groupBy({ by: ["validationStatus"], _count: true }),
      prisma.importReport.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.importCandidate.count(),
    ]);
    return { bySubject, byOrigin, byStatus, reports, pending };
  });
}
