export const SUBJECTS = ["GS", "AR", "WK", "PC", "MK", "EI", "AI", "SI", "MC", "AO"] as const;
export type SubjectCode = (typeof SUBJECTS)[number];
export type DifficultyCode = "EASY" | "MEDIUM" | "HARD";

export const AFQT_SUBJECTS: SubjectCode[] = ["AR", "MK", "WK", "PC"];

export const CAT_SECTIONS: { subject: SubjectCode | "AS"; pool: SubjectCode[]; count: number; minutes: number }[] = [
  { subject: "GS", pool: ["GS"], count: 15, minutes: 12 },
  { subject: "AR", pool: ["AR"], count: 15, minutes: 55 },
  { subject: "WK", pool: ["WK"], count: 15, minutes: 9 },
  { subject: "PC", pool: ["PC"], count: 10, minutes: 27 },
  { subject: "MK", pool: ["MK"], count: 15, minutes: 31 },
  { subject: "EI", pool: ["EI"], count: 15, minutes: 10 },
  { subject: "AI", pool: ["AI"], count: 10, minutes: 7 },
  { subject: "SI", pool: ["SI"], count: 10, minutes: 6 },
  { subject: "MC", pool: ["MC"], count: 15, minutes: 22 },
  { subject: "AO", pool: ["AO"], count: 15, minutes: 18 },
];

export const PAPER_SECTIONS: { subject: SubjectCode | "AS"; pool: SubjectCode[]; count: number; minutes: number }[] = [
  { subject: "GS", pool: ["GS"], count: 25, minutes: 11 },
  { subject: "AR", pool: ["AR"], count: 30, minutes: 36 },
  { subject: "WK", pool: ["WK"], count: 35, minutes: 11 },
  { subject: "PC", pool: ["PC"], count: 15, minutes: 13 },
  { subject: "MK", pool: ["MK"], count: 25, minutes: 24 },
  { subject: "EI", pool: ["EI"], count: 20, minutes: 9 },
  { subject: "AS", pool: ["AI", "SI"], count: 25, minutes: 11 },
  { subject: "MC", pool: ["MC"], count: 25, minutes: 19 },
  { subject: "AO", pool: ["AO"], count: 25, minutes: 15 },
];

const ORDER: DifficultyCode[] = ["EASY", "MEDIUM", "HARD"];

export function nextDifficulty(current: DifficultyCode, correct: boolean): DifficultyCode {
  const index = ORDER.indexOf(current);
  if (correct) return ORDER[Math.min(ORDER.length - 1, index + 1)];
  return ORDER[Math.max(0, index - 1)];
}

export function remainingFromDeadline(deadlineMs: number, clockOffsetMs: number, clientNowMs: number) {
  return deadlineMs - (clientNowMs + clockOffsetMs);
}

export function clockOffset(serverNowMs: number, clientNowMs: number) {
  return serverNowMs - clientNowMs;
}

export function normalizeStem(value: string) {
  return value
    .replace(/\[\[(.*?)\]\]/g, "$1")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function jaccard(left: string, right: string) {
  const a = new Set(normalizeStem(left).split(" ").filter(Boolean));
  const b = new Set(normalizeStem(right).split(" ").filter(Boolean));
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function isNearDuplicate(left: string, right: string) {
  const a = normalizeStem(left);
  const b = normalizeStem(right);
  if (a === b) return true;
  return jaccard(a, b) >= 0.9;
}

export function poolDecision(origins: string[], available: number, needed: number) {
  if (available < needed) {
    return {
      ok: false as const,
      code: origins.length === 1 && origins[0] === "OFFICIAL_RELEASED" ? "OFFICIAL_POOL_SHORT" : "POOL_SHORT",
      available,
      needed,
    };
  }
  return { ok: true as const };
}

export function afqtReadiness(correct: number, total: number) {
  if (total <= 0) {
    return { accuracy: null, band: "insufficient" as const, official: false as const };
  }
  const accuracy = correct / total;
  const band = accuracy >= 0.85 ? "strong" : accuracy >= 0.7 ? "building" : accuracy >= 0.5 ? "developing" : "early";
  return { accuracy, band: band as "strong" | "building" | "developing" | "early", official: false as const };
}

export function reviewSchedule(input: { ease: number; intervalDays: number; lapses: number }, correct: boolean, now: Date) {
  if (!correct) {
    const ease = Math.max(1.3, input.ease - 0.2);
    return { ease, intervalDays: 1, lapses: input.lapses + 1, nextReviewAt: new Date(now.getTime() + 86_400_000) };
  }
  const ease = Math.min(3, input.ease + 0.05);
  const intervalDays = input.intervalDays <= 0 ? 1 : Math.max(1, Math.round(input.intervalDays * ease));
  return { ease, intervalDays, lapses: input.lapses, nextReviewAt: new Date(now.getTime() + intervalDays * 86_400_000) };
}

export function parseMarkedStem(stem: string) {
  const terms: { term: string; start: number; end: number }[] = [];
  let display = "";
  const pattern = /\[\[(.*?)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(stem))) {
    display += stem.slice(last, match.index);
    const start = display.length;
    display += match[1];
    terms.push({ term: match[1], start, end: display.length });
    last = match.index + match[0].length;
  }
  display += stem.slice(last);
  return { display, terms };
}

export function safeSvg(svg: string | null | undefined) {
  if (!svg) return null;
  const trimmed = svg.trim();
  if (!trimmed.startsWith("<svg") || !trimmed.endsWith("</svg>")) return null;
  if (/script|on\w+\s*=|javascript:|foreignObject/i.test(trimmed)) return null;
  return trimmed;
}

export function simulationModes(mode: string) {
  return mode === "FULL_CAT" || mode === "CAT_ADAPTIVE" || mode === "PAPER_PENCIL";
}

export function allowsBack(mode: string) {
  return mode === "PRACTICE_SUBJECT" || mode === "QUESTION_BANK" || mode === "MISTAKES" || mode === "PAPER_PENCIL";
}

export type PublicOption = { id: string; label: string; text: string; diagramSvg: string | null };
export type StoredOption = PublicOption & { isCorrect?: boolean };

export function toPublicOptions(options: StoredOption[]): PublicOption[] {
  return options.map(({ id, label, text, diagramSvg }) => ({
    id,
    label,
    text,
    diagramSvg: safeSvg(diagramSvg),
  }));
}
