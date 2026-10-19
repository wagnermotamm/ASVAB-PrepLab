import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";
import { handle } from "@/server/http";
import { publishIssues, stemHash, normalizeStem, isNearDuplicate } from "@/server/quality";

const optionSchema = z.object({ text: z.string().min(1), isCorrect: z.boolean(), diagramSvg: z.string().nullable().optional() });
const explanationSchema = z.object({
  locale: z.string(),
  fullExplanation: z.string(),
  quickMethod: z.string().default(""),
  concept: z.string().default(""),
  optionAnalysis: z.record(z.string()).default({}),
});
const schema = z.object({
  subject: z.enum(["GS", "AR", "WK", "PC", "MK", "EI", "AI", "SI", "MC", "AO"]),
  stem: z.string().min(10),
  passage: z.string().nullable().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  origin: z.enum(["OFFICIAL_RELEASED", "PDF_BASED", "ORIGINAL"]),
  topic: z.string().min(2),
  options: z.array(optionSchema).min(4),
  explanations: z.array(explanationSchema).min(3),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "REJECTED", "VALIDATED"]).default("PENDING_REVIEW"),
});

export async function GET(request: Request) {
  return handle(async () => {
    await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const status = url.searchParams.get("status");
    const where: Prisma.QuestionWhereInput = status ? { validationStatus: status as "VALIDATED" } : {};
    const take = 25;
    const [total, rows] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
        include: { options: true },
      }),
    ]);
    return { total, page, rows };
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const admin = await requireAdmin();
    const body = schema.parse(await request.json());
    const issues = publishIssues(body);
    if (body.status === "VALIDATED" && issues.length) throw new AppError("QUALITY_GATE", 422, { issues });
    const normalized = normalizeStem(body.stem);
    const peers = await prisma.question.findMany({
      where: { subject: body.subject, validationStatus: "VALIDATED" },
      select: { id: true, normalizedStem: true },
    });
    if (peers.some((peer) => isNearDuplicate(peer.normalizedStem, normalized))) {
      throw new AppError("DUPLICATE", 409);
    }
    const labels = ["A", "B", "C", "D", "E"];
    const question = await prisma.question.create({
      data: {
        externalKey: `admin-${Date.now()}`,
        subject: body.subject,
        stem: body.stem,
        passage: body.passage ?? null,
        difficulty: body.difficulty,
        origin: body.origin,
        topic: body.topic,
        validationStatus: body.status,
        rejectionReason: issues.join(",") || null,
        stemHash: stemHash(body.stem),
        normalizedStem: normalized,
        sourceRef: "Admin entry",
        options: { create: body.options.map((option, index) => ({ label: labels[index], text: option.text, isCorrect: option.isCorrect, order: index, diagramSvg: option.diagramSvg })) },
        explanations: { create: body.explanations },
      },
    });
    await prisma.auditLog.create({ data: { userId: admin.id, action: "QUESTION_CREATED", detail: { id: question.id, status: body.status } } });
    return { id: question.id };
  });
}
