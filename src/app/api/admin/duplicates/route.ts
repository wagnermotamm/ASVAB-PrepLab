import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";
import { isNearDuplicate } from "@/server/quality";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const rows = await prisma.question.findMany({
      where: { validationStatus: "VALIDATED" },
      select: { id: true, externalKey: true, subject: true, normalizedStem: true },
    });
    const exact = new Map<string, string[]>();
    for (const row of rows) {
      const list = exact.get(row.normalizedStem) ?? [];
      list.push(row.externalKey);
      exact.set(row.normalizedStem, list);
    }
    const exactGroups = [...exact.values()].filter((group) => group.length > 1);
    const near: string[][] = [];
    const bySubject = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = bySubject.get(row.subject) ?? [];
      list.push(row);
      bySubject.set(row.subject, list);
    }
    for (const group of bySubject.values()) {
      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          if (group[i].normalizedStem === group[j].normalizedStem) continue;
          if (isNearDuplicate(group[i].normalizedStem, group[j].normalizedStem)) {
            near.push([group[i].externalKey, group[j].externalKey]);
          }
        }
      }
    }
    return { exactGroups, near: near.slice(0, 50), compared: rows.length };
  });
}
