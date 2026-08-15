#!/usr/bin/env python3
"""Validate (and regenerate) original ME/LS practice banks.
ponytail: ME items are constructed uniquely (no search). Run when Python is available.
"""
from __future__ import annotations

import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"
rng = random.Random(20260926)


def make_options(correct: int) -> tuple[list[dict], str]:
    opts = {correct}
    while len(opts) < 4:
        opts.add(rng.randint(1, 20))
    opt_list = list(opts)
    rng.shuffle(opt_list)
    options = [{"id": chr(97 + j), "text": str(v)} for j, v in enumerate(opt_list)]
    answer = chr(97 + opt_list.index(correct))
    return options, answer


def me_item(
    id_: str,
    difficulty: str,
    target: str,
    correct: int,
    equations: str,
    explanation: str,
) -> dict:
    options, answer = make_options(correct)
    return {
        "id": id_,
        "type": "me",
        "difficulty": difficulty,
        "prompt": f"Each letter stands for a distinct integer from 1 to 20. Find the value of {target}.",
        "equations": equations,
        "ask": target,
        "entryMode": "numeric",
        "answerValue": correct,
        "options": options,
        "answer": answer,
        "explanation": explanation,
    }


def build_me() -> list[dict]:
    items = []
    for i in range(1, 17):
        a, b = rng.sample(range(1, 21), 2)
        target = rng.choice(["A", "B"])
        correct = a if target == "A" else b
        items.append(
            me_item(
                f"me-l{i:02d}",
                "low",
                target,
                correct,
                f"A = {a}\nA + B = {a + b}",
                f"{target} = {correct}. A={a}, B={b}.",
            )
        )
    for i in range(1, 17):
        a, b, c = rng.sample(range(1, 21), 3)
        target = rng.choice(["A", "B", "C"])
        correct = {"A": a, "B": b, "C": c}[target]
        items.append(
            me_item(
                f"me-m{i:02d}",
                "medium",
                target,
                correct,
                f"A = {a}\nA + B = {a + b}\nB + C = {b + c}",
                f"{target} = {correct}. A={a}, B={b}, C={c}.",
            )
        )
    for i in range(1, 17):
        a, b, c, d = rng.sample(range(1, 21), 4)
        target = rng.choice(["A", "B", "C", "D"])
        correct = {"A": a, "B": b, "C": c, "D": d}[target]
        # Alternate equation order / product-sum variants for later highs
        if i <= 8:
            eqs = f"A + B = {a + b}\nA = {a}\nB + C = {b + c}\nC + D = {c + d}"
        else:
            eqs = f"A = {a}\nB = {b}\nA + C = {a + c}\nC + D = {c + d}"
        items.append(
            me_item(
                f"me-h{i:02d}",
                "high",
                target,
                correct,
                eqs,
                f"{target} = {correct}. A={a}, B={b}, C={c}, D={d}.",
            )
        )
    return items


def latin_square() -> list[list[str]]:
    symbols = list("ABCDE")
    perm = symbols[:]
    rng.shuffle(perm)
    rows = list(range(5))
    cols = list(range(5))
    rng.shuffle(rows)
    rng.shuffle(cols)
    return [[perm[(i + j) % 5] for j in cols] for i in rows]


def build_ls() -> list[dict]:
    items = []
    for diff, n, reveal in (("low", 16, 16), ("medium", 16, 12), ("high", 16, 9)):
        for k in range(1, n + 1):
            full = latin_square()
            qr, qc = rng.randrange(5), rng.randrange(5)
            correct = full[qr][qc]
            shown = set()
            for c in range(5):
                if c != qc:
                    shown.add((qr, c))
            for r in range(5):
                if r != qr:
                    shown.add((r, qc))
            extras = [
                (r, c)
                for r in range(5)
                for c in range(5)
                if (r, c) not in shown and (r, c) != (qr, qc)
            ]
            rng.shuffle(extras)
            need = max(0, reveal - len(shown))
            shown.update(extras[:need])
            grid = []
            for r in range(5):
                row = []
                for c in range(5):
                    if (r, c) == (qr, qc):
                        row.append("?")
                    elif (r, c) in shown:
                        row.append(full[r][c])
                    else:
                        row.append("")
                grid.append(row)
            items.append(
                {
                    "id": f"ls-{diff[0]}{k:02d}",
                    "type": "ls",
                    "difficulty": diff,
                    "prompt": "Each letter A–E appears once per row and once per column. What letter replaces the question mark?",
                    "grid": grid,
                    "options": [{"id": x.lower(), "text": x} for x in "ABCDE"],
                    "answer": correct.lower(),
                    "explanation": f"Cell ({qr + 1},{qc + 1}) must be {correct} by Latin-square elimination.",
                }
            )
    return items


def validate_file(name: str, expect_type: str, min_n: int) -> None:
    path = DATA / name
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    assert len(data) >= min_n, f"{name}: expected >= {min_n}, got {len(data)}"
    for it in data:
        assert it["type"] == expect_type
        assert it["answer"] in {o["id"] for o in it["options"]}
        assert it["difficulty"] in {"low", "medium", "high"}
        if expect_type == "me":
            assert it.get("entryMode") == "numeric"
            assert it.get("answerValue") == int(
                next(o["text"] for o in it["options"] if o["id"] == it["answer"])
            )
    print(f"OK {name}: {len(data)} items")


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    me = build_me()
    ls = build_ls()
    (DATA / "me.json").write_text(json.dumps(me, indent=2), encoding="utf-8")
    (DATA / "ls.json").write_text(json.dumps(ls, indent=2), encoding="utf-8")
    print(f"Wrote {len(me)} ME and {len(ls)} LS")
    validate_file("me.json", "me", 48)
    validate_file("ls.json", "ls", 48)
    validate_file("fs.json", "fs", 48)
    validate_file("gam.json", "gam", 40)


if __name__ == "__main__":
    main()
