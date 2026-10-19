import { describe, expect, it } from "vitest";
import { interleaveSubjects } from "./study-selection";
import { questionVocabulary } from "./vocabulary";
import bank from "../../content/bank.json";
import { SUBJECTS } from "./exam";

describe("balanced practice", () => {
  it("alternates subjects, never repeats a question and redistributes an exhausted pool", () => {
    const rows = [{ id: 1, subject: "WK" }, { id: 2, subject: "WK" }, { id: 3, subject: "WK" }, { id: 4, subject: "AR" }, { id: 5, subject: "GS" }, { id: 6, subject: "GS" }];
    const picked = interleaveSubjects(rows, ["WK", "AR", "GS"], 6);
    expect(picked.map(q => q.subject)).toEqual(["WK", "AR", "GS", "WK", "GS", "WK"]);
    expect(new Set(picked.map(q => q.id)).size).toBe(6);
    expect(interleaveSubjects(rows, ["WK", "WK"], 10)).toHaveLength(3);
  });
  it("covers every selected subject in a ten-question session", () => {
    const rows = bank.questions.map(q => ({ ...q }));
    expect(new Set(interleaveSubjects(rows, [...SUBJECTS], 10).map(q => q.subject)).size).toBe(10);
    expect(interleaveSubjects(rows, ["MK"], 20)).toHaveLength(20);
  });
});

describe("vocabulary coverage", () => {
  it("defines the target and every alternative in all current Word Knowledge questions, in three languages", () => {
    for (const question of bank.questions.filter(q => q.subject === "WK")) {
      const vocabulary = questionVocabulary(question);
      const target = question.stem.match(/\[\[(.*?)\]\]/)?.[1];
      expect(target).toBeTruthy();
      for (const term of [target!, ...question.options.map(o => o.text)]) {
        for (const locale of ["en", "pt-BR", "es"]) expect(vocabulary[term.toLowerCase()]?.[locale], `${question.externalKey}: ${term} / ${locale}`).toBeTruthy();
      }
    }
  });
  it("covers relational vocabulary in stems and alternatives", () => {
    const vocabulary = questionVocabulary({ subject: "WK", stem: "Tree is to wood as sheep is to…", passage: null, options: [{ text: "wool" }, { text: "steel" }], hints: [] });
    for (const term of ["tree", "wood", "sheep", "wool", "steel"]) expect(vocabulary[term]["pt-BR"]).toBeTruthy();
    expect(vocabulary.abundant).toBeUndefined();
  });
  it("has a localized explanation for every question", () => {
    for (const question of bank.questions) for (const locale of ["en", "pt-BR", "es"]) {
      expect(question.explanations.find(e => e.locale === locale)?.fullExplanation, `${question.externalKey}/${locale}`).toBeTruthy();
    }
  });
});
