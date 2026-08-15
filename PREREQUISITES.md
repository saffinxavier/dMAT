# Prerequisites

You only need **Python 3** (plus a browser) to run the prep app and regenerate question banks. **Node.js is not required.**

During the first bank build, this machine had no working Python/Node on PATH (Windows Store stubs only), so banks were generated with PowerShell instead. Installing Python fixes serving and regeneration.

## Required

| Need | Required? | Why |
| --- | --- | --- |
| **Python 3.10+** from [python.org](https://www.python.org/downloads/) — tick **Add python.exe to PATH** | **Yes** to run the app + regen banks | `python -m http.server` + [`scripts/gen_bank_check.py`](scripts/gen_bank_check.py) |
| Browser (Chrome / Edge / Firefox) | Yes | Quiz UI |
| Official prep PDF | Yes for real format | See [materials/SOURCES.md](materials/SOURCES.md) |

## Not required

| Need | Notes |
| --- | --- |
| Node.js | Not used by this repo |
| npm / React | App is static HTML/JS |
| Paid coaching | Skip |

## Install Python (Windows)

1. Download **Python 3.10+** from [python.org/downloads](https://www.python.org/downloads/).
2. Run the installer and enable **Add python.exe to PATH**.
3. Close and reopen the terminal (and Cursor).
4. Verify:

```powershell
python --version
```

You should see something like `Python 3.12.x`. If you get a Microsoft Store redirect, disable the Store app aliases under **Settings → Apps → Advanced app settings → App execution aliases** (turn off `python.exe` / `python3.exe` stubs), or use the `py -3` launcher after a real install.

## Run the prep app

```powershell
cd d:\SetUp\dMAT\app
python -m http.server 8080
```

Open http://localhost:8080

Opening `index.html` as `file://` often fails because the browser blocks JSON `fetch`. Always use HTTP.

## Regenerate / validate ME + LS banks

```powershell
cd d:\SetUp\dMAT
python scripts\gen_bank_check.py
```

FS and GAM JSON are hand-authored under `app/data/` and are only validated, not rewritten, by that script.

## Study aids in this repo

| Doc | Purpose |
| --- | --- |
| [progress/TRACKER.md](progress/TRACKER.md) | Weekly + per-type score tracking |
| [materials/CHEATS.md](materials/CHEATS.md) | Memory codes (study only — no notes in exam) |
| [materials/HOW-TO-SOLVE.md](materials/HOW-TO-SOLVE.md) | Solution order per question type |
| [app/README.md](app/README.md) | App features |
