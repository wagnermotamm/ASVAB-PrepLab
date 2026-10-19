import { createHash } from "crypto";
import { normalizeStem, isNearDuplicate } from "@/lib/exam";

export function stemHash(stem: string) {
  return createHash("sha256").update(normalizeStem(stem)).digest("hex");
}

export function publishIssues(input: {
  stem: string;
  options: { text: string; isCorrect: boolean }[];
  explanations: { locale: string; fullExplanation: string }[];
  origin: string;
}) {
  const issues: string[] = [];
  const correct = input.options.filter((option) => option.isCorrect);
  if (input.options.length < 4) issues.push("OPTIONS");
  if (correct.length !== 1) issues.push("ONE_KEY");
  if (new Set(input.options.map((option) => option.text.trim().toLowerCase())).size !== input.options.length) issues.push("DUPLICATE_OPTIONS");
  for (const locale of ["en", "pt-BR", "es"]) {
    if (!input.explanations.some((row) => row.locale === locale && row.fullExplanation.trim().length > 10)) issues.push(`EXPLANATION_${locale}`);
  }
  if (normalizeStem(input.stem).split(" ").length < 4) issues.push("STEM_SHORT");
  if (input.origin === "OFFICIAL_RELEASED") issues.push("OFFICIAL_NOT_CLEARED");
  if (input.origin === "PDF_BASED") issues.push("PDF_NOT_CLEARED");
  return issues;
}

export { isNearDuplicate, normalizeStem };
