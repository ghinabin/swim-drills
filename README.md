# Lane 50

A framework-free poolside companion for the supplied **October 4–13, 2026 final taper**:
50 m freestyle on October 12 and 100 m freestyle on October 13, in a 25 m pool.

Run `python3 -m http.server 8000` and open `http://localhost:8000`.
No application dependencies or build step are required.

- **Today:** today's AM swim or race first; Before pool, optional PM and Evening are separate links. Complete-rest days have no swimming controls.
- **Plan:** all ten dates grouped into final preparation, rest/activation and race days. AM estimates and PM availability stay distinct.
- **Session:** one part of the day at a time. Drill blocks remain in the prescribed order. Large prescription/rest text, explicit Done/Undo and Skip controls, contextual rest choices and one persistent Next/rest footer support use through a phone pouch. Reading a card cannot complete it. Optional PM progress never completes the AM workout.
- **Race:** event-specific activation, warm-up, race cues, optional reporting/heat/lane details, conditional post-50 recovery and official results. Older Oct 1/2 rehearsal records stay under an explicit earlier-records disclosure.
- **Tools & reference:** Tempo remains available as an optional personal cadence tool, outside the three primary navigation destinations. The supplied plan is downloadable.

Activation and mobility are shown as simple ordered lists, without swimming timers or forced check-ins. PM is optional on Oct 4, 5, 7, 8 and after the Oct 12 race under its conditions; Oct 6, 9, 10 and 11 have no PM swimming. No Oct 13 PM workout is supplied. Oct 10 is complete rest; Oct 11 preserves “GET OUT / do not add laps”.

## Source and distances

`SWIMMING-PLAN.md` preserves the newly supplied wording, including Markdown hard line breaks. `data/competition-plan.json` structures all ten dates and four parts of each day. Each set has a purpose group, prescription, effort, recovery and execution cue. The importer validates source excerpts, IDs, phases, rest semantics and known distances, then generates `assets/data.js`:

```sh
node scripts/import-plan.cjs
```

Distance headings are **source estimates**, not verified completed metres. Short skill repetitions and variable distances are preserved rather than rounded up to pool lengths. Oct 6 lists **1,200 m plus turns**, despite a heading of approximately 900–1,000 m; the screen calls out the difference. The Oct 5 PM blocks already total 400–450 m before the easy remainder. Nothing is removed or added to reconcile the supplied estimates.

Rest after a repetition means **after EACH rep**, not a send-off. Between different drill blocks, the supplied default is 30–60 seconds unless a longer rest is specified. The two Oct 8 broken 50s retain their separate 20–30-second internal rest and 4–5-minute rest before the second broken 50. “Full recovery” has no invented countdown. Selecting rest never starts it automatically.

The previous source and structured plan are archived in `docs/archive`. Legacy drill/race-tool URLs lead to current screens; old session IDs offer a current-plan escape link. See `APP-PREPARATION-PLAN.md` for the current information architecture.

## Saved data and offline use

Progress saves on this device, separately for each plan revision and AM/PM phase. Old completion records are retained without attaching them to replacement workouts. Existing official results, reporting details and earlier rehearsal entries carry forward because the two race events are unchanged. Personal tempo profiles survive plan revisions.

Storage failures produce a persistent warning with Retry; pending edits can be exported. Data & backup previews and validates imports, then saves atomically. Backups include phase progress, race details/results, earlier rehearsals and tempos; running timers are excluded. Mixed plan backups must match the current revision. Profile-only Tempo exports can be restored across revisions.

The app works offline after a successful first load on HTTPS or localhost. Check “Ready offline” before the pool. Home-screen installation guidance is available in Data & backup. Updates wait for **Update app** or for all app tabs to close; an active session is not forcibly reloaded. The service worker caches a coherent release and requires a version bump for subsequent changes.

Within a pool session, **Day parts & options** holds screen controls, offline status and Data & backup. **Keep screen on** requests a screen wake lock where supported. It is opt-in and reports failure. Rest countdowns use stored deadlines; foreground/background alerts depend on the device. Physical pouch touch accuracy, pool-light readability, sound audibility and iPhone/Android interruption behaviour still need device testing.

## Tempo

`tempo.html` supports one-effort-at-a-time calibration, manual targets, comparison and short Web Audio cues. Whole-length cadence is labelled an estimate because push-off/glide time is included; a measured surface-window option is provided. 66 individual arm strokes/min equals 33 complete cycles/min, preserving physical cadence when display/beep units change. Pause, stop, volume and ±1/±2 arm-SPM adjustments are available. Audio pauses when the page is hidden or interrupted, and resume requires a tap.

Session attachment, race/turn tempo cues and 1-2-3 rhythm remain future increments. Do not add new calibration sprints to this taper automatically.

## Validation

With Python Playwright and Google Chrome available:

```sh
node tests/tempo.cjs
node tests/tempo-audio.cjs
python3 tests/competition.py
python3 tests/poolside.py
python3 tests/tempo.py
```

The current suites cover the final source contract, date routing, every AM/PM/activation/mobility view at mobile/desktop sizes, explicit completion, independent phase progress, contextual rests, deadline recovery, replacement-plan migration, failed saves/retry, phase backups, race records and coherent offline updates. Older test scripts describe superseded revisions.
