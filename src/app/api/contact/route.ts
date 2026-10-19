import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
});

export async function POST(request: Request) {
  return handle(async () => {
    const user = await getSession();
    const body = schema.parse(await request.json());
    await prisma.contactMessage.create({
      data: { userId: user?.id, name: body.name, email: body.email, message: body.message },
    });
    return { saved: true };
  });
}
