# Lane 50

A framework-free poolside companion for the supplied **October 4–13, 2026 final taper**:
50 m freestyle on October 12 and 100 m freestyle on October 13, in a 25 m pool.

Run `python3 -m http.server 8000` and open `http://localhost:8000`.
No application dependencies or build step are required.

- **Today:** one card for the day’s training focus, distance, drill count and ordered drill groups, with one Open/Resume drills action. No swim-period tabs. Before-pool activation opens in a modal; evening mobility appears under Evening recovery. Complete-rest days have no swimming controls.
- **Plan:** all ten dates grouped into final preparation, rest/activation and race days. AM estimates and rest days remain visible.
- **Session:** one AM swim with activation and evening mobility buttons. Activation/mobility buttons at the top open modal exercise lists with a large Close button, Escape/Back support and return to the same scroll position. Drill blocks remain in the prescribed order. Compact cards use standard native checkboxes inside full-card labels: tap anywhere or use Space to check/uncheck, with a struck-through title. Prescription, rest and cues stay readable. Done, Skip, per-card Rest and bulk-finish buttons are removed. The bottom rest bar defaults to 20 seconds and has no Next row. Tap the time to open one compact grid of this workout’s rest times; tapping a duration immediately starts rest and closes the picker. There is no drill selector, custom entry or separate Start step in the picker. Legacy evening-swim links open the current AM workout.
- **Race:** event-specific activation, warm-up, race cues, optional reporting/heat/lane details, conditional post-50 recovery and official results. Older Oct 1/2 rehearsal records stay under an explicit earlier-records disclosure.
- **Tools & reference:** Tempo remains available as an optional personal cadence tool, outside the three primary navigation destinations. The supplied plan is downloadable. Pending app updates can be applied from this disclosure on Today or Plan.

Activation and mobility are simple ordered lists, without swimming timers or forced check-ins. From Oct 5, evenings are for recovery rather than a second pool visit. Oct 5 adds only 2 × 15 m easy streamline/dolphin/breakout after warm-up; Oct 5 and 7 use 2–3 reps in their existing AM turn blocks. Oct 5, 7 and 8 offer 10–15 minutes of gentle mobility. Oct 10 remains complete rest; Oct 11 preserves “GET OUT / do not add laps”. The conditional post-race loosen on Oct 12 remains race-day guidance, without a separate PM session.

## Source and distances

`SWIMMING-PLAN.md` contains the revised AM-only schedule, including Markdown hard line breaks. `data/competition-plan.json` structures all ten dates and three parts of each day. Each set has a purpose group, prescription, effort, recovery and execution cue. The importer validates source excerpts, IDs, phases, rest semantics and known distances, then generates `assets/data.js`:

```sh
node scripts/import-plan.cjs
```

Distance headings are **source estimates**, not verified completed metres. Short skill repetitions and variable distances are preserved rather than rounded up to pool lengths. Oct 6 lists **1,300 m including 2 × 50 m turn practice**, despite a heading of approximately 900–1,000 m; the screen calls out the difference. The short Oct 5 skill addition is 30 m; discarded evening volume is not merged into AM.

Rest after a repetition means **after EACH rep**, not a send-off. Between different drill blocks, the supplied default is 30–60 seconds unless a longer rest is specified. The two Oct 8 broken 50s retain their separate 20–30-second internal rest and 4–5-minute rest before the second broken 50. “Full recovery” has no invented countdown. The rest picker combines the repetition, broken-set and between-block durations into one sorted, deduplicated list. A duration tap starts a new countdown, including when another countdown is already running. Opening or cancelling the picker leaves the timer running. The 20-second timer default is a manual convenience; the supplied rest text and available prescribed times retain their original values. No numeric duration is assigned to full recovery. Existing selected/running/paused timers survive navigation and reload. Legacy blank timers upgrade to 20 seconds; a completed timer still shows 0:00.

The previous source and structured plan are archived in `docs/archive`. Legacy drill/race-tool URLs lead to current screens; old session IDs offer a current-plan escape link. See `APP-PREPARATION-PLAN.md` for the current information architecture.

## Saved data and offline use

Progress saves on this device, separately for each plan revision and AM session. Old completion records are retained without attaching them to replacement workouts. Existing official results, reporting details and earlier rehearsal entries carry forward because the two race events are unchanged. Personal tempo profiles survive plan revisions.

Storage failures produce a persistent warning with Retry; successful saves show no banner. The Data & backup interface and offline status messages are removed. Existing saved records remain intact; historical skipped sets appear unchecked and do not count as completed work. Tempo still offers its separate profile export.

The app works offline after a successful first load on HTTPS or localhost. Offline caching runs without a status banner. Updates wait for **Update app** or for all app tabs to close; an active session is not forcibly reloaded. The service worker caches a coherent release and requires a version bump for subsequent changes.

The Pool options and Full supplied day sections are removed from session screens; Pool options is also removed from race warm-up. Screen wake-lock controls are no longer shown. Rest countdowns use stored deadlines; foreground/background alerts depend on the device. Physical pouch touch accuracy, pool-light readability, sound audibility and iPhone/Android interruption behaviour still need device testing.

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

The current suites cover the final source contract, date routing, every AM/activation/mobility view at mobile/desktop sizes, day-based Home without tabs, native whole-card tap/Space completion and title strikethrough, legacy evening-link recovery, 20-second defaults and legacy-blank upgrades, generic time choices, automatic start/close, deadline recovery, replacement-plan migration, failed saves/retry, preserved historical records, race records and coherent offline updates. Older test scripts describe superseded revisions.
