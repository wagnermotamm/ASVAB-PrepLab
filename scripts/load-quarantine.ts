import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Item = {
  fileName: string;
  page: number;
  subjectGuess: string | null;
  excerpt: string;
  hash: string;
  reason: string;
};

async function main() {
  const file = path.join(process.cwd(), "content", "quarantine.json");
  const payload = JSON.parse(readFileSync(file, "utf8")) as { summary: Record<string, unknown>; items: Item[] };
  const sources = await prisma.source.findMany({ where: { fileName: { not: null } } });
  const byFile = new Map(sources.map((source) => [source.fileName, source.id]));
  await prisma.importCandidate.deleteMany({ where: { sourceId: { in: [...byFile.values()] } } });
  let stored = 0;
  for (const item of payload.items) {
    const sourceId = byFile.get(item.fileName);
    if (!sourceId) continue;
    await prisma.importCandidate.create({
      data: {
        sourceId,
        page: item.page,
        subjectGuess: item.subjectGuess,
        stemText: item.excerpt,
        stemHash: item.hash,
        status: "QUARANTINE",
        reason: item.reason,
      },
    });
    stored += 1;
  }
  const report = await prisma.importReport.create({
    data: {
      summary: { ...payload.summary, stored, published: 0 },
    },
  });
  console.log(JSON.stringify({ report: report.id, stored, published: 0 }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
