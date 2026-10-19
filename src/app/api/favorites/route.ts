import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";

const schema = z.object({ questionId: z.string(), favorite: z.boolean() });

export async function POST(request: Request) {
  return handle(async () => {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    await prisma.userQuestionState.upsert({
      where: { userId_questionId: { userId: user.id, questionId: body.questionId } },
      create: { userId: user.id, questionId: body.questionId, favorite: body.favorite },
      update: { favorite: body.favorite },
    });
    return { ok: true };
  });
}
