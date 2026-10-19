import { describe, expect, it } from "vitest";
import {
  afqtReadiness,
  allowsBack,
  clockOffset,
  isNearDuplicate,
  nextDifficulty,
  parseMarkedStem,
  poolDecision,
  remainingFromDeadline,
  reviewSchedule,
  safeSvg,
  toPublicOptions,
} from "./exam";

describe("exam rules", () => {
  it("moves difficulty one step at a time", () => {
    expect(nextDifficulty("MEDIUM", true)).toBe("HARD");
    expect(nextDifficulty("MEDIUM", false)).toBe("EASY");
    expect(nextDifficulty("EASY", false)).toBe("EASY");
    expect(nextDifficulty("HARD", true)).toBe("HARD");
  });

  it("keeps the timer based on the server deadline", () => {
    const clientNow = 1_000_000;
    const serverNow = 1_000_500;
    const offset = clockOffset(serverNow, clientNow);
    const deadline = serverNow + 30_000;
    expect(remainingFromDeadline(deadline, offset, clientNow + 10_000)).toBe(20_000);
  });

  it("does not treat an official shortfall as a silent substitution", () => {
    expect(poolDecision(["OFFICIAL_RELEASED"], 0, 15).code).toBe("OFFICIAL_POOL_SHORT");
    expect(poolDecision(["ORIGINAL"], 10, 15).code).toBe("POOL_SHORT");
    expect(poolDecision(["ORIGINAL"], 15, 15).ok).toBe(true);
  });

  it("labels the AFQT indicator as unofficial", () => {
    const result = afqtReadiness(17, 20);
    expect(result.official).toBe(false);
    expect(result.band).toBe("strong");
    expect(afqtReadiness(0, 0).band).toBe("insufficient");
  });

  it("detects duplicate stems and strips answer keys from the public payload", () => {
    expect(isNearDuplicate("The word [[abundant]] most nearly means", "The word abundant most nearly means")).toBe(true);
    expect(isNearDuplicate("A crew has 12 fasteners.", "A crew has 90 fasteners.")).toBe(false);
    const options = toPublicOptions([
      { id: "1", label: "A", text: "48", diagramSvg: null, isCorrect: true },
      { id: "2", label: "B", text: "14", diagramSvg: "<svg></svg>", isCorrect: false },
    ]);
    expect(JSON.stringify(options)).not.toContain("isCorrect");
    expect(safeSvg("<svg><script>bad</script></svg>")).toBeNull();
  });

  it("places vocabulary markers without changing the English word", () => {
    const parsed = parseMarkedStem('The word "[[abundant]]" most nearly means');
    expect(parsed.display).toContain("abundant");
    expect(parsed.display).not.toContain("[[");
    expect(parsed.terms[0]?.term).toBe("abundant");
  });

  it("schedules a missed item for the next day", () => {
    const now = new Date("2026-10-18T12:00:00Z");
    const next = reviewSchedule({ ease: 2.5, intervalDays: 6, lapses: 0 }, false, now);
    expect(next.intervalDays).toBe(1);
    expect(next.lapses).toBe(1);
  });

  it("allows review navigation only outside the forward-only CAT modes", () => {
    expect(allowsBack("FULL_CAT")).toBe(false);
    expect(allowsBack("CAT_ADAPTIVE")).toBe(false);
    expect(allowsBack("PAPER_PENCIL")).toBe(true);
    expect(allowsBack("PRACTICE_SUBJECT")).toBe(true);
  });
});
