# Lane 50 — mobile UI and business review

Reviewed September 28, 2026 · Application revision `fd32cba`

**Overall assessment**

Lane 50 has a coherent visual identity and a sensible product boundary: help a swimmer execute an existing competition plan. Today → Session, with Plan and Race as supporting destinations, is a strong foundation. The application already handles more detail than its simple appearance suggests: exact prescriptions, completion versus skipping, resume links, rehearsal splits, offline access, and date-dependent screens.

The next investment should be poolside usability and confidence in saved information. Adding many more destinations would weaken the product before resolving these problems. It is a credible personal competition companion; it is not yet a reusable product for different swimmers, coaches, and meets. That distinction is a scope decision, not a design failure.

**Review method and limits**

- Read all active screen implementations, navigation, styles, offline behavior, structured plan data, and product documentation. Identified legacy pages as redirects rather than additional active features.
- Ran the current `tests/competition.py` suite successfully: 18 dates, prescribed content, mobile/desktop layouts, date transitions, completion/skipping, timer recovery, rehearsal validation, navigation, storage failure feedback, and offline sessions/races.
- Inspected fresh mobile screenshots of Today, Plan, normal sessions, rehearsal, recovery, rest, both races, timer, effort guide, invalid input, and the post-plan state; also inspected desktop Plan.
- Additional checks covered 667 × 375 landscape, a simulated doubling of session text sizes, failed saves, and the post-plan results link. Measurements below use a 390 × 844 viewport unless stated otherwise.
- This is an expert review supported by browser observation, not a swimmer usability study. Physical wet-hand use, glare, native mobile keyboards, iOS Safari/VoiceOver, Android TalkBack, and real background timer behavior were not tested. Business opportunities are hypotheses; no market demand or willingness to pay was measured. Swimming prescriptions were not medically or technically reassessed.

Evidence: [Today](reviews/2026-09-28/today.png), [Session](reviews/2026-09-28/session.png), [Race](reviews/2026-09-28/race50.png), [Timer](reviews/2026-09-28/timer.png), [Invalid rehearsal](reviews/2026-09-28/invalid-record.png), [measurements](reviews/2026-09-28/measurements.json).

**What to preserve**

1. **Three primary destinations.** Today, Plan, and Race cover the current job without requiring a dashboard or account.
2. **Strong visual consistency.** Dark teal surfaces, restrained cyan, amber actions, readable spacing, and consistent SVG icons give the application a recognizable identity. The Today action is easy to find.
3. **A focused session view.** Hiding primary navigation during a session and keeping one shared timer reduces competition between controls. Retain the full ordered set list and contextual Back behavior.
4. **Faithful content.** Nested rounds, optional work, recovery placement, effort guidance, and full source instructions are preserved. Do not simplify away execution conditions.
5. **Useful state handling.** Skip differs from complete; bulk completion offers undo; resume goes to an unfinished set; offline use and date transitions are covered by checks.
6. **Low setup cost.** Opening the app leads directly to useful information. A mandatory onboarding carousel or signup would be a regression for the current audience.

**Priority findings**

P1 means address in the next usability iteration; P2 means a valuable follow-up. No release-blocking failure was established by this review.

| Priority | Finding and observed evidence | Recommended improvement | User/business value |
| --- | --- | --- | --- |
| P1 | A save failure produces a temporary toast, but the set still appears completed after the toast disappears. This was reproduced after six seconds. | Keep the in-memory action, but display persistent “Changes not saved” feedback with Retry until persistence succeeds. | Users can distinguish completed work from a reliably stored record. |
| P1 | The session prescription is 15 px; effort/rest are 13 px; titles are larger. The information needed while swimming is visually secondary. | Make repetitions/distance the strongest card text; enlarge effort and rest. Reduce introductory repetition to recover space. | Faster reading at poolside and less interpretation. |
| P1 | The timer has generic 30/60/120/180/240/300-second presets, while the plan includes 20, 40, 45, 75, and 150 seconds and multiple rest contexts. Custom input exists, but the app does not use structured set timers. | Keep one shared timer. Offer explicit “Use this rest” choices associated with the set, including separate between-repetition and between-round choices. Let users choose within prescribed ranges. | Fewer taps and less chance of carrying the previous set’s duration into the next set. |
| P1 | The next-set shortcut appears above the list and is lost when scrolling. Current-set emphasis is mostly a small “Next” label; unfinished cards otherwise share the same styling. | Keep a compact next-set action within reach while scrolling and give the next unfinished card a distinctive label and border. Do not auto-scroll on completion. | Easier resumption and navigation during a session. |
| P1 | On the 50 m Race screen, the first warm-up card starts around y=817, below the usable first viewport. The page is about 3,576 px tall with disclosures closed. | Reduce the race header stack and provide an explicit “Start/resume warm-up” action. Show known reporting time prominently. Keep cues and results directly reachable. | Race-day information is easier to retrieve under time pressure. |
| P1 | After the plan ends, “View results” opens `race.html` at its preparation header. The official-result section was about 2,525 px down the destination page. | Link directly to results, ideally a compact summary of both events with preparation still accessible. Say “Plan ended” if completion is unknown. | The final step delivers the outcome its label promises. |
| P1 | Offline readiness is at the page bottom, and session progress has no visible backup/export. “Copy results” exports rehearsal text only. | Add a small accessible status/data area: offline ready, saved on this device, export backup, restore backup. Include official results and completion state. | More confidence before arriving at the pool and less accidental loss. |
| P2 | Entering an out-of-order 50 m split marks all four 100 m rehearsal inputs invalid, including untouched fields. | Identify the offending field and compare it with the relevant earlier split. Preserve unfinished entries as drafts. | Easier correction and clearer trust in recorded results. |
| P2 | The form automatically saves on input and also presents “Save record.” Invalid drafts are persisted too. | Distinguish “Draft saved,” “Needs correction,” and “Recorded”; choose one clear save model. | Users understand whether they have stored a valid result or unfinished input. |
| P2 | “Sets,” “drills,” “Complete,” “Reviewed,” and “Session reviewed” describe overlapping states. Optional sets count toward all-set completion. | Use “sets” consistently; distinguish Completed, Finished with skips, and In progress. Keep optional work separate from required completion. | Progress reflects what happened without pushing unnecessary work. |

Implementation references: `assets/app.js` contains the active screens, save behavior, forms, and timer; `assets/preparation.css` contains the final presentation overrides; `assets/offline.js` and `sw.js` handle offline readiness and release updates.

**Screen-by-screen recommendations**

**Today:** Keep the current single-action hero. Its hierarchy is clear and it fits the daily task. Add a compact, unobtrusive offline/save indicator. On a rest day, make the next swim easy to open; do not create a task to “complete” rest. When today’s required work is finished, show a simple factual summary, including skips, rather than relying on “Review session” alone. A small race countdown is optional; it should not displace today’s action.

**Plan:** The dates, week grouping, and current-day highlight work. The 18-card mobile page is about 3,028 px long, so quick return to the current date matters; “Find today” already helps. Consider a compact past-days disclosure after the first week, preserving manual access and return position. Do not introduce calendar/list toggles or filters for only 18 dates. Give rest entries less visual weight than swims, and distinguish an unrecorded past session from a skipped session. An unmarked workout is not evidence that the swimmer missed it.

**Session:** Prioritize prescription → effort/rest → execution cue → secondary detail. A useful card hierarchy would read:

> 100 m race rhythm  
> **2 rounds × 4 × 25 m**  
> RP100 · 100 m rhythm · 8–9/10  
> **20–30 sec between 25s · 4 min between rounds**  
> Controlled fast → rhythm → hold technique → strong finish

All existing conditions must remain accessible and critical execution instructions must stay visible. Keep the full list rather than forcing a step-by-step wizard. A lightweight optional round/rep counter is useful for complex sets only; do not require logging every length. Whole-card tap-to-complete is efficient but deserves wet-hand testing because reading, scrolling, and checking share the same surface. If accidental completion occurs, use a clearly labeled dedicated completion area or immediate undo feedback. This is a usability hypothesis, not an observed error rate.

**Timer:** Retain the footer start/pause/resume controls. Label the selected rest context so a generic timer value is not mistaken for a prescription. Context selection should always be explicit and should never manufacture a duration for “full recovery.” The active implementation uses a visual completion state and vibration where supported; it has no audible alert or screen wake-lock request. An opt-in keep-awake control and tested foreground sound are worth exploring. Do not promise lock-screen/background alerts based on a browser simulation. Preserve the deliberately timer-free recovery day.

**Race:** Organize the existing content around a simple sequence: reporting details → warm-up → race cues → record result. The current shortcut links are useful, but they only help while near the top. A compact phase selector or return-to-sections action would reduce repeated scrolling. Optional event number, heat, and lane fields are more useful here than additional training statistics. Never infer official reporting times. After the event, results should take precedence over preparation without making the warm-up inaccessible.

**Rehearsals/results:** Keep cumulative split labels and automatic length calculations. Add field-specific errors and a clear valid/draft state. Provide one copy/export action that can include both official results, rehearsals, event dates, and pool length. A modest rehearsal-versus-race comparison is useful if both are present, but label the contexts rather than presenting it as proof of training improvement. Do not require every split when only a final time is available.

**Rest, empty, and error states:** A quiet rest screen is appropriate; it does not need motivational filler. A link to the next swim could reduce backtracking. The legacy-session error already offers a current-plan escape route. Add persistent recovery actions to storage errors. The post-plan message should distinguish calendar completion from actual recorded completion.

**Accessibility and mobile quality**

Existing strengths include meaningful control labels, keyboard focus styling, native dialogs, reduced-motion support, generous primary controls, and textual completion indicators. The current suite verified at least 48 px control heights for selected session actions at narrow widths. The simulated doubled-text session did not horizontally overflow, and neither did the additional landscape screens. Those checks do not establish full accessibility compliance.

Use 48–56 CSS px as a practical target for frequent poolside controls, then test on physical devices. WCAG 2.2’s target-size minimum is 24 × 24 CSS px subject to its exceptions; that is a compliance floor, not a poolside comfort target. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

Test actual browser text scaling/zoom to 200%, including dialogs, forms, and fixed controls; the synthetic session check is only a preliminary check. [W3C resize-text guidance](https://www.w3.org/WAI/WCAG21/Understanding/resize-text).

Validate dark-mode readability in bright pool lighting before changing the palette. A light/high-visibility option is a reasonable experiment, not a demonstrated requirement. Check focus and error announcements with mobile screen readers, and test time entry with the real decimal keyboard. The supported `m:ss.xx` format may be awkward when a decimal keyboard does not expose a colon; seconds-only remains an existing alternative.

**Business assessment: decide the intended product**

The present value proposition is: “Turn my supplied competition plan into clear, reliable poolside actions and race records.” This is specific and useful. Its short lifecycle is appropriate for a personal meet companion.

| Product direction | What becomes necessary | What remains unnecessary initially |
| --- | --- | --- |
| Personal companion for this meet | Reliable poolside flow, local backup, official-result summary, archived access after October 13 | Accounts, billing, social features, coach administration |
| Reusable tool for an individual swimmer | Plan import/selection, meet/date configuration, archive, plan-version handling, result history across meets | Marketplace, complex dashboards, mandatory cloud sync |
| Coach-to-swimmer product | Coach authoring/validation, assignment, update visibility, controlled sharing, swimmer feedback, dependable data transfer | Public feed, leaderboards, an AI-generated plan as the initial differentiator |

Do not treat multi-user or commercial requirements as defects in the current personal app. They are expansion work. If commercialization is intended, validate coach demand for delivering existing plans before investing in a generic workout platform. A paid coach workflow or meet-preparation package is a hypothesis worth interviewing for; pricing and revenue projections are not justified by the present evidence.

There is no measured retention or conversion funnel in the repository. For this product, meaningful success is task completion with low friction, not screen time or daily streaks. Rest days and an intentionally finite plan make conventional daily-engagement targets misleading.

**Missing features worth prioritizing**

- **Backup and restore:** local-first file export with a versioned format; preserve records when moving devices or replacing a plan. Copying rehearsal text is not a full backup.
- **Persistent save state:** visible unsaved changes and retry, including session checks and official times.
- **Result closure:** a two-event summary and export at the end of the meet.
- **Basic race logistics:** optional heat/lane/event number and prominent reporting time, without a scheduling engine.
- **A small settings/data entry point:** storage explanation, export/restore, display preferences, and app information. A fourth primary tab is not necessary.
- **Home-screen use:** there is service-worker caching but no linked web-app manifest or install guidance. Add an installable presentation and platform-appropriate guidance if standalone mobile use is intended; verify on target devices.

**Nice to have after the core fixes**

- Optional round counter for nested sets.
- One optional session note or brief effort reflection, stored without claiming to diagnose readiness or automatically change training.
- Coach-share summary containing completed/skipped work, notes, and results, shared only when the swimmer chooses.
- Printable poolside session card/PDF. A Markdown plan download and legacy print styles exist, but a polished current-session printout still needs design and verification.
- Display-size and light/high-visibility preferences after poolside testing.
- Calendar export for known events or reminders after users demonstrate a need. Avoid notification infrastructure before that need is established.
- Read-only technique illustrations attached to confusing sets, if users actually need them; avoid a separate content library for this block.

**What is already too much, and what to avoid adding**

The feature count is restrained. The excess is mostly presentational: repeated date/context text, many equally weighted cards, a tall race header, repeated Skip actions, an always-visible completion instruction, and a timer dialog giving custom input equal prominence to common actions. Simplify hierarchy without deleting meaningful instructions or removing accessible skip controls.

Do not add streaks, badges, leaderboards, social feeds, calorie dashboards, a generic drill library, mandatory per-length logging, speculative readiness scores, or generated pace targets. Do not build a native app or watch integration solely to make the product feel complete. Each adds cost and maintenance without demonstrated value to the current job.

Keep full source instructions and effort definitions as secondary disclosures; they are useful reference, not redundant features. Keep skip and undo. Keep the single timer. Avoid increasing default screen density to fit more information: improve ordering and text hierarchy first.

**Proposed delivery order**

Effort is relative engineering size, not a delivery estimate: S = localized; M = several connected flows; L = new product capability.

| Order | Work | Effort | Acceptance evidence |
| --- | --- | --- | --- |
| 1 | Persistent unsaved state; fix post-plan results destination; unify set/status language | S–M | Failed writes remain clearly unsaved; Retry works; “View results” exposes results immediately; skips never become completed sets |
| 2 | Improve prescription/rest hierarchy, persistent next-set access, compact race entry | M | In physical-device tasks, swimmers find the next prescription/rest without searching; first race action is visible; existing instructions remain intact |
| 3 | Explicit set-associated choices for the shared timer | M | Users can choose both between-rep and between-round rests; ranges remain choices; no invented rest duration; timer-free day remains unchanged |
| 4 | Field-specific validation, valid/draft state, official/rehearsal summary and sharing | M | A bad split flags the relevant field; valid records are distinguishable from drafts; exported summaries include intended results |
| 5 | Backup/restore and home-screen presentation | M | Export/import round trip preserves records; incompatible data is explained; offline use works from the installed presentation on target devices |
| 6 | Reusable plans or coach workflows, only if that product direction is chosen | L | A second plan can be added without rewriting date-specific UI; records remain attached to the correct plan version |

Before expanding scope, run a small observed pilot with 5–8 target swimmers or swimmer/coach pairs. Ask them to open today’s session, identify a complex set’s round rest, resume after an interruption, skip a set, correct a split, find reporting time, and retrieve final results. Include a poolside trial where feasible.

Measure task success, time to find the next action, accidental completion/undo, timer-selection errors, confidence in saved state, and successful result retrieval/export. Establish a baseline before claiming improvement. Recorded checkmarks alone cannot prove workout completion, and app usage cannot establish that the training caused a faster race.

**Maintenance observations**

The active code coexists with older race/picker/style files, historic data, and superseded test scripts. The README identifies the current suite, which helps. Clearly archive or label unused material before future expansion; otherwise maintainers can evaluate or edit the wrong experience. Do not delete historical records as part of that cleanup.

The service worker can navigate open pages when a new cache release activates. That supports coherent updates but warrants an active-session update test before wider distribution. Plan revision changes also create new storage namespaces: preserved old records need an explicit archive/migration policy if reusable plans become part of the product.

The recommended next release is a reliability and poolside-usability release. Preserve the current visual identity and focused navigation while improving the information and controls swimmers need in the moment.
