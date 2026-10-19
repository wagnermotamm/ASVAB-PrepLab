"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";
import { SUBJECTS, type SubjectCode } from "@/lib/exam";
import { SubjectPicker } from "./subject-picker";
export function StudyForm({ mode, title, body }: { mode: "PRACTICE_SUBJECT" | "MISTAKES" | "QUESTION_BANK"; title: string; body: string }) {
  const t = useTranslations("common"); const x = useTranslations("experience"); const locale = useLocale(); const router = useRouter();
  const [picked, setPicked] = useState<SubjectCode[]>([...SUBJECTS]); const [count, setCount] = useState(mode === "QUESTION_BANK" ? 20 : 10);
  const [difficulty, setDifficulty] = useState(""); const [timer, setTimer] = useState(false); const [hints, setHints] = useState(true);
  const [feedback, setFeedback] = useState<"immediate" | "end">("immediate"); const [unseenOnly, setUnseenOnly] = useState(false);
  const [signedIn, setSignedIn] = useState(false); const [accountLoaded, setAccountLoaded] = useState(false);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ user: unknown }>("/api/auth/me").then(r => setSignedIn(Boolean(r.user))).catch(() => undefined).finally(() => setAccountLoaded(true)); }, []);
  const total = mode === "MISTAKES" ? count : Math.max(count, picked.length);
  async function start() {
    if (busy) return;
    if (mode !== "MISTAKES" && !picked.length) { setError(x("chooseOne")); return; }
    setBusy(true); setError("");
    try {
      const created = await api<{ id: string }>("/api/sessions", { method: "POST", body: JSON.stringify({ mode, subjects: picked, count: total, difficulty: difficulty || undefined, origins: ["ORIGINAL"], unseenOnly: signedIn && unseenOnly, timer, hints, feedback, locale }) });
      router.push(`/exam/${created.id}`);
    } catch (reason) {
      const code = reason instanceof ApiError ? reason.message : "SERVER";
      if (reason instanceof ApiError && reason.status === 401) router.push("/login");
      setError(t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.SERVER")); setBusy(false);
    }
  }
  return <div className="space-y-8">
    <div className="max-w-2xl"><span className="eyebrow">ASVAB / {x("practice")}</span><h1 className="mt-3 text-4xl md:text-5xl">{mode === "PRACTICE_SUBJECT" ? x("selectionTitle") : title}</h1><p className="mt-4 leading-relaxed text-muted">{mode === "PRACTICE_SUBJECT" ? x("selectionBody") : body}</p></div>
    <div className="study-layout"><div>
      {mode !== "MISTAKES" && <fieldset><legend className="mb-4 text-lg font-semibold">{t("subjects")}</legend><SubjectPicker picked={picked} onChange={setPicked} /></fieldset>}
      <details className="mt-6 rounded-2xl border border-line bg-card p-5"><summary className="font-medium">{x("settings")}</summary><div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm">{t("difficulty")}<select className="mt-2 w-full rounded-lg border border-line bg-card p-3" value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="">{t("any")}</option><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></label>
        <label className="text-sm">{t("feedback")}<select className="mt-2 w-full rounded-lg border border-line bg-card p-3" value={feedback} onChange={e => setFeedback(e.target.value as "immediate" | "end")}><option value="immediate">{t("immediate")}</option><option value="end">{t("end")}</option></select></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={timer} onChange={e => setTimer(e.target.checked)} />{t("timer")}</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hints} onChange={e => setHints(e.target.checked)} />{t("hints")}</label>
        {signedIn && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unseenOnly} onChange={e => setUnseenOnly(e.target.checked)} />{t("unseen")}</label>}
      </div></details>
    </div><aside className="study-sidebar">
      <Layers3 size={25} className="text-accent" /><h2 className="mt-4 text-xl">{x("sessionSummary")}</h2>
      <p className="mt-2 text-sm text-muted">{mode !== "MISTAKES" && `${picked.length} ${t("subjects")} · `}{x("interleaved")}</p>
      <fieldset className="mt-6"><legend className="mb-3 text-sm font-medium">{x("length")}</legend><div className="flex flex-wrap gap-2">{(mode === "QUESTION_BANK" ? [10,20] : [10,20,30,50]).map(n => <button type="button" key={n} aria-pressed={count === n} className={`chip ${count === n ? "border-accent bg-accent/10 text-accent" : ""}`} onClick={() => setCount(n)}>{n}</button>)}</div></fieldset>
      <p className="my-5 text-3xl font-medium">{total} <span className="text-sm font-normal text-muted">{x("questions")}</span></p>
      {timer && <p className="mb-4 text-sm text-muted">~{Math.max(5,total)} {x("minutes")}</p>}
      {error && <p role="alert" className="mb-4 text-sm text-danger">{error}</p>}
      <button type="button" className="btn-primary w-full" disabled={busy || !accountLoaded || (mode !== "MISTAKES" && !picked.length)} onClick={() => void start()}>{x(busy ? "starting" : "start")}<ArrowRight size={16} /></button>
      {!signedIn && <div className="mt-5 border-t border-line pt-5 text-xs leading-relaxed text-muted"><p>{x("accountBody")}</p><Link href="/login" className="mt-3 inline-block font-semibold text-accent">{x("login")} ↗</Link></div>}
    </aside></div>
  </div>;
}
