"use client";

import { use, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ResultsView } from "@/components/results-view";
import { api } from "@/lib/client";
import { useRouter } from "@/i18n/navigation";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [assisted, setAssisted] = useState(false);

  useEffect(() => {
    api<{ status: string; assisted: boolean; summary: Record<string, unknown> | null }>(`/api/sessions/${id}?locale=${locale}`)
      .then((data) => {
        if (data.status !== "COMPLETED" || !data.summary) router.push(`/exam/${id}`);
        else {
          setSummary(data.summary);
          setAssisted(data.assisted);
        }
      })
      .catch(() => router.push("/login"));
  }, [id, locale, router]);

  if (!summary) return <p>{t("common.loading")}</p>;
  return <ResultsView summary={summary} assisted={assisted} />;
}
