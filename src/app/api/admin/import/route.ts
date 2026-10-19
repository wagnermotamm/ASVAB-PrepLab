import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/server/http";

const exec = promisify(execFile);

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const [candidates, reports] = await Promise.all([
      prisma.importCandidate.findMany({ orderBy: { detectedAt: "desc" }, take: 100, include: { source: true } }),
      prisma.importReport.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
    return { candidates, reports };
  });
}

export async function POST() {
  return handle(async () => {
    const admin = await requireAdmin();
    const root = process.cwd();
    await exec("python", ["scripts/import_pdfs.py"], { cwd: root });
    await exec("npx", ["tsx", "scripts/load-quarantine.ts"], { cwd: root, shell: true });
    await prisma.auditLog.create({ data: { userId: admin.id, action: "PDF_IMPORT", detail: { path: path.join(root, "docs") } } });
    const report = await prisma.importReport.findFirst({ orderBy: { createdAt: "desc" } });
    return { report };
  });
}
