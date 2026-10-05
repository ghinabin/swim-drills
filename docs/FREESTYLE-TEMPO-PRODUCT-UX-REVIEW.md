# Freestyle Tempo: product and UX review

Reviewed 2 October 2026 against the current repository and the supplied feature brief. This is a proposed product specification, not an implemented feature or a physical-device usability test.

## Recommendation and product fit

Add **Tempo** as a reusable training tool, with the page heading **Freestyle Pace & Stroke Tempo Trainer**. Its value is helping a swimmer rehearse a personal arm rhythm and apply it to an existing set. It should remain available after this competition plan ends.

The current product is Lane 50: a dated competition companion with Today, Plan and Race navigation. Sessions present prescribed sets, completion/skip actions and a shared rest timer. It is not currently a general drill library, workout builder, repetition tracker or live race controller. The old drill and race-tool URLs redirect to current pages.

Recommended placement:

- Add Tempo as a fourth navigation destination; retain Today as the primary session entry.
- Add a quiet “Practise your freestyle tempo” link below the Today session action, including on the post-plan screen. Do not displace Open/Resume session.
- Add “Use tempo” in the footer of eligible session cards, alongside existing rest and skip actions, outside the whole-card completion button.
- Link from Race technique/preparation content as “Practise race rhythm”. Keep official results and reporting details separate from training playback.
- Open the active player as a focused view with a contextual return to the originating session/set. Hide general navigation during playback, as sessions already do.

Business hypothesis: swimmers will return to an evergreen personal rhythm tool beyond the dated plan. Validate repeat use and successful set attachment before adding accounts, paid features or a full session builder. No claim of improved race time follows from app usage alone.

## Requirements that need correction before implementation

### 1. Distinguish cadence from swimming pace

SPM describes arm cadence, not distance per time. “100 m rhythm” and “50 m sprint rhythm” are effort-associated personal presets, not guaranteed race speeds. Keep observed 25 m time alongside cadence as context. Do not calculate a predicted 50/100 m result or automatically rank higher cadence as better.

### 2. Whole-length calibration is an estimate

The brief's arithmetic is correct: 18 individual strokes / 16 seconds × 60 = 67.5 SPM, with a 0.889-second interval. But the whole-length time includes push-off/glide and potentially a start, when the swimmer is not taking arm strokes. Treat this as **estimated average over the length**, not a precise measurement of active stroke rhythm.

Offer two methods:

- **Quick estimate:** requested 25 m time and stroke count, with an explicit estimate label and editable target after listening to the cue.
- **Measured cadence:** count strokes over a timed surface-swimming window; calculate count / window duration × 60. Define the window as a fixed observation duration, excluding push-off and wall time. Retain whole-length time separately when supplied.

Explain counting: “Count each arm entry: right = 1, left = 2.” Store measurement method, raw count, time, count unit, date and pool length. Let the user calibrate only one effort and return later; never require three tests to use the player. Repeating a test is optional and does not erase the old result until saved. Do not insert calibration sprints into the prescribed training calendar automatically.

### 3. Count units and playback units must be separate

Store a canonical **individual-arm strokes/minute** value. When measurement is in complete cycles, multiply cycles/minute by two. Changing the playback unit must preserve physical cadence.

| Same physical rhythm | Rate displayed | Interval between beeps |
| --- | --- | --- |
| Every arm entry | 66 strokes/min | 0.91 seconds/stroke |
| Every right + left cycle | 33 cycles/min | 1.82 seconds/cycle |

Never label cycles/min as SPM. Store count unit per observation; a global setting alone cannot reliably interpret older entries. Use precise, unrounded values for scheduling and round only the display. Adjustment buttons should explicitly change arm SPM even when the screen also shows cycle equivalents.

### 4. Decide how the swimmer hears it

A functioning browser speaker does not establish that a swimmer can follow the cue in water. Validate the intended arrangement: coach holding the phone at the wall, poolside speaker, or a suitable swimmer audio device. Include “Test sound” before starting, a volume control and a short explanation of what each beep means. Describe coach/land rhythm rehearsal as a supported use while in-water audibility is being validated.

Do not promise lock-screen or background playback. MDN documents iOS Safari audio interruption when leaving a page or turning off the screen. Default to foreground playback with optional screen wake lock where supported. If hidden or audio is interrupted, stop queued sounds, freeze the workout, and require explicit Resume on return. No missed-beat burst and no silent advancement through repetitions. Source: [MDN AudioContext states](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state).

### 5. Distance alone cannot finish a repetition

The app cannot detect completion of 25 m without a sensor or user input. MVP uses “Finish rep” at the wall, followed by the prescribed rest countdown. A later timed rehearsal mode may transition using user-entered durations, clearly labelled **planned timing**, not measured distance or verified completion. Save “played/finished” separately from existing “set done”; offer an explicit Mark set complete action at the end.

### 6. Split and turn timing needs a single definition

Store each expected segment duration as elapsed time between segment boundaries, including any turn time within that interval. Derive cumulative boundaries by adding segment durations. Do not add a separate turn transition to every split and thereby extend the race unintentionally.

For a boundary at 18 seconds and warning offset 1.5 seconds: warning at 16.5 seconds, wall reference at 18 seconds. A configured quiet transition masks cadence after that boundary; it does not shift later boundaries. Distinguish cue sound duration from quiet transition duration. Validate positive splits, warning offsets smaller than their segment, and transitions shorter than the following segment.

For 100 m, support four logical 25 m segments in either pool length. In a 25 m pool walls are at 25/50/75 m; in a 50 m pool the only turn is at 50 m, while 25/75 m are tempo changes. Independent expected segment durations are needed for timed playback. One repeated split may be offered as an explicit convenience. Keep turn cues disabled initially and describe them as wall references, never commands to turn.

## Proposed user experience

### Tempo home

Four cards: Easy, 100 m rhythm, 50 m sprint rhythm, Custom. Each calibrated card shows arm SPM, seconds/stroke, calibration date and a compact source label. Uncalibrated cards say “Find my tempo”; do not silently substitute sample values. Custom permits manual entry without calibration and labels the value “Manual target”.

Secondary actions: Find My Tempo, Compare tempos, Race rhythm practice. Race modes are workout patterns; 1-2-3 is a cue style. Neither should appear as another pace card.

### Find My Tempo

Choose one effort → choose measurement method → enter time/count and optional effort rating → review result → Test sound → Save target. Keep explanatory content close to the relevant field. Missing, zero, non-finite and implausible values receive field errors or an explicit review prompt. If Easy happens to exceed a sprint measurement, suggest checking units/conditions rather than rejecting it or automatically reordering targets.

### Player

Ready view shows selected effort, very large arm SPM, interval and “One beep per arm entry”. Settings contain cue style, count display, volume and adjustments of ±1/±2 arm SPM. Active view keeps Pause, Stop and two large ±1 controls visible; ±2 remains available in the adjustment panel. This reconciles the requested adjustment options with minimal active controls.

For an attached set:

```text
REP 2 / 4
100 M RHYTHM
66 SPM
0.91 SEC / STROKE
SWIM · 25 m
[Finish rep]   [Pause]
```

During rest:

```text
REST AFTER REP
00:30
NEXT: REP 3 / 4 · 25 m · 66 SPM
[Start next rep]   [Pause]
```

At rest expiry, show Ready rather than automatically starting the next swim by default. Separate final-set rest from rep rest; after the last rep, use set rest only rather than adding both implicitly. Do not run the existing footer countdown and a second trainer countdown simultaneously: the attached trainer owns the active rest phase; standalone playback leaves the existing timer untouched.

Use 56–64 px frequent action targets, tabular numbers, explicit WORK/REST/PAUSED text and adequate spacing. Colour reinforces the state but never carries it alone. Avoid per-beat screen-reader announcements; announce meaningful phase changes. Respect reduced motion. Keep the safety and technique notes accessible in setup and a short persistent player note without crowding the numeric display.

### 1-2-3 rhythm

At arm cadence S, each three-beat group spans 60/S seconds; sub-beat spacing is 20/S seconds. At 66 SPM this is approximately 0.303 seconds between sub-beats. For full-cycle display, retain two groups per cycle. Emphasize 1; use quieter ticks for 2 and 3. Describe it as an optional six-beat-kick coordination cue, with no claim of a universal speed or automatic synchronisation to the swimmer. Test whether swimmers can hear and distinguish the ticks before prioritising it over the core player.

### Race rhythm and comparison

50 m defaults to the swimmer's saved sprint target, with editable expected splits and pool length. 100 m defaults to the saved 100 m target for all four segments. Progressive mode reveals four editable targets with the brief's labels; do not invent numeric increases. If a target is unavailable, offer calibration or explicit manual entry.

Place the comparison table inside Tempo, not Progress or official results. Show missing entries as “Not recorded”. Signed sprint-minus-100 cadence is descriptive, without green/red judgement. Pool length, measurement method and observed date provide context when observations differ.

## Existing architecture and reuse

| Existing asset | Reuse and constraint |
| --- | --- |
| `assets/styles.css`, `assets/preparation.css` | Existing colours, typography, buttons, panels, native dialogs, focus styles, mobile/safe-area layout. Add scoped tempo rules. |
| `assets/navigation.js` | View restoration, session links, modal history and return behaviour. Extend contextual navigation for Tempo. |
| `assets/app.js` | Today/Plan/Race shell; session set rendering and footer actions; completion semantics and rest formatting. Keep the player outside this already large file. |
| `assets/storage.js` | Retry and unsaved-state patterns. Current allowed record keys and plan-scoped persistence require extension. |
| `assets/settings.js` | Export/restore validation and storage-warning UI. New records must explicitly participate in backup. |
| `data/competition-plan.json`, `scripts/import-plan.cjs`, `assets/data.js` | Structured source and validation/generation pipeline. Generated data must not be edited directly. Existing prescriptions/rest labels are not a general repetition execution schema. |
| `assets/race.js` | Historical oscillator and wake-lock examples only. It is absent from the current service-worker asset list and is not the current Race-page controller. Do not assume its lifecycle is production-ready for sustained tempo playback. |
| `sw.js`, `assets/offline.js` | Offline caching and deferred update behaviour. Cache the new page/modules and bump the release. |
| `tests/competition.py`, `tests/poolside.py` | Current browser regressions and persistence patterns. Older test files target superseded revisions. |

## Proposed files and data

Create `tempo.html`, `assets/tempo.js` (page UI), `assets/tempo-core.js` (pure conversion/calibration/segment/cue functions), `assets/tempo-audio.js` (audio scheduling), `assets/tempo-session.js` (work/rest state), `assets/tempo.css`, `tests/tempo.cjs` and `tests/tempo.py`. Follow the framework-free JS conventions; no new UI framework or build system is necessary.

Modify `assets/app.js`, `assets/navigation.js`, `assets/storage.js`, `assets/settings.js`, `sw.js` and `README.md`. Modify the source plan JSON/import validator only when explicit eligible-set metadata is added; regenerate `assets/data.js` through the existing script. Do not derive executable reps, alternating efforts or round rests by parsing human-readable prescription strings.

Model decisions:

- Profile: schema version; calibration observations by effort; saved canonical targets; manual custom target; preferred beep mode. Profile survives plan revisions in a separate versioned record.
- Preset: selected effort, target arm SPM, cue style, pool length, turn settings and expected segment durations. Compute intervals instead of persisting redundant seconds/stroke.
- Race segment: distance, arm SPM, label, expected duration. Boundaries are derived.
- Set attachment: plan revision + day ID + set ID; explicit repetitions/rounds, distance, targets, rep rest and set/round rest. Snapshot targets when starting so profile edits cannot alter an active workout unexpectedly.
- Active run: state, rep/round indices, remaining phase time and configured targets. Restore to paused; never start audio because a saved run was loaded.

Cross-plan profile backup requires an explicit migration/restore policy; current restore rejects different plan revisions. Preview portable profile changes separately from matching-plan session records and preserve atomic failure behaviour. Do not simply add profile data to the current backup without adapting its validators and merge rules.

## Incremental delivery and acceptance

1. **Foundation:** canonical units, calibration, manual target, persistence/backup and comparison. Verify cycle conversion, partial calibration, invalid values and profile survival across revisions.
2. **Usable core:** standalone player, foreground audio, sound test, pause/resume/stop, adjustments and interruption recovery. Use AudioContext time with scheduled short tones and a bounded look-ahead scheduler. Cancel queued nodes when changing state; change target on a defined next beat. Physical iPhone/Android sound and interruption checks are release gates, not replaced by mocked timer tests.
3. **Session attachment:** explicit metadata for suitable simple freestyle sets; rep/round tracking and shared-rest ownership. Preserve whole-set completion and existing prescriptions. Keep mixed FAST/EASY, kick-only, turn-only and complex technique sets ineligible until their execution model is defined. Preserve the current deliberately timer-free day.
4. **Advanced cues:** 1-2-3, 50/100 m timed rehearsal, progressive targets and turn references after base audibility and timing are validated.

Accept the release when the 18/16 example displays 67.5 SPM and 0.89 seconds; 9 cycles/16 seconds yields the same arm cadence; mode switches preserve rhythm; malformed/extreme inputs never schedule audio; pause/background stop queued cues; resume never catches up missed sounds; tempo changes never double-play; race boundaries stay fixed through turn quiet windows; rest types remain distinct; backups restore safely; and new screens work offline without regressions in the current browser suites. Define supported cadence limits as technical product limits, not physiological recommendations.

Run a small observed swimmer/coach pilot: can users explain the beep unit, save one tempo, find an eligible set, distinguish swim/rest, pause and recover, and hear the cue in their actual setup? Record confusion and accidental taps. A screen recording can verify layout, but cannot establish in-water usefulness.

Carry forward the brief's exact technique, wall-approach and normal-breathing messages. Exclude breath-hold, hypoxic and underwater-distance challenges. The feature controls rhythm only.

Relevant background: [U.S. Masters Swimming on individual stroke-rate experimentation](https://www.usms.org/fitness-and-training/articles-and-videos/articles/your-ideal-stroke-rate?Oldid=3289), [MDN scheduled audio sources](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode). The placement and workflow recommendations above are product/design judgement based on repository inspection; swimming improvement and poolside audibility remain unvalidated.
