#!/usr/bin/env python3
"""Generate original Figure Sequence items (dual 5th+6th for Exam Mock)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"


def frame(r, c, colour, rot=0, shape="square"):
    return {"figures": [{"shape": shape, "r": r, "c": c, "colour": colour, "rot": rot}]}


def two(f1, f2):
    return {"figures": f1["figures"] + f2["figures"]}


def build_fs() -> list[dict]:
    items: list[dict] = []

    def add(diff, idx, explanation, series4, fifth, sixth, distractors):
        # MCQ fallback: fifth as correct option among fourth-ish distractors
        opts = [fifth] + distractors[:3]
        labeled = []
        answer = "a"
        for i, fr in enumerate(opts):
            oid = chr(97 + i)
            labeled.append({"id": oid, "frame": fr})
            if fr == fifth:
                answer = oid
        # option pool must include fifth + sixth + distractors
        pool = []
        seen = set()

        def key(fr):
            return json.dumps(fr, sort_keys=True)

        for fr in [fifth, sixth, *distractors, *opts]:
            k = key(fr)
            if k not in seen:
                seen.add(k)
                pool.append(fr)

        items.append(
            {
                "id": f"fs-{diff[0]}{idx:02d}",
                "type": "fs",
                "difficulty": diff,
                "prompt": "Which matrices continue the series?",
                "series": series4,
                "options": labeled,
                "answer": answer,
                "explanation": explanation,
                "answerFrames": {"fifth": fifth, "sixth": sixth},
                "optionFrames": pool,
            }
        )

    # ----- LOW (single rule) -----
    add(
        "low",
        1,
        "Blue square moves one cell right each step (row 1).",
        [frame(1, 0, "blue"), frame(1, 1, "blue"), frame(1, 2, "blue"), frame(1, 0, "blue")],
        frame(1, 1, "blue"),
        frame(1, 2, "blue"),
        [frame(1, 0, "blue"), frame(0, 1, "blue"), frame(2, 1, "red")],
    )
    add(
        "low",
        2,
        "Red circle moves one cell down each step (column 1).",
        [
            frame(0, 1, "red", shape="circle"),
            frame(1, 1, "red", shape="circle"),
            frame(2, 1, "red", shape="circle"),
            frame(0, 1, "red", shape="circle"),
        ],
        frame(1, 1, "red", shape="circle"),
        frame(2, 1, "red", shape="circle"),
        [
            frame(0, 1, "red", shape="circle"),
            frame(1, 0, "red", shape="circle"),
            frame(1, 1, "blue", shape="circle"),
        ],
    )
    add(
        "low",
        3,
        "Square stays at centre; colour alternates blue → green.",
        [frame(1, 1, "blue"), frame(1, 1, "green"), frame(1, 1, "blue"), frame(1, 1, "green")],
        frame(1, 1, "blue"),
        frame(1, 1, "green"),
        [frame(1, 1, "yellow"), frame(1, 0, "blue"), frame(0, 1, "blue")],
    )
    add(
        "low",
        4,
        "Triangle at (0,0) rotates 90° clockwise each step.",
        [
            frame(0, 0, "navy", 0, "triangle"),
            frame(0, 0, "navy", 90, "triangle"),
            frame(0, 0, "navy", 180, "triangle"),
            frame(0, 0, "navy", 270, "triangle"),
        ],
        frame(0, 0, "navy", 0, "triangle"),
        frame(0, 0, "navy", 90, "triangle"),
        [
            frame(0, 0, "navy", 180, "triangle"),
            frame(0, 1, "navy", 0, "triangle"),
            frame(1, 0, "navy", 0, "triangle"),
        ],
    )
    add(
        "low",
        5,
        "Green square moves on the diagonal and bounces: 0,0 → 1,1 → 2,2 → 1,1 → 0,0 → 1,1.",
        [frame(0, 0, "green"), frame(1, 1, "green"), frame(2, 2, "green"), frame(1, 1, "green")],
        frame(0, 0, "green"),
        frame(1, 1, "green"),
        [frame(2, 2, "green"), frame(1, 2, "green"), frame(0, 1, "green")],
    )
    add(
        "low",
        6,
        "Orange circle moves left one cell; after col 0 it reappears at col 2.",
        [
            frame(2, 2, "orange", shape="circle"),
            frame(2, 1, "orange", shape="circle"),
            frame(2, 0, "orange", shape="circle"),
            frame(2, 2, "orange", shape="circle"),
        ],
        frame(2, 1, "orange", shape="circle"),
        frame(2, 0, "orange", shape="circle"),
        [
            frame(2, 2, "orange", shape="circle"),
            frame(1, 1, "orange", shape="circle"),
            frame(2, 1, "blue", shape="circle"),
        ],
    )
    add(
        "low",
        7,
        "Teal square moves up one; wraps from row 0 to row 2.",
        [frame(2, 2, "teal"), frame(1, 2, "teal"), frame(0, 2, "teal"), frame(2, 2, "teal")],
        frame(1, 2, "teal"),
        frame(0, 2, "teal"),
        [frame(2, 2, "teal"), frame(1, 1, "teal"), frame(2, 1, "teal")],
    )
    add(
        "low",
        8,
        "Centre square cycles blue → red → yellow → blue.",
        [frame(1, 1, "blue"), frame(1, 1, "red"), frame(1, 1, "yellow"), frame(1, 1, "blue")],
        frame(1, 1, "red"),
        frame(1, 1, "yellow"),
        [frame(1, 1, "blue"), frame(1, 1, "green"), frame(0, 0, "red")],
    )
    add(
        "low",
        9,
        "Yellow square moves right one on row 0 (wrap).",
        [frame(0, 0, "yellow"), frame(0, 1, "yellow"), frame(0, 2, "yellow"), frame(0, 0, "yellow")],
        frame(0, 1, "yellow"),
        frame(0, 2, "yellow"),
        [frame(0, 0, "yellow"), frame(1, 1, "yellow"), frame(0, 1, "blue")],
    )
    add(
        "low",
        10,
        "Purple circle moves up on column 0 (wrap).",
        [
            frame(2, 0, "purple", shape="circle"),
            frame(1, 0, "purple", shape="circle"),
            frame(0, 0, "purple", shape="circle"),
            frame(2, 0, "purple", shape="circle"),
        ],
        frame(1, 0, "purple", shape="circle"),
        frame(0, 0, "purple", shape="circle"),
        [
            frame(2, 0, "purple", shape="circle"),
            frame(1, 1, "purple", shape="circle"),
            frame(1, 0, "red", shape="circle"),
        ],
    )
    add(
        "low",
        11,
        "Grey square stays put; colour cycles red → teal → red.",
        [frame(2, 2, "red"), frame(2, 2, "teal"), frame(2, 2, "red"), frame(2, 2, "teal")],
        frame(2, 2, "red"),
        frame(2, 2, "teal"),
        [frame(2, 2, "blue"), frame(1, 1, "red"), frame(2, 1, "teal")],
    )
    add(
        "low",
        12,
        "Triangle at centre rotates 90° CCW each step.",
        [
            frame(1, 1, "navy", 0, "triangle"),
            frame(1, 1, "navy", 270, "triangle"),
            frame(1, 1, "navy", 180, "triangle"),
            frame(1, 1, "navy", 90, "triangle"),
        ],
        frame(1, 1, "navy", 0, "triangle"),
        frame(1, 1, "navy", 270, "triangle"),
        [
            frame(1, 1, "navy", 90, "triangle"),
            frame(1, 0, "navy", 0, "triangle"),
            frame(0, 1, "navy", 0, "triangle"),
        ],
    )
    add(
        "low",
        13,
        "Green square moves down-left on anti-diagonal bounce.",
        [frame(0, 2, "green"), frame(1, 1, "green"), frame(2, 0, "green"), frame(1, 1, "green")],
        frame(0, 2, "green"),
        frame(1, 1, "green"),
        [frame(2, 0, "green"), frame(0, 0, "green"), frame(1, 2, "green")],
    )
    add(
        "low",
        14,
        "Blue circle moves right on row 2 (wrap).",
        [
            frame(2, 0, "blue", shape="circle"),
            frame(2, 1, "blue", shape="circle"),
            frame(2, 2, "blue", shape="circle"),
            frame(2, 0, "blue", shape="circle"),
        ],
        frame(2, 1, "blue", shape="circle"),
        frame(2, 2, "blue", shape="circle"),
        [
            frame(2, 0, "blue", shape="circle"),
            frame(1, 1, "blue", shape="circle"),
            frame(2, 1, "red", shape="circle"),
        ],
    )
    add(
        "low",
        15,
        "Orange square moves left on row 1 (wrap).",
        [frame(1, 2, "orange"), frame(1, 1, "orange"), frame(1, 0, "orange"), frame(1, 2, "orange")],
        frame(1, 1, "orange"),
        frame(1, 0, "orange"),
        [frame(1, 2, "orange"), frame(0, 1, "orange"), frame(1, 1, "blue")],
    )
    add(
        "low",
        16,
        "Centre square cycles yellow → purple → gray → yellow.",
        [frame(1, 1, "yellow"), frame(1, 1, "purple"), frame(1, 1, "gray"), frame(1, 1, "yellow")],
        frame(1, 1, "purple"),
        frame(1, 1, "gray"),
        [frame(1, 1, "yellow"), frame(1, 1, "blue"), frame(0, 0, "purple")],
    )

    # ----- MEDIUM (combined rules) -----
    add(
        "medium",
        1,
        "Moves right one and colour flips blue/green each step.",
        [frame(0, 0, "blue"), frame(0, 1, "green"), frame(0, 2, "blue"), frame(0, 0, "green")],
        frame(0, 1, "blue"),
        frame(0, 2, "green"),
        [frame(0, 1, "green"), frame(0, 2, "blue"), frame(1, 1, "blue")],
    )
    add(
        "medium",
        2,
        "Moves down and rotates +90° each step.",
        [
            frame(0, 0, "navy", 0, "triangle"),
            frame(1, 0, "navy", 90, "triangle"),
            frame(2, 0, "navy", 180, "triangle"),
            frame(0, 0, "navy", 270, "triangle"),
        ],
        frame(1, 0, "navy", 0, "triangle"),
        frame(2, 0, "navy", 90, "triangle"),
        [
            frame(1, 0, "navy", 90, "triangle"),
            frame(2, 0, "navy", 0, "triangle"),
            frame(1, 1, "navy", 0, "triangle"),
        ],
    )
    add(
        "medium",
        3,
        "Step size grows then bounce: positions 0→1→0→2→0→1 on row 1.",
        [frame(1, 0, "purple"), frame(1, 1, "purple"), frame(1, 0, "purple"), frame(1, 2, "purple")],
        frame(1, 0, "purple"),
        frame(1, 1, "purple"),
        [frame(1, 2, "purple"), frame(1, 1, "blue"), frame(0, 2, "purple")],
    )
    add(
        "medium",
        4,
        "Two independent figures: blue right, red left.",
        [
            two(frame(0, 0, "blue"), frame(2, 2, "red", shape="circle")),
            two(frame(0, 1, "blue"), frame(2, 1, "red", shape="circle")),
            two(frame(0, 2, "blue"), frame(2, 0, "red", shape="circle")),
            two(frame(0, 0, "blue"), frame(2, 2, "red", shape="circle")),
        ],
        two(frame(0, 1, "blue"), frame(2, 1, "red", shape="circle")),
        two(frame(0, 2, "blue"), frame(2, 0, "red", shape="circle")),
        [
            two(frame(0, 2, "blue"), frame(2, 2, "red", shape="circle")),
            two(frame(1, 1, "blue"), frame(2, 1, "red", shape="circle")),
            two(frame(0, 1, "red"), frame(2, 1, "blue", shape="circle")),
        ],
    )
    add(
        "medium",
        5,
        "Diagonal move + colour blue→orange alternate.",
        [frame(0, 0, "blue"), frame(1, 1, "orange"), frame(2, 2, "blue"), frame(1, 1, "orange")],
        frame(0, 0, "blue"),
        frame(1, 1, "orange"),
        [frame(0, 0, "orange"), frame(2, 2, "orange"), frame(1, 0, "blue")],
    )
    add(
        "medium",
        6,
        "Slide along border: top row then down the right edge.",
        [frame(0, 0, "teal"), frame(0, 1, "teal"), frame(0, 2, "teal"), frame(1, 2, "teal")],
        frame(2, 2, "teal"),
        frame(2, 1, "teal"),
        [frame(0, 2, "teal"), frame(1, 1, "teal"), frame(2, 0, "teal")],
    )
    add(
        "medium",
        7,
        "Rotation 90° and move right one.",
        [
            frame(1, 0, "navy", 0, "triangle"),
            frame(1, 1, "navy", 90, "triangle"),
            frame(1, 2, "navy", 180, "triangle"),
            frame(1, 0, "navy", 270, "triangle"),
        ],
        frame(1, 1, "navy", 0, "triangle"),
        frame(1, 2, "navy", 90, "triangle"),
        [
            frame(1, 1, "navy", 90, "triangle"),
            frame(1, 2, "navy", 0, "triangle"),
            frame(0, 1, "navy", 0, "triangle"),
        ],
    )
    add(
        "medium",
        8,
        "Bounce at right edge: right, right, left, left.",
        [frame(2, 0, "green"), frame(2, 1, "green"), frame(2, 2, "green"), frame(2, 1, "green")],
        frame(2, 0, "green"),
        frame(2, 1, "green"),
        [frame(2, 2, "green"), frame(1, 0, "green"), frame(2, 1, "blue")],
    )
    add(
        "medium",
        9,
        "Moves down one; colour flips yellow/teal.",
        [frame(0, 1, "yellow"), frame(1, 1, "teal"), frame(2, 1, "yellow"), frame(0, 1, "teal")],
        frame(1, 1, "yellow"),
        frame(2, 1, "teal"),
        [frame(1, 1, "teal"), frame(2, 1, "yellow"), frame(0, 0, "yellow")],
    )
    add(
        "medium",
        10,
        "Moves left one and rotates +90°.",
        [
            frame(0, 2, "navy", 0, "triangle"),
            frame(0, 1, "navy", 90, "triangle"),
            frame(0, 0, "navy", 180, "triangle"),
            frame(0, 2, "navy", 270, "triangle"),
        ],
        frame(0, 1, "navy", 0, "triangle"),
        frame(0, 0, "navy", 90, "triangle"),
        [
            frame(0, 1, "navy", 90, "triangle"),
            frame(0, 0, "navy", 0, "triangle"),
            frame(1, 1, "navy", 0, "triangle"),
        ],
    )
    add(
        "medium",
        11,
        "Border walk clockwise one cell.",
        [frame(0, 0, "red"), frame(0, 1, "red"), frame(0, 2, "red"), frame(1, 2, "red")],
        frame(2, 2, "red"),
        frame(2, 1, "red"),
        [frame(1, 1, "red"), frame(2, 0, "red"), frame(0, 0, "blue")],
    )
    add(
        "medium",
        12,
        "Two figures: green down, orange up (same column).",
        [
            two(frame(0, 2, "green"), frame(2, 0, "orange", shape="circle")),
            two(frame(1, 2, "green"), frame(1, 0, "orange", shape="circle")),
            two(frame(2, 2, "green"), frame(0, 0, "orange", shape="circle")),
            two(frame(0, 2, "green"), frame(2, 0, "orange", shape="circle")),
        ],
        two(frame(1, 2, "green"), frame(1, 0, "orange", shape="circle")),
        two(frame(2, 2, "green"), frame(0, 0, "orange", shape="circle")),
        [
            two(frame(1, 2, "orange"), frame(1, 0, "green", shape="circle")),
            two(frame(2, 2, "green"), frame(1, 0, "orange", shape="circle")),
            two(frame(0, 2, "green"), frame(0, 0, "orange", shape="circle")),
        ],
    )
    add(
        "medium",
        13,
        "Diagonal bounce + alternate purple/gray.",
        [frame(0, 0, "purple"), frame(1, 1, "gray"), frame(2, 2, "purple"), frame(1, 1, "gray")],
        frame(0, 0, "purple"),
        frame(1, 1, "gray"),
        [frame(0, 0, "gray"), frame(2, 2, "gray"), frame(1, 0, "purple")],
    )
    add(
        "medium",
        14,
        "Move right with growing then shrinking steps on row 0: 0→1→0→2→0→1.",
        [frame(0, 0, "blue"), frame(0, 1, "blue"), frame(0, 0, "blue"), frame(0, 2, "blue")],
        frame(0, 0, "blue"),
        frame(0, 1, "blue"),
        [frame(0, 2, "blue"), frame(0, 1, "red"), frame(1, 0, "blue")],
    )
    add(
        "medium",
        15,
        "Slide bottom edge left then up the left border.",
        [frame(2, 2, "teal"), frame(2, 1, "teal"), frame(2, 0, "teal"), frame(1, 0, "teal")],
        frame(0, 0, "teal"),
        frame(0, 1, "teal"),
        [frame(1, 1, "teal"), frame(0, 2, "teal"), frame(2, 0, "blue")],
    )
    add(
        "medium",
        16,
        "Rotate 90° CW while moving down (wrap).",
        [
            frame(0, 2, "navy", 0, "triangle"),
            frame(1, 2, "navy", 90, "triangle"),
            frame(2, 2, "navy", 180, "triangle"),
            frame(0, 2, "navy", 270, "triangle"),
        ],
        frame(1, 2, "navy", 0, "triangle"),
        frame(2, 2, "navy", 90, "triangle"),
        [
            frame(1, 2, "navy", 90, "triangle"),
            frame(2, 2, "navy", 0, "triangle"),
            frame(1, 1, "navy", 0, "triangle"),
        ],
    )

    # ----- HIGH (multi-rule / dual figures) -----
    add(
        "high",
        1,
        "x+1 steps right with bounce; colour cycles blue/red.",
        [frame(0, 0, "blue"), frame(0, 1, "red"), frame(0, 0, "blue"), frame(0, 2, "red")],
        frame(0, 0, "blue"),
        frame(0, 1, "red"),
        [frame(0, 1, "blue"), frame(0, 2, "blue"), frame(1, 2, "red")],
    )
    add(
        "high",
        2,
        "Two figures: square rotates in place; circle orbits clockwise on corners.",
        [
            two(frame(1, 1, "navy", 0), frame(0, 0, "orange", shape="circle")),
            two(frame(1, 1, "navy", 90), frame(0, 2, "orange", shape="circle")),
            two(frame(1, 1, "navy", 180), frame(2, 2, "orange", shape="circle")),
            two(frame(1, 1, "navy", 270), frame(2, 0, "orange", shape="circle")),
        ],
        two(frame(1, 1, "navy", 0), frame(0, 0, "orange", shape="circle")),
        two(frame(1, 1, "navy", 90), frame(0, 2, "orange", shape="circle")),
        [
            two(frame(1, 1, "navy", 90), frame(0, 0, "orange", shape="circle")),
            two(frame(1, 1, "navy", 0), frame(0, 2, "orange", shape="circle")),
            two(frame(0, 0, "navy", 0), frame(1, 1, "orange", shape="circle")),
        ],
    )
    add(
        "high",
        3,
        "Slide on border clockwise one cell each step.",
        [frame(0, 0, "purple"), frame(0, 1, "purple"), frame(0, 2, "purple"), frame(1, 2, "purple")],
        frame(2, 2, "purple"),
        frame(2, 1, "purple"),
        [frame(1, 1, "purple"), frame(2, 0, "purple"), frame(0, 0, "purple")],
    )
    add(
        "high",
        4,
        "Move down-right with growing step then colour flip.",
        [frame(0, 0, "blue"), frame(1, 1, "green"), frame(0, 0, "blue"), frame(2, 2, "green")],
        frame(0, 0, "blue"),
        frame(1, 1, "green"),
        [frame(1, 1, "blue"), frame(2, 2, "blue"), frame(0, 1, "green")],
    )
    add(
        "high",
        5,
        "Triangle rotates −90° (CCW) while moving left.",
        [
            frame(0, 2, "navy", 0, "triangle"),
            frame(0, 1, "navy", 270, "triangle"),
            frame(0, 0, "navy", 180, "triangle"),
            frame(0, 2, "navy", 90, "triangle"),
        ],
        frame(0, 1, "navy", 0, "triangle"),
        frame(0, 0, "navy", 270, "triangle"),
        [
            frame(0, 1, "navy", 270, "triangle"),
            frame(0, 0, "navy", 0, "triangle"),
            frame(1, 1, "navy", 0, "triangle"),
        ],
    )
    add(
        "high",
        6,
        "Independent: blue down, green right, both wrap.",
        [
            two(frame(0, 0, "blue"), frame(2, 0, "green")),
            two(frame(1, 0, "blue"), frame(2, 1, "green")),
            two(frame(2, 0, "blue"), frame(2, 2, "green")),
            two(frame(0, 0, "blue"), frame(2, 0, "green")),
        ],
        two(frame(1, 0, "blue"), frame(2, 1, "green")),
        two(frame(2, 0, "blue"), frame(2, 2, "green")),
        [
            two(frame(2, 0, "blue"), frame(2, 1, "green")),
            two(frame(1, 1, "blue"), frame(2, 1, "green")),
            two(frame(1, 0, "green"), frame(2, 1, "blue")),
        ],
    )
    add(
        "high",
        7,
        "Bounce horizontal + alternate yellow/teal.",
        [frame(1, 0, "yellow"), frame(1, 1, "teal"), frame(1, 2, "yellow"), frame(1, 1, "teal")],
        frame(1, 0, "yellow"),
        frame(1, 1, "teal"),
        [frame(1, 0, "teal"), frame(1, 2, "teal"), frame(0, 0, "yellow")],
    )
    add(
        "high",
        8,
        "Clockwise border walk two cells each step.",
        [frame(0, 0, "red"), frame(0, 2, "red"), frame(2, 2, "red"), frame(2, 0, "red")],
        frame(0, 0, "red"),
        frame(0, 2, "red"),
        [frame(0, 1, "red"), frame(1, 2, "red"), frame(1, 1, "red")],
    )
    add(
        "high",
        9,
        "x+1 down with bounce on col 2; colour blue/orange.",
        [frame(0, 2, "blue"), frame(1, 2, "orange"), frame(0, 2, "blue"), frame(2, 2, "orange")],
        frame(0, 2, "blue"),
        frame(1, 2, "orange"),
        [frame(1, 2, "blue"), frame(2, 2, "blue"), frame(0, 1, "orange")],
    )
    add(
        "high",
        10,
        "Square orbits anti-clockwise on corners; centre circle flips colour.",
        [
            two(frame(0, 0, "green"), frame(1, 1, "red", shape="circle")),
            two(frame(2, 0, "green"), frame(1, 1, "teal", shape="circle")),
            two(frame(2, 2, "green"), frame(1, 1, "red", shape="circle")),
            two(frame(0, 2, "green"), frame(1, 1, "teal", shape="circle")),
        ],
        two(frame(0, 0, "green"), frame(1, 1, "red", shape="circle")),
        two(frame(2, 0, "green"), frame(1, 1, "teal", shape="circle")),
        [
            two(frame(0, 0, "green"), frame(1, 1, "teal", shape="circle")),
            two(frame(0, 2, "green"), frame(1, 1, "red", shape="circle")),
            two(frame(1, 1, "green"), frame(0, 0, "red", shape="circle")),
        ],
    )
    add(
        "high",
        11,
        "Border slide CCW one cell + colour cycle yellow→purple→gray.",
        [frame(0, 0, "yellow"), frame(1, 0, "purple"), frame(2, 0, "gray"), frame(2, 1, "yellow")],
        frame(2, 2, "purple"),
        frame(1, 2, "gray"),
        [frame(2, 2, "yellow"), frame(0, 1, "purple"), frame(1, 1, "gray")],
    )
    add(
        "high",
        12,
        "Triangle moves right (wrap) and rotates +90°; colour stays navy.",
        [
            frame(2, 0, "navy", 0, "triangle"),
            frame(2, 1, "navy", 90, "triangle"),
            frame(2, 2, "navy", 180, "triangle"),
            frame(2, 0, "navy", 270, "triangle"),
        ],
        frame(2, 1, "navy", 0, "triangle"),
        frame(2, 2, "navy", 90, "triangle"),
        [
            frame(2, 1, "navy", 90, "triangle"),
            frame(2, 2, "navy", 0, "triangle"),
            frame(1, 1, "navy", 0, "triangle"),
        ],
    )
    add(
        "high",
        13,
        "Two movers: blue right on top, red left on bottom (wrap).",
        [
            two(frame(0, 0, "blue"), frame(2, 2, "red")),
            two(frame(0, 1, "blue"), frame(2, 1, "red")),
            two(frame(0, 2, "blue"), frame(2, 0, "red")),
            two(frame(0, 0, "blue"), frame(2, 2, "red")),
        ],
        two(frame(0, 1, "blue"), frame(2, 1, "red")),
        two(frame(0, 2, "blue"), frame(2, 0, "red")),
        [
            two(frame(0, 1, "red"), frame(2, 1, "blue")),
            two(frame(1, 1, "blue"), frame(2, 1, "red")),
            two(frame(0, 2, "blue"), frame(2, 2, "red")),
        ],
    )
    add(
        "high",
        14,
        "Diagonal bounce with step growth then colour teal/orange.",
        [frame(0, 0, "teal"), frame(1, 1, "orange"), frame(0, 0, "teal"), frame(2, 2, "orange")],
        frame(0, 0, "teal"),
        frame(1, 1, "orange"),
        [frame(1, 1, "teal"), frame(2, 2, "teal"), frame(0, 1, "orange")],
    )
    add(
        "high",
        15,
        "Clockwise corner hop + in-place 90° spin.",
        [
            frame(0, 0, "navy", 0, "triangle"),
            frame(0, 2, "navy", 90, "triangle"),
            frame(2, 2, "navy", 180, "triangle"),
            frame(2, 0, "navy", 270, "triangle"),
        ],
        frame(0, 0, "navy", 0, "triangle"),
        frame(0, 2, "navy", 90, "triangle"),
        [
            frame(0, 0, "navy", 90, "triangle"),
            frame(1, 1, "navy", 0, "triangle"),
            frame(0, 2, "navy", 0, "triangle"),
        ],
    )
    add(
        "high",
        16,
        "NO-GHOST dual: blue down-right diagonal bounce, green stays opposite corner then swaps.",
        [
            two(frame(0, 0, "blue"), frame(2, 2, "green")),
            two(frame(1, 1, "blue"), frame(2, 2, "green")),
            two(frame(2, 2, "blue"), frame(0, 0, "green")),
            two(frame(1, 1, "blue"), frame(0, 0, "green")),
        ],
        two(frame(0, 0, "blue"), frame(2, 2, "green")),
        two(frame(1, 1, "blue"), frame(2, 2, "green")),
        [
            two(frame(0, 0, "blue"), frame(0, 0, "green")),  # overlap BAD distractor
            two(frame(1, 1, "green"), frame(2, 2, "blue")),
            two(frame(2, 2, "blue"), frame(2, 2, "green")),
        ],
    )

    return items


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    items = build_fs()
    assert len(items) == 48, len(items)
    for it in items:
        assert it["answer"] in {o["id"] for o in it["options"]}
        assert len(it["series"]) == 4
        assert it["answerFrames"]["fifth"]
        assert it["answerFrames"]["sixth"]
        assert it["answerFrames"]["fifth"] in it["optionFrames"] or any(
            json.dumps(f, sort_keys=True) == json.dumps(it["answerFrames"]["fifth"], sort_keys=True)
            for f in it["optionFrames"]
        )
    (DATA / "fs.json").write_text(json.dumps(items, indent=2), encoding="utf-8")
    print(f"Wrote {len(items)} FS items")


if __name__ == "__main__":
    main()
