"use client";
import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { RichText } from "./rich-text";
import { dbLocale } from "@/lib/locale";
export type DemoQuestion = {
  subject: string; stem: string; diagramSvg: string | null;
  options: { text: string; label: string; isCorrect: boolean }[];
  explanations: { locale: string; fullExplanation: string }[];
  vocabulary: Record<string, Record<string, string>>;
};
export function HomeDemo({ questions }: { questions: DemoQuestion[] }) {
  const t = useTranslations("experience"); const exam = useTranslations("exam"); const language = dbLocale(useLocale());
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState<Record<number, number>>({});
  const [choice, setChoice] = useState<number | null>(null); const [help, setHelp] = useState(false); const [term, setTerm] = useState<string | null>(null);
  const question = questions[index]; const answered = answers[index] !== undefined; const complete = index >= questions.length;
  const score = Object.entries(answers).filter(([i, answer]) => questions[Number(i)].options[answer].isCorrect).length;
  function reset() { setIndex(0); setAnswers({}); setChoice(null); setHelp(false); setTerm(null); }
  return <section id="try-it" className="demo-section scroll-mt-24" aria-labelledby="demo-title">
    <div className="demo-intro">
      <span className="eyebrow">PREPLAB / 01</span><h2 id="demo-title" className="mt-4 text-3xl md:text-4xl">{t("demoTitle")}</h2>
      <p className="mt-4 leading-relaxed text-muted">{t("demoBody")}</p>
      <div className="mt-7 flex gap-2" aria-label={`${Math.min(index + 1, 5)}/5`}>
        {questions.map((_, i) => <span key={i} className={`grid size-9 place-items-center rounded-full border text-sm ${answers[i] !== undefined ? "border-accent bg-accent text-accent-foreground" : i === index ? "border-accent text-accent" : "border-line text-muted"}`}>{answers[i] !== undefined ? <CheckCircle2 size={16} /> : i + 1}</span>)}
      </div><p className="mt-6 text-sm text-muted">{t("step2Body")}</p>
    </div>
    <div className="demo-question">
      {complete ? <div className="py-10 text-center" aria-live="polite"><CheckCircle2 className="mx-auto size-12 text-accent" /><h3 className="mt-4 text-3xl">{t("finished")}</h3><p className="mt-3 text-xl">{score}/5 {t("result")}</p><Link href="/practice" className="btn-primary mt-6">{t("continue")}<ArrowRight size={17} /></Link><button type="button" className="mx-auto mt-4 flex items-center gap-2 text-sm text-muted" onClick={reset}><RotateCcw size={15} />{t("restart")}</button></div> : <>
        <div className="mb-5 flex items-center justify-between gap-3"><span className="pill">{t(`subjects.${question.subject}.title`)}</span><span className="text-xs tabular-nums text-muted">0{index + 1} / 05</span></div>
        <h3 className="text-xl leading-relaxed"><RichText text={question.stem} terms={Object.keys(question.vocabulary)} onTerm={setTerm} /></h3>
        {question.diagramSvg && <div className="my-4 max-w-xs" dangerouslySetInnerHTML={{ __html: question.diagramSvg }} />}
        <div className="mt-5 space-y-2" role="radiogroup" aria-label={t("check")}>
          {question.options.map((option, i) => <div key={option.label} onClick={() => { if (!answered) setChoice(i); }} className={`answer-row ${choice === i ? "is-selected" : ""} ${answered && option.isCorrect ? "is-correct" : ""} ${answered && choice === i && !option.isCorrect ? "is-incorrect" : ""}`}>
            <button type="button" role="radio" aria-checked={choice === i} aria-label={`${option.label}. ${option.text}`} disabled={answered} className="answer-choice" onClick={() => setChoice(i)}>{option.label}</button>
            <div className="flex-1 py-3 pr-4"><RichText text={option.text} terms={Object.keys(question.vocabulary)} onTerm={setTerm} /></div>
          </div>)}
        </div>
        {term && <div className="help-panel" role="status"><div className="flex justify-between gap-3"><strong>{term}</strong><button type="button" onClick={() => setTerm(null)} className="text-xs text-muted">{t("close")}</button></div><p className="mt-2">{question.vocabulary[term]?.[language] ?? question.vocabulary[term]?.en}</p></div>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button type="button" className="help-button" aria-expanded={help} onClick={() => setHelp(!help)}><HelpCircle size={18} />{t("solve")}</button>
          <button type="button" className="btn-primary" disabled={choice === null} onClick={() => { if (!answered && choice !== null) setAnswers({ ...answers, [index]: choice }); else { setIndex(index + 1); setChoice(null); setHelp(false); setTerm(null); } }}>{t(answered ? "next" : "check")}<ArrowRight size={16} /></button>
        </div>
        {(answered || help) && <div className="help-panel" aria-live="polite">{answered && <p className="mb-2 font-semibold">{exam(question.options[answers[index]].isCorrect ? "correct" : "incorrect")}</p>}<p>{question.explanations.find(e => e.locale === language)?.fullExplanation}</p></div>}
      </>}
    </div>
  </section>;
}
