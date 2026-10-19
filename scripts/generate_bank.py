"""Build the original PrepLab question bank and a count report."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from data_quant import arithmetic_items, math_items
from data_tech import (
    assembling_items,
    auto_items,
    electronics_items,
    mechanical_items,
    science_items,
    shop_items,
)
from data_verbal import passage_items, word_items

TARGETS = {
    "GS": 120,
    "AR": 120,
    "WK": 120,
    "PC": 100,
    "MK": 120,
    "EI": 100,
    "AI": 80,
    "SI": 80,
    "MC": 80,
    "AO": 80,
}


def main() -> None:
    seen: set[str] = set()
    bank = []
    bank.extend(science_items(TARGETS["GS"], seen))
    bank.extend(arithmetic_items(TARGETS["AR"], seen))
    bank.extend(word_items(TARGETS["WK"], seen))
    bank.extend(passage_items(TARGETS["PC"], seen))
    bank.extend(math_items(TARGETS["MK"], seen))
    bank.extend(electronics_items(TARGETS["EI"], seen))
    bank.extend(auto_items(TARGETS["AI"], seen))
    bank.extend(shop_items(TARGETS["SI"], seen))
    bank.extend(mechanical_items(TARGETS["MC"], seen))
    bank.extend(assembling_items(TARGETS["AO"], seen))

    counts = Counter(item["subject"] for item in bank)
    difficulties = Counter(item["difficulty"] for item in bank)
    out = ROOT / "content"
    out.mkdir(exist_ok=True)
    payload = {
        "version": 1,
        "origin": "ORIGINAL",
        "count": len(bank),
        "questions": bank,
    }
    (out / "bank.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    lines = [
        "# Banco original do ASVAB PrepLab",
        "",
        "Todas as questões abaixo são originais. Nenhuma foi copiada dos PDFs em `docs`.",
        "Nenhuma foi classificada como Official Released Question.",
        "",
        f"Total validado pelo gerador: **{len(bank)}**.",
        "",
        "| Área | Meta | Geradas |",
        "|---|---:|---:|",
    ]
    for subject, target in TARGETS.items():
        lines.append(f"| {subject} | {target} | {counts[subject]} |")
    lines.extend(
        [
            "",
            "## Dificuldade",
            "",
            f"- EASY: {difficulties['EASY']}",
            f"- MEDIUM: {difficulties['MEDIUM']}",
            f"- HARD: {difficulties['HARD']}",
            "",
            "O gabarito das questões numéricas é calculado pelo gerador.",
            "Dicas de nível Quick e Method não podem conter o texto da alternativa correta.",
            "",
        ]
    )
    report = ROOT / "relatorios"
    report.mkdir(exist_ok=True)
    (report / "banco-original.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(bank)} questions")
    for subject, target in TARGETS.items():
        print(f"  {subject}: {counts[subject]} (target {target})")


if __name__ == "__main__":
    main()
