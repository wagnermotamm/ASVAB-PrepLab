import { z } from "zod";
import { requireStudyUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { createStudySession } from "@/server/sessions";

const schema = z.object({
  mode: z.enum(["PRACTICE_SUBJECT", "FULL_CAT", "CAT_ADAPTIVE", "PAPER_PENCIL", "QUESTION_BANK", "MISTAKES"]),
  subjects: z.array(z.enum(["GS", "AR", "WK", "PC", "MK", "EI", "AI", "SI", "MC", "AO"])).optional(),
  count: z.number().int().min(1).max(50).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  origins: z.array(z.enum(["OFFICIAL_RELEASED", "PDF_BASED", "ORIGINAL"])).default(["ORIGINAL"]),
  unseenOnly: z.boolean().optional(),
  timer: z.boolean().optional(),
  hints: z.boolean().optional(),
  feedback: z.enum(["immediate", "end"]).optional(),
});

export async function POST(request: Request) {
  return handle(async () => {
    const input = schema.parse(await request.json());
    const user = await requireStudyUser(true);
    if (user.guest && (input.mode === "MISTAKES" || input.unseenOnly)) throw new Error("UNAUTHENTICATED");
    const test = await createStudySession(user.id, input);
    return { id: test.id };
  });
}
