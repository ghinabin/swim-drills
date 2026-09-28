# Lane 50

A focused, framework-free companion for the supplied September 26–October 13,
2026 competition plan: 50 m freestyle on October 12 and 100 m freestyle on
October 13, in a 25 m pool.

## Use

Run `python3 -m http.server 8000` and open `http://localhost:8000`.
There are no application dependencies or build steps.

- **Today:** current or next scheduled session, one focus, and resume action.
- **Plan:** all 18 dates, including Saturday rest days and both races.
- **Race:** event-specific warm-up, race cues, reporting time, optional event/heat/lane,
  official results, rehearsal records, and a summary of both events.
- **Session:** exact ordered sets, tap-to-complete cards, skip controls, source instructions,
  a persistent shortcut to the next unfinished set, and one shared footer timer with
  direct start/pause, prescribed rest choices, presets, and custom seconds. Choosing
  a duration never starts the timer automatically. Bulk completion preserves skipped
  and optional sets and provides undo. Day views use a
  top back link instead of the main navigation. September 30 has no stopwatch controls.

Checks, skipped sets, rehearsal entries, race details, and rest timers are saved
in this browser. They are not synchronised between devices. Storage failures
leave a persistent warning with Retry; navigating away warns about unsaved changes.
**Data & backup** exports progress, rehearsal drafts, official results, and race
details as JSON. Restore previews the change, validates the plan revision and data,
and saves matching records atomically; other records are preserved. The running
timer is not exported. Earlier browser records are read automatically and remain
preserved after migration to the current storage format.

The app works offline after a successful initial load on
HTTPS or localhost. Background timer alerts depend on browser/device support.
Offline readiness is visible at the top of each screen. A web app manifest and icons
support home-screen use; installation steps are in Data & backup. Availability varies
by browser. Updates wait until the user chooses **Update app** or closes all app tabs,
so an active session is not forcibly reloaded. For the first upgrade from the previous
release, close all app tabs and reopen once to activate the new release.

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
python3 tests/poolside.py
```

The test validates all dates and set prescriptions, mobile/desktop rendering,
completion and skip persistence, round rests and timer recovery, rehearsal split
validation, reporting times, browser navigation, legacy URLs, storage errors,
and offline sessions/race preparation. The poolside suite additionally checks legacy
record migration, persistent save failures and retry, contextual rests, optional work,
field-level errors, result sharing, atomic backup/restore, and the new layouts.
Earlier scripts in `tests` describe superseded app revisions.
