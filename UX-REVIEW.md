# Application usability review

September 28 upgrade: implemented the priority recommendations from
[`docs/MOBILE-UX-BUSINESS-REVIEW-2026-09-28.md`](docs/MOBILE-UX-BUSINESS-REVIEW-2026-09-28.md).
The three main destinations and all prescribed swimming remain intact.

- Larger prescription, effort, and rest text; a distinct next-set state and a
  persistent footer link to the next required set.
- Explicit per-set duration choices feed the existing shared timer, including
  between-repetition versus between-round rests. Custom and generic durations remain.
- Persistent failed-save warning and Retry, automatic legacy-record migration,
  and atomic JSON backup/restore in Data & backup.
- Optional warm-up sets remain independent of required completion and bulk actions.
- Race warm-up start/resume, sticky section links, optional heat/lane/event fields,
  a two-event results summary, and copying official plus rehearsal results.
- Field-specific rehearsal errors, auto-saved drafts, and a distinct recorded state
  when a valid final time is available.
- Visible offline readiness, home-screen manifest/icons, and updates that wait for
  user action or for app tabs to close.

Validated with `tests/competition.py` and `tests/poolside.py`, including 320 px mobile,
landscape, desktop, offline flows, and blocked storage. Physical-device installation,
wet-hand use, mobile assistive technology, and background alerts still need device
testing. Optional round counters, coaching workflows, and reusable plans are deferred.

The primary journey is Today → session → complete sets or use the shared rest
timer → return to the originating screen. Plan supports finding another date;
Race groups the event's warm-up, race cues, reporting time, and results.

## Implemented

- Consistent SVG icons: back arrow for returning, chevron for opening a screen,
  down arrow for jumping within a page, and download icon for the supplied plan.
- Today shows saved session progress alongside the resume action.
- Sessions provide a next-unfinished-set shortcut. Returning to Plan preserves
  position; day screens retain the focused header and shared footer timer.
- Start, pause, resume, and restart the rest timer directly from the footer.
  Tapping the timer opens duration settings; completion has a distinct state.
- Bulk completion preserves deliberately skipped sets and offers immediate undo.
  Skipped sets are never reported as completed by the bulk action.
- Larger pace and cue text, consistent detail disclosures, stable card borders,
  and a clearer visual hierarchy between primary actions and secondary help.
- Notifications appear above the fixed timer. Forms stack on narrow screens,
  and bottom spacing reserves space for navigation without a large empty gap.

## Scope and validation

Training prescriptions, source instructions, distances, rests, and effort
guidance are unchanged in this review. No new training recommendations were added.

The current browser suite checks all 18 dates and original prescriptions,
320–1440 px layouts, keyboard navigation, completion and skip state, bulk undo,
the next-set shortcut, direct timer controls, stored records, error feedback,
and offline sessions. Visual review covers Today, Plan, sessions, and Race.

Saved progress remains local to this browser. This review does not add accounts,
cloud synchronization, or background notification guarantees.
