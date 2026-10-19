"""Scan docs/*.pdf and write a local quarantine report.

Copyrighted and unverified items are not copied into the student question bank.
content/quarantine.json is gitignored. relatorios/importacao.md stores counts only.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
QUARANTINE = ROOT / "content" / "quarantine.json"
REPORT = ROOT / "relatorios" / "importacao.md"

REASONS = {
    "ASVABerPracticeExam1.pdf": "copyright_restricted",
    "CliffsTestPrep ASVAB.PDF": "copyright_restricted",
    "Full_ASVAB.pdf": "copyright_restricted",
    "ASVAB-Practice-Test1.pdf": "no_question_stems",
    "asvab_practice_test.pdf": "unverified_no_answer_key",
}

CHOICE = re.compile(r"(?:^|\n)\s*(?:[A-D][\.\)]|\([A-D]\))\s+\S", re.I)
BARE_CHOICE = re.compile(r"(?:^|\n)\s*[A-D]\s*(?:\n|$)", re.I)
NUMBERED = re.compile(r"(?:^|\n)\s*\d{1,3}[\.\)]\s*")
MEANS = re.compile(r"most nearly means", re.I)


def subject_guess(text: str) -> str | None:
    lowered = text.lower()
    pairs = [
        ("electronics", "EI"),
        ("voltage", "EI"),
        ("ohm", "EI"),
        ("engine", "AI"),
        ("spark plug", "AI"),
        ("wrench", "SI"),
        ("saw", "SI"),
        ("gear", "MC"),
        ("lever", "MC"),
        ("most nearly means", "WK"),
        ("paragraph", "PC"),
        ("passage", "PC"),
        ("perimeter", "MK"),
        ("equation", "MK"),
        ("percent", "AR"),
        ("miles", "AR"),
        ("planet", "GS"),
        ("atom", "GS"),
    ]
    for needle, code in pairs:
        if needle in lowered:
            return code
    return None


def blocks_on_page(text: str) -> list[str]:
    chunks = re.split(r"\n(?=\s*\d{1,3}[\.\)])", text)
    found = []
    for chunk in chunks:
        choices = len(CHOICE.findall(chunk)) + len(BARE_CHOICE.findall(chunk))
        if (choices >= 3 or MEANS.search(chunk)) and len(chunk.split()) >= 6:
            found.append(re.sub(r"\s+", " ", chunk).strip()[:500])
    return found


def main() -> None:
    files = sorted(path for path in DOCS.iterdir() if path.suffix.lower() == ".pdf")
    items: list[dict] = []
    errors: list[str] = []
    duplicates = 0
    seen: set[str] = set()
    per_file: list[dict] = []

    for path in files:
        reason = REASONS.get(path.name, "unverified_no_answer_key")
        extracted = 0
        try:
            document = fitz.open(path)
        except Exception as error:  # noqa: BLE001
            errors.append(f"{path.name}: {error}")
            per_file.append({"file": path.name, "pages": 0, "extracted": 0, "reason": "read_error"})
            continue
        if reason == "no_question_stems":
            per_file.append({"file": path.name, "pages": document.page_count, "extracted": 0, "reason": reason})
            document.close()
            continue
        for index, page in enumerate(document, start=1):
            text = page.get_text("text") or ""
            choice_count = len(CHOICE.findall(text)) + len(BARE_CHOICE.findall(text))
            if not NUMBERED.search(text) and choice_count < 3 and not MEANS.search(text):
                continue
            detected = blocks_on_page(text)
            if not detected and (choice_count >= 3 or MEANS.search(text)):
                detected = [re.sub(r"\s+", " ", text).strip()[:500]]
            for block in detected:
                digest = hashlib.sha256(re.sub(r"[^a-z0-9]+", " ", block.lower()).encode()).hexdigest()
                if digest in seen:
                    duplicates += 1
                    continue
                seen.add(digest)
                extracted += 1
                items.append(
                    {
                        "fileName": path.name,
                        "page": index,
                        "subjectGuess": subject_guess(block),
                        "excerpt": block[:220],
                        "hash": digest,
                        "reason": reason,
                        "hasAnswerKey": False,
                    }
                )
        per_file.append({"file": path.name, "pages": document.page_count, "extracted": extracted, "reason": reason})
        document.close()

    summary = {
        "found": len(files),
        "extracted": len(items),
        "imported": 0,
        "rejected": len(items),
        "duplicates": duplicates,
        "pending": len(items),
        "errors": errors,
        "files": per_file,
        "note": "No PDF item was published. Official released count remains 0. Student bank is original practice only.",
    }
    QUARANTINE.parent.mkdir(parents=True, exist_ok=True)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    QUARANTINE.write_text(json.dumps({"summary": summary, "items": items}, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = [
        "# Importação de PDFs",
        "",
        "A detecção é heurística e não confirma gabarito.",
        "Nenhum texto integral de PDF entra no banco visível aos estudantes.",
        "Os trechos ficam só em `content/quarantine.json`, que não vai para o git.",
        "",
        f"- Arquivos encontrados: {summary['found']}",
        f"- Questões detectadas: {summary['extracted']}",
        f"- Importadas para o banco público: {summary['imported']}",
        f"- Rejeitadas para publicação: {summary['rejected']}",
        f"- Duplicatas: {summary['duplicates']}",
        f"- Pendentes de revisão: {summary['pending']}",
        f"- Erros de leitura: {len(errors)}",
        "",
        "| Arquivo | Páginas | Detectadas | Motivo |",
        "|---|---:|---:|---|",
    ]
    for row in per_file:
        lines.append(f"| {row['file']} | {row['pages']} | {row['extracted']} | {row['reason']} |")
    if errors:
        lines.extend(["", "## Erros", ""])
        lines.extend(f"- {error}" for error in errors)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({key: summary[key] for key in ("found", "extracted", "imported", "rejected", "duplicates", "pending")}))


if __name__ == "__main__":
    main()
