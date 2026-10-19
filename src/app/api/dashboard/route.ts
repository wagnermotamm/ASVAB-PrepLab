import { requireUser } from "@/lib/auth";
import { handle } from "@/server/http";
import { dashboardFor } from "@/server/sessions";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    return dashboardFor(user.id);
  });
}
