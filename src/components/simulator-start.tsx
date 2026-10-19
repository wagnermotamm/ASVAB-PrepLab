"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";

const modes = [
  ["FULL_CAT", "cat", "catBody"],
  ["CAT_ADAPTIVE", "adaptive", "adaptiveBody"],
  ["PAPER_PENCIL", "paper", "paperBody"],
] as const;

export function SimulatorStart() {
  const t = useTranslations();
  const router = useRouter();
  const [official, setOfficial] = useState(false);
  const [error, setError] = useState("");

  async function start(mode: (typeof modes)[number][0]) {
    setError("");
    try {
      const created = await api<{ id: string }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode,
          origins: official ? ["OFFICIAL_RELEASED"] : ["ORIGINAL"],
        }),
      });
      router.push(`/exam/${created.id}`);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        router.push("/login");
        return;
      }
      const code = reason instanceof Error ? reason.message : "SERVER";
      setError(t.has(`common.errors.${code}`) ? t(`common.errors.${code}`) : t("common.errors.SERVER"));
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-4xl">{t("simulator.title")}</h1>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={official} onChange={(event) => setOfficial(event.target.checked)} />
        {t("simulator.officialOnly")}
      </label>
      {error && <p className="text-danger">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {modes.map(([mode, title, body]) => (
          <article key={mode} className="flex flex-col rounded-3xl border border-line bg-card p-5">
            <h2 className="text-2xl">{t(`simulator.${title}`)}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{t(`simulator.${body}`)}</p>
            <button type="button" className="mt-4 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground" onClick={() => void start(mode)}>
              {t("common.start")}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
