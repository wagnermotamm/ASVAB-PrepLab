import { PrismaClient, type Difficulty, type Origin, type Subject } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { normalizeStem, parseMarkedStem } from "../src/lib/exam";

const prisma = new PrismaClient();

type BankHint = {
  locale: string;
  type: "VOCABULARY" | "STRATEGY";
  level: "QUICK" | "METHOD" | "STEP";
  term: string | null;
  explanation: string;
};

type BankQuestion = {
  externalKey: string;
  subject: Subject;
  stem: string;
  passage: string | null;
  type: "MULTIPLE_CHOICE" | "SPATIAL";
  difficulty: Difficulty;
  origin: Origin;
  topic: string;
  sourceRef: string;
  diagramSvg: string | null;
  options: { label: string; text: string; isCorrect: boolean; diagramSvg: string | null }[];
  hints: BankHint[];
  explanations: {
    locale: string;
    fullExplanation: string;
    quickMethod: string;
    concept: string;
    optionAnalysis: Record<string, string>;
  }[];
};

const PDFS = [
  {
    fileName: "ASVABerPracticeExam1.pdf",
    name: "ASVABer Practice Exam #1",
    license: "Copyright 2012-2013 DevGen, LLC. Redistribution is prohibited.",
    licenseStatus: "RESTRICTED",
    notes: "Commercial practice exam. Detected text may be reviewed by an administrator and is not published to students.",
  },
  {
    fileName: "CliffsTestPrep ASVAB.PDF",
    name: "CliffsTestPrep ASVAB",
    license: "Commercial test-preparation book. All rights reserved.",
    licenseStatus: "RESTRICTED",
    notes: "Book by Fred N. Grayson / CliffsNotes. Not cleared for the student bank.",
  },
  {
    fileName: "Full_ASVAB.pdf",
    name: "Full_ASVAB.pdf",
    license: "Appears to be a chapter from a commercial preparation book.",
    licenseStatus: "RESTRICTED",
    notes: "No reproduction license was supplied. Held for review only.",
  },
  {
    fileName: "ASVAB-Practice-Test1.pdf",
    name: "ASVAB Practice Test 1 answer sheet",
    license: "Unverified third-party answer sheet.",
    licenseStatus: "REFERENCE_ONLY",
    notes: "The file is a bubble sheet and does not contain question stems.",
  },
  {
    fileName: "asvab_practice_test.pdf",
    name: "ASVAB practice test (USAREC metadata)",
    license: "Unverified. File metadata names USAREC, but this is not an official released ASVAB form.",
    licenseStatus: "UNVERIFIED",
    notes: "Not classified as Official Released Question. Held in quarantine without an answer key.",
  },
];

async function main() {
  const bankPath = path.join(process.cwd(), "content", "bank.json");
  const bank = JSON.parse(readFileSync(bankPath, "utf8")) as { questions: BankQuestion[] };

  const password = await bcrypt.hash("PrepLab-Student-2026", 12);
  const adminPassword = await bcrypt.hash("PrepLab-Admin-2026", 12);
  await prisma.user.upsert({
    where: { email: "student@preplab.local" },
    update: {},
    create: { name: "Alex Student", email: "student@preplab.local", passwordHash: password, role: "STUDENT", locale: "br" },
  });
  await prisma.user.upsert({
    where: { email: "admin@preplab.local" },
    update: {},
    create: { name: "PrepLab Admin", email: "admin@preplab.local", passwordHash: adminPassword, role: "ADMIN", locale: "en" },
  });

  const original = await prisma.source.upsert({
    where: { id: "source-original" },
    update: {},
    create: {
      id: "source-original",
      kind: "generator",
      name: "ASVAB PrepLab original item bank",
      license: "Original practice material written for this application.",
      licenseStatus: "ORIGINAL",
      verifiedAt: new Date("2026-10-18T00:00:00Z"),
      notes: "Items are original. Numeric keys are computed by scripts/generate_bank.py.",
    },
  });

  await prisma.source.upsert({
    where: { id: "source-official-site" },
    update: {},
    create: {
      id: "source-official-site",
      kind: "website",
      name: "Official ASVAB program references",
      url: "https://www.officialasvab.com/applicants/what-to-expect/",
      license: "Official pages describe the test. Individual test questions are controlled testing materials.",
      licenseStatus: "REFERENCE_ONLY",
      verifiedAt: new Date("2026-10-18T00:00:00Z"),
      notes: "Structure of CAT-ASVAB and P&P-ASVAB was checked on 18 Oct 2026 against the page updated 6 Oct 2026. No official item text is stored.",
    },
  });

  for (const pdf of PDFS) {
    await prisma.source.upsert({
      where: { id: `source-${pdf.fileName}` },
      update: { license: pdf.license, licenseStatus: pdf.licenseStatus, notes: pdf.notes },
      create: {
        id: `source-${pdf.fileName}`,
        kind: "pdf",
        name: pdf.name,
        fileName: pdf.fileName,
        license: pdf.license,
        licenseStatus: pdf.licenseStatus,
        notes: pdf.notes,
      },
    });
  }

  const existing = new Set(
    (await prisma.question.findMany({ select: { externalKey: true } })).map((row) => row.externalKey),
  );

  let created = 0;
  for (const item of bank.questions) {
    if (existing.has(item.externalKey)) continue;
    const parsed = parseMarkedStem(item.stem);
    const normalized = normalizeStem(parsed.display);
    await prisma.question.create({
      data: {
        externalKey: item.externalKey,
        subject: item.subject,
        stem: parsed.display,
        passage: item.passage ? parseMarkedStem(item.passage).display : null,
        type: item.type,
        difficulty: item.difficulty,
        origin: "ORIGINAL",
        topic: item.topic,
        sourceId: original.id,
        sourceRef: item.sourceRef,
        validationStatus: "VALIDATED",
        stemHash: createHash("sha256").update(normalized).digest("hex"),
        normalizedStem: normalized,
        diagramSvg: item.diagramSvg,
        options: {
          create: item.options.map((option, index) => ({
            label: option.label,
            text: option.text,
            isCorrect: option.isCorrect,
            order: index,
            diagramSvg: option.diagramSvg,
          })),
        },
        hints: {
          create: item.hints.map((hint) => {
            const mark = hint.term ? parsed.terms.find((term) => term.term === hint.term) : undefined;
            return {
              term: hint.term,
              startIndex: mark?.start ?? null,
              endIndex: mark?.end ?? null,
              locale: hint.locale,
              type: hint.type,
              level: hint.level,
              explanation: hint.explanation,
            };
          }),
        },
        explanations: {
          create: item.explanations.map((explanation) => ({
            locale: explanation.locale,
            fullExplanation: explanation.fullExplanation,
            quickMethod: explanation.quickMethod,
            concept: explanation.concept,
            optionAnalysis: explanation.optionAnalysis,
          })),
        },
      },
    });
    created += 1;
    if (created % 100 === 0) console.log(`seeded ${created}`);
  }

  console.log(`Created ${created} questions. Existing skipped: ${existing.size}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
