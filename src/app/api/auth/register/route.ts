import { z } from "zod";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";
import { handle } from "@/server/http";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(80),
  locale: z.string().default("en"),
});

export async function POST(request: Request) {
  return handle(async () => {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("EMAIL_IN_USE", 409);
    const user = await prisma.user.create({
      data: { name: body.name, email, passwordHash: await hashPassword(body.password), locale: body.locale },
    });
    await setSessionCookie({ id: user.id, name: user.name, email: user.email, role: user.role, locale: user.locale });
    return { id: user.id };
  });
}
