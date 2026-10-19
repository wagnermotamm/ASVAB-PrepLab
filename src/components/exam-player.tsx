"use client";

import { HelpCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";
import { clockOffset, remainingFromDeadline } from "@/lib/exam";
import { SUBJECT_NAMES } from "@/lib/labels";
import { RichText } from "./rich-text";
import { ResultsView } from "./results-view";

type Option = { id: string; label: string; text: string; diagramSvg: string | null };
type View = {
  id: string;
  guest?: boolean;
  review: { order: number; subject: string; stem: string; selected: string | null; correct: string | null; isCorrect: boolean; explanation: string }[];
  mode: string;
  status: string;
  assisted: boolean;
  hintsEnabled: boolean;
  feedback: "immediate" | "end";
  canGoBack: boolean;
  index: number;
  total: number;
  section: { subject: string; order: number; questionCount: number; deadlineAt: string | null; serverNow: string; expired: boolean } | null;
  navigator: { order: number; answered: boolean; flagged: boolean }[];
  question: { id: string; subject: string; stem: string; passage: string | null; diagramSvg: string | null; terms: string[]; options: Option[] } | null;
  selectedOptionId: string | null;
  flagged: boolean;
  revealed: { correctOptionId: string | null; explanation: string; quickMethod: string; concept: string; analysis: Record<string, string> } | null;
  summary: Record<string, unknown> | null;
};

export function ExamPlayer({ id }: { id: string }) {
  const t = useTranslations();
  const x = useTranslations("experience");
  const locale = useLocale();
  const router = useRouter();
  const [view, setView] = useState<View | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [popover, setPopover] = useState<{ term: string; text: string } | null>(null);
  const [levels, setLevels] = useState<Record<string, string>>({});
  const [zoom, setZoom] = useState<string | null>(null);
  const expiredOnce = useRef(false);

  const load = useCallback(async () => {
    const data = await api<View>(`/api/sessions/${id}?locale=${locale}`);
    setView(data);
    setChoice(data.selectedOptionId);
    return data;
  }, [id, locale]);

  useEffect(() => {
    load().catch((reason: unknown) => {
      if (reason instanceof ApiError && reason.status === 401) router.push("/login");
      else setError(reason instanceof Error ? reason.message : "SERVER");
    });
  }, [load, router]);

  useEffect(() => {
    if (!view?.section?.deadlineAt) {
      setLeft(null);
      return;
    }
    const deadline = new Date(view.section.deadlineAt).getTime();
    const offset = clockOffset(new Date(view.section.serverNow).getTime(), Date.now());
    const tick = () => setLeft(remainingFromDeadline(deadline, offset, Date.now()));
    tick();
    const timer = window.setInterval(tick, 250);
    const onVisible = () => tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [view?.section?.deadlineAt, view?.section?.serverNow]);

  useEffect(() => {
    expiredOnce.current = false;
  }, [view?.section?.deadlineAt, view?.section?.order]);

  useEffect(() => {
    if (left !== null && left <= 0 && !expiredOnce.current) {
      expiredOnce.current = true;
      load().catch(() => undefined);
    }
  }, [left, load]);

  useEffect(() => {
    setPopover(null);
    setLevels({});
  }, [view?.question?.id]);

  async function post(path: string, body: object) {
    setBusy(true);
    setError("");
    try {
      const data = await api<View>(`/api/sessions/${id}/${path}`, {
        method: "POST",
        body: JSON.stringify({ locale, ...body }),
      });
      if ("status" in data) {
        setView({ ...data, guest: view?.guest });
        setChoice(data.selectedOptionId);
      }
      return data;
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "SERVER";
      setError(t.has(`common.errors.${code}`) ? t(`common.errors.${code}`) : t("common.errors.SERVER"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function openTerm(term: string) {
    const data = await post("hint", { kind: "VOCABULARY", term, enable: !view?.hintsEnabled });
    if (data && "explanation" in data) {
      setPopover({ term, text: String((data as { explanation?: string }).explanation ?? "") });
      setView(current => current ? { ...current, hintsEnabled: true, assisted: Boolean(data.assisted) } : current);
    }
  }

  async function openLevel(level: "QUICK" | "METHOD" | "STEP") {
    const data = await post("hint", { kind: "STRATEGY", level, enable: !view?.hintsEnabled });
    if (data && "explanation" in data) {
      setLevels((current) => ({ ...current, [level]: String((data as { explanation?: string }).explanation ?? "") }));
      if (view) setView({ ...view, hintsEnabled: true, assisted: Boolean(data.assisted) });
    }
  }

  async function openSolution() {
    const data = await post("hint", { kind: "SOLUTION", enable: true });
    if (data && "explanation" in data) {
      setLevels(current => ({ ...current, SOLUTION: String(data.explanation) }));
      setView(current => current ? { ...current, hintsEnabled: true, assisted: Boolean(data.assisted) } : current);
    }
  }

  async function submit() {
    if (!view?.question || !choice) return;
    if (view.revealed && view.feedback === "immediate") {
      await post("next", {});
      return;
    }
    await post("answer", { optionId: choice });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.altKey || event.ctrlKey || event.metaKey || busy) return;
      if (event.key === "Escape") {
        setPopover(null);
        setZoom(null);
      }
      if (!view?.question) return;
      const index = "1234abcd".indexOf(event.key.toLowerCase());
      const optionIndex = index >= 4 ? index - 4 : index;
      if (optionIndex >= 0 && view.question.options[optionIndex] && !view.revealed) {
        setChoice(view.question.options[optionIndex].id);
      }
      if (event.key.toLowerCase() === "n") void submit();
      if (event.key.toLowerCase() === "h" && view.hintsEnabled) void openLevel("QUICK");
      if (event.key.toLowerCase() === "f" && view.canGoBack) void post("flag", { flagged: !view.flagged });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!view) return <p>{error || t("common.loading")}</p>;
  if (view.status === "COMPLETED" && view.summary) return <div className="space-y-8"><ResultsView summary={view.summary} assisted={view.assisted} />{view.guest && <div className="help-panel"><p>{x("guestNote")}</p><Link href="/register" className="mt-3 inline-block font-semibold text-accent">{x("createAccount")} ↗</Link></div>}<section><h2 className="mb-4 text-2xl">{x("reviewTitle")}</h2>{view.review?.map(item => <details key={item.order} className="mb-3 rounded-xl border border-line bg-card p-4"><summary className="cursor-pointer">{item.order + 1}. {item.stem} <span className={item.isCorrect ? "text-ok" : "text-danger"}>{t(item.isCorrect ? "exam.correct" : "exam.incorrect")}</span></summary><p className="mt-3 text-sm">{x("answerLabel")}: {item.selected ?? x("noAnswer")}</p><p className="mt-2 text-sm font-medium">{x("correctAnswer")}: {item.correct}</p><p className="mt-3 text-sm leading-relaxed text-muted">{item.explanation}</p></details>)}</section></div>;

  const subject = view.question?.subject ?? view.section?.subject ?? "";
  const clock = left === null ? null : `${Math.floor(Math.max(0, left) / 60000)}:${String(Math.ceil(Math.max(0, left) / 1000) % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-3xl">
      {view.guest && <p className="mb-5 rounded-xl border border-line bg-card px-4 py-3 text-xs leading-relaxed text-muted">{x("guestNote")} <Link href="/login" className="font-semibold text-accent">{x("login")}</Link></p>}
      <div className="progress-track mb-5" role="progressbar" aria-label={t("exam.progress")} aria-valuenow={view.index} aria-valuemin={0} aria-valuemax={view.total}><div style={{ width: `${view.index / view.total * 100}%` }} /></div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>
          {subject} · {x.has(`subjects.${subject}.title`) ? x(`subjects.${subject}.title`) : SUBJECT_NAMES[subject] ?? subject}
        </p>
        <p>
          {t("exam.progress")} {Math.min(view.total, view.index + 1)} / {view.total}
          {clock ? ` · ${t("exam.remaining")} ${clock}` : ""}
        </p>
      </div>
      {view.section?.expired && <p className="mt-3 text-danger">{t("exam.expired")}</p>}
      {view.question && (
        <article className="mt-4 rounded-2xl border border-line bg-card p-5 md:p-8">
          {view.question.passage && (
            <p className="mb-4 leading-relaxed">
              <RichText text={view.question.passage} terms={view.question.terms} onTerm={(term) => void openTerm(term)} />
            </p>
          )}
          <h1 className="text-2xl leading-snug">
            <RichText text={view.question.stem} terms={view.question.terms} onTerm={(term) => void openTerm(term)} />
          </h1>
          <button type="button" className="help-button mt-3" disabled={busy} aria-expanded={Boolean(levels.SOLUTION)} onClick={() => void openSolution()}><HelpCircle size={18} />{x("solve")}</button>
          {levels.SOLUTION && <div className="help-panel" role="status">{levels.SOLUTION}</div>}
          {!view.hintsEnabled && <p className="mt-1 text-xs text-muted">{x("helpWarning")}</p>}
          {view.question.diagramSvg && (
            <figure className="mt-4">
              <div className="max-w-md" dangerouslySetInnerHTML={{ __html: view.question.diagramSvg }} />
              <button type="button" className="mt-2 text-sm text-accent" onClick={() => setZoom(view.question?.diagramSvg ?? null)}>
                {t("exam.enlarge")}
              </button>
            </figure>
          )}
          <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Choices">
            {view.question.options.map((option, index) => {
              const selected = choice === option.id;
              const correct = view.revealed?.correctOptionId === option.id;
              return (
                <div key={option.id} onClick={() => { if (!view.revealed && !busy) setChoice(option.id); }} className={`answer-row ${selected ? "is-selected" : ""} ${correct ? "is-correct" : ""} ${view.revealed && selected && !correct ? "is-incorrect" : ""}`}>
                  <button type="button" role="radio" aria-checked={selected} aria-label={`${option.label}. ${option.text}`} disabled={Boolean(view.revealed) || busy} className="answer-choice" onClick={() => setChoice(option.id)}>{option.label || String.fromCharCode(65 + index)}</button>
                  <div className="flex-1 py-3 pr-4"><RichText text={option.text} terms={view.question!.terms} onTerm={term => void openTerm(term)} />{option.diagramSvg && <span className="mt-2 block max-w-xs" dangerouslySetInnerHTML={{ __html: option.diagramSvg }} />}</div>
                </div>
              );
            })}
          </div>
          {view.revealed && (
            <div className="mt-5 rounded-2xl bg-background p-4 text-sm">
              <p className="font-medium">{view.revealed.correctOptionId === choice ? t("exam.correct") : t("exam.incorrect")}</p>
              <p className="mt-2">{view.revealed.explanation}</p>
              {view.revealed.quickMethod && <p className="mt-2 text-muted">{view.revealed.quickMethod}</p>}
              {view.revealed.concept && (
                <p className="mt-2">
                  <span className="text-muted">{t("exam.concept")}: </span>
                  {view.revealed.concept}
                </p>
              )}
              {Object.keys(view.revealed.analysis ?? {}).length > 0 && (
                <div className="mt-3">
                  <p className="text-muted">{t("exam.why")}</p>
                  <ul className="mt-1 list-disc pl-5">
                    {Object.entries(view.revealed.analysis).map(([label, text]) => (
                      <li key={label}>
                        {label}: {text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </article>
      )}
      {popover && (
        <div className="help-panel" role="status" aria-label={popover.term}>
          <div className="flex justify-between gap-3">
            <strong>{popover.term}</strong>
            <button type="button" onClick={() => setPopover(null)}>
              Esc
            </button>
          </div>
          <p className="mt-2 whitespace-pre-wrap">{popover.text}</p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {view.hintsEnabled ? (
          (["QUICK", "METHOD", "STEP"] as const).map((level, index) => (
            <button key={level} type="button" className="chip" disabled={busy || (level === "METHOD" && !levels.QUICK) || (level === "STEP" && !levels.METHOD)} onClick={() => void openLevel(level)}>
              {t(`exam.hint${index + 1}`)}
            </button>
          ))
        ) : (
          <button type="button" className="rounded-full border border-brass px-3 py-2 text-sm" onClick={() => void openLevel("QUICK")}>
            {t("exam.enable")}
          </button>
        )}
        {view.canGoBack && (
          <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => void post("flag", { flagged: !view.flagged })}>
            {t("exam.flag")}
          </button>
        )}
        <button type="button" className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground" disabled={!choice || busy} onClick={() => void submit()}>
          {view.revealed || view.feedback === "end" ? t("common.next") : x("check")}
        </button>
      </div>
      {Object.entries(levels).filter(([level]) => level !== "SOLUTION").map(([level, text]) => (
        <p key={level} className="mt-3 rounded-2xl bg-card p-4 text-sm">
          {text}
        </p>
      ))}
      {view.navigator.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1" aria-label="Questions">
          {view.navigator.map((item) => (
            <button
              key={item.order}
              type="button"
              className={`size-8 rounded-lg border text-xs ${item.order === view.index ? "border-accent" : "border-line"}`}
              onClick={() => void post("navigate", { order: item.order })}
            >
              {item.order + 1}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-3 text-danger">{error}</p>}
      <p className="mt-4 text-xs text-muted">{t("exam.keys")}</p>
      {view.assisted && <p className="mt-2 text-sm text-brass">{t("simulator.assisted")}</p>}
      <p className="mt-6">
        <Link href={view.guest ? "/practice" : "/dashboard"} className="text-sm text-muted">
          {view.guest ? x("continue") : t("nav.dashboard")}
        </Link>
      </p>
      {zoom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6" role="dialog">
          <button type="button" className="absolute top-4 right-4 text-white" onClick={() => setZoom(null)}>
            Esc
          </button>
          <div className="max-h-full max-w-4xl overflow-auto rounded-2xl bg-card p-4" dangerouslySetInnerHTML={{ __html: zoom }} />
        </div>
      )}
    </div>
  );
}
