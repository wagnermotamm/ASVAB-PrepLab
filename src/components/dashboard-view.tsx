"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";
import { AFQT, SUBJECT_NAMES } from "@/lib/labels";

type Progress = { subject: string; correct: number; incorrect: number; timeSpentMs: number };
type TestRow = { id: string; mode: string; status: string; startedAt: string; assisted: boolean };
type Data = {
  bankSize: number;
  answered: number;
  accuracy: number;
  studyMs: number;
  streak: number;
  due: number;
  recommendation: string | null;
  progress: Progress[];
  tests: TestRow[];
};

export function DashboardView() {
  const t = useTranslations();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    api<Data>("/api/dashboard")
      .then(setData)
      .catch((reason: unknown) => {
        if (reason instanceof ApiError && reason.status === 401) router.push("/login");
      });
  }, [router]);

  if (!data) return <p>{t("common.loading")}</p>;
  const chart = data.progress.map((row) => ({
    subject: row.subject,
    accuracy: row.correct + row.incorrect ? Math.round((row.correct / (row.correct + row.incorrect)) * 100) : 0,
  }));
  const cards = [
    [t("dashboard.answered"), data.answered],
    [t("dashboard.remaining"), Math.max(0, data.bankSize - data.answered)],
    [t("dashboard.accuracy"), `${Math.round(data.accuracy * 100)}%`],
    [t("dashboard.study"), `${Math.round(data.studyMs / 60000)} min`],
    [t("dashboard.streak"), data.streak],
    [t("dashboard.due"), data.due],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">{t("dashboard.title")}</h1>
      {data.answered === 0 && <p className="text-muted">{t("dashboard.none")}</p>}
      <dl className="grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-line bg-card p-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-2xl">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="rounded-3xl border border-line bg-card p-5">
        <h2 className="text-2xl">{t("dashboard.recommend")}</h2>
        <p className="mt-2 text-muted">{t("dashboard.recommendBody")}</p>
        {data.recommendation ? (
          <Link href="/practice" className="mt-3 inline-block rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">
            {data.recommendation} · {SUBJECT_NAMES[data.recommendation]}
          </Link>
        ) : (
          <p className="mt-3 text-sm text-muted">{t("dashboard.none")}</p>
        )}
      </section>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart}>
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line dataKey="accuracy" stroke="var(--accent)" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {data.progress.map((row) => (
          <li key={row.subject} className={`rounded-xl border px-3 py-2 text-sm ${AFQT.has(row.subject) ? "border-accent" : "border-line"}`}>
            {row.subject} · {SUBJECT_NAMES[row.subject]} · {row.correct}/{row.correct + row.incorrect}
          </li>
        ))}
      </ul>
      <section>
        <h2 className="text-2xl">{t("dashboard.history")}</h2>
        <ul className="mt-2 space-y-2">
          {data.tests.map((test) => (
            <li key={test.id}>
              <Link href={test.status === "COMPLETED" ? `/results/${test.id}` : `/exam/${test.id}`} className="text-sm">
                {test.mode} · {test.status} · {new Date(test.startedAt).toLocaleString()}
                {test.assisted ? " · assisted" : ""}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
