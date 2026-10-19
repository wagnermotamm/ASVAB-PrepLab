import { requireUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { getSessionView } from "@/server/sessions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const locale = new URL(request.url).searchParams.get("locale") ?? user.locale;
    return getSessionView(user.id, id, locale);
  });
}
