# Lane 50

A focused, framework-free companion for the supplied September 26–October 13,
2026 competition plan: 50 m freestyle on October 12 and 100 m freestyle on
October 13, in a 25 m pool.

## Use

Run `python3 -m http.server 8000` and open `http://localhost:8000`.
There are no application dependencies or build steps.

- **Today:** current or next scheduled session, one focus, and resume action.
- **Plan:** all 18 dates, including Saturday rest days and both races.
- **Race:** event-specific warm-up, race cues, reporting time, results, and rehearsal records.
- **Session:** exact ordered sets, tap-to-complete cards, skip controls, source instructions,
  and one shared footer timer with presets and custom seconds. Day views use a
  top back link instead of the main navigation. September 30 has no stopwatch controls.

Checks, skipped sets, rehearsal entries, race details, and rest timers are saved
in this browser. They are not synchronised between devices. Storage failures
are reported visibly. The app works offline after a successful initial load on
HTTPS or localhost. Background timer alerts depend on browser/device support.

## Source and updates

`SWIMMING-PLAN.md` is the unchanged supplied plan. `data/competition-plan.json`
contains the reviewed structured sets and each day's original instructions.
Run `node scripts/import-plan.cjs` after editing the structured data. The command
validates dates, source excerpts, totals, and timer durations, then generates
`assets/data.js`. All visible pages use that same bundle.

Two race warm-up labels reflect the arithmetic of the prescribed sets:
October 12 is 500 m plus optional 50–100 m; October 13 is 550–600 m.
No prescribed sets were removed to match the original headings.

Old plan documents are preserved in `docs/archive`. Legacy drill, progress,
preview, and race-tool URLs lead to current screens. Old workout IDs display a
current-plan link. Existing browser records from previous revisions are retained
but never attached to replacement workouts.

`APP-PREPARATION-PLAN.md` records the agreed product plan. The application uses
`assets/app.js`, `assets/navigation.js`, `assets/styles.css`, and
`assets/preparation.css`. `sw.js` caches the complete current release; bump its
cache version for subsequent releases.

## Validation

With Python Playwright and Google Chrome available, run:

```sh
python3 tests/competition.py
```

The test validates all dates and set prescriptions, mobile/desktop rendering,
completion and skip persistence, round rests and timer recovery, rehearsal split
validation, reporting times, browser navigation, legacy URLs, storage errors,
and offline sessions/race preparation. Earlier scripts in `tests` describe
superseded app revisions; this is the current release check.
