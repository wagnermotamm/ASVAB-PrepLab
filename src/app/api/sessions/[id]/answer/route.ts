import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { answerSession } from "@/server/sessions";

const schema = z.object({ optionId: z.string().min(1), locale: z.string().default("en") });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    return answerSession(user.id, id, body.optionId, body.locale);
  });
}
