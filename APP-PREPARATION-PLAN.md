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

Today leads with AM/race and lists the other three parts directly below. The session displays only the selected part. “Day parts & options” reveals the other parts and screen/data controls without filling the pool screen with permanent tabs. No automatic switching by clock time assumes when the swimmer trains.

## Pool interaction

Set groups follow the supplied order: warm-up → catch/pull or kick → starts/breakout → speed/race rhythm → turns/finish → easy finish, with the actual sequence varying by day. Nothing is reordered to fit a generic template.

Each card shows the prescription first, then recovery, with technique and conditions beside the affected work. Reading the card is passive; separate 60 px Done/Undo, Rest and Skip actions carry interaction. The next incomplete set is highlighted and reachable through a persistent footer link. Marking a set done does not start rest or move the swimmer automatically. Optional reps and skipped sets do not count as completed required work.

A single countdown is selected from the current set, or from the explicit 30–60-second block-rest rule. Range choices stay within the prescription. Broken-set internal rest and rest before the next broken 50 have separate labels. Full recovery stays textual. Activation, mobility and off phases have no timer footer. A running timer retains its context through phase navigation rather than being mistaken for a new prescription.

Keep screen on is an opt-in wake-lock request. All essential interactions are taps; none depend on swiping, dragging, long presses or accurate touches to small icons. Numbers and rest text remain large. Colour reinforces explicit Done, Skipped and Up next text. Full instructions, effort definitions and supporting records use disclosures.

## Race days

Choose 50 / October 12 or 100 / October 13. Keep reporting details near preparation; never infer reporting time. Activation opens separately. Warm-up follows the supplied sequence and permissions. Race cues are separate from workout completion, including the 100's third-length HOLD FORM cue. Preserve normal/familiar breathing instructions.

After the 50: optional 300–400 m extremely easy recovery only if access allows and the swimmer feels normal; otherwise rest. No evening exercise. Do not create an October 13 recovery workout.

Official results remain tied to their events. Oct 1/2 records from the previous plan remain under “Earlier rehearsal records”, without reintroducing their workouts.

## Content integrity and storage

The latest source replaces the earlier visible schedule. All ten dates, AM/PM work, dryland activation, mobility, stopping instructions and conditional PM work are represented. Exact daily source excerpts remain available. Previous source/data and saved progress are preserved separately.

Supplied distances are estimates. Explicit variable/short skill reps are not converted into invented full lengths. Oct 6's listed fixed lengths total 1,200 m plus turns while its heading says ~900–1,000 m; retain both and flag the discrepancy. Oct 5 PM lists 400–450 m plus easy remainder against a ~400 m heading. These are source discrepancies, not permission to remove prescribed work.

Use a new plan revision and stable phase/set identities. AM and PM completion remain separate. Carry forward only records describing the unchanged race events and earlier actual rehearsals. Preserve portable tempo profiles. Backup validation recognises phase-specific records and rejects unknown set IDs before writing atomically.

## Verification and limits

Validate source excerpts/sets, dates, complete-rest and PM-off states; check each phase at 320, 390, 768 and 1440 px. Exercise completion/undo/skip, phase navigation, contextual rest, timer pause/reload, storage failure/retry, replacement-plan migration, backup validation and offline updates. Keep the existing Tempo calculations/player regressions.

Browser tests establish layout and state behaviour. Real pouch handling, wet-touch accuracy, bright pool lighting, and screen wake-lock/audio support require physical-device checks. No breath-hold timer, hypoxic task or reward for prolonged underwater swimming is added.
