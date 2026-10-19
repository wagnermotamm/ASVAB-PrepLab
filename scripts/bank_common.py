"""Shared helpers for the original ASVAB PrepLab item bank."""

from __future__ import annotations

import hashlib
import random
import re
import unicodedata
from typing import Iterable

LOCALES = ("en", "pt-BR", "es")
NON_ENGLISH = re.compile(
    r"\b(não|questão|porque|também|você|está|são|para|com|uma|resposta|significa|"
    r"pregunta|porque|también|usted|está|opción|significa|más)\b",
    re.IGNORECASE,
)


def normalize(text: str) -> str:
    folded = re.sub(r"\[\[(.*?)\]\]", r"\1", text)
    folded = unicodedata.normalize("NFKD", folded)
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    folded = folded.lower()
    folded = re.sub(r"[^a-z0-9]+", " ", folded)
    return re.sub(r"\s+", " ", folded).strip()


def stem_hash(text: str) -> str:
    return hashlib.sha256(normalize(text).encode("utf-8")).hexdigest()


def display_stem(stem: str) -> str:
    return re.sub(r"\[\[(.*?)\]\]", r"\1", stem)


def shuffle_options(correct: str, wrongs: list[str], rng: random.Random, diagrams: list[str] | None = None) -> list[dict]:
    rows = [{"text": correct, "isCorrect": True, "diagramSvg": None}]
    for index, wrong in enumerate(wrongs):
        diagram = diagrams[index + 1] if diagrams else None
        rows.append({"text": wrong, "isCorrect": False, "diagramSvg": diagram})
    if diagrams:
        rows[0]["diagramSvg"] = diagrams[0]
    rng.shuffle(rows)
    labels = ["A", "B", "C", "D", "E"]
    for index, row in enumerate(rows):
        row["label"] = labels[index]
    return rows


def hints_for(
    strategy: dict[str, dict[str, str]],
    vocab: list[dict] | None = None,
) -> list[dict]:
    rows: list[dict] = []
    level_map = (("QUICK", "quick"), ("METHOD", "method"), ("STEP", "step"))
    for level, key in level_map:
        for locale in LOCALES:
            rows.append(
                {
                    "locale": locale,
                    "type": "STRATEGY",
                    "level": level,
                    "term": None,
                    "explanation": strategy[key][locale],
                }
            )
    for entry in vocab or []:
        for locale in LOCALES:
            rows.append(
                {
                    "locale": locale,
                    "type": "VOCABULARY",
                    "level": "QUICK",
                    "term": entry["term"],
                    "explanation": entry["text"][locale],
                }
            )
    return rows


def explanations_for(
    text: dict[str, str],
    quick: dict[str, str],
    concept: dict[str, str],
    options: list[dict],
    why_wrong: dict[str, str],
) -> list[dict]:
    rows = []
    for locale in LOCALES:
        analysis = {}
        for option in options:
            if option["isCorrect"]:
                analysis[option["label"]] = text[locale]
            else:
                analysis[option["label"]] = why_wrong[locale]
        rows.append(
            {
                "locale": locale,
                "fullExplanation": text[locale],
                "quickMethod": quick[locale],
                "concept": concept[locale],
                "optionAnalysis": analysis,
            }
        )
    return rows


def make_item(
    *,
    external_key: str,
    subject: str,
    stem: str,
    correct: str,
    wrongs: list[str],
    difficulty: str,
    topic: str,
    strategy: dict[str, dict[str, str]],
    explain: dict[str, str],
    concept: dict[str, str],
    why_wrong: dict[str, str],
    rng: random.Random,
    passage: str | None = None,
    vocab: list[dict] | None = None,
    question_type: str = "MULTIPLE_CHOICE",
    diagram_svg: str | None = None,
    option_diagrams: list[str] | None = None,
) -> dict:
    options = shuffle_options(correct, wrongs, rng, option_diagrams)
    return {
        "externalKey": external_key,
        "subject": subject,
        "stem": stem,
        "passage": passage,
        "type": question_type,
        "difficulty": difficulty,
        "origin": "ORIGINAL",
        "topic": topic,
        "sourceRef": "ASVAB PrepLab original practice item",
        "diagramSvg": diagram_svg,
        "options": options,
        "hints": hints_for(strategy, vocab),
        "explanations": explanations_for(explain, strategy["method"], concept, options, why_wrong),
    }


def assert_clean(item: dict, seen: set[str]) -> None:
    stem = display_stem(item["stem"])
    if len(stem) < 20:
        raise ValueError(f"{item['externalKey']} stem too short")
    if NON_ENGLISH.search(stem):
        raise ValueError(f"{item['externalKey']} stem is not English-only")
    options = item["options"]
    if len(options) < 4:
        raise ValueError(f"{item['externalKey']} needs four options")
    texts = [normalize(option["text"] + (option.get("diagramSvg") or "")) for option in options]
    if len(set(texts)) != len(texts):
        raise ValueError(f"{item['externalKey']} duplicate options")
    correct = [option for option in options if option["isCorrect"]]
    if len(correct) != 1:
        raise ValueError(f"{item['externalKey']} needs one key")
    key = correct[0]["text"].strip().lower()
    if len(key) > 3:
        pattern = re.compile(rf"(?<![a-z0-9]){re.escape(key)}(?![a-z0-9])")
        for hint in item["hints"]:
            if hint["level"] == "STEP" or hint["type"] != "STRATEGY":
                continue
            if pattern.search(hint["explanation"].lower()):
                raise ValueError(f"{item['externalKey']} hint leaks answer: {hint['locale']} {hint['level']}")
    fingerprint = stem_hash(f"{item['passage'] or ''}\n{item['stem']}")
    if fingerprint in seen:
        raise ValueError(f"{item['externalKey']} duplicate stem")
    seen.add(fingerprint)
    for locale in LOCALES:
        if not any(row["locale"] == locale for row in item["explanations"]):
            raise ValueError(f"{item['externalKey']} missing explanation {locale}")


def take_unique(rows: Iterable[dict], limit: int, seen: set[str]) -> list[dict]:
    kept: list[dict] = []
    skipped: list[str] = []
    for row in rows:
        if len(kept) >= limit:
            break
        try:
            assert_clean(row, seen)
        except ValueError as error:
            if len(skipped) < 8:
                skipped.append(str(error))
            continue
        kept.append(row)
    if len(kept) < limit:
        raise RuntimeError(f"Only produced {len(kept)} of {limit}. Examples: {skipped}")
    return kept
