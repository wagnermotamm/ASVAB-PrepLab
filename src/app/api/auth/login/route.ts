import { z } from "zod";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";
import { AppError } from "@/server/errors";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(request: Request) {
  return handle(async () => {
    const body = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new AppError("INVALID_LOGIN", 401);
    }
    await setSessionCookie({ id: user.id, name: user.name, email: user.email, role: user.role, locale: user.locale });
    return { id: user.id, name: user.name, role: user.role };
  });
}
