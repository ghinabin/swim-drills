# Training audit for the 12 October 2026 race

Reviewed: 16 September 2026  
Race: 50 m in a 25 m pool; freestyle assumed from the existing plan  
Athlete: age 35, swimming daily and following the app's drills  
Latest result: approximately 16 seconds for 25 m, full stroke from a wall push  
Time remaining: 26 days

## 1. My verdict

**The plan contains useful drills, but I would revise its workload, targets, and several instructions before following it unchanged. More distance is not the first fix.**

For your remaining preparation, about 1,000 m can be a useful session length if it provides enough warm-up, good full-stroke swimming, race skills, and recovery. It is not a scientifically established minimum or an assurance of competitiveness. The more immediate problems are too many demanding sessions in succession, targets not based on your current times, and a taper that cuts distance sharply while keeping almost every swim day hard.

My recommendation is to keep your familiar overall workload initially, organise roughly **three quality days separated by easy swimming or rest**, and use fewer drills with clearer purposes. Count starts, turns, and return swimming in the actual distance. Do not suddenly double your distance or add another hard set.

This can improve your preparation and give you a better chance of swimming your best race. **It cannot establish that you will break 30 seconds or place competitively.** We need a comparable full 50 m time and results for your actual race category.

The set prescriptions below are practical judgments for this short preparation period, not a research-tested programme for you personally. Training history before September, injuries, start proficiency, and recovery response are still unknown. Age 35 alone does not determine the right volume.

## 2. What your 16 seconds tells us

Your clarification establishes that this was swimming after a wall push, not kick-only swimming. That makes it relevant to your sprint preparation.

However, a single 25 m does not measure your dive, turn, or ability to maintain speed over the second length. Timing method, fatigue, breathing, and whether this was a maximal effort also matter.

The app asks for repeated 14.5–15.0-second 25s. Compared with 16.0 seconds:

| Target | Reduction in time |
| --- | ---: |
| 15.0 s | 1.0 s / 6.25% |
| 14.5 s | 1.5 s / 9.38% |

If 16 seconds is near your current fresh maximum, those are improvement goals, not appropriate compulsory repeat targets today. If it was a tired or controlled effort, establish a fresh baseline first.

Do not double 16 and treat 32 seconds as a prediction. Equally, do not subtract an assumed dive advantage and promise sub-30. A race includes different start conditions, a turn, and fatigue.

The existing race note also contains an arithmetic error: **14.2 + 15.8 = 30.0, not 29.9.** Even a corrected sum would need to come from your actual race profile.

### A useful baseline session

Replace one planned race-simulation main set with this assessment; do not add it on top:

1. Complete your normal progressive warm-up.
2. If you already know how to dive safely and blocks are available under supervision, swim one timed 50 m from a legal start in a 25 m pool.
3. Otherwise swim a timed 50 m from a push and label it clearly.
4. Record the start type, timer, total, approximate 25 m split, turn quality, breathing, and how the last 10 m felt.
5. Finish easily. A second attempt is optional only after full recovery, not required.

Use the same timer and start convention on later checks. For a flip-turn split, consistently use feet contacting the wall if observing manually or on video; it is not a hand-touch split. The full 50 m time is the main comparison.

Compare race competitiveness with the same event, pool length, age/category, and timing standard. I did not find a verified current 14th NSA Cup results/entry document establishing your field or qualifying threshold. October 12 and the 25 m course are taken from your confirmation.

## 3. Your missed session and calendar

I interpret your original message as: the September 14 workout was completed, possibly on September 15; the workout assigned to September 15 was omitted; and you did September 16's workout on September 16. The exact date of the first workout is ambiguous, but the recommendation is the same:

**Keep the race calendar fixed. Do not cram in the missing workout, double tomorrow, or delay the taper to finish every checkbox.**

There is also an app issue relevant to this: `assets/app.js` requires every previous week's checklist to be complete before later weeks unlock for tracking. A skipped session can therefore block next week's checkboxes even though the training calendar should move on. All weeks remain viewable.

A future app revision should distinguish completed, skipped, and rest days, record the actual training date, and allow calendar progression without falsely marking a missed workout complete. This audit does not change your saved progress.

## 4. What is actually in the current plan

I reviewed all of `assets/data.js`, including BASE, W3, W4, and the race-day checklist. I also checked the progression logic and README.

### Weekly workload as labelled

| Week | Dates | Labelled distance | Scheduled swims | Main concern |
| --- | --- | ---: | ---: | --- |
| Load | Sep 14–20 | 6,800 m | 7, with Sunday optional | Hard work on most days |
| Peak | Sep 21–27 | 6,800 m | 7, with Sunday optional | Same BASE data, not a distinct progressive week |
| Taper begins | Sep 28–Oct 4 | 3,500 m | 5 | All five swim days contain race-pace or maximal work |
| Race week | Oct 5–11 | 2,200 m | 5 | Very short sessions but repeated maximal instructions |

These are labels, not reliable actual totals. The optional Saturday loosen-up in race week is excluded; its pool length is unspecified.

Relative to 6,800 m, 3,500 m is a **48.5% weekly reduction**, despite the “cut reps 30 percent” description. The final 2,200 m is a **67.6% reduction**. Cutting each session and removing days compounds the reduction.

### Distance and instruction inconsistencies

| Location | Finding |
| --- | --- |
| BASE Saturday, 50 m pool | Main block displays 8 lengths = 400 m, but says 4 × 50 = 200 m. Written distance-based sets total 800 m before the dive block. |
| W3 Saturday, 50 m pool | Main block displays 6 lengths = 300 m, but says 3 × 50 = 150 m. Written distance-based sets total 550 m before dives. |
| W4 Tuesday | Four starts stopping at 15 m account for 60 m, while the block counts 4 × 25 = 100 m. Specify the remaining easy swimming. |
| W4 Sunday | Main block counts 4 × 25 = 100 m, but describes only 2 × 25 = 50 m. Written total is 250 m unless 50 m recovery is intended. |
| Timed turn, breakout, underwater, dive, and venue blocks | Their travelled distance is omitted from the normal numeric total. Thursday's 4 × 15 m adds at least 60 m; Friday's 6 × 15 m adds at least 90 m, before returns. |
| Vertical kick | Adds effort and time, even though it adds no horizontal metres. Eight 30-second cycles are four minutes; ten are five minutes, not eight. The remaining block time is unspecified. |
| Week 2 | Shares BASE with week 1. Only the vertical-kick prose explicitly changes repetitions. |
| Race split | 14.2 + 15.8 totals 30.0. |

The app uses “laps” to mean one pool length. Write metres explicitly in future revisions to avoid the common out-and-back interpretation.

### Intensity distribution

Monday has maximal 25s; Tuesday has ten purported race-pace 25s; Thursday has four all-out 50s plus fast 25s; Friday has another race simulation; Saturday has dives plus four all-out 50s. Even Sunday builds to maximum.

Thursday through Saturday therefore prescribe **ten all-out 50s across three consecutive days**, plus other fast work. That is my strongest workload objection for an athlete without a documented history of tolerating this schedule. The “technique” label also hides demanding work such as maximum-tempo pull-buoy sprints.

Wednesday's recovery day includes a ten-minute breakout block and fast builds. Sunday is only genuinely light if its efforts are reduced. Low distance does not automatically make a session easy.

## 5. Drill-by-drill validation

“Keep” means the drill has a useful purpose. It does not mean that the exact current dose or time target is validated.

| Drill or component | Assessment | Recommendation for you |
| --- | --- | --- |
| Easy swimming and progressive builds | Keep | Warm up until comfortable and coordinated. Do not let a round-number distance cap force you to sprint cold. |
| Fast kickboard flutter kick | Keep, smaller dose | Use a few technically good lengths. The 22–25 s target needs your own kick baseline. Avoid exhausting your legs before the most important swimming. |
| Fist swimming | Keep selectively | Pair a short fist segment with normal freestyle so the sensation transfers. Focus on forearm pressure, then check whether normal swimming improves. |
| Pull buoy | Useful accessory | Controlled pulling can help attention to the catch. Maximum arm tempo is not automatically better propulsion, and arms-only work is not a substitute for full-stroke sprint coordination. |
| Vertical dolphin kick | Optional | Lower priority than your turn and full-stroke speed. Keep your face above water, use supervision, and stop if you cannot maintain position comfortably. Do not make hands-above-head compulsory. |
| Flip-turn repetitions | High priority | Your race has one turn. Practise approach, compact rotation, foot placement, streamline, and return to swimming. Time a consistent 5 m-in/5 m-out segment. |
| Five or six compulsory dolphin kicks | Revise | Use a kick count that preserves speed. Compare a couple of comfortable, familiar options over the same distance. A larger count is not a goal by itself. |
| Freestyle arms with dolphin kick | Optional coordination drill | Keep only if it helps your breakout. Follow it with normal freestyle. Remove the universal instruction that a flutter transition must never occur. |
| Timed 15 m underwater kick | Replace as a default | Prefer short, supervised start-to-breakout swimming. Fifteen metres is a legal maximum after a start/turn, not a required underwater training distance. |
| Push starts | Keep | Good for streamline and breakout; they do not practise block reaction, take-off, or entry. |
| Block starts | Keep, prioritise freshness | If safe and permitted, begin with roughly 4–6 deliberate starts with feedback rather than chasing 10–12 dives and then four exhausting races. |
| Full-rest fast 25s | Keep | Calibrate to current performance and stop while speed/form remain good. |
| Ten 25s on 1:00 at 14.5–15.0 | Recalibrate | Start with fewer controlled repeats at a speed you can reproduce. A hoped-for future best is not current race pace. |
| All-out 50s | Keep sparingly | One race-specific session per week can contain 1–2 good 50s initially, replacing the repeated Thu/Fri/Sat tests. |
| Easy swimming and cool-down | Keep | Use for recovery and relaxed full-stroke practice. Add a little here if the session needs it. |
| Finish practice | Add within existing metres | Practise swimming to the touch without lifting your head or taking an unnecessary long glide. No extra drill circuit is needed. |

Closed-fist work is a recognised coaching method for developing awareness of forearm contribution. Pairing drills with normal swimming makes the intended skill explicit. This is coaching guidance, not proof of a particular time improvement. [USMS/LaneMate freestyle pull guide](https://lanemate.usms.org/fitness-and-training/guides/freestyle/pull)

A smooth, level breakout that preserves speed is the useful objective. [USMS flip-turn guide](https://www.usms.org/fitness-and-training/guides/turns/flip-turns) GoSwim explicitly teaches a dolphin-to-flutter transition before the first freestyle stroke in one breakout drill, demonstrating why the app's blanket prohibition is too strong. It does not prove that this timing is optimal for every swimmer. [GoSwim breakout instruction](https://blog.goswim.tv/post/freestyle-phelps-like-breakouts)

## 6. Breathing and underwater instructions to change first

The combination of progressively restricted breathing, fixed long underwaters, and a compulsory no-breath first 25 is not appropriate as a generic prescription for an athlete whose tolerance has not been assessed.

Replace Wednesday's 3/5/7-stroke progression with comfortable breathing; practise either side if useful without forcing longer intervals. Replace race-day breath quotas with a familiar, rehearsed pattern that permits adequate air. Never hyperventilate before underwater work or practise prolonged breath-holding alone. Supervision is necessary for underwater/start practice and does not make extended breath-holding safe. The joint Red Cross/USA Swimming/YMCA statement specifically warns about hyperventilation and extended breath-holding. [Joint hypoxic-blackout statement](https://www.redcross.org/content/dam/redcross/training-services/scientific-advisory-council/2022-Hypoxic-Blackout-Joint-Statement-Red-Cross-Y-USA-Swimming-1-10-2022.pdf)

Under current World Aquatics freestyle rules, the head must break the surface at or before 15 m after the start and each turn. Touching the wall at the turn and finish is required. Confirm the meet's applicable rules. This legal limit does not establish your fastest or safest breakout distance. [World Aquatics June 2026 reference card](https://resources.fina.org/fina/document/2026/06/30/b8b17245-fdb2-4461-bd51-d59c7c7fb2c2/Swimming-Reference-Card-25062026.pdf)

## 7. Is 1,000 m enough? Should you add distance?

**For the next 26 days, keep roughly your familiar volume while improving its distribution. Do not add distance merely because 1,000 sounds small.**

A randomised study of 41 elite swimmers found that reducing volume while increasing high-intensity work maintained measured performance over 12 weeks. However, the reduced-volume group still trained around 17 km/week, compared with around 35 km/week, and the measured performance outcomes were 100/200 m. It does not validate 1 km sessions, prove lower volume superior, or promise a 50 m improvement for you. [Kilen et al., 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0095025)

For your situation:

| What happens in practice | Response |
| --- | --- |
| You warm up well, hold good speed, and recover for the next quality day | Keep the approximate distance. |
| You need more easy swimming to feel ready | Add 100–200 m of easy warm-up within your tolerated workload. |
| You finish a 1,000 m session fresh but lack relaxed full-stroke practice | An optional 100–300 m easy addition before taper can be reasonable; assess recovery before repeating. |
| Times worsen across repetitions and technique deteriorates | Reduce fast repetitions or extend rest. |
| You are persistently tired, sore, or slower across sessions | Reduce load; do not force the programme's targets. |
| Your second 25 collapses in a full 50 | Examine turn execution, breathing, pacing, and event-specific endurance before assuming you need kilometres more. |

The optional distances above are practical starting adjustments, not validated thresholds or a universal progression rule. Count extra skill swimming before adding anything. Do not introduce unfamiliar heavy strength training this close to the race.

## 8. A better weekly structure

Assuming you are tolerating your present swimming and have no limiting symptoms, use this structure through late September. If you prefer attending daily, make an additional visit genuinely easy rather than adding another hard day.

| Day | Purpose | Suggested emphasis |
| --- | --- | --- |
| Monday | Quality: speed and turn | Full-rest fast 25s, a few turns, easy swimming |
| Tuesday | Easy technique | Comfortable swimming, one selected drill, no compulsory pace target |
| Wednesday | Rest or easy recovery | Choose from how you feel; normal breathing |
| Thursday | Quality: speed maintenance | A small set of repeatable fast swims with generous recovery |
| Friday | Easy technique | Relaxed full stroke and a few finishes |
| Saturday | Quality: starts and race execution | A few good starts; 1–2 timed 50s if fresh, replacing other hard repetitions |
| Sunday | Rest | Optional short easy loosen-up only if it helps |

Three quality days is my conservative starting recommendation, not a biological rule for every 35-year-old. Short speed efforts need sufficient recovery to stay fast; USMS coaching guidance suggests two to three minutes for its maximal sprint examples. [USMS sprint guidance](https://www.usms.org/fitness-and-training/articles-and-videos/articles/six-reasons-distance-swimmers-should-sprint)

Because Saturday training is currently in a 50 m pool, its straight 50 does not reproduce your competition turn. Keep that access for starts, but place at least one full race-distance rehearsal in a 25 m pool. Substitute it for a quality main set rather than adding a fourth hard day.

For September 17 specifically, do not try to recover the omitted September 15 session. If you feel fresh after today's swim, use a reduced quality session. If tired, swim easily and put the next quality session after recovery.

### Example: a complete 1,000 m speed session in a 25 m pool

This is an illustration for a fresh quality day, not an extra workout:

| Component | Distance | Instructions |
| --- | ---: | --- |
| Warm-up | 300 m | 200 easy + 4 × 25 progressively building, not all-out |
| One technique focus | 100 m | 4 × 25, each partly fist swimming and partly normal freestyle |
| Skill | 100 m | 4 × 25 with a brief familiar breakout focus, then easy to the wall; recover fully |
| Main | 300 m | Up to 6 × (25 fast + 25 easy), allowing about 2–3 minutes between fast starts |
| Relaxed swimming | 100 m | Comfortable breathing and body position |
| Cool-down | 100 m | Easy |
| Total | **1,000 m** | All travel counted |

If you need more warm-up, add it or shorten another component. If speed degrades, stop the fast repetitions and replace the remaining metres with easy swimming or finish early.

For timing feedback, establish several fresh, comparable 25s first. A provisional quality rule is to reassess after two repetitions roughly 3–5% slower than your fresh reference, especially if form deteriorates. For a 16.0 reference that is about 16.5–16.8 seconds. This is a coaching heuristic, not a research-derived cut-off; hand timing makes tiny differences unreliable.

“On 2:00” means start-to-start, while “2:00 rest” means two minutes after finishing. The current plan mixes these conventions. Label them consistently. [USMS workout notation guide](https://www.usms.org/fitness-and-training/articles-and-videos/articles/how-to-write-a-swimming-workout)

## 9. Taper: preserve speed while reducing fatigue

The general taper concept is sound. A meta-analysis of 27 studies found the strongest average results with about two weeks of taper and a 41–60% volume reduction while maintaining intensity and frequency. This was a mixed competitive-athlete evidence base, not a personalised prescription for your already modest volume. Maintaining intensity means retaining some fast swimming, not making every length maximal. [Bosquet et al., 2007](https://pubmed.ncbi.nlm.nih.gov/17762369/)

Your current plan's 3,500 m then 2,200 m may be more reduction than you need, especially after only a short loading period, while its repeated hard days can still leave fatigue. It should be adjusted to your actual recent workload and response.

A provisional approach:

| Period | Suggested approach |
| --- | --- |
| Sep 17–27 | Establish the revised hard/easy pattern and obtain a full 50 m baseline. No volume surge. |
| Sep 28–Oct 4 | Begin trimming demanding repetitions as needed. Keep familiar water contact and adequate warm-up. Do not force all five swim days to be hard. |
| Oct 5–8 | Shorter familiar sessions; a few brief fast efforts with full recovery. Avoid draining repeated all-out 50s. |
| Oct 9–11 | Easy water contact or rest according to your usual response; only brief rehearsed speed/starts if they leave you fresh. |
| Oct 12 | Rehearsed warm-up and race execution. |

For this lower-volume plan, a modest reduction beginning around 7–10 days out, progressing toward roughly 30–50% below a genuinely tolerated recent week, is a possible starting option to discuss with an observing coach. It is an inference, not the exact protocol established by the meta-analysis. If clearly fatigued, ease earlier. If fresh, do not mechanically cut warm-up to hit a percentage.

Replace the statement that feeling flat and heavy proves the taper is working. That feeling is not a diagnostic test of successful tapering. Persistent fatigue deserves a review of training and recovery.

## 10. Race-day warm-up and activation

Keep easy swimming, progressive builds, a few familiar short accelerations/starts when permitted, and staying warm while waiting. Rehearse the sequence before race day and fit it to the actual marshalling schedule.

The medicine-ball recommendation has some relevant evidence: a randomised crossover study in 24 adolescent competitive swimmers found faster 50 m performance after 3 × 5 slams followed by four minutes' recovery. This supports investigating that particular intervention, not prescribing it automatically to a 35-year-old or treating 15 broad jumps as equivalent. [Hill et al., 2024](https://pubmed.ncbi.nlm.nih.gov/38900175/)

Other activation research improved early start segments without improving the full 50 m result, illustrating the trade-off with fatigue. [Cuenca-Fernández et al., 2020](https://pubmed.ncbi.nlm.nih.gov/33105381/)

**Use slams or jumps only if already familiar and previously shown to help you in practice. Otherwise use your normal warm-up.** The app's fixed ten-minute wait and subsequent 4–8-minute timing should not override call-room instructions or your individual response.

## 11. What to measure before October 12

Use a short log instead of relying on completed checkboxes:

| Measure | Frequency | Purpose |
| --- | --- | --- |
| Comparable 25 m times, start type, rest | Quality sessions | See whether speed is repeatable |
| Full 50 m with pool/start recorded | Baseline, then perhaps once about 7–10 days out if recovered | Assess race-distance progress |
| Turn segment, same markers | Selected skill sessions | Determine whether wall execution improves |
| Start-to-15 m time with a normal breakout | Supervised start sessions | Evaluate the whole start rather than underwater distance alone |
| Actual metres and session duration | Every swim | Include skills and returns |
| Effort out of 10 and next-day freshness | Every swim | Adjust workload |
| Brief technique note | Every quality session | Identify one thing to repeat or improve |

Do not add all these as separate test sets. Collect them within the planned work. If you can get one session of in-person coaching or video feedback, use it to inspect the dive, turn, and final 10 m.

## 12. Priority changes to the app's content

1. Replace arbitrary 14.5–15.0 targets with baseline-based targets.
2. Separate quality days with truly easy swimming or rest.
3. Remove compulsory restricted-breathing and fixed underwater-distance instructions.
4. Individualise kick count and breakout timing.
5. Count every set accurately and specify recovery swimming.
6. Keep turn practice specific to the 25 m race pool.
7. Make taper reductions depend on actual load and freshness.
8. Make race-day activation optional and rehearsed.
9. Add skipped-session handling and actual completion dates.
10. Replace the assumed sub-30 splits with measured race information.

**Your next useful step is a well-rested, consistently timed full 50 m, followed by better spacing of quality work. Keep useful drills, reduce unnecessary fatigue, and let measured performance decide whether more distance is warranted.**

---

### Evidence and scope notes

Sources are linked beside the claims they support. Research findings, coaching guidance, file arithmetic, and my practical recommendations are deliberately distinguished. No study reviewed here validates this exact four-week plan or predicts your finishing position.

Current World Aquatics rules were checked using the official June 2026 quick-reference card. The main February 2026 regulation PDF could not be retrieved by the browser tool; the reference card is explicitly a summary, not the complete rules. The meet organiser's regulations remain relevant.

The report incorporates your age, race pool/distance, daily swimming, and clarification of the 16-second push swim. Your current full 50 m best, category, training history before this plan, and timing method remain unknown.

This file is an audit and proposed revision. The training data, application behaviour, and browser progress have not been changed.

