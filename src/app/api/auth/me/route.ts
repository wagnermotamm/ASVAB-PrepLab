import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";
import { z } from "zod";

export async function GET() {
  return handle(async () => ({ user: await getSession() }));
}

const schema = z.object({ locale: z.enum(["en", "br", "es"]) });

export async function PATCH(request: Request) {
  return handle(async () => {
    const user = await getSession();
    if (!user) return { user: null };
    const body = schema.parse(await request.json());
    const updated = await prisma.user.update({ where: { id: user.id }, data: { locale: body.locale } });
    return { user: { id: updated.id, locale: updated.locale } };
  });
}
