"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";
import { SUBJECT_NAMES } from "@/lib/labels";

const subjects = ["GS", "AR", "WK", "PC", "MK", "EI", "AI", "SI", "MC", "AO"];
const origins = ["ORIGINAL", "PDF_BASED", "OFFICIAL_RELEASED"] as const;

export function StudyForm({
  mode,
  title,
  body,
}: {
  mode: "PRACTICE_SUBJECT" | "MISTAKES" | "QUESTION_BANK";
  title: string;
  body: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(["GS"]);
  const [count, setCount] = useState(mode === "QUESTION_BANK" ? 20 : 10);
  const [difficulty, setDifficulty] = useState("");
  const [origin, setOrigin] = useState<(typeof origins)[number]>("ORIGINAL");
  const [timer, setTimer] = useState(false);
  const [hints, setHints] = useState(true);
  const [feedback, setFeedback] = useState<"immediate" | "end">("immediate");
  const [unseenOnly, setUnseenOnly] = useState(mode === "QUESTION_BANK");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError("");
    try {
      const created = await api<{ id: string }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode,
          subjects: mode === "QUESTION_BANK" && picked.length === 0 ? subjects : picked,
          count,
          difficulty: difficulty || undefined,
          origins: [origin],
          unseenOnly,
          timer,
          hints,
          feedback,
          locale,
        }),
      });
      router.push(`/exam/${created.id}`);
    } catch (reason) {
      const code = reason instanceof ApiError ? reason.message : "SERVER";
      if (reason instanceof ApiError && reason.status === 401) router.push("/login");
      setError(t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.SERVER"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-4xl">{title}</h1>
      <p className="text-muted">{body}</p>
      {mode !== "MISTAKES" && (
        <fieldset>
          <legend className="text-sm text-muted">{t("subjects")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <label key={subject} className="rounded-full border border-line px-3 py-1 text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={picked.includes(subject)}
                  onChange={() =>
                    setPicked((current) => (current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject]))
                  }
                />
                {subject} · {SUBJECT_NAMES[subject]}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <label className="block text-sm">
        {t("count")}
        <input className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" type="number" min={1} max={mode === "QUESTION_BANK" ? 20 : 50} value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </label>
      <label className="block text-sm">
        {t("difficulty")}
        <select className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="">{t("any")}</option>
          <option>EASY</option>
          <option>MEDIUM</option>
          <option>HARD</option>
        </select>
      </label>
      <label className="block text-sm">
        {t("origin")}
        <select className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" value={origin} onChange={(event) => setOrigin(event.target.value as (typeof origins)[number])}>
          {origins.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-4 text-sm">
        <label><input type="checkbox" checked={timer} onChange={(event) => setTimer(event.target.checked)} /> {t("timer")}</label>
        <label><input type="checkbox" checked={hints} onChange={(event) => setHints(event.target.checked)} /> {t("hints")}</label>
        <label><input type="checkbox" checked={unseenOnly} onChange={(event) => setUnseenOnly(event.target.checked)} /> {t("unseen")}</label>
      </div>
      <label className="block text-sm">
        {t("feedback")}
        <select className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" value={feedback} onChange={(event) => setFeedback(event.target.value as "immediate" | "end")}>
          <option value="immediate">{t("immediate")}</option>
          <option value="end">{t("end")}</option>
        </select>
      </label>
      {error && <p className="text-danger">{error}</p>}
      <button type="button" className="rounded-full bg-accent px-5 py-2 text-accent-foreground" disabled={busy} onClick={() => void start()}>
        {t("start")}
      </button>
    </div>
  );
}
