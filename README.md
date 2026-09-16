# Lane 50

A responsive, framework-free swimming training companion. The original four-week NSA Cup training content is preserved in assets/data.js.

## Pages

- index.html: current session, race countdown, and upcoming sessions
- plan.html: expandable four-week plan and race day
- session.html?id=w1d0: individual session, set tracking, and rest timer
- drills.html: searchable, filterable training set library
- progress.html: completion totals, activity, export, and confirmed reset
- race.html: focused stopwatch with expandable swim setup
- race-tools.html: race history and export

## Run

Run `python -m http.server 8000` in this directory and open http://localhost:8000. No dependencies or build step are required. Use a consistent host and port to retain browser progress.

## Organization

- assets/styles.css: shared layout, components, responsive breakpoints, print styles
- assets/data.js: original training data and date helpers
- assets/app.js: page rendering, progress storage, and workout controls
- assets/navigation.js: return context, browser history, focus, scroll restoration, and dialog navigation
- assets/interactions.css: sticky controls, session layout, and timer sheet

Progress uses localStorage on the current browser and origin. It does not sync across devices. Export saves a JSON backup; there is no import interface. The rest timer catches up when returning to the tab, but does not send background notifications.

Dropdowns share 48px touch targets, 16px text, visible focus, and a consistent disclosure arrow. Options open in themed dialogs, presented as bottom sheets on mobile, with selected indicators and keyboard arrow navigation. Escape, Cancel, the backdrop, and browser Back dismiss without changing the value. Race setup stacks fields on small screens and includes metres in distance and pool options.

Mobile controls include bottom navigation with safe-area spacing, large touch targets, expandable weeks and drill cards, session paging, and optional vibration on supported devices. Keyboard focus and reduced-motion preferences are supported.

## Navigation and interaction behavior

- Overview answers what to do next; the plan provides week shortcuts and expandable sessions; the library supports searching sets and opening their sessions; progress summarizes completed work.
- Session entry remembers the originating page. The header and completion area return to that page with its scroll position, expanded sections, and link focus restored.
- Choosing a day requires pressing View; changing a selection alone never navigates. Day switching replaces the current session entry in browser history, so Back returns to the originating list in one step. Direct session links fall back to the matching day in the plan.
- Plan week shortcuts expand their destination and account for sticky header height. Search and focus filters live in the library URL.
- On mobile, a compact session action bar replaces the main tabs. It provides the next unfinished set and rest timer; the sticky header retains the return route and an All days link.
- Checking a set never automatically advances the scroll. The next-set button explicitly scrolls and focuses the unfinished set.
- The native timer dialog traps keyboard focus, locks background scroll, and returns focus and scroll on close. Escape, browser Back, and the close button dismiss it; Forward restores it. The timer continues when the sheet is closed, but resets if the document is reloaded or another day is opened.
- View state is per tab using sessionStorage; progress uses localStorage. When browser storage is unavailable, navigation remains usable but saved view restoration is unavailable.

## Browser checks

Run `python tests/pickers.py` for themed option selection, keyboard controls, dismissal, Back/Forward, focus restoration, and mobile sheet layouts.

With Python, Playwright, and Chrome installed, run `python tests/navigation.py`. The test starts and stops its own local server and uses isolated browser storage. It checks contextual returns, native Back/Forward, opened weeks, library filters, scroll and focus restoration, timer dismissal, touch controls, and mobile through desktop layouts.

## Lean content and accessibility

Overview shows the current session and the next two days. Totals live on Progress; export and reset are under Manage progress. Repeated slogans, decorative labels, duplicated dates, and the overview calendar have been removed. Workout instructions and rest targets remain intact.

Controls have visible labels, descriptive accessible names, keyboard focus, and non-color completion states. Session completion feedback uses a live region that stays available on mobile. Reset has an explicit, untimed confirmation and Cancel action. Text can reflow at 200%; forced-colors focus styles are included.

Run `python tests/accessibility.py --axe PATH_TO_AXE_MIN_JS` with a local axe-core script (tested with 4.10.3). It audits desktop/mobile pages and dialogs, then checks keyboard controls, announcements, confirmation, enlarged text, and forced-colors focus. Automated checks do not replace testing with actual assistive technology.

## Week progression

Week 1 is available immediately. Each subsequent week unlocks after all checks in all earlier weeks are complete. All seven days count, including recovery checklists. Locked weeks can be expanded and their sessions can be opened from the plan, library, or a direct URL; only progress changes are disabled. The preview links back to the first unfinished prerequisite session.

Access is derived from saved progress and survives reload. Undoing a prerequisite or clearing progress relocks later weeks while keeping any remaining saved checks. Open tabs update when progress changes in another tab. The race-day checklist and drill instructions remain available independently of the week gates.

Run `python tests/progression.py` to verify preview access, mutation guards, partial completion, sequential unlocks, cross-tab updates, and reset behavior. This is a browser-based training progression feature, not server-side access control.

## Offline access and independent race practice

Open over HTTPS (or localhost) and wait for **Ready offline**. The service worker downloads every app screen, script, stylesheet, and the bundled “Take your marks” voice. All session URLs work offline. Progress and race results remain on this browser/origin; reconnecting checks for app updates, with no server upload or cross-device sync. New shell versions activate after existing app tabs close, preventing an update from replacing a running race. Bump `CACHE` in `sw.js` when publishing changes. Clearing browser site data removes downloads and saved results.

Open **Race** from the header or overview. Race practice is separate from the meet-day checklist and weekly progression. Choose stroke, distance, pool, and preparation time. The standalone stopwatch keeps the timer, Start/Finish button, and compact swim settings on one screen. Tap Start directly; a compact swim summary opens settings in a modal through Edit, using a bottom sheet on mobile without moving the timer. Starting locks the settings. Race history and export live on race-tools.html, reached through History in the header. During a swim, the split button records every 25 m without stopping the clock. Optional breakout tracking adds start and post-turn breakout markers; an observer taps when the head first breaks the surface, or skips a missed breakout. Breakout times are measured from the start beep. Results and history show segment durations and cumulative split times. Markers persist across reloads. Settings lock during an attempt. The final time stays on the clock until Swim again resets it. Short whistles, a long whistle (two for backstroke), the bundled voice, and a short dual-tone electronic start beep are scheduled using Web Audio. Timing begins at the beep's scheduled onset, using a monotonic clock during the visit. Device output latency and manual finish reaction mean this is practice timing, not official meet timing.

The sequence follows [World Aquatics start rules](https://www.worldaquatics.com/swimming/rules); automated preparation intervals and a randomized 1.5–3 second pause after the voice are practice choices, not prescribed official intervals. Keep the page visible and audible. Hiding or leaving during preparation interrupts and logs the attempt without a time. Once swimming, the timer can recover on reload using wall-clock timestamps; recovered times are explicitly labelled approximate. Screen wake lock is requested where available. Phone/browser background audio behavior still needs a poolside sound check on the actual device.

Tap the large Finish button to stop and save the stopwatch, whether you or a helper operates it. Test the start beep from 3–4 metres away on the actual device; a phone speaker cannot guarantee that range over pool noise. The 0.25-second start beep is generated offline and normalized to 95% peak to avoid clipping. Completed, cancelled, abandoned, and interrupted attempts appear in a separate race log and JSON export. Training reset does not delete race records. Saves that fail offer retry and keep the unsaved result on screen. Race mode requires writable browser storage before arming.

Run `python tests/race_offline.py` with Playwright and Chrome installed for offline navigation, saved training checks, the audio-clock race start, finish logging, cancellation, reload recovery, unified stopwatch logging, reconnect, and responsive layout checks.


### Start-signal reference

[World Aquatics describes OMEGA’s swimming start signal as a beep](https://www.worldaquatics.com/news/3251540/how-omega-keeps-advancing-timekeeping-in-swimming-a-partnership-celebrating-50-years). The [Colorado Time Systems Infinity Pro manual, Features](https://coloradotime.com/hubfs/CTS%20Website%20%20Assets/Manuals/Swim%20Timing%20Components/Start%20Systems/Infinity%20Pro/INF-PRO%20Starter_F1063.pdf?hsLang=en) specifies a 0.25-second dual-tone electronic signal. We use that duration and format instead of the previous sustained air-horn sound. Our 1000/1500 Hz sine tones are an explicitly chosen practice approximation: the cited manual does not specify frequencies, and this is not a recording or exact reproduction of CTS or OMEGA hardware. The stopwatch starts at the beep’s onset. Phone output cannot reproduce the sound-pressure level of poolside starting equipment.
