import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { continueSession } from "@/server/sessions";

const schema = z.object({ locale: z.string().default("en") });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    return continueSession(user.id, id, body.locale);
  });
}
