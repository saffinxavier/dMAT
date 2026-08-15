# Adding questions

Append objects to the JSON banks under `app/data/`. Refresh the browser after saving. Serve via HTTP (`python -m http.server` from `app/`).

## Files

| File | Type code |
| --- | --- |
| `data/me.json` | `me` |
| `data/ls.json` | `ls` |
| `data/fs.json` | `fs` |
| `data/gam.json` | `gam` |

Keep `id` unique (e.g. `me-l11`, `fs-m09`).

## Shared fields

```json
{
  "id": "me-l99",
  "type": "me",
  "difficulty": "low",
  "prompt": "…",
  "explanation": "Why the answer is correct."
}
```

`difficulty`: `low` | `medium` | `high`

---

## Mathematical Equations (keypad + MCQ)

**Preferred (Exam Mock keypad):**

```json
{
  "id": "me-l99",
  "type": "me",
  "difficulty": "low",
  "prompt": "Each letter stands for a distinct integer from 1 to 20. Find the value of B.",
  "equations": "A = 5\nA + B = 12",
  "ask": "B",
  "entryMode": "numeric",
  "answerValue": 7,
  "options": [
    { "id": "a", "text": "5" },
    { "id": "b", "text": "7" },
    { "id": "c", "text": "12" },
    { "id": "d", "text": "17" }
  ],
  "answer": "b",
  "explanation": "B = 7. A=5, B=7."
}
```

If `entryMode` / `answerValue` are missing, practice falls back to MCQ using `options` + `answer`.

---

## Latin Squares

```json
{
  "id": "ls-l99",
  "type": "ls",
  "difficulty": "low",
  "prompt": "What letter replaces the question mark?",
  "grid": [
    ["A", "B", "C", "D", "E"],
    ["B", "C", "D", "E", "A"],
    ["C", "D", "?", "A", "B"],
    ["D", "E", "A", "B", "C"],
    ["E", "A", "B", "C", "D"]
  ],
  "options": [
    { "id": "a", "text": "A" },
    { "id": "b", "text": "B" },
    { "id": "c", "text": "C" },
    { "id": "d", "text": "D" },
    { "id": "e", "text": "E" }
  ],
  "answer": "e",
  "explanation": "Row/col elimination → E."
}
```

Use `""` for empty cells and `"?"` for the target. `answer` is the lowercase letter.

---

## Figure Sequences (dual 5th + 6th)

A frame is `{ "figures": [ { "shape", "r", "c", "colour", "rot" } ] }`.

```json
{
  "id": "fs-l99",
  "type": "fs",
  "difficulty": "low",
  "prompt": "Which matrices continue the series?",
  "series": [ /* 4 frames */ ],
  "answerFrames": {
    "fifth": { "figures": [ { "shape": "square", "r": 1, "c": 1, "colour": "blue", "rot": 0 } ] },
    "sixth": { "figures": [ { "shape": "square", "r": 1, "c": 2, "colour": "blue", "rot": 0 } ] }
  },
  "optionFrames": [ /* pool of frames user can pick, include fifth+sixth */ ],
  "options": [ /* optional MCQ fallback with id + frame */ ],
  "answer": "a",
  "explanation": "…"
}
```

Shapes: `square` | `circle` | `triangle`. Colours: `blue`, `green`, `red`, `yellow`, `orange`, `navy`, `teal`, `purple`, `gray`. Grid coords `r`,`c` in `0..2`.

---

## General Academic Module

```json
{
  "id": "gam-99-q1",
  "type": "gam",
  "difficulty": "medium",
  "scenarioId": "gam-99",
  "scenarioTitle": "Short title",
  "scenario": "Full scenario text…",
  "prompt": "Question?",
  "options": [
    { "id": "a", "text": "…" },
    { "id": "b", "text": "…" },
    { "id": "c", "text": "…" },
    { "id": "d", "text": "…" }
  ],
  "answer": "b",
  "explanation": "…"
}
```

---

## Validate ME/LS generators

When Python works:

```powershell
cd d:\SetUp\dMAT
python scripts\gen_bank_check.py
```

That regenerates ME/LS (and validates FS/GAM counts). Re-add `entryMode` / `answerValue` to new ME items if you regenerate.

**Do not** paste copyrighted official PDF items into these files.
