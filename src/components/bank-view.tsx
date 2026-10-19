"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";
import { SUBJECT_NAMES } from "@/lib/labels";
import { StudyForm } from "./study-form";

type Row = { id: string; externalKey: string; subject: string; stem: string; difficulty: string; origin: string };
type Payload = { total: number; page: number; pages: number; rows: Row[]; counts: { subject: string; origin: string; _count: number }[] };

export function BankView() {
  const t = useTranslations();
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [subject, setSubject] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (origin) params.set("origin", origin);
    if (subject) params.set("subject", subject);
    api<Payload>(`/api/questions?${params}`)
      .then(setData)
      .catch((reason: unknown) => {
        if (reason instanceof ApiError && reason.status === 401) router.push("/login");
        else setError(reason instanceof Error ? reason.message : "SERVER");
      });
  }, [origin, page, router, subject]);

  return (
    <div className="space-y-8">
      <StudyForm mode="QUESTION_BANK" title={t("bank.title")} body={t("bank.body")} />
      <div className="flex flex-wrap gap-3">
        <select className="rounded-xl border border-line bg-card px-3 py-2" value={subject} onChange={(event) => { setPage(1); setSubject(event.target.value); }}>
          <option value="">{t("common.any")}</option>
          {Object.keys(SUBJECT_NAMES).filter((item) => item !== "AS").map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select className="rounded-xl border border-line bg-card px-3 py-2" value={origin} onChange={(event) => { setPage(1); setOrigin(event.target.value); }}>
          <option value="">{t("common.any")}</option>
          <option value="ORIGINAL">ORIGINAL</option>
          <option value="PDF_BASED">PDF_BASED</option>
          <option value="OFFICIAL_RELEASED">OFFICIAL_RELEASED</option>
        </select>
      </div>
      {origin === "OFFICIAL_RELEASED" && data?.total === 0 && <p>{t("bank.emptyOfficial")}</p>}
      {error && <p className="text-danger">{error}</p>}
      <p className="text-sm text-muted">{data ? `${data.total}` : ""}</p>
      <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
        {(data?.counts ?? []).map((row) => (
          <li key={`${row.subject}-${row.origin}`} className="rounded-xl border border-line px-3 py-2">
            {row.subject} · {row.origin} · {row._count}
          </li>
        ))}
      </ul>
      <ul className="space-y-3">
        {data?.rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-line bg-card p-4">
            <p className="text-xs text-muted">{row.subject} · {row.origin} · {row.difficulty}</p>
            <p className="mt-1">{row.stem}</p>
          </li>
        ))}
      </ul>
      {data && data.pages > 1 && (
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-line px-3 py-1" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>←</button>
          <span className="text-sm">{data.page} / {data.pages}</span>
          <button type="button" className="rounded-full border border-line px-3 py-1" disabled={page >= data.pages} onClick={() => setPage((value) => value + 1)}>→</button>
        </div>
      )}
    </div>
  );
}
