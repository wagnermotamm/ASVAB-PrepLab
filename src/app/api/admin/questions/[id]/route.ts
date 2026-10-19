import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";
import { handle } from "@/server/http";

const schema = z.object({
  validationStatus: z.enum(["DRAFT", "PENDING_REVIEW", "REJECTED", "VALIDATED"]).optional(),
  stem: z.string().min(10).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    const current = await prisma.question.findUnique({ where: { id }, include: { options: true, explanations: true } });
    if (!current) throw new AppError("NOT_FOUND", 404);
    if (body.validationStatus === "VALIDATED") {
      const { publishIssues } = await import("@/server/quality");
      const issues = publishIssues(current);
      if (issues.length) throw new AppError("QUALITY_GATE", 422, { issues });
    }
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(body.validationStatus ? { validationStatus: body.validationStatus } : {}),
        ...(body.stem ? { stem: body.stem } : {}),
        ...(body.validationStatus === "REJECTED" ? { rejectionReason: "Rejected by an administrator" } : {}),
      },
    });
    await prisma.auditLog.create({ data: { userId: admin.id, action: "QUESTION_UPDATED", detail: { id, ...body } } });
    return { id: question.id, validationStatus: question.validationStatus };
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await prisma.question.update({ where: { id }, data: { validationStatus: "REJECTED", rejectionReason: "Deactivated by an administrator" } });
    await prisma.auditLog.create({ data: { userId: admin.id, action: "QUESTION_DEACTIVATED", detail: { id } } });
    return { id, validationStatus: "REJECTED" };
  });
}
