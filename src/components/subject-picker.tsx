"use client";
import { Atom, BookOpen, Calculator, Car, Check, ChevronDown, Cog, Hammer, Puzzle, Sigma, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { AFQT_SUBJECTS, CAT_SECTIONS, SUBJECTS, type SubjectCode } from "@/lib/exam";
const icons = { GS: Atom, AR: Calculator, WK: BookOpen, PC: BookOpen, MK: Sigma, EI: Zap, AI: Car, SI: Hammer, MC: Cog, AO: Puzzle };
export function SubjectPicker({ picked, onChange }: { picked?: string[]; onChange?: (subjects: SubjectCode[]) => void }) {
  const t = useTranslations("experience");
  return <div>
    {onChange && <div className="mb-5 flex flex-wrap items-center gap-2">
      <button type="button" className="chip" onClick={() => onChange([...SUBJECTS])}>{t("selectAll")}</button>
      <button type="button" className="chip" onClick={() => onChange([...AFQT_SUBJECTS])}>{t("afqtOnly")}</button>
      <button type="button" className="chip" onClick={() => onChange([])}>{t("clear")}</button>
      <span className="ml-auto text-sm text-muted" aria-live="polite">{picked?.length ?? 0}/10 {t("selected")}</span>
    </div>}
    <div className="grid gap-3 sm:grid-cols-2">
      {SUBJECTS.map((subject, index) => {
        const Icon = icons[subject]; const selected = picked?.includes(subject); const section = CAT_SECTIONS[index];
        return <article key={subject} className={`subject-card ${selected ? "is-selected" : ""}`}>
          {onChange ? <label className="flex cursor-pointer items-center gap-3 p-4">
            <span className="subject-icon"><Icon size={21} aria-hidden /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{t(`subjects.${subject}.title`)}</span><span className="text-xs text-muted">{subject}{AFQT_SUBJECTS.includes(subject) ? " · AFQT" : ""}</span></span>
            <input type="checkbox" className="size-5 accent-accent" checked={Boolean(selected)} onChange={() => onChange(selected ? picked!.filter(s => s !== subject) as SubjectCode[] : [...picked ?? [], subject] as SubjectCode[])} />
          </label> : <div className="flex items-center gap-3 p-4"><span className="subject-icon"><Icon size={21} aria-hidden /></span><h3 className="text-base font-semibold">{t(`subjects.${subject}.title`)} <span className="ml-1 text-xs text-muted">{subject}</span></h3></div>}
          <details className="subject-details">
            <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-xs font-medium text-accent">{t("categoryHelp")}<ChevronDown size={14} aria-hidden /></summary>
            <div className="space-y-3 px-4 pb-4 text-sm leading-relaxed text-muted">
              <p>{t(`subjects.${subject}.body`)}</p>
              <p className="font-medium text-foreground">CAT · {t("position")} {index + 1} · {section.count} {t("questions")} · {section.minutes} min</p>
              <p>{t(AFQT_SUBJECTS.includes(subject) ? "afqtNote" : "careerNote")}</p>
              <p><span className="font-semibold text-accent">{t("tip")}: </span>{t(`subjects.${subject}.tip`)}</p>
            </div>
          </details>
        </article>;
      })}
    </div>
    {onChange && <p className="mt-4 flex items-start gap-2 text-sm text-muted"><Check size={16} className="mt-1 shrink-0 text-accent" aria-hidden />{t("balanced")}</p>}
  </div>;
}
