# Lane 50

A responsive swimming training companion for the October 12–13, 2026 NSA Cup. The current [daily plan](SWIMMING-PLAN.md) follows the supplied September 18 revision with Saturdays free for family/rest.

The [training update](TRAINING-REVIEW.md) summarises the schedule and the [sequence review](SEQUENCE-REVIEW.md) lists every day's set order. Active swimming starts September 18: weekly totals are 800 m, 3,400 m, 2,550 m and 1,500–1,750 m, including optional October 11. Both competition days have separate checklists. Confirm actual events and competition pool length.

September 14–17 are read-only historical records. The app preserves previous checks for replaced workouts in History instead of assigning them to new sets. The revised plan is date-based; no missed session blocks access or delays the taper.

## Pages

- index.html: current session, race countdown, and upcoming sessions
- plan.html: expandable four-week plan and both competition days
- session.html?id=w1d0: individual session, set tracking, and rest timer
- drills.html: searchable, filterable training set library
- progress.html: completion totals, activity, export, and confirmed reset
- race.html: simple stopwatch with lap timestamps
- race-tools.html: race history and export

## Run

Run `python -m http.server 8000` in this directory and open http://localhost:8000. No dependencies or build step are required. Use a consistent host and port to retain browser progress.

## Organization

- assets/styles.css: shared layout, components, responsive breakpoints, print styles
- SWIMMING-PLAN.md: approved full plan, including guidance and both competition days
- assets/data.js: generated current sessions, previous prescriptions and date helpers
- scripts/import-plan.cjs: rebuilds data from the Markdown; run `node scripts/import-plan.cjs`
- data/compact-copy.json: concise display text; full source instructions remain under More
- data/previous-plan.json: original prescriptions for read-only history and check migration
- assets/app.js: page rendering, progress storage, and workout controls
- assets/navigation.js: return context, browser history, focus, scroll restoration, and dialog navigation
- assets/interactions.css: sticky controls, session layout, and timer sheet

Progress uses localStorage on the current browser and origin. It does not sync across devices. Export saves a JSON backup; there is no import interface. The rest timer catches up when returning to the tab, but does not send background notifications.

Dropdowns share 48px touch targets, 16px text, visible focus, and a consistent disclosure arrow. Options open in themed dialogs, presented as bottom sheets on mobile, with selected indicators and keyboard arrow navigation. Escape, Cancel, the backdrop, and browser Back dismiss without changing the value. Race setup stacks fields on small screens and includes metres in distance and pool options.

Mobile controls include bottom navigation with safe-area spacing, large touch targets, expandable weeks and drill cards, session paging, and optional vibration on supported devices. Keyboard focus and reduced-motion preferences are supported.

## Navigation and interaction behavior

- Overview answers what to do next; the plan provides week shortcuts and expandable sessions; the library supports searching sets and opening their sessions; progress summarizes completed work.
- Session entry remembers the originating page. The header and completion area return to that page with its scroll position, expanded sections, and link focus restored.
- Direct session links fall back to the matching day in the plan. Session IDs stay stable, including `race` for October 12 and `race2` for October 13.
- Plan week shortcuts expand their destination and account for sticky header height. Search and focus filters live in the library URL.
- On mobile, a compact session action bar replaces the main tabs. It provides completion totals and a rest timer; the sticky header retains the return route and an All days link.
- Checking a set never automatically advances the scroll. More/Less controls are separate from completion buttons.
- The native timer dialog traps keyboard focus, locks background scroll, and returns focus and scroll on close. Escape, browser Back, and the close button dismiss it; Forward restores it. The timer continues when the sheet is closed, but resets if the document is reloaded or another day is opened.
- View state is per tab using sessionStorage; progress uses localStorage. When browser storage is unavailable, navigation remains usable but saved view restoration is unavailable.

## Browser checks

Run `python tests/pickers.py` for themed option selection, keyboard controls, dismissal, Back/Forward, focus restoration, and mobile sheet layouts.

With Python, Playwright, and Chrome installed, run `python tests/navigation.py`. The test starts and stops its own local server and uses isolated browser storage. It checks contextual returns, native Back/Forward, opened weeks, library filters, scroll and focus restoration, timer dismissal, touch controls, and mobile through desktop layouts.

## Lean content and accessibility

Overview shows the current session and the next two days. Totals live on Progress; export and reset are under Manage progress. Repeated slogans, decorative labels, duplicated dates, and the overview calendar have been removed. Sets use short instructions with reps and rest targets visible. Longer session notes and race guidance expand under More; opening details never changes completion.

Controls have visible labels, descriptive accessible names, keyboard focus, and non-color completion states. Session completion feedback uses a live region that stays available on mobile. Reset has an explicit, untimed confirmation and Cancel action. Text can reflow at 200%; forced-colors focus styles are included.

Run `python tests/accessibility.py --axe PATH_TO_AXE_MIN_JS` with a local axe-core script (tested with 4.10.3). It audits desktop/mobile pages and dialogs, then checks keyboard controls, announcements, confirmation, enlarged text, and forced-colors focus. Automated checks do not replace testing with actual assistive technology.

## Dated sessions, logs and history

All active dates are available immediately. Overview follows today or the next scheduled date, including rest days. Completing or missing a session does not reschedule later workouts. The optional October 11 swim has a Choose rest instead action.

Quick log saves actual metres, effort, breathing comfort and a coach cue locally. Rehearsal and competition days also accept event, pool length, start type, first split and total time, with a calculated second split. There is one log per date; additional events can be noted in the observation. Progress distance sums actual training logs, not prescribed metres or competition swims. Export includes checks, logs, rest choices and archived records. Reset clears all of these after confirmation.

Revision-specific progress keys keep old checks off new workouts. September 14–17 retain their original content and checks as read-only records. Saved checks for replaced later sessions appear under Previous workout history. Old split-set migration remains supported. The drill library contains only current training sets.

Run `node tests/sequence.cjs` for dates, all source instructions, totals and every prior completion pattern. Run `python tests/progression.py` for calendar access, historical records, More controls, logging, optional rest, mobile layout and offline checks.

## Offline access and independent race practice

Open over HTTPS (or localhost) and wait for **Ready offline**. The service worker downloads every app screen, script, stylesheet, and the bundled “Take your marks” voice. All session URLs work offline. Progress and race results remain on this browser/origin; reconnecting checks for app updates, with no server upload or cross-device sync. New shell versions activate after existing app tabs close, preventing an update from replacing a running race. Bump `CACHE` in `sw.js` when publishing changes. Clearing browser site data removes downloads and saved results.

Open **Race** from the header or overview to use the standalone stopwatch. Start gives five seconds to get ready, then plays the previous short whistles, long whistle, “Take your marks” voice, and electronic start beep. Timing begins at the scheduled beep onset. Keep the page visible during preparation; leaving cancels the start. Lap records the elapsed time without stopping; Finish stops and saves. The circular clock keeps its size and shape when laps are recorded. The list sits directly below the circle and fills the available space, newest first, and scrolls when more laps are recorded. Lap and Start/Finish remain side by side with a generous gap. Button presses give a brief vibration where supported and a visual pressed state. Routine feedback stays out of the footer; storage errors remain visible. Reset clears the display for a new attempt; saved times remain in History.

Timing uses a monotonic clock during the visit. A running stopwatch recovers after reload using wall-clock timestamps, with an ≈ indicator identifying approximate recovered timing. Screen wake lock is requested where available. Results and laps stay on this browser/origin and are available offline; History supports JSON export. Previous swim records remain readable. If saving fails, keep the page open and use Retry saving.

Run `python tests/race_offline.py` with Playwright and Chrome installed to check the preparation and audio-clock start, lap timestamps, the fixed circle and buttons, adaptive lap scrolling, finish, reset, reload recovery, history, and offline routes.
