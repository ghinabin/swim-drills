/* ============================ DATA ============================ */
      function b(n, t, d, r, k) {
        return { n: n, t: t, d: d, r: r || "", k: k || "easy" };
      }
      function assign(a, b2) {
        var o = {},
          k;
        for (k in a) {
          if (a.hasOwnProperty(k)) o[k] = a[k];
        }
        for (k in b2) {
          if (b2.hasOwnProperty(k)) o[k] = b2[k];
        }
        return o;
      }
      function findBy(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
          if (fn(arr[i])) return arr[i];
        }
        return null;
      }

      // Weekday deck starts rehearse the full swim; Saturday block starts use Satdobato.
      var RACE_SEQUENCE = "On the start signal: use the prescribed start (normally a permitted deck dive), streamline and dolphin kicks, breakout, first 25 m, your practised turn and wall push, dolphin kicks, breakout, return 25 m, finish touch. Use your reliable side turn until a flip turn is consistently quicker in practice. Choose kick counts that preserve speed; surface by 15 m after each wall and breathe as needed.";
      var TEST_SETUP = "Weekdays: use a permitted deck dive with supervision in the 25 m pool; blocks are available only on Saturdays at Satdobato. If deck diving is not permitted, use a push start. Record deck / push / blocks, pool length, turn type, 50 m time and one technique observation; ask an observer for a 25 m split if possible. Baseline: 34 s from push with a side turn in 25 m. Compare matching starts and turns; a deck dive rehearses the whole swim but not the block launch.";
      var QUALITY = "If two successive efforts slow noticeably or technique breaks down, extend rest; if quality does not return, finish the hard work and swim easy. Distances listed exclude timed skill blocks.";
      var WATER_SKILLS = "Practise dives and underwaters with direct supervision and only where permitted. Never hyperventilate or force breath holds. Surface sooner when needed; 15 m is a limit, not a target.";

      var BASE = [
        {
          dow: "Mon",
          title: "Maximum speed and turns",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(
              10,
              "Warm-up",
              "4 easy free, 2 free with a short comfortable dolphin-kick breakout off each wall, 2 board kick easy, 2 build to 80%",
              "Continuous",
              "easy",
            ),
            b(
              6,
              "Kick on board",
              "6 × 25 flutter kick, controlled; save maximum effort for the swim set",
              "30 s rest. Keep ankles relaxed",
              "tech",
            ),
            b(
              4,
              "Fist swimming",
              "4 × 25, feel the pressure on your forearm",
              "20 s rest",
              "tech",
            ),
            b(
              "8 min",
              "Turn block",
              "6 to 8 reps. Swim in from 10 m, flip, dolphin kicks, breakout, 5 strokes. Use your quickest comfortable kick count, not a fixed five. Learn flips here; use the reliable side turn for timed 50s until flips are consistent.",
              "Full rest. Quality only",
              "skill",
            ),
            b(
              14,
              "Main set",
              "7 × (25 maximum from push + 25 easy back)",
              "2–3 min recovery after each fast 25, including the easy return. Use current repeatable speed",
              "max",
            ),
            b(6, "Cool-down", "6 easy, long relaxed strokes", "", "easy"),
          ],
        },

        {
          dow: "Tue",
          title: "Controlled endurance and dolphin kick",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(10, "Warm-up", "4 easy, 4 build, 2 kick", "Continuous", "easy"),
            b(
              6,
              "Pull buoy",
              "6 × 25 with buoy, smooth catch at controlled tempo",
              "30 s rest",
              "tech",
            ),
            b(
              4,
              "Fist swimming",
              "2 fist, 2 open hand. Feel the difference in grip",
              "20 s rest",
              "tech",
            ),
            b(
              "8 min",
              "Vertical dolphin kick",
              "Deep corner with supervision, head above water. 6 × 10 s controlled dolphin kick, 30 s easy recovery. Repeat in both weeks; progress only when fresh.",
              "Hands by your sides; stop if you cannot keep your airway clear",
              "skill",
            ),
            b(
              14,
              "Main set",
              "6 × 50 smooth freestyle at moderate effort (5–6/10), then 2 × 25 easy. Hold stroke length and a consistent second length",
              "20–30 s rest after each 50; breathe normally",
              "endurance",
            ),
            b(6, "Cool-down", "6 easy", "", "easy"),
          ],
        },

        {
          dow: "Wed",
          title: "Recovery and breakouts",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(
              10,
              "Warm-up",
              "Easy freestyle and backstroke mixed",
              "Continuous",
              "easy",
            ),
            b(
              6,
              "Board kick",
              "2 × 25 easy board kick, then 4 × 25 easy surface dolphin kick alternating back and front; breathe freely",
              "20 s rest",
              "tech",
            ),
            b(
              6,
              "Pull buoy",
              "6 × 25 easy with buoy, comfortable breathing; no breath restriction",
              "20 s rest",
              "tech",
            ),
            b(6, "Fist and catch", "3 fist, 3 open hand", "20 s rest", "tech"),
            b(
              "10 min",
              "Breakout block",
              "4 to 6 relaxed 25s, fins optional. Start with a short comfortable dolphin-kick breakout, link the last kick to the first pull, then easy freestyle with normal breathing. Rest fully; no prolonged underwater swimming.",
              "Stop after 10 min or sooner if tired",
              "skill",
            ),
            b(
              6,
              "Main set",
              "3 × 50 easy freestyle, relaxed turns and normal breathing",
              "20 s rest. Easy means 2–3/10 effort",
              "easy",
            ),
            b(6, "Cool-down", "6 easy", "", "easy"),
          ],
        },

        {
          dow: "Thu",
          title: "Race preparation, light",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(10, "Warm-up", "4 easy, 4 build, 2 kick", "Continuous", "easy"),
            b(
              6,
              "Pull buoy",
              "6 × 25 pull buoy, easy catch practice",
              "40 s rest",
              "tech",
            ),
            b(
              4,
              "Board kick",
              "4 × 25 board kick easy, loose ankles",
              "30 s rest",
              "tech",
            ),
            b(
              "6 min",
              "Breakout check to 15 m",
              "4 push starts: short dolphin kicks, breakout, then swim to 15 m. Compare comfortable kick counts using time to 15 m, including surface swimming. No full-distance underwater target.",
              "1:30 rest",
              "skill",
            ),
            b(
              14,
              "Main set",
              "3 × (25 smooth build to 80% + 25 easy), then 8 × 25 easy",
              "1:30 per pair; 15–20 s between easy lengths. Save race effort for Friday",
              "easy",
            ),
            b(6, "Cool-down", "6 easy", "", "easy"),
          ],
        },

        {
          dow: "Fri",
          title: "Race simulation",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(10, "Warm-up", "4 easy, 4 build, 2 kick", "Continuous", "easy"),
            b(
              8,
              "Buoy and fist",
              "4 with pull buoy at tempo, 4 fist",
              "25 s rest",
              "tech",
            ),
            b(
              "6 min",
              "Start block",
              "3 to 4 controlled start rehearsals to 15 m including the breakout and surface swimming. Dive only where permitted; otherwise push. Save your best effort for the full 50s.",
              "Full rest between reps",
              "skill",
            ),
            b(
              16,
              "Full 50 m race simulation",
              "2 × 50 timed deck-dive race rehearsals, with 12 × 25 easy spread before, between and after. Keep each attempt continuous through the turn. " + RACE_SEQUENCE + " " + TEST_SETUP,
              "At least 5 min recovery after each timed 50, including easy swimming; extend until ready",
              "max",
            ),
            b(6, "Cool-down", "6 easy", "", "easy"),
          ],
        },

        {
          dow: "Sat",
          title: "Starts and underwaters",
          pool: "50 m",
          laps: 20,
          dist: "1,000 m",
          blocks: [
            b(4, "Warm-up", "2 easy, 2 build", "Continuous", "easy"),
            b(
              4,
              "Kick and pull",
              "2 × 50 board kick easy, 2 × 50 pull buoy smooth",
              "40 s rest",
              "tech",
            ),
            b(
              "15 min",
              "Dive block",
              "4 to 6 quality dives. Entry, a comfortable fast dolphin-kick sequence, breakout, then swim to 15 m. Keep the rest of the session easy; stop dives if Friday fatigue affects entry or breakout.",
              "Full rest between every dive",
              "skill",
            ),
            b(
              8,
              "Main set",
              "2 × (50 smooth build to 80% + 50 easy), then 4 × 50 easy. No extra all-out 50s after Friday",
              "1 min after builds; 20–30 s after easy lengths",
              "easy",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
          note: "Saturday at Satdobato: practise the block launch while fresh. A 50 m length in this scheduled 50 m pool has no turn; Friday in 25 m rehearses the turn and return from a deck dive. Confirm the actual competition course before comparing times. " + WATER_SKILLS,
        },

        REST_DAY("Sun", "Full rest from pool and hard gym work. Easy walking or mobility is optional. Recover for Monday; do not make up missed sprints."),
      ];

      function REST_DAY(dow, msg) {
        return {
          dow: dow,
          title: "Rest day",
          pool: "—",
          laps: 0,
          dist: "—",
          rest: 1,
          note: msg,
          blocks: [
            b(
              0,
              "Stay out of the water",
              "Easy mobility if you feel stiff — ankles, lats, hips. Sleep is the session today.",
              "",
              "easy",
            ),
          ],
        };
      }

      var W3 = [
        {
          dow: "Mon",
          title: "Maximum speed and turns",
          pool: "25 m",
          laps: 28,
          dist: "700 m",
          blocks: [
            b(
              8,
              "Warm-up",
              "4 easy, 2 with dolphin kicks off the wall, 2 build",
              "Continuous",
              "easy",
            ),
            b(
              4,
              "Kick on board",
              "4 × 25 flutter kick, fast",
              "30 s rest",
              "tech",
            ),
            b(2, "Fist swimming", "2 × 25", "20 s rest", "tech"),
            b(
              "6 min",
              "Turn block",
              "4 to 6 reps. In from 10 m, flip, dolphin kicks, breakout, 5 strokes. Use your tested comfortable kick count. Keep the reliable side turn in timed swims until flips are consistent.",
              "Full rest",
              "skill",
            ),
            b(
              10,
              "Main set",
              "5 × (25 maximum from push + 25 easy back)",
              "2–3 min recovery after each fast 25, including the easy return. Use current repeatable speed",
              "max",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
        },
        {
          dow: "Tue",
          title: "Controlled endurance, trimmed",
          pool: "25 m",
          laps: 28,
          dist: "700 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(4, "Pull buoy", "4 × 25 smooth catch at controlled tempo", "30 s rest", "tech"),
            b(2, "Fist swimming", "1 fist, 1 open hand", "20 s rest", "tech"),
            b(
              "6 min",
              "Vertical dolphin kick",
              "4 × 10 s controlled, head above water, 30 s easy recovery.",
              "Supervised deep corner; hands by your sides",
              "skill",
            ),
            b(
              10,
              "Main set",
              "4 × 50 moderate freestyle (5/10 effort), then 2 × 25 easy",
              "20–30 s rest after each 50; normal breathing",
              "endurance",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
        },
        REST_DAY(
          "Wed",
          "Taper week. Rest today. Feeling flat is possible, but persistent fatigue is a reason to reduce load, not proof the taper is working. Do not add missed volume back.",
        ),
        {
          dow: "Thu",
          title: "Race preparation, trimmed",
          pool: "25 m",
          laps: 28,
          dist: "700 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(4, "Pull buoy", "4 × 25 pull buoy, easy catch practice", "40 s rest", "tech"),
            b(2, "Board kick", "2 × 25 easy", "30 s rest", "tech"),
            b(
              "4 min",
              "Breakout check to 15 m",
              "3 push starts with a short dolphin-kick breakout, then surface swimming to 15 m; use your comfortable kick count",
              "1:30 rest",
              "skill",
            ),
            b(
              10,
              "Main set",
              "2 × (25 build to 80% + 25 easy), then 6 × 25 easy",
              "1:30 per pair; 20 s between easy lengths",
              "easy",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
        },
        {
          dow: "Fri",
          title: "Race simulation",
          pool: "25 m",
          laps: 28,
          dist: "700 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(
              4,
              "Buoy and fist",
              "2 buoy at tempo, 2 fist",
              "25 s rest",
              "tech",
            ),
            b(
              "5 min",
              "Start block",
              "2 to 3 controlled starts to 15 m including breakout and surface swimming; dive only where permitted, otherwise push",
              "Full rest",
              "skill",
            ),
            b(
              12,
              "Full 50 m race simulation",
              "1 × 50 timed race rehearsal, with 10 × 25 easy before and after. " + RACE_SEQUENCE + " " + TEST_SETUP,
              "Full recovery before the timed 50; no extra test if fatigued",
              "max",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
        },
        {
          dow: "Sat",
          title: "Starts and underwaters",
          pool: "50 m",
          laps: 14,
          dist: "700 m",
          blocks: [
            b(4, "Warm-up", "2 easy, 2 build", "Continuous", "easy"),
            b(
              2,
              "Kick and pull",
              "1 × 50 easy kick, 1 × 50 smooth pull",
              "40 s rest",
              "tech",
            ),
            b(
              "12 min",
              "Dive block",
              "3 to 4 quality dives. Entry, comfortable dolphin kicks, breakout, then swim to 15 m. Full recovery; skip dives if Friday fatigue affects technique.",
              "Full rest",
              "skill",
            ),
            b(6, "Main set", "2 × (50 build to 80% + 50 easy), then 2 × 50 easy", "1 min after builds; 20–30 s after easy lengths", "easy"),
            b(2, "Cool-down", "2 easy", "", "easy"),
          ],
        },
        REST_DAY("Sun", "Full rest. Nothing in the pool, nothing in the gym."),
      ];

      var W4 = [
        {
          dow: "Mon",
          title: "Short and sharp",
          pool: "25 m",
          laps: 20,
          dist: "500 m",
          blocks: [
            b(6, "Warm-up", "4 easy, 2 build", "Continuous", "easy"),
            b(
              12,
              "Main set",
              "6 × (25 maximum + 25 easy back)",
              "2:30 rest. Every one has to be fast",
              "max",
            ),
            b(2, "Cool-down", "2 easy", "", "easy"),
          ],
        },
        {
          dow: "Tue",
          title: "Race pace and dives",
          pool: "25 m",
          laps: 20,
          dist: "500 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(
              8,
              "Main set",
              "4 × 25 at race pace, 4 easy between",
              "1:30 rest",
              "pace",
            ),
            b(
              4,
              "Dives",
              "2 × 25 start practice: dive if permitted, breakout and swim easy to the wall. Then 2 × 25 easy cool-down. No breath holding or extra starts.",
              "Full rest",
              "skill",
            ),
          ],
        },
        REST_DAY("Wed", "Rest. Sleep is the session today."),
        {
          dow: "Thu",
          title: "Race rehearsal, controlled",
          pool: "25 m",
          laps: 20,
          dist: "500 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(
              "8 min",
              "Turn approach and finish",
              "Rehearse your reliable turn from both ends and a firm finish touch. Use the wall markings to judge distance. Keep efforts controlled and breathe normally.",
              "Full rest",
              "skill",
            ),
            b(
              4,
              "Full 50 m race simulation",
              "2 × 50 complete race rehearsals at controlled 90–95% effort. " + RACE_SEQUENCE + " " + TEST_SETUP,
              "At least 5 min recovery; no personal-best chasing",
              "pace",
            ),
            b(8, "Cool-down", "8 easy", "", "easy"),
          ],
          note: "Controlled rehearsal in your weekday 25 m pool. Use the permitted deck start you practised; no block access today. Leave fresh for the October 12–13 meet.",
        },
        {
          dow: "Fri",
          title: "Touch the speed",
          pool: "25 m",
          laps: 16,
          dist: "400 m",
          blocks: [
            b(6, "Warm-up", "4 easy, 2 build", "Continuous", "easy"),
            b(
              8,
              "Main set",
              "4 × 25 maximum, 4 easy between",
              "Long rest, 2:30",
              "max",
            ),
            b(2, "Cool-down", "2 easy", "", "easy"),
          ],
          note: "Nothing else. Get out while you still want more.",
        },
        REST_DAY(
          "Sat",
          "Rest, or 12 laps easy to loosen off if you feel stiff. Nothing harder.",
        ),
        {
          dow: "Sun",
          title: "Pre-meet shakeout",
          pool: "25 m",
          laps: 12,
          dist: "300 m",
          blocks: [
            b(6, "Warm-up", "4 easy, 2 build", "Continuous", "easy"),
            b(
              4,
              "Main set",
              "2 × (25 fast and relaxed from a permitted deck dive or push + 25 easy). No extra repeats",
              "Full rest",
              "max",
            ),
            b(2, "Cool-down", "2 easy", "", "easy"),
          ],
          note: "Short shakeout in your available pool, no more than 30 minutes. Deck dive only if permitted; otherwise push. Leave fresh.",
        },
      ];

      var RACE = {
        dow: "Mon",
        title: "Race day",
        pool: "Satdobato",
        laps: 0,
        dist: "50 m freestyle",
        race: 1,
        blocks: [
          b(
            "1",
            "Pool warm-up",
            "Easy swimming, a few builds, and 2 or 3 starts if the warm-up pool allows it.",
            "Raise your body temperature",
            "easy",
          ),
          b(
            "2",
            "Get out and wait",
            "Stay warm in your tracksuit. Time your wait and familiar activation around the call-room schedule and the warm-up timing that worked in rehearsal; do not force a fixed ten-minute wait.",
            "Let the fatigue clear",
            "easy",
          ),
          b(
            "3",
            "Poolside activation",
            "Use only your familiar, rehearsed activation routine. Keep it brief and stop while fresh; do not introduce new jumps or strength work on race day.",
            "Match the routine that worked in your rehearsal",
            "skill",
          ),
          b(
            "4",
            "Race",
            "Use your rehearsed start, breakout, turn and finish. Breathe as needed using the pattern practised in training; never force a zero-breath length. In a 50 m competition pool, swim straight through with no turn.",
            "Follow the call-room schedule and your rehearsed warm-up timing",
            "max",
          ),
        ],
        note: "Nationals: October 12–13. Goal: 28 seconds or below; current baseline is 34 s from push with a side turn in a 25 m pool. Use rehearsed execution, not a forced target split. Confirm the competition course and your event schedule. Between meet days, recover and use only familiar easy loosening; no extra time trials. Repeat the race-day routine for your October 13 events if scheduled.",
      };

      [BASE, W3].forEach(function (week) {
        week.forEach(function (day) {
          if (day.rest) return;
          day.note = (day.note ? day.note + " " : "") + QUALITY;
          if (day.dow === "Mon" || day.dow === "Wed" || day.dow === "Thu") {
            day.note += " " + WATER_SKILLS;
          }
          if (day.dow === "Fri") {
            day.note += " Friday tests replace the former extra sprint set; do not add more hard efforts. " + WATER_SKILLS;
          }
        });
      });
      W3[5].note += " Saturday at Satdobato: block-start skill only, with easy swimming afterwards. The scheduled 50 m pool has no turn within a 50. " + WATER_SKILLS;
      W4[1].note = WATER_SKILLS;
      W4[3].note += " " + WATER_SKILLS;
      W4[6].note += " " + WATER_SKILLS;

      // Stable progress keys keep existing checks attached to their sets when reordered.
      function reorderBlocks(day, order) {
        var original = day.blocks;
        original.forEach(function (block, i) { block.progressKey = "b" + i; });
        day.blocks = order.map(function (i) { return original[i]; });
      }
      BASE[4].blocks[1].t = "Catch to freestyle";
      BASE[4].blocks[1].d = "2 × 25 smooth buoy, then 2 × (25 fist + 25 normal freestyle), then 2 × 25 progressive freestyle. Carry the catch feeling into your normal stroke; build smoothly, not all-out. Total 200 m.";
      W3[4].blocks[1].t = "Catch to freestyle";
      W3[4].blocks[1].d = "25 smooth buoy + 25 fist + 25 normal freestyle + 25 progressive freestyle. Carry the catch into your normal stroke; finish with a smooth build, not a sprint. Total 100 m.";
      [BASE[4], W3[4]].forEach(function (day) {
        day.blocks[2].t = "Controlled start practice";
        day.note += " Catch drills lead into normal freestyle before starts. Recover fully before the first timed 50. Time limits are caps: do fewer starts rather than shorten recovery.";
      });

      BASE[0].blocks[2].d = "2 × (25 fist + 25 normal freestyle). Transfer the catch feeling into your usual stroke before turns and speed.";
      W3[0].blocks[2].d = "25 fist + 25 normal freestyle. Transfer the catch feeling into your usual stroke.";
      W3[0].blocks[1].d = "4 × 25 flutter kick, easy to controlled. Keep this supplementary work relaxed after the speed set.";
      [BASE[0], W3[0]].forEach(function (day) {
        reorderBlocks(day, [0, 2, 3, 4, 1, 5]);
        day.note += " Practise turns with full recovery, then prioritise maximum swimming before supplementary kicking. Stop the hard work when quality fades; do not chase the repetition count.";
      });
      reorderBlocks(BASE[2], [0, 4, 1, 2, 3, 5, 6]);
      BASE[2].note += " Practise relaxed breakouts early while attentive, then keep every remaining drill and length easy.";

      var racePaceDay = W4[1];
      var originalPaceBlocks = racePaceDay.blocks;
      originalPaceBlocks.forEach(function (block, i) { block.progressKey = "b" + i; });
      var startPractice = assign(originalPaceBlocks[2], {
        n: 2, t: "Start practice",
        d: "2 × 25: permitted deck dive or push, breakout, then easy freestyle to the wall. Practise while fresh; recover fully before the race-pace set. No extra starts or breath holding."
      });
      var paceCoolDown = b(2, "Cool-down", "2 × 25 easy freestyle", "", "easy");
      paceCoolDown.progressKey = "b2-cooldown";
      paceCoolDown.legacyProgressKey = "b2";
      racePaceDay.blocks = [originalPaceBlocks[0], startPractice, originalPaceBlocks[1], paceCoolDown];
      racePaceDay.note += " Starts come before race-pace swimming so you can rehearse entry and breakout while fresh. Keep the easy cool-down last.";

      // Preserve September 14–17 exactly as trained, including block order for saved checks.
      // Revised BASE applies to September 21 onward; Week 1 changes only from September 18.
      var COMPLETED_WEEK1_DAYS = [
        {
          "dow": "Mon",
          "title": "Maximum speed and turns",
          "pool": "25 m",
          "laps": 40,
          "dist": "1,000 m",
          "blocks": [
            {
              "n": 10,
              "t": "Warm-up",
              "d": "4 easy free, 2 free with 5 dolphin kicks off each wall, 2 board kick easy, 2 build to 80%",
              "r": "Continuous",
              "k": "easy"
            },
            {
              "n": 6,
              "t": "Kick on board",
              "d": "6 × 25 flutter kick, fast",
              "r": "30 s rest. Hold 22–25 s",
              "k": "tech"
            },
            {
              "n": 4,
              "t": "Fist swimming",
              "d": "4 × 25, feel the pressure on your forearm",
              "r": "20 s rest",
              "k": "tech"
            },
            {
              "n": "8 min",
              "t": "Turn block",
              "d": "8 to 10 reps. Swim in from 10 m, flip, 5 dolphin kicks, breakout, 5 strokes.",
              "r": "Full rest. Quality only",
              "k": "skill"
            },
            {
              "n": 14,
              "t": "Main set",
              "d": "7 × (25 maximum from push + 25 easy back)",
              "r": "2:00 cycle. Target 14.5",
              "k": "max"
            },
            {
              "n": 6,
              "t": "Cool-down",
              "d": "6 easy, long relaxed strokes",
              "r": "",
              "k": "easy"
            }
          ]
        },
        {
          "dow": "Tue",
          "title": "Race pace and dolphin kick",
          "pool": "25 m",
          "laps": 40,
          "dist": "1,000 m",
          "blocks": [
            {
              "n": 10,
              "t": "Warm-up",
              "d": "4 easy, 4 build, 2 kick",
              "r": "Continuous",
              "k": "easy"
            },
            {
              "n": 6,
              "t": "Pull buoy",
              "d": "6 × 25 with buoy, high arm tempo",
              "r": "30 s rest",
              "k": "tech"
            },
            {
              "n": 4,
              "t": "Fist swimming",
              "d": "2 fist, 2 open hand. Feel the difference in grip",
              "r": "20 s rest",
              "k": "tech"
            },
            {
              "n": "8 min",
              "t": "Vertical dolphin kick",
              "d": "Deep corner. 10 s hard, 20 s easy. Week 1: 8 reps. Week 2: 10 reps.",
              "r": "Hands on chest or above head",
              "k": "skill"
            },
            {
              "n": 14,
              "t": "Main set",
              "d": "10 × 25 at race pace on 1:00, then 4 easy",
              "r": "Hold 14.5–15.0 every rep",
              "k": "pace"
            },
            {
              "n": 6,
              "t": "Cool-down",
              "d": "6 easy",
              "r": "",
              "k": "easy"
            }
          ]
        },
        {
          "dow": "Wed",
          "title": "Recovery and breakouts",
          "pool": "25 m",
          "laps": 40,
          "dist": "1,000 m",
          "blocks": [
            {
              "n": 10,
              "t": "Warm-up",
              "d": "Easy freestyle and backstroke mixed",
              "r": "Continuous",
              "k": "easy"
            },
            {
              "n": 6,
              "t": "Board kick",
              "d": "6 × 25 moderate, ankles loose and relaxed",
              "r": "20 s rest",
              "k": "tech"
            },
            {
              "n": 6,
              "t": "Pull buoy",
              "d": "6 × 25 breathing every 3, 5, 7, changing every 2 laps",
              "r": "20 s rest",
              "k": "tech"
            },
            {
              "n": 6,
              "t": "Fist and catch",
              "d": "3 fist, 3 open hand",
              "r": "20 s rest",
              "k": "tech"
            },
            {
              "n": "10 min",
              "t": "Breakout block",
              "d": "25s of freestyle arms with dolphin kick, fins first. The last dolphin kick has to fire into your first arm pull. Never tack a flutter kick onto the end of the underwater.",
              "r": "No clock. Repeat until the timing is automatic",
              "k": "skill"
            },
            {
              "n": 6,
              "t": "Main set",
              "d": "3 × (25 build to fast + 25 easy)",
              "r": "1:30 cycle",
              "k": "pace"
            },
            {
              "n": 6,
              "t": "Cool-down",
              "d": "6 easy",
              "r": "",
              "k": "easy"
            }
          ]
        },
        {
          "dow": "Thu",
          "title": "Speed endurance",
          "pool": "25 m",
          "laps": 40,
          "dist": "1,000 m",
          "blocks": [
            {
              "n": 10,
              "t": "Warm-up",
              "d": "4 easy, 4 build, 2 kick",
              "r": "Continuous",
              "k": "easy"
            },
            {
              "n": 6,
              "t": "Pull buoy",
              "d": "6 × 25 sprint arms only, maximum tempo",
              "r": "40 s rest",
              "k": "tech"
            },
            {
              "n": 4,
              "t": "Board kick",
              "d": "4 × 25 fast, descending 1 to 4",
              "r": "30 s rest",
              "k": "tech"
            },
            {
              "n": "6 min",
              "t": "15 m underwater",
              "d": "4 × 15 m dolphin kick, timed. Write down the time and the kick count.",
              "r": "1:30 rest",
              "k": "skill"
            },
            {
              "n": 14,
              "t": "Main set",
              "d": "4 × 50 all out from push, then 3 × (25 fast + 25 easy)",
              "r": "50s on 3:00, 25s on 2:00. This one hurts",
              "k": "max"
            },
            {
              "n": 6,
              "t": "Cool-down",
              "d": "6 easy",
              "r": "",
              "k": "easy"
            }
          ]
        }
      ];
      var W1 = COMPLETED_WEEK1_DAYS.concat(BASE.slice(4).map(function (day) {
        return assign(day, { blocks: day.blocks.map(function (block) { return assign(block, {}); }) });
      }));
      W1[4].blocks[3].d = "2 × 50 timed race rehearsals: first from push with your current side turn to check the 34 s baseline, then from a permitted deck dive. Include 12 × 25 easy before, between and after. " + RACE_SEQUENCE + " " + TEST_SETUP;
      W1[4].note = "September 18: you completed the original hard September 17 session. Assess recovery during warm-up. If still fatigued or your builds feel unusually slow, replace both timed 50s with easy 50s and keep the rest of today easy. Next planned test: September 25; do not make up missed efforts on Saturday. " + W1[4].note;

      var WEEKS = [
        {
          name: "Load",
          sub: "Build power and skill volume",
          start: "2026-09-14",
          days: W1,
        },
        {
          name: "Peak",
          sub: "Repeat quality; progress only when recovered",
          start: "2026-09-21",
          days: BASE,
        },
        {
          name: "Taper begins",
          sub: "Fewer repetitions, fresh speed and more recovery",
          start: "2026-09-28",
          days: W3,
        },
        {
          name: "Race week",
          sub: "Short quality efforts with generous recovery",
          start: "2026-10-05",
          days: W4,
        },
      ];
      var RACE_DATE = new Date(2026, 9, 12);
      var MON = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      var LAB = {
        easy: "easy",
        tech: "technique",
        skill: "skill",
        pace: "race pace",
        endurance: "controlled endurance",
        max: "maximum",
      };

      var DAYS = [];
      WEEKS.forEach(function (w, wi) {
        var s = new Date(w.start + "T00:00:00");
        w.days.forEach(function (d, di) {
          var dt = new Date(s.getTime());
          dt.setDate(s.getDate() + di);
          DAYS.push(
            assign(d, {
              id: "w" + (wi + 1) + "d" + di,
              wi: wi,
              di: di,
              date: dt,
              weekName: "Week " + (wi + 1) + ", " + w.name,
            }),
          );
        });
      });
      DAYS.push(
        assign(RACE, {
          id: "race",
          wi: 4,
          di: 0,
          date: RACE_DATE,
          weekName: "Race day",
        }),
      );

      function fmt(d) {
        return d.getDate() + " " + MON[d.getMonth()];
      }
      function total(d) {
        return d.blocks.length;
      }
