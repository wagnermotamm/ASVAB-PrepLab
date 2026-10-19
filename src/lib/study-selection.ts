import type { SubjectCode } from "./exam";

/** Round-robin over shuffled pools keeps selected subjects balanced, without repeats. */
export function interleaveSubjects<T extends { subject: string }>(rows: T[], subjects: SubjectCode[], count: number): T[] {
  const pools = [...new Set(subjects)].map(subject => rows.filter(row => row.subject === subject));
  const result: T[] = [];
  while (result.length < count && pools.some(pool => pool.length)) {
    for (const pool of pools) {
      const item = pool.shift();
      if (item) result.push(item);
      if (result.length === count) break;
    }
  }
  return result;
}
