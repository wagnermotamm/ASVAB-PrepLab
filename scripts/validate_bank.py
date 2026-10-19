"""Re-check the generated bank."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bank_common import LOCALES, assert_clean, display_stem

ROOT = Path(__file__).resolve().parents[1]
bank = json.loads((ROOT / "content" / "bank.json").read_text(encoding="utf-8"))
seen: set[str] = set()
for item in bank["questions"]:
    assert_clean(item, seen)
    if item["origin"] != "ORIGINAL":
        raise SystemExit(item["externalKey"])
    if "[[" in display_stem(item["stem"]):
        raise SystemExit(f"unclosed marker {item['externalKey']}")
    for locale in LOCALES:
        if not any(row["locale"] == locale and row["fullExplanation"] for row in item["explanations"]):
            raise SystemExit(f"missing explanation {item['externalKey']} {locale}")
print(f"OK {len(bank['questions'])} items")
print(Counter(item["subject"] for item in bank["questions"]))
