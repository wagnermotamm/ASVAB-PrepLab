import { readFileSync } from "fs";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (!match || process.env[match[1]]) continue;
  process.env[match[1]] = match[2].replace(/^"|"$/g, "");
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { createStudySession, getSessionView, answerSession, continueSession } = await import("../src/server/sessions");
  const student = await prisma.user.findUnique({ where: { email: "student@preplab.local" } });
  if (!student) throw new Error("missing student");
  const progressBefore = await prisma.userProgress.findMany({ where: { userId: student.id } });

  let officialFailed = false;
  try {
    await createStudySession(student.id, { mode: "FULL_CAT", origins: ["OFFICIAL_RELEASED"] });
  } catch (error) {
    officialFailed = error instanceof Error && error.message === "OFFICIAL_POOL_SHORT";
  }
  if (!officialFailed) throw new Error("official pool was not refused");

  const practice = await createStudySession(student.id, {
    mode: "PRACTICE_SUBJECT",
    subjects: ["WK"],
    count: 2,
    origins: ["ORIGINAL"],
    hints: true,
    feedback: "immediate",
  });
  const view = await getSessionView(student.id, practice.id, "br");
  const options = view.question?.options ?? [];
  if (options.some((option) => "isCorrect" in option)) throw new Error("answer key leaked");
  if (!view.question?.terms.length) throw new Error("expected vocabulary terms");
  const first = options[0];
  const answered = await answerSession(student.id, practice.id, first.id, "br");
  if (!answered.revealed?.explanation) throw new Error("missing immediate explanation");
  if (answered.question?.id !== view.question.id) throw new Error("immediate feedback advanced too soon");
  const continued = await continueSession(student.id, practice.id, "es");
  if (continued.question?.id === view.question.id) throw new Error("continue did not advance");

  const cat = await createStudySession(student.id, { mode: "FULL_CAT", origins: ["ORIGINAL"] });
  const loaded = await prisma.test.findUnique({
    where: { id: cat.id },
    include: { sections: { orderBy: { order: "asc" } }, items: true },
  });
  const expected = [15, 15, 15, 10, 15, 15, 10, 10, 15, 15];
  const minutes = [12, 55, 9, 27, 31, 10, 7, 6, 22, 18];
  const counts = loaded?.sections.map((section) => section.questionCount) ?? [];
  const clocks = loaded?.sections.map((section) => section.timeLimitSec / 60) ?? [];
  if (JSON.stringify(counts) !== JSON.stringify(expected)) throw new Error(`CAT counts ${counts.join(",")}`);
  if (JSON.stringify(clocks) !== JSON.stringify(minutes)) throw new Error(`CAT clocks ${clocks.join(",")}`);
  if (loaded?.items.length !== 135) throw new Error(`CAT items ${loaded?.items.length}`);
  const catView = await getSessionView(student.id, cat.id, "en");
  if (catView.hintsEnabled) throw new Error("simulation hints should start off");
  if (catView.canGoBack) throw new Error("CAT should not allow backtracking");
  if (JSON.stringify(catView.question).includes("isCorrect")) throw new Error("CAT payload includes isCorrect");

  await prisma.userProgress.deleteMany({ where: { userId: student.id } });
  if (progressBefore.length) {
    await prisma.userProgress.createMany({
      data: progressBefore.map((row) => ({
        userId: row.userId,
        subject: row.subject,
        correct: row.correct,
        incorrect: row.incorrect,
        timeSpentMs: row.timeSpentMs,
      })),
    });
  }
  await prisma.userAnswer.deleteMany({ where: { userId: student.id, testId: practice.id } });
  await prisma.userQuestionState.deleteMany({ where: { userId: student.id, questionId: { in: (await prisma.testQuestion.findMany({ where: { testId: practice.id }, select: { questionId: true } })).map((row) => row.questionId) } } });
  await prisma.test.deleteMany({ where: { id: { in: [practice.id, cat.id] } } });
  console.log("flow-ok");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
