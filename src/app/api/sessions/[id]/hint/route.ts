import { z } from "zod";
import { requireStudyUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { useHint } from "@/server/sessions";

const schema = z.object({
  kind: z.enum(["VOCABULARY", "STRATEGY", "SOLUTION"]),
  term: z.string().optional(),
  level: z.enum(["QUICK", "METHOD", "STEP"]).optional(),
  enable: z.boolean().optional(),
  locale: z.string().default("en"),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireStudyUser();
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    return useHint(user.id, id, body.locale, body);
  });
}
