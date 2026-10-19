import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
}
const base = "http://127.0.0.1:3000";
const created: string[] = [];
function client() {
  let cookie = "";
  return { cookie: () => cookie, async call(path: string, body?: unknown) {
    const response = await fetch(base + path, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) });
    const set = response.headers.get("set-cookie"); if (set?.startsWith("preplab_guest=")) cookie = set.split(";")[0];
    const data = await response.json(); return { status: response.status, data };
  }};
}
async function main() {
  const a = client(), b = client();
  try {
    const start = await a.call("/api/sessions", { mode: "PRACTICE_SUBJECT", subjects: ["WK", "AR"], count: 4 });
    assert.equal(start.status, 200, JSON.stringify(start.data)); created.push(start.data.id);
    let view = (await a.call(`/api/sessions/${start.data.id}?locale=br`)).data;
    assert.equal(view.guest, true); assert.equal(view.total, 4); assert.equal(view.revealed, null);
    assert.ok(a.cookie().startsWith("preplab_guest="));
    assert.equal((await a.call("/api/auth/me")).data.user, null);
    assert.equal((await a.call("/api/dashboard")).status, 401);
    assert.equal((await a.call("/api/admin/stats")).status, 401);
    const other = await b.call("/api/sessions", { mode: "PRACTICE_SUBJECT", subjects: ["GS"], count: 1 });
    assert.equal(other.status, 200); created.push(other.data.id);
    assert.equal((await b.call(`/api/sessions/${start.data.id}?locale=br`)).status, 404);
    assert.equal((await b.call(`/api/sessions/${start.data.id}/hint`, { kind: "SOLUTION", enable: true })).status, 404);
    const seen: string[] = [], subjects: string[] = [];
    for (let i = 0; i < 4; i++) {
      assert.ok(!view.question.options.some((o: object) => "isCorrect" in o));
      seen.push(view.question.id); subjects.push(view.question.subject);
      if (view.question.subject === "WK") {
        for (const option of view.question.options) {
          assert.ok(view.question.terms.includes(option.text.toLowerCase()));
          const gloss = await a.call(`/api/sessions/${start.data.id}/hint`, { kind: "VOCABULARY", term: option.text, enable: true, locale: "es" });
          assert.equal(gloss.status, 200); assert.ok(gloss.data.explanation.length > 0);
        }
      }
      const help = await a.call(`/api/sessions/${start.data.id}/hint`, { kind: "SOLUTION", enable: true, locale: "br" });
      assert.equal(help.status, 200); assert.ok(help.data.explanation.length > 0);
      const answer = await a.call(`/api/sessions/${start.data.id}/answer`, { optionId: view.question.options[0].id, locale: "br" });
      assert.equal(answer.status, 200); assert.ok(answer.data.revealed?.explanation);
      view = (await a.call(`/api/sessions/${start.data.id}/next`, { locale: "br" })).data;
    }
    assert.equal(new Set(seen).size, 4); assert.notEqual(subjects[0], subjects[1]); assert.equal(view.status, "COMPLETED"); assert.equal(view.review.length, 4);
    for (const mode of ["FULL_CAT", "CAT_ADAPTIVE", "PAPER_PENCIL"]) {
      const session = await a.call("/api/sessions", { mode }); assert.equal(session.status, 200); created.push(session.data.id);
      const full = (await a.call(`/api/sessions/${session.data.id}?locale=br`)).data;
      assert.equal(full.total, mode === "PAPER_PENCIL" ? 225 : 135); assert.equal(full.revealed, null); assert.equal(full.hintsEnabled, false); assert.equal(full.assisted, false); assert.ok(full.section.deadlineAt);
      const help = await a.call(`/api/sessions/${session.data.id}/hint`, { kind: "SOLUTION", enable: true, locale: "br" });
      assert.equal(help.status, 200); assert.equal(help.data.assisted, true);
    }
    console.log("PASS: guest practice, all simulator modes, ownership isolation, account API restrictions, balanced selection, vocabulary, solutions, results and assisted scoring.");
  } finally {
    const { PrismaClient } = await import("@prisma/client"); const db = new PrismaClient();
    const tests = await db.test.findMany({ where: { id: { in: created } }, select: { userId: true } });
    for (const id of new Set(tests.map(t => t.userId))) {
      const user = await db.user.findUnique({ where: { id } });
      if (user && (user.preferences as { guest?: boolean }).guest === true) { await db.auditLog.deleteMany({ where: { userId: id } }); await db.user.delete({ where: { id } }); }
    }
    await db.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
