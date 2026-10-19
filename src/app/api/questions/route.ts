import { Prisma, type Origin, type Subject } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";

export async function GET(request: Request) {
  return handle(async () => {
    await requireUser();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const subject = url.searchParams.get("subject");
    const origin = url.searchParams.get("origin");
    const difficulty = url.searchParams.get("difficulty");
    const where: Prisma.QuestionWhereInput = { validationStatus: "VALIDATED" };
    if (subject) where.subject = subject as Subject;
    if (origin) where.origin = origin as Origin;
    if (difficulty) where.difficulty = difficulty as "EASY" | "MEDIUM" | "HARD";
    const take = 20;
    const [total, rows, counts] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        orderBy: { externalKey: "asc" },
        skip: (page - 1) * take,
        take,
        select: { id: true, externalKey: true, subject: true, stem: true, difficulty: true, origin: true, topic: true },
      }),
      prisma.question.groupBy({
        by: ["subject", "origin"],
        where: { validationStatus: "VALIDATED" },
        _count: true,
      }),
    ]);
    return { page, pages: Math.ceil(total / take), total, rows, counts };
  });
}
