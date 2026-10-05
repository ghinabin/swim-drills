# Final taper information architecture

Updated 5 October 2026. Implemented locally against the latest supplied October 4–13 schedule.

## User and primary task

One swimmer preparing for 50 m freestyle on October 12 and 100 m freestyle on October 13 in a 25 m pool. The phone is used at the pool inside a water/rainproof pouch. The app must make the next prescribed action readable and easy to tap, with minimal decisions and no extra training suggestions.

## Navigation and hierarchy

**Today → AM swim / race** is the primary path. **Plan** exposes the full ten-date schedule. **Race** contains meet-day preparation and official results. Tempo lives under Tools & reference, preserving the feature without making it compete with the taper.

Each day has four independent parts:

1. **Before pool:** duration, activation constraints, exercise sequence.
2. **AM swim:** grouped drills, exact prescription, effort, rest and relevant execution cues.
3. **PM swim:** optional/easy conditions or explicit Off. Its progress does not affect AM.
4. **Evening:** mobility sequence/duration, optional conditions, or explicit rest.

Today presents one day-specific card with the focus, distance, drill count and ordered drill groups, with Open/Resume drills as its primary action. Optional later swimming and evening mobility are grouped under Later today. Home has no AM/PM tabs and legacy phase links still show the whole day. Pool sessions have two visible AM/PM tabs. AM is the default; opening a PM link explicitly selects PM. Before-pool activation sits at the top of AM; evening mobility/rest sits at the top of PM. Each opens a native modal with a large sticky Close button. Escape and browser Back also close it and restore the originating position/focus. Only the selected swim's drills fill the main view. Pool options is removed from sessions and race warm-up; Full supplied day is removed from sessions. Pending updates are available under Tools & reference on Today/Plan. No automatic switching by clock time assumes when the swimmer trains.

## Pool interaction

Set groups follow the supplied order: warm-up → catch/pull or kick → starts/breakout → speed/race rhythm → turns/finish → easy finish, with the actual sequence varying by day. Nothing is reordered to fit a generic template.

Each compact card shows its title/checkbox, prescription, recovery, technique and relevant conditions. Each card is a label wrapping a standard native checkbox, activated by tapping anywhere or using Space. The native checkbox appearance and checked state replace the custom checkmark. Checking crosses out only the title; instructions remain readable. Tap again to undo. There are no Done, Skip, per-card Rest or bulk-finish buttons. The next unchecked set is highlighted. The timer footer has no Next link. Checking never starts or changes rest, or scrolls the swimmer automatically. Optional reps do not count as required work; historical skips are retained in storage but appear unchecked.

A single generic countdown is controlled from the bottom rest bar, defaulting to 20 seconds. Tapping the time opens one compact grid: 20 seconds plus all supplied numeric rest choices in the selected swim, including repetition rest, broken-set rest and the 30–60-second between-block rule. Choices are sorted and deduplicated; there are no drill labels, Rest for selector, custom-duration form or separate Start/Reset panel. One hint identifies the minutes:seconds format. Tapping a time starts a new countdown immediately, closes the picker and returns focus to the footer. Choosing during a running countdown restarts it with the selected time; opening or cancelling the picker leaves it running. The footer supports pause, resume and restart. Supplied rest labels remain on their drill cards; full recovery gets no invented numeric duration. Existing running/paused countdowns survive refresh and navigation, with prior drill-specific timer context removed from the generic interface. Legacy blank timers upgrade to 20 seconds. Activation, mobility and off phases have no timer footer.

Screen wake-lock controls are no longer shown. All essential interactions are taps; none depend on swiping, dragging, long presses or accurate touches to small icons. The complete card is a large tap target; tabs, modal Close and timer controls retain at least 48 px height. Numbers and rest text remain readable. Checked boxes and struck-through titles communicate completion without relying on colour. Routine offline/save status and the Data & backup interface are removed; a Retry warning appears only when saving fails. Effort definitions and supporting records use disclosures; the supplied schedule is downloadable from Tools & reference.

## Race days

Choose 50 / October 12 or 100 / October 13. Keep reporting details near preparation; never infer reporting time. Activation opens in a modal from the AM header; PM recovery opens through the PM tab. Warm-up follows the supplied sequence and permissions. Race cues are separate from workout completion, including the 100's third-length HOLD FORM cue. Preserve normal/familiar breathing instructions.

After the 50: optional 300–400 m extremely easy recovery only if access allows and the swimmer feels normal; otherwise rest. No evening exercise. Do not create an October 13 recovery workout.

Official results remain tied to their events. Oct 1/2 records from the previous plan remain under “Earlier rehearsal records”, without reintroducing their workouts.

## Content integrity and storage

The latest source replaces the earlier visible schedule. All ten dates, AM/PM work, dryland activation, mobility, stopping instructions and conditional PM work are represented. Exact daily source excerpts remain available. Previous source/data and saved progress are preserved separately.

Supplied distances are estimates. Explicit variable/short skill reps are not converted into invented full lengths. Oct 6's listed fixed lengths total 1,200 m plus turns while its heading says ~900–1,000 m; retain both and flag the discrepancy. Oct 5 PM lists 400–450 m plus easy remainder against a ~400 m heading. These are source discrepancies, not permission to remove prescribed work.

Use a new plan revision and stable phase/set identities. AM and PM completion remain separate. Carry forward only records describing the unchanged race events and earlier actual rehearsals. Preserve portable tempo profiles. The storage layer still preserves prior revisions and supports atomic writes; removing the backup interface does not clear records.

## Verification and limits

Validate source excerpts/sets, dates, complete-rest and PM-off states; check each phase at 320, 390, 768 and 1440 px. Exercise the whole-day Home card and Later today, native whole-card completion/undo and Space, title-only strikethrough, phase navigation, default/legacy-empty timers, generic repetition/block duration choices and automatic start/close, timer pause/reload, storage failure/retry, replacement-plan migration and offline updates. Verify removed controls stay absent and older skipped records remain preserved. Keep the existing Tempo calculations/player regressions.

Browser tests establish layout and state behaviour. Real pouch handling, wet-touch accuracy, bright pool lighting, and screen wake-lock/audio support require physical-device checks. No breath-hold timer, hypoxic task or reward for prolonged underwater swimming is added.
