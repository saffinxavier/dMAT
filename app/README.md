# dMAT Prep App

Local practice for **Figure Sequences**, **Mathematical Equations**, **Latin Squares**, and **General Academic Module**.

Original items only — not past papers. Official PDFs: [`../materials/SOURCES.md`](../materials/SOURCES.md).

## Prerequisite

**Python 3.10+** — [`../PREREQUISITES.md`](../PREREQUISITES.md)

```powershell
cd d:\SetUp\dMAT\app
python -m http.server 8080
```

Open http://localhost:8080

## Themes (1B)

- **Practice** defaults to **dark** (easier on eyes). Toggle Light/Dark in the hub header.
- **Exam Mock** forces a separate **light grey test-centre** skin.

## Learn codes

Hub button **Learn codes** opens an interactive view (practice only — not in Exam Mock):

- Big flipable **cheat code chips** (not a bullet list)
- “Say it once” recall line
- How-to-solve steppers per type
- Self-check: pick the right code for a situation

Offline markdown still exists at [`../materials/CHEATS.md`](../materials/CHEATS.md) and [`../materials/HOW-TO-SOLVE.md`](../materials/HOW-TO-SOLVE.md).

## About dMAT

Hub button **About dMAT** — exam structure, timers, rules, scoring, APS India dates/fee. Offline mirror: [`../materials/EXAM-DAY.md`](../materials/EXAM-DAY.md).

## Modes

| Mode | Notes |
| --- | --- |
| Quick / Exam-style / Timed | Practice: Check/Reveal, scratch pad, cheats on hub |
| **Exam Mock** | Full Core → break → GAM; irreversible End subtest; no notes/cheats; ME keypad, FS dual frames, LS clickable grid |

Exam Mock **approximates** g.a.s.t. digital flow. Still watch official videos before test day: [d-mat.de preparation](https://www.d-mat.de/en/preparation-for-the-exam/).

## Adding questions

See **[ADDING-QUESTIONS.md](ADDING-QUESTIONS.md)** — append JSON to `data/*.json`, refresh browser.

## Bank sizes

| File | Items |
| --- | --- |
| `data/me.json` | 48 (16× low/med/high, numeric `answerValue`) |
| `data/ls.json` | 48 (16× low/med/high) |
| `data/fs.json` | 48 (16× low/med/high, dual `answerFrames`) |
| `data/gam.json` | 40 (8 scenarios × 5) |

## Related

| Doc | Purpose |
| --- | --- |
| [CHEATS.md](../materials/CHEATS.md) | Memory codes |
| [HOW-TO-SOLVE.md](../materials/HOW-TO-SOLVE.md) | Solution process |
| [TRACKER.md](../progress/TRACKER.md) | Weekly scores |
