# Competition preparation app — proposed implementation

Status: implemented locally. See README.md for the current browser validation command.

## 1. Product decision

The app should answer four questions quickly:

1. What am I swimming today?
2. What exactly do I do next, at what effort, with how much rest?
3. What do I need for my 50 m and 100 m races?
4. Where do I record the two rehearsals and find those results again?

Primary navigation: **Today · Plan · Race**. Sessions open from Today or Plan. Drill explanations open within their session. Results stay attached to rehearsals and are also reachable from Race.

Keep the existing responsive visual foundation. Prioritise readable sets, generous tap targets, and a clear next action.

## 2. Authoritative content

Use the latest pasted “NSA 14th Short-Course Final Preparation” plan, covering **26 September–13 October 2026**, as the source for this revision. It specifies a 25 m pool, 50 m freestyle on October 12, and 100 m freestyle on October 13.

The current app uses a conflicting September 23–October 11 schedule in `assets/data.js`. `SWIMMING-PLAN.md`, `TRAINING-REVIEW.md`, and the open downloaded document describe another older revision. Do not merge their workouts into this plan.

Preserve every prescribed set, its order, repetitions, metres, effort, rests, optional conditions, and stopping instructions. Concise presentation must retain the original meaning. Keep the full supplied wording reachable through “Full instructions.” Do not add exercises, target times, kick counts, or underwater distances.

All visible sessions, explanations, race preparation, and documentation must use the same plan revision. Preserve the original supplied document separately for comparison; label superseded documents clearly. Update the old importer so it cannot silently restore the superseded schedule.

### Calendar contract

| Date | Session | Planned distance |
| --- | --- | ---: |
| Sat Sep 26 | Rest | 0 m |
| Sun Sep 27 | Technique + aerobic control | 850 m |
| Mon Sep 28 | 100 m speed endurance | 1,000 m |
| Tue Sep 29 | 50 m speed | 900 m |
| Wed Sep 30 | Active recovery | 700 m |
| Thu Oct 1 | 50 m race rehearsal | 850 m |
| Fri Oct 2 | 100 m race rehearsal | 950 m |
| Sat Oct 3 | Rest | 0 m |
| Sun Oct 4 | Recovery + short-course skills | 700 m |
| Mon Oct 5 | Sprint speed | 700 m |
| Tue Oct 6 | 100 m race pace | 700 m |
| Wed Oct 7 | Recovery | 500 m |
| Thu Oct 8 | 50 m sharpening | 550 m |
| Fri Oct 9 | Activation | 400 m |
| Sat Oct 10 | Rest | 0 m |
| Sun Oct 11 | Pre-meet shakeout | 300 m |
| Mon Oct 12 | 50 m race | Warm-up, race, recovery shown separately |
| Tue Oct 13 | 100 m race | Warm-up and race shown separately |

Training totals: Sep 26–27 = 850 m; Sep 28–Oct 4 = 5,100 m; Oct 5–11 = 3,150 m. These are planned totals, not completed metres.

### Source discrepancies to resolve before finalising race-day totals

- **October 12:** the listed base warm-up sums to **500 m**. The optional additional 50–100 m makes it **550–600 m when taken**. Recommended display: “500 m + optional 50–100 m.” Keep the 50 m race and conditional 100–200 m recovery separate.
- **October 13:** the listed warm-up sums to **550–600 m**, although its heading says 500–600 m. Recommended display: “550–600 m,” retaining all listed sets. This is an arithmetic correction, not a change to the swimming.
- Some sets specify no rest duration, and some say only “full recovery.” Preserve those distinctions. Do not manufacture timer values or reuse defaults from the older plan.
- QUICK has an explicit ~85–90% instruction on October 9, but no numerical definition on October 11. Do not propagate a numerical target into a day that does not prescribe one.
- Preserve recovery placement in FAST/EASY combinations. Do not silently reinterpret rest after a FAST length as a send-off or as rest only after the EASY return. Where wording is ambiguous, show the source instruction and leave sequencing manual.

## 3. Today

Show, in this order:

1. Date, session name, and planned metres.
2. One short focus drawn from that day's source instructions.
3. **Open session**, or **Resume session** if it has saved progress.
4. The next scheduled day.
5. A small link identifying the next event and date.

Rest days show “Rest · 0 m” and the next swim. No completion task is needed. Recovery days remain swimming days. October 11 is the prescribed 300 m session in this source, not the older optional 250 m version.

Before September 26, label the first entry “Plan starts September 26.” On October 12 and 13, lead with that day's race preparation. After October 13, show that the plan has ended and links to results; never present October 11 as today's workout.

## 4. Plan

Use one chronological list of all 18 dates, with simple week separators. Each row shows the date, session title, metres, and a restrained status: Rest, Recovery, Rehearsal, or Race where applicable.

Provide **Jump to today**. Keep both races visible in the same timeline. Every date opens directly; completion of earlier sessions never locks later sessions. Back navigation returns to the same scroll position.

No calendar/list toggle, new phase taxonomy, or filters are needed for this short plan.

## 5. Session — the main poolside experience

Show the full ordered set list immediately. Each set presents:

- Set name and prescription, such as **4 × 50 m**.
- Set total, such as **200 m**; lengths are secondary if useful.
- Effort using the source's exact label.
- Rest and exactly when it applies.
- The relevant technique cue and any condition affecting execution.

Multi-part sets stay together. For example, September 28's main set must read:

> **2 rounds × 4 × 25 m · RP100 · 200 m**  
> Rest 20–30 sec between 25s · 4 min between rounds  
> Controlled fast → rhythm → hold technique → strong finish

Do not flatten it into “8 × 25” and lose the round rest.

### Interactions

- A large, explicit **Mark set done** control avoids marking a set complete when someone opens its instructions. Completion is reversible.
- Highlight the next unfinished set without collapsing or hiding later sets.
- Add **Skip set** as a secondary action so the swimmer can follow the source's stopping instructions. Skipped sets are never counted as completed.
- Save status automatically on this device. Refreshing or returning resumes the same session.
- Checking a set does not establish an actual-distance log. Do not infer metres for partially completed or skipped sets.
- Show conditions such as “If #2 deteriorates, stop after #1” beside the affected set. Do not hide these in a general help page.
- Tap an effort label for the supplied definition. Longer source wording opens under “Full instructions.”

### Rest timer

- Open the timer from the relevant set, with its prescribed rest.
- For ranges, show the full range and let the swimmer choose within it; never silently replace 20–30 sec with a single displayed prescription.
- For the broken 100 sets, distinguish **Between 25s: 20–30 sec** from **Between rounds: 4 min**.
- Provide Start, Pause/Resume, and Reset. Keep the active countdown visible while reading sets.
- Completion never starts a countdown or advances a repetition automatically.
- For “full recovery” or unspecified rest, show that wording without an invented countdown.
- On September 30, honour “No stopwatch”: hide timed-performance controls and do not push a timer into the recovery flow.
- Restore a running countdown from its deadline after navigation or refresh. Browser/device background restrictions mean an audible alert cannot be guaranteed with the screen locked.

Use at least 48 px touch targets, strong text contrast, visible keyboard focus, and labels alongside colour. Avoid swipe-only actions and obligatory tapping after every length.

## 6. Rehearsal records

Show a small **Record rehearsal** form next to the scheduled rehearsal set. Entry is optional and can be completed later. A helper can use an external stopwatch; a new built-in race stopwatch is unnecessary for this version.

**October 1 — 50 m:** first 25 time, total 50 time, turn (good/average/poor), and last-15-m technique (good/breaking down). Calculate the second 25 as total minus first 25.

**October 2 — 100 m:** cumulative times at 25, 50, 75, and 100 m. Label them explicitly as elapsed times from the start. Calculate individual 25 m lengths by subtraction. Allow partial records; calculate only values supported by entered measurements.

Validate numeric times and increasing cumulative splits. Keep the two records together under Race → Rehearsal results, with **Copy results** for sharing with the coach. Do not automatically change upcoming workouts based on those numbers.

No daily journaling requirement, performance score, or progress dashboard.

## 7. Race

At the top, provide **50 m · Oct 12** and **100 m · Oct 13**. Default to the upcoming event, and select the correct event on its race day.

Within each event, show:

1. **Warm-up:** the exact ordered sets, conditions, and correctly labelled distance.
2. **Race cues:** the source's short instructions by length; for the 50, also its turn cue. Emphasise HOLD for the third length of the 100.
3. **After the race:** include the supplied October 12 recovery instructions and preparation for the next day's event. Do not invent an October 13 recovery workout.
4. **Result:** optional final time; link to the relevant rehearsal result.

Keep familiar-start, familiar-turn, normal practised breathing, and no-hyperventilation instructions where they apply. The four technique reminders can be opened from this screen without becoming a separate navigation tab.

Provide optional event-specific reporting time entry because it affects race-day preparation. Leave it blank until known. Never use the ordinary 7:30 training window as an assumed meet reporting time.

## 8. Information hierarchy and exclusions

**Always visible:** the prescription, effort, rest, execution cue, and conditions needed to perform the set correctly.

**One tap away:** effort definitions, full source instructions, rehearsal results, and technique reminders.

**Reference only:** the source's background explanations and research links. They do not occupy the poolside session view. This work translates the supplied plan; it does not independently reassess its coaching claims.

Exclude a generic drill-library tab, old drills, dryland workouts, streaks, badges, social features, charts, repeated motivational text, and invented pace targets. Preserve existing stored records without exposing an unrelated history dashboard.

## 9. Implementation sequence

1. **Content first:** preserve the supplied source, encode all dated sessions, compare every prescription and sum, and handle the two warm-up labels explicitly. Define stable date/set identifiers and a plan revision. Update conflicting documentation and importer behaviour.
2. **Navigation and discovery:** build Today, the full Plan timeline, and Race; correct pre-plan, rest-day, race-day, and post-plan states.
3. **Session use:** render exact structured sets, contextual instructions, explicit completion/skip controls, resume behaviour, and set-specific rest controls.
4. **Race preparation and results:** add the two rehearsal forms, split calculations, copy action, event-specific warm-ups/cues, reporting times, and optional official results.
5. **Offline and release checks:** cache all three destinations and their data; ensure updates replace the old plan coherently. Validate on mobile and desktop before publishing.

Likely touchpoints: `assets/data.js`, `assets/app.js`, `assets/navigation.js`, `assets/styles.css`, `assets/interactions.css`, the page shells, `sw.js`, `scripts/import-plan.cjs`, relevant tests, and plan documentation. Inspect the legacy race pages before reusing them; their stopwatch interface is not the proposed Race screen.

The data should represent nested rounds, repeated FAST/EASY components, numeric/ranged/text-only rest, optional components, source instructions, and race-day components explicitly. Generate visible totals from those components, while preserving the source's stated totals for validation. All screens must consume the same data.

Namespace new completion and result data by plan revision and stable session/set identity. Preserve old browser records; never attach completion from a different workout to the replacement session. If saving fails, tell the swimmer the change is not saved.

## 10. Acceptance criteria

- All 18 dates match the supplied plan. Saturday rest days are Sep 26, Oct 3, and Oct 10; recovery days retain their prescribed swimming.
- Every set matches source order, repetition structure, distance, effort, recovery placement, and conditions. No old drills appear through navigation, search, stale links, or offline pages.
- Training totals reconcile, including the 3,150 m final week. Optional race-day metres are shown separately and accurately.
- Today opens the appropriate session or race with one action; every other session is reachable through Plan.
- The broken 100 sets retain their 4-minute round rest. No rest is converted to a send-off.
- Source stopping instructions remain visible and skipping remains distinct from completion.
- Both rehearsal forms calculate correct splits and preserve entries across reloads. Invalid times are explained without erasing entered values.
- Sessions, race preparation, and saved results work offline after the app has loaded and cached successfully.
- Returning to a session preserves its state; returning to Plan preserves scroll. Keyboard and touch interaction work without horizontal overflow at narrow mobile widths.
- Date-dependent states are checked before Sep 26, on a rest day, on a recovery day, on each rehearsal and race day, and after Oct 13 in local time.

Review basis: source comparison, daily arithmetic checks, and mobile/desktop browser validation. Browser dependencies were located in the existing temporary test environment during implementation.
