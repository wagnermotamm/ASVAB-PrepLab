import dictionary from "../../content/vocabulary.json";

type Gloss = Record<string, string>;
const glossary: Record<string, Gloss> = dictionary;
type QuestionText = {
  subject: string;
  stem: string;
  passage: string | null;
  options: { text: string }[];
  hints: { type: string; term: string | null; locale: string; explanation: string }[];
};

export function questionVocabulary(question: QuestionText): Record<string, Gloss> {
  const result: Record<string, Gloss> = {};
  // Full dictionaries are kept on the server. Only the current question's terms are exposed.
  if (question.subject === "WK" || /\bis to\b/i.test(question.stem)) {
    const words = new Set([question.stem, question.passage ?? "", ...question.options.map(o => o.text)].join(" ").toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g));
    for (const word of words) if (glossary[word]) result[word] = { ...glossary[word] };
  }
  for (const hint of question.hints) {
    if (hint.type !== "VOCABULARY" || !hint.term) continue;
    const term = hint.term.toLowerCase();
    result[term] = { ...result[term], [hint.locale]: hint.explanation };
  }
  return result;
}
