import { Prisma, type Difficulty, type Origin, type Subject, type TestMode } from "@prisma/client";
import {
  AFQT_SUBJECTS,
  CAT_SECTIONS,
  PAPER_SECTIONS,
  SUBJECTS,
  allowsBack,
  afqtReadiness,
  nextDifficulty,
  poolDecision,
  safeSvg,
  simulationModes,
  toPublicOptions,
  type DifficultyCode,
  type SubjectCode,
} from "@/lib/exam";
import { dbLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { AppError } from "./errors";

const questionInclude = {
  options: { orderBy: { order: "asc" as const } },
  hints: true,
  explanations: true,
} satisfies Prisma.QuestionInclude;

type HintBag = { quick?: boolean; method?: boolean; step?: boolean; terms?: string[] };

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function bag(value: Prisma.JsonValue | null | undefined): HintBag {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as HintBag;
}

export async function createStudySession(userId: string, input: {
  mode: TestMode;
  subjects?: SubjectCode[];
  count?: number;
  difficulty?: DifficultyCode;
  origins: Origin[];
  unseenOnly?: boolean;
  timer?: boolean;
  hints?: boolean;
  feedback?: "immediate" | "end";
}) {
  if (input.mode === "QUESTION_BANK") {
    const open = await prisma.test.findFirst({
      where: { userId, mode: "QUESTION_BANK", status: "IN_PROGRESS" },
    });
    if (open) return open;
  }

  const simulation = simulationModes(input.mode);
  const hints = simulation ? false : input.hints !== false;
  const feedback = simulation ? "end" : input.feedback ?? "immediate";
  const origins = input.origins.length ? input.origins : (["ORIGINAL"] as Origin[]);

  if (input.mode === "FULL_CAT" || input.mode === "CAT_ADAPTIVE" || input.mode === "PAPER_PENCIL") {
    const blueprint = input.mode === "PAPER_PENCIL" ? PAPER_SECTIONS : CAT_SECTIONS;
    for (const section of blueprint) {
      const available = await prisma.question.count({
        where: {
          validationStatus: "VALIDATED",
          origin: { in: origins },
          subject: { in: section.pool as Subject[] },
        },
      });
      const decision = poolDecision(origins, available, section.count);
      if (!decision.ok) throw new AppError(decision.code, 409, { available: decision.available, needed: decision.needed, subject: section.subject });
    }
    return createBlueprintTest(userId, input.mode, blueprint, origins, hints, feedback);
  }

  const subjects = (
    input.subjects?.length ? input.subjects : input.mode === "QUESTION_BANK" ? [...SUBJECTS] : ["GS"]
  ) as Subject[];
  const count = Math.min(
    input.mode === "QUESTION_BANK" ? 20 : 50,
    Math.max(1, input.count ?? (input.mode === "QUESTION_BANK" ? 20 : input.mode === "MISTAKES" ? 15 : 10)),
  );
  const where: Prisma.QuestionWhereInput = {
    validationStatus: "VALIDATED",
    origin: { in: origins },
    subject: { in: subjects },
    ...(input.difficulty ? { difficulty: input.difficulty } : {}),
  };

  if (input.mode === "MISTAKES") {
    const states = await prisma.userQuestionState.findMany({
      where: { userId, incorrectCount: { gt: 0 } },
      orderBy: [{ nextReviewAt: "asc" }, { incorrectCount: "desc" }],
    });
    const ids = states.filter((state) => state.lastCorrect === false || (state.nextReviewAt && state.nextReviewAt <= new Date())).map((state) => state.questionId);
    where.id = { in: ids.length ? ids : ["__none__"] };
  } else if (input.unseenOnly || input.mode === "QUESTION_BANK") {
    const seen = await prisma.userAnswer.findMany({ where: { userId }, select: { questionId: true }, distinct: ["questionId"] });
    where.id = { notIn: seen.map((row) => row.questionId) };
  }

  const availableRows = await prisma.question.findMany({
    where,
    select: { id: true, difficulty: true, subject: true },
  });
  const decision = poolDecision(origins, availableRows.length, Math.min(count, availableRows.length || count));
  if (availableRows.length === 0) throw new AppError(decision.ok ? "POOL_SHORT" : decision.code, 409, { available: 0, needed: count });
  const picked = shuffle(availableRows).slice(0, count);
  const minutes = input.timer ? Math.max(5, picked.length) : 0;
  const created = await prisma.test.create({
    data: {
      userId,
      mode: input.mode,
      config: { origins, hints, feedback, timer: Boolean(input.timer), subjects },
      sections: {
        create: {
          subject: picked[0]?.subject ?? "GS",
          order: 0,
          questionCount: picked.length,
          timeLimitSec: minutes * 60,
        },
      },
    },
    include: { sections: true },
  });
  await prisma.testQuestion.createMany({
    data: picked.map((question, index) => ({
      testId: created.id,
      sectionId: created.sections[0].id,
      questionId: question.id,
      order: index,
      servedDifficulty: question.difficulty,
    })),
  });
  return created;
}

async function createBlueprintTest(
  userId: string,
  mode: TestMode,
  blueprint: typeof CAT_SECTIONS,
  origins: Origin[],
  hints: boolean,
  feedback: "immediate" | "end",
) {
  const adaptive = mode === "CAT_ADAPTIVE";
  const sections: { subject: Subject; order: number; questionCount: number; timeLimitSec: number; pool: SubjectCode[] }[] = [];
  const items: { questionId: string; order: number; servedDifficulty: Difficulty; sectionOrder: number }[] = [];
  let order = 0;

  for (const [index, section] of blueprint.entries()) {
    sections.push({
      subject: section.subject as Subject,
      order: index,
      questionCount: section.count,
      timeLimitSec: section.minutes * 60,
      pool: section.pool,
    });
    if (adaptive) {
      if (index > 0) continue;
      const first = await pickAdaptiveQuestion(section.pool, "MEDIUM", origins, []);
      if (!first) throw new AppError("POOL_SHORT", 409, { subject: section.subject });
      items.push({ questionId: first.id, order, servedDifficulty: first.difficulty, sectionOrder: index });
      order += 1;
      continue;
    }
    const rows = await prisma.question.findMany({
      where: { validationStatus: "VALIDATED", origin: { in: origins }, subject: { in: section.pool as Subject[] } },
      select: { id: true, difficulty: true },
    });
    const picked = shuffle(rows).slice(0, section.count);
    if (picked.length < section.count) throw new AppError("POOL_SHORT", 409, { subject: section.subject, available: picked.length, needed: section.count });
    for (const question of picked) {
      items.push({ questionId: question.id, order, servedDifficulty: question.difficulty, sectionOrder: index });
      order += 1;
    }
  }

  const created = await prisma.test.create({
    data: {
      userId,
      mode,
      config: { origins, hints, feedback, timer: true, adaptive, blueprint: blueprint.map((section) => section.subject) },
      sections: { create: sections.map(({ pool: _pool, ...section }) => section) },
    },
    include: { sections: true },
  });

  const sectionId = new Map(created.sections.map((section) => [section.order, section.id]));
  await prisma.testQuestion.createMany({
    data: items.map((item) => ({
      testId: created.id,
      sectionId: sectionId.get(item.sectionOrder),
      questionId: item.questionId,
      order: item.order,
      servedDifficulty: item.servedDifficulty,
    })),
  });
  return created;
}

async function pickAdaptiveQuestion(pool: SubjectCode[], difficulty: DifficultyCode, origins: Origin[], exclude: string[]) {
  const ladder: DifficultyCode[] = [difficulty, "MEDIUM", "EASY", "HARD"];
  for (const level of ladder) {
    const rows = await prisma.question.findMany({
      where: {
        validationStatus: "VALIDATED",
        origin: { in: origins },
        subject: { in: pool as Subject[] },
        difficulty: level,
        id: { notIn: exclude },
      },
      select: { id: true, difficulty: true },
      take: 40,
    });
    if (rows.length) return shuffle(rows)[0];
  }
  return null;
}

export async function getSessionView(userId: string, testId: string, locale: string) {
  await ensureClock(testId);
  await expireIfNeeded(userId, testId);
  await ensureClock(testId);
  const fresh = await loadTest(userId, testId);
  return present(fresh, dbLocale(locale));
}

async function expireIfNeeded(userId: string, testId: string) {
  const test = await loadTest(userId, testId);
  if (test.status !== "IN_PROGRESS") return;
  const item = test.items[test.currentIndex];
  const section = item ? test.sections.find((entry) => entry.id === item.sectionId) : null;
  if (!section?.deadlineAt || section.deadlineAt.getTime() > Date.now()) return;
  const now = new Date();
  if (!section.endedAt) await closeSection(test, section.id, now);
  const nextSection = test.sections.find((entry) => entry.order === section.order + 1);
  if (!nextSection) {
    await finishTest(test.id, userId, now);
    return;
  }
  const nextItem = test.items.find((entry) => entry.sectionId === nextSection.id && !entry.selectedOptionId);
  if (nextItem) {
    await prisma.test.update({ where: { id: test.id }, data: { currentSection: nextSection.order, currentIndex: nextItem.order } });
    return;
  }
  if (test.mode === "CAT_ADAPTIVE") {
    const config = (test.config ?? {}) as { origins?: Origin[] };
    const blueprint = CAT_SECTIONS.find((entry) => entry.subject === nextSection.subject);
    const first = await pickAdaptiveQuestion(
      blueprint?.pool ?? [nextSection.subject as SubjectCode],
      "MEDIUM",
      config.origins ?? ["ORIGINAL"],
      test.items.map((entry) => entry.questionId),
    );
    if (!first) {
      await finishTest(test.id, userId, now);
      return;
    }
    const created = await prisma.testQuestion.create({
      data: { testId: test.id, sectionId: nextSection.id, questionId: first.id, order: test.items.length, servedDifficulty: first.difficulty },
    });
    await prisma.test.update({ where: { id: test.id }, data: { currentSection: nextSection.order, currentIndex: created.order } });
    return;
  }
  await finishTest(test.id, userId, now);
}

async function loadTest(userId: string, testId: string) {
  const test = await prisma.test.findFirst({
    where: { id: testId, userId },
    include: {
      sections: { orderBy: { order: "asc" } },
      items: { orderBy: { order: "asc" }, include: { question: { include: questionInclude } } },
    },
  });
  if (!test) throw new AppError("NOT_FOUND", 404);
  return test;
}

async function ensureClock(testId: string) {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { sections: { orderBy: { order: "asc" } }, items: { orderBy: { order: "asc" } } },
  });
  if (!test || test.status !== "IN_PROGRESS") return;
  const item = test.items[test.currentIndex];
  if (!item) return;
  const section = test.sections.find((entry) => entry.id === item.sectionId) ?? test.sections[0];
  if (section && !section.startedAt) {
    const now = new Date();
    await prisma.testSection.update({
      where: { id: section.id },
      data: {
        startedAt: now,
        deadlineAt: section.timeLimitSec > 0 ? new Date(now.getTime() + section.timeLimitSec * 1000) : null,
      },
    });
  }
  if (!item.shownAt) {
    await prisma.testQuestion.update({ where: { id: item.id }, data: { shownAt: new Date() } });
  }
}

function present(test: Awaited<ReturnType<typeof loadTest>>, locale: string) {
  const config = (test.config ?? {}) as { hints?: boolean; feedback?: "immediate" | "end"; timer?: boolean };
  const item = test.items[test.currentIndex] ?? null;
  const section = item ? test.sections.find((entry) => entry.id === item.sectionId) ?? test.sections[test.currentSection] : test.sections[test.currentSection];
  const now = new Date();
  const expired = Boolean(section?.deadlineAt && section.deadlineAt.getTime() <= now.getTime());
  const question = item?.question;
  const terms = question
    ? [...new Set(question.hints.filter((hint) => hint.type === "VOCABULARY" && hint.term).map((hint) => hint.term as string))]
    : [];
  const revealed = question && item?.selectedOptionId && (config.feedback === "immediate" || test.status === "COMPLETED")
    ? reveal(question, locale)
    : null;

  return {
    id: test.id,
    mode: test.mode,
    status: test.status,
    assisted: test.assisted,
    hintsEnabled: Boolean(config.hints),
    feedback: config.feedback ?? "end",
    canGoBack: allowsBack(test.mode),
    index: test.currentIndex,
    total: test.mode === "CAT_ADAPTIVE"
      ? test.sections.reduce((sum, entry) => sum + entry.questionCount, 0)
      : test.items.length,
    section: section
      ? {
          subject: section.subject,
          order: section.order,
          questionCount: section.questionCount,
          deadlineAt: section.deadlineAt?.toISOString() ?? null,
          serverNow: now.toISOString(),
          expired,
        }
      : null,
    navigator: allowsBack(test.mode)
      ? test.items
          .filter((entry) => !section || entry.sectionId === section.id || test.mode !== "PAPER_PENCIL")
          .map((entry) => ({ order: entry.order, answered: Boolean(entry.selectedOptionId), flagged: entry.flagged }))
      : [],
    question: question && test.status !== "COMPLETED"
      ? {
          id: question.id,
          subject: question.subject,
          stem: question.stem,
          passage: question.passage,
          diagramSvg: safeSvg(question.diagramSvg),
          type: question.type,
          terms,
          options: toPublicOptions(question.options),
        }
      : null,
    review: test.status === "COMPLETED"
      ? test.items.map((entry) => {
          const correct = entry.question.options.find((option) => option.isCorrect);
          const selected = entry.question.options.find((option) => option.id === entry.selectedOptionId);
          const explanation = entry.question.explanations.find((row) => row.locale === locale) ?? entry.question.explanations[0];
          return {
            order: entry.order,
            subject: entry.question.subject,
            stem: entry.question.stem,
            selected: selected?.text ?? null,
            correct: correct?.text ?? null,
            isCorrect: Boolean(selected && correct && selected.id === correct.id),
            explanation: explanation?.fullExplanation ?? "",
          };
        })
      : [],
    selectedOptionId: item?.selectedOptionId ?? null,
    flagged: item?.flagged ?? false,
    revealed,
    summary: test.status === "COMPLETED" ? test.scoreSummary : null,
  };
}

function reveal(question: { options: { id: string; label: string; isCorrect: boolean }[]; explanations: { locale: string; fullExplanation: string; quickMethod: string; concept: string; optionAnalysis: Prisma.JsonValue }[] }, locale: string) {
  const explanation = question.explanations.find((entry) => entry.locale === locale) ?? question.explanations[0];
  return {
    correctOptionId: question.options.find((option) => option.isCorrect)?.id ?? null,
    explanation: explanation?.fullExplanation ?? "",
    quickMethod: explanation?.quickMethod ?? "",
    concept: explanation?.concept ?? "",
    analysis: (explanation?.optionAnalysis ?? {}) as Record<string, string>,
  };
}

export async function answerSession(userId: string, testId: string, optionId: string, locale: string) {
  const test = await loadTest(userId, testId);
  if (test.status !== "IN_PROGRESS") throw new AppError("TEST_CLOSED", 409);
  await ensureClock(test.id);
  const fresh = await loadTest(userId, testId);
  const item = fresh.items[fresh.currentIndex];
  if (!item) throw new AppError("NO_QUESTION", 409);
  const section = fresh.sections.find((entry) => entry.id === item.sectionId);
  const now = new Date();
  if (section?.deadlineAt && section.deadlineAt.getTime() <= now.getTime()) {
    return getSessionView(userId, testId, locale);
  }
  if (item.selectedOptionId) return getSessionView(userId, testId, locale);

  const option = item.question.options.find((entry) => entry.id === optionId);
  if (!option) throw new AppError("INVALID_OPTION", 400);
  const elapsed = item.shownAt ? Math.max(0, now.getTime() - item.shownAt.getTime()) : 0;
  const hintsUsed = bag(item.hintsUsed);

  await prisma.$transaction(async (tx) => {
    await tx.testQuestion.update({
      where: { id: item.id },
      data: { selectedOptionId: option.id, answeredAt: now, timeSpentMs: elapsed },
    });
    await tx.userAnswer.create({
      data: {
        userId,
        questionId: item.questionId,
        testId,
        optionId: option.id,
        isCorrect: option.isCorrect,
        timeSpentMs: elapsed,
        hintsUsed: hintsUsed as Prisma.InputJsonValue,
      },
    });
    const state = await tx.userQuestionState.findUnique({ where: { userId_questionId: { userId, questionId: item.questionId } } });
    const schedule = (await import("@/lib/exam")).reviewSchedule(
      { ease: state?.ease ?? 2.5, intervalDays: state?.intervalDays ?? 0, lapses: state?.lapses ?? 0 },
      option.isCorrect,
      now,
    );
    await tx.userQuestionState.upsert({
      where: { userId_questionId: { userId, questionId: item.questionId } },
      create: {
        userId,
        questionId: item.questionId,
        correctCount: option.isCorrect ? 1 : 0,
        incorrectCount: option.isCorrect ? 0 : 1,
        hintCount: (hintsUsed.terms?.length ?? 0) + Number(Boolean(hintsUsed.quick)) + Number(Boolean(hintsUsed.method)) + Number(Boolean(hintsUsed.step)),
        lastCorrect: option.isCorrect,
        lastAnsweredAt: now,
        ...schedule,
      },
      update: {
        correctCount: { increment: option.isCorrect ? 1 : 0 },
        incorrectCount: { increment: option.isCorrect ? 0 : 1 },
        lastCorrect: option.isCorrect,
        lastAnsweredAt: now,
        ...schedule,
      },
    });
    await tx.userProgress.upsert({
      where: { userId_subject: { userId, subject: item.question.subject } },
      create: {
        userId,
        subject: item.question.subject,
        correct: option.isCorrect ? 1 : 0,
        incorrect: option.isCorrect ? 0 : 1,
        timeSpentMs: elapsed,
      },
      update: {
        correct: { increment: option.isCorrect ? 1 : 0 },
        incorrect: { increment: option.isCorrect ? 0 : 1 },
        timeSpentMs: { increment: elapsed },
      },
    });
  });

  const config = (fresh.config ?? {}) as { feedback?: "immediate" | "end" };
  if (config.feedback !== "immediate") await advance(userId, testId, now);
  return getSessionView(userId, testId, locale);
}

export async function continueSession(userId: string, testId: string, locale: string) {
  const test = await loadTest(userId, testId);
  if (test.status !== "IN_PROGRESS") return getSessionView(userId, testId, locale);
  const item = test.items[test.currentIndex];
  if (!item?.selectedOptionId) throw new AppError("NEED_ANSWER", 409);
  await advance(userId, testId, new Date());
  return getSessionView(userId, testId, locale);
}

async function advance(userId: string, testId: string, now: Date) {
  const test = await loadTest(userId, testId);
  const config = (test.config ?? {}) as { origins?: Origin[]; adaptive?: boolean };
  const item = test.items[test.currentIndex];
  if (!item?.sectionId) return;
  const section = test.sections.find((entry) => entry.id === item.sectionId);
  if (!section) return;
  const inSection = test.items.filter((entry) => entry.sectionId === section.id);
  const answeredInSection = inSection.filter((entry) => entry.selectedOptionId).length;

  if (test.mode === "CAT_ADAPTIVE" && answeredInSection < section.questionCount) {
    const last = inSection[inSection.length - 1];
    const correct = last.question.options.find((option) => option.id === last.selectedOptionId)?.isCorrect ?? false;
    const blueprint = (test.mode === "CAT_ADAPTIVE" ? CAT_SECTIONS : PAPER_SECTIONS).find((entry) => entry.subject === section.subject);
    const pool = blueprint?.pool ?? [section.subject as SubjectCode];
    const next = await pickAdaptiveQuestion(
      pool,
      nextDifficulty(last.servedDifficulty, correct),
      (config.origins as Origin[]) ?? ["ORIGINAL"],
      test.items.map((entry) => entry.questionId),
    );
    if (!next) {
      await finishTest(test.id, userId, now);
      return;
    }
    await prisma.testQuestion.create({
      data: {
        testId: test.id,
        sectionId: section.id,
        questionId: next.id,
        order: test.items.length,
        servedDifficulty: next.difficulty,
        shownAt: now,
      },
    });
    await prisma.test.update({ where: { id: test.id }, data: { currentIndex: test.items.length } });
    return;
  }

  if (answeredInSection >= section.questionCount || inSection.every((entry) => entry.selectedOptionId)) {
    await closeSection(test, section.id, now);
    const nextSection = test.sections.find((entry) => entry.order === section.order + 1);
    if (!nextSection) {
      await finishTest(test.id, userId, now);
      return;
    }
    if (test.mode === "CAT_ADAPTIVE") {
      const blueprint = CAT_SECTIONS.find((entry) => entry.subject === nextSection.subject);
      const first = await pickAdaptiveQuestion(
        blueprint?.pool ?? [nextSection.subject as SubjectCode],
        "MEDIUM",
        (config.origins as Origin[]) ?? ["ORIGINAL"],
        test.items.map((entry) => entry.questionId),
      );
      if (!first) {
        await finishTest(test.id, userId, now);
        return;
      }
      const created = await prisma.testQuestion.create({
        data: {
          testId: test.id,
          sectionId: nextSection.id,
          questionId: first.id,
          order: test.items.length,
          servedDifficulty: first.difficulty,
          shownAt: now,
        },
      });
      await prisma.testSection.update({
        where: { id: nextSection.id },
        data: {
          startedAt: now,
          deadlineAt: nextSection.timeLimitSec > 0 ? new Date(now.getTime() + nextSection.timeLimitSec * 1000) : null,
        },
      });
      await prisma.test.update({
        where: { id: test.id },
        data: { currentSection: nextSection.order, currentIndex: created.order },
      });
      return;
    }
    const nextItem = test.items.find((entry) => entry.sectionId === nextSection.id);
    await prisma.test.update({
      where: { id: test.id },
      data: { currentSection: nextSection.order, currentIndex: nextItem ? nextItem.order : test.currentIndex },
    });
    return;
  }

  const nextItem = test.items.find((entry) => entry.order > item.order && !entry.selectedOptionId);
  if (!nextItem) {
    await finishTest(test.id, userId, now);
    return;
  }
  await prisma.test.update({ where: { id: test.id }, data: { currentIndex: nextItem.order } });
}

async function closeSection(test: { id: string; sections: { id: string; startedAt: Date | null }[] }, sectionId: string, now: Date) {
  const section = test.sections.find((entry) => entry.id === sectionId);
  const spent = section?.startedAt ? Math.round((now.getTime() - section.startedAt.getTime()) / 1000) : 0;
  await prisma.testSection.update({
    where: { id: sectionId },
    data: { endedAt: now, timeSpentSec: spent },
  });
}

async function finishTest(testId: string, userId: string, now: Date) {
  const test = await loadTest(userId, testId);
  const answers = test.items.filter((item) => item.selectedOptionId);
  const correct = answers.filter((item) => item.question.options.some((option) => option.id === item.selectedOptionId && option.isCorrect)).length;
  const timeMs = test.items.reduce((sum, item) => sum + item.timeSpentMs, 0);
  const hinted = answers.filter((item) => {
    const used = bag(item.hintsUsed);
    return used.quick || used.method || used.step || (used.terms?.length ?? 0) > 0;
  }).length;
  const bySubject: Record<string, { correct: number; total: number }> = {};
  for (const item of answers) {
    const key = item.question.subject;
    bySubject[key] ??= { correct: 0, total: 0 };
    bySubject[key].total += 1;
    if (item.question.options.some((option) => option.id === item.selectedOptionId && option.isCorrect)) bySubject[key].correct += 1;
  }
  const afqtTotals = AFQT_SUBJECTS.reduce(
    (sum, subject) => {
      sum.correct += bySubject[subject]?.correct ?? 0;
      sum.total += bySubject[subject]?.total ?? 0;
      return sum;
    },
    { correct: 0, total: 0 },
  );
  const summary = {
    answered: answers.length,
    correct,
    incorrect: answers.length - correct,
    accuracy: answers.length ? correct / answers.length : 0,
    timeMs,
    averageMs: answers.length ? Math.round(timeMs / answers.length) : 0,
    hintRate: answers.length ? hinted / answers.length : 0,
    assisted: test.assisted,
    bySubject,
    afqt: afqtReadiness(afqtTotals.correct, afqtTotals.total),
    officialAfqt: false,
  };
  await prisma.test.update({
    where: { id: testId },
    data: { status: "COMPLETED", completedAt: now, scoreSummary: summary as Prisma.InputJsonValue },
  });
  await prisma.auditLog.create({
    data: { userId, action: "TEST_COMPLETED", detail: { testId, mode: test.mode, assisted: test.assisted, correct, answered: answers.length } },
  });
}

export async function useHint(userId: string, testId: string, locale: string, input: { kind: "VOCABULARY" | "STRATEGY"; term?: string; level?: "QUICK" | "METHOD" | "STEP"; enable?: boolean }) {
  const test = await loadTest(userId, testId);
  if (test.status !== "IN_PROGRESS") throw new AppError("TEST_CLOSED", 409);
  const config = { ...(test.config as Record<string, unknown>) };
  let assisted = test.assisted;
  if (!config.hints) {
    if (!input.enable || !simulationModes(test.mode)) throw new AppError("HINTS_DISABLED", 403);
    config.hints = true;
    assisted = true;
  } else if (simulationModes(test.mode)) {
    assisted = true;
  }
  const item = test.items[test.currentIndex];
  if (!item) throw new AppError("NO_QUESTION", 409);
  const language = dbLocale(locale);
  const used = bag(item.hintsUsed);
  let explanation = "";

  if (input.kind === "VOCABULARY") {
    const hint = item.question.hints.find((entry) => entry.type === "VOCABULARY" && entry.locale === language && entry.term?.toLowerCase() === input.term?.toLowerCase());
    if (!hint) throw new AppError("HINT_NOT_FOUND", 404);
    explanation = hint.explanation;
    used.terms = [...new Set([...(used.terms ?? []), hint.term ?? input.term ?? ""])];
  } else {
    const level = input.level ?? "QUICK";
    if (level === "METHOD" && !used.quick) throw new AppError("HINT_SEQUENCE", 409);
    if (level === "STEP" && !used.method) throw new AppError("HINT_SEQUENCE", 409);
    const hint = item.question.hints.find((entry) => entry.type === "STRATEGY" && entry.level === level && entry.locale === language);
    if (!hint) throw new AppError("HINT_NOT_FOUND", 404);
    explanation = hint.explanation;
    if (level === "QUICK") used.quick = true;
    if (level === "METHOD") used.method = true;
    if (level === "STEP") used.step = true;
  }

  await prisma.testQuestion.update({ where: { id: item.id }, data: { hintsUsed: used as Prisma.InputJsonValue } });
  await prisma.test.update({ where: { id: test.id }, data: { assisted, config: config as Prisma.InputJsonValue } });
  await prisma.userQuestionState.upsert({
    where: { userId_questionId: { userId, questionId: item.questionId } },
    create: { userId, questionId: item.questionId, hintCount: 1 },
    update: { hintCount: { increment: 1 } },
  });
  return { explanation, assisted };
}

export async function moveSession(userId: string, testId: string, order: number, locale: string) {
  const test = await loadTest(userId, testId);
  if (!allowsBack(test.mode)) throw new AppError("NO_BACKTRACK", 403);
  const item = test.items.find((entry) => entry.order === order);
  if (!item) throw new AppError("NOT_FOUND", 404);
  if (test.mode === "PAPER_PENCIL") {
    const current = test.items[test.currentIndex];
    if (current && item.sectionId !== current.sectionId) throw new AppError("SECTION_LOCKED", 403);
  }
  await prisma.test.update({ where: { id: test.id }, data: { currentIndex: order } });
  return getSessionView(userId, testId, locale);
}

export async function flagSession(userId: string, testId: string, flagged: boolean, locale: string) {
  const test = await loadTest(userId, testId);
  if (simulationModes(test.mode) && test.mode !== "PAPER_PENCIL") throw new AppError("FLAG_DISABLED", 403);
  const item = test.items[test.currentIndex];
  if (!item) throw new AppError("NO_QUESTION", 409);
  await prisma.testQuestion.update({ where: { id: item.id }, data: { flagged } });
  await prisma.userQuestionState.upsert({
    where: { userId_questionId: { userId, questionId: item.questionId } },
    create: { userId, questionId: item.questionId, flagged },
    update: { flagged },
  });
  return getSessionView(userId, testId, locale);
}

export async function dashboardFor(userId: string) {
  const [answers, progress, tests, states, questions] = await Promise.all([
    prisma.userAnswer.findMany({ where: { userId }, orderBy: { answeredAt: "desc" }, take: 500 }),
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.test.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 12 }),
    prisma.userQuestionState.findMany({ where: { userId } }),
    prisma.question.count({ where: { validationStatus: "VALIDATED" } }),
  ]);
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const days = new Set(answers.map((answer) => answer.answeredAt.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (let guard = 0; guard < 365; guard += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const weakest = [...progress].sort((a, b) => {
    const aRate = a.correct + a.incorrect === 0 ? 1 : a.correct / (a.correct + a.incorrect);
    const bRate = b.correct + b.incorrect === 0 ? 1 : b.correct / (b.correct + b.incorrect);
    return aRate - bRate;
  })[0];
  return {
    bankSize: questions,
    answered: new Set(answers.map((answer) => answer.questionId)).size,
    attempts: answers.length,
    correct,
    accuracy: answers.length ? correct / answers.length : 0,
    studyMs: progress.reduce((sum, row) => sum + row.timeSpentMs, 0),
    streak,
    progress,
    tests,
    due: states.filter((state) => state.nextReviewAt && state.nextReviewAt <= new Date()).length,
    favorites: states.filter((state) => state.favorite).length,
    recommendation: weakest ? weakest.subject : null,
    recent: answers.slice(0, 8),
  };
}
