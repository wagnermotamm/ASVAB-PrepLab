import { clearSessionCookie } from "@/lib/auth";
import { handle } from "@/server/http";

export async function POST() {
  return handle(async () => {
    await clearSessionCookie();
    return { ok: true };
  });
}
