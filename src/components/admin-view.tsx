"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";

type Stats = {
  bySubject: { subject: string; _count: number }[];
  byOrigin: { origin: string; _count: number }[];
  byStatus: { validationStatus: string; _count: number }[];
  pending: number;
  reports: { id: string; summary: unknown; createdAt: string }[];
};
type ImportPayload = {
  candidates: { id: string; page: number | null; subjectGuess: string | null; stemText: string | null; status: string; reason: string; source: { name: string } }[];
  reports: { id: string; summary: { found?: number; extracted?: number; imported?: number; rejected?: number; duplicates?: number; pending?: number; errors?: string[] }; createdAt: string }[];
};

export function AdminView() {
  const t = useTranslations();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [imported, setImported] = useState<ImportPayload | null>(null);
  const [duplicates, setDuplicates] = useState("");
  const [message, setMessage] = useState("");
  const [stem, setStem] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((reason: unknown) => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) router.push("/login");
      });
    api<ImportPayload>("/api/admin/import").then(setImported).catch(() => undefined);
  }, [router]);

  async function runImport() {
    setMessage(t("common.loading"));
    const result = await api<{ report: { summary: unknown } | null }>("/api/admin/import", { method: "POST" });
    setMessage(JSON.stringify(result.report?.summary ?? {}));
    setImported(await api<ImportPayload>("/api/admin/import"));
    setStats(await api<Stats>("/api/admin/stats"));
  }

  async function checkDuplicates() {
    const result = await api<{ exactGroups: string[][]; near: string[][]; compared: number }>("/api/admin/duplicates");
    setDuplicates(`${result.compared} compared · exact ${result.exactGroups.length} · near ${result.near.length}`);
  }

  async function createQuestion(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const filler = (locale: string, text: string) => ({ locale, fullExplanation: text, quickMethod: text, concept: "admin", optionAnalysis: { A: text } });
      await api("/api/admin/questions", {
        method: "POST",
        body: JSON.stringify({
          subject: "GS",
          stem,
          difficulty: "MEDIUM",
          origin: "ORIGINAL",
          topic: "admin",
          status: "PENDING_REVIEW",
          options: [
            { text: "Option A", isCorrect: true },
            { text: "Option B", isCorrect: false },
            { text: "Option C", isCorrect: false },
            { text: "Option D", isCorrect: false },
          ],
          explanations: [filler("en", stem), filler("pt-BR", stem), filler("es", stem)],
        }),
      });
      setMessage("PENDING_REVIEW");
      setStem("");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "SERVER");
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">{t("admin.title")}</h1>
      <section>
        <h2 className="text-2xl">{t("admin.volume")}</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {stats?.bySubject.map((row) => (
            <li key={row.subject} className="rounded-xl border border-line px-3 py-2">{row.subject} · {row._count}</li>
          ))}
          {stats?.byOrigin.map((row) => (
            <li key={row.origin} className="rounded-xl border border-line px-3 py-2">{row.origin} · {row._count}</li>
          ))}
          {stats?.byStatus.map((row) => (
            <li key={row.validationStatus} className="rounded-xl border border-line px-3 py-2">{row.validationStatus} · {row._count}</li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-line bg-card p-5">
        <h2 className="text-2xl">{t("admin.import")}</h2>
        <p className="mt-2 text-sm text-muted">{t("admin.importBody")}</p>
        <button type="button" className="mt-3 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground" onClick={() => void runImport()}>
          {t("admin.run")}
        </button>
        <button type="button" className="mt-3 ml-2 rounded-full border border-line px-4 py-2 text-sm" onClick={() => void checkDuplicates()}>
          {t("admin.duplicates")}
        </button>
        {duplicates && <p className="mt-3 text-sm">{duplicates}</p>}
        {message && <p className="mt-3 text-sm">{message}</p>}
        <h3 className="mt-4 text-lg">{t("admin.pending")}</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {imported?.candidates.map((row) => (
            <li key={row.id} className="rounded-xl border border-line p-3">
              <p className="text-xs text-muted">{row.source.name} · p. {row.page ?? "—"} · {row.status} · {row.reason}</p>
              <p className="mt-1">{row.stemText || "—"}</p>
            </li>
          ))}
        </ul>
      </section>
      <form onSubmit={createQuestion} className="space-y-3">
        <h2 className="text-2xl">{t("admin.create")}</h2>
        <textarea required minLength={10} className="w-full rounded-xl border border-line bg-card p-3" placeholder={t("admin.stem")} value={stem} onChange={(event) => setStem(event.target.value)} />
        <button className="rounded-full border border-line px-4 py-2 text-sm" type="submit">{t("common.save")}</button>
      </form>
    </div>
  );
}
