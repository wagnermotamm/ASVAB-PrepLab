"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "@/i18n/navigation";
import { AFQT, SUBJECT_NAMES } from "@/lib/labels";

type Summary = {
  answered?: number;
  correct?: number;
  incorrect?: number;
  accuracy?: number;
  timeMs?: number;
  averageMs?: number;
  hintRate?: number;
  assisted?: boolean;
  bySubject?: Record<string, { correct: number; total: number }>;
  afqt?: { accuracy: number | null; band: string; official: false };
  officialAfqt?: false;
};

function minutes(ms = 0) {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function ResultsView({ summary, assisted }: { summary: Record<string, unknown>; assisted?: boolean }) {
  const t = useTranslations();
  const data = summary as Summary;
  const rows = Object.entries(data.bySubject ?? {}).map(([subject, value]) => ({
    subject,
    accuracy: value.total ? Math.round((value.correct / value.total) * 100) : 0,
    afqt: AFQT.has(subject),
  }));
  const stats = [
    [t("results.answered"), data.answered ?? 0],
    [t("results.correct"), data.correct ?? 0],
    [t("results.incorrect"), data.incorrect ?? 0],
    [t("results.accuracy"), `${Math.round((data.accuracy ?? 0) * 100)}%`],
    [t("results.time"), minutes(data.timeMs)],
    [t("results.avg"), minutes(data.averageMs)],
    [t("results.hints"), `${Math.round((data.hintRate ?? 0) * 100)}%`],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">{t("results.title")}</h1>
      {(assisted || data.assisted) && <p className="text-brass">{t("simulator.assisted")}</p>}
      <dl className="grid gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-line bg-card p-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-2xl">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="rounded-3xl border border-accent/40 bg-card p-5">
        <h2 className="text-2xl">{t("results.afqtTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{t("results.afqtNote")}</p>
        <p className="mt-3 text-3xl">
          {data.afqt?.accuracy === null || data.afqt?.accuracy === undefined ? "—" : `${Math.round(data.afqt.accuracy * 100)}%`}
          <span className="ml-3 text-base text-muted">{data.afqt?.band}</span>
        </p>
      </section>
      <section>
        <h2 className="text-2xl">{t("results.subjects")}</h2>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <li key={row.subject} className={`rounded-xl border px-3 py-2 text-sm ${row.afqt ? "border-accent" : "border-line"}`}>
              {row.subject} · {SUBJECT_NAMES[row.subject]} · {row.accuracy}%
            </li>
          ))}
        </ul>
      </section>
      <Link href="/dashboard" className="inline-block text-accent">
        {t("nav.dashboard")}
      </Link>
    </div>
  );
}
