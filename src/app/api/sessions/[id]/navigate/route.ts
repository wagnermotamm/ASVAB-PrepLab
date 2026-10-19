import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { moveSession } from "@/server/sessions";

const schema = z.object({ order: z.number().int().min(0), locale: z.string().default("en") });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    return moveSession(user.id, id, body.order, body.locale);
  });
}
