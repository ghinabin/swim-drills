# Application usability review

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
