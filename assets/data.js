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
              "4 easy free, 2 free with 5 dolphin kicks off each wall, 2 board kick easy, 2 build to 80%",
              "Continuous",
              "easy",
            ),
            b(
              6,
              "Kick on board",
              "6 × 25 flutter kick, fast",
              "30 s rest. Hold 22–25 s",
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
              "8 to 10 reps. Swim in from 10 m, flip, 5 dolphin kicks, breakout, 5 strokes.",
              "Full rest. Quality only",
              "skill",
            ),
            b(
              14,
              "Main set",
              "7 × (25 maximum from push + 25 easy back)",
              "2:00 cycle. Target 14.5",
              "max",
            ),
            b(6, "Cool-down", "6 easy, long relaxed strokes", "", "easy"),
          ],
        },

        {
          dow: "Tue",
          title: "Race pace and dolphin kick",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(10, "Warm-up", "4 easy, 4 build, 2 kick", "Continuous", "easy"),
            b(
              6,
              "Pull buoy",
              "6 × 25 with buoy, high arm tempo",
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
              "Deep corner. 10 s hard, 20 s easy. Week 1: 8 reps. Week 2: 10 reps.",
              "Hands on chest or above head",
              "skill",
            ),
            b(
              14,
              "Main set",
              "10 × 25 at race pace on 1:00, then 4 easy",
              "Hold 14.5–15.0 every rep",
              "pace",
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
              "6 × 25 moderate, ankles loose and relaxed",
              "20 s rest",
              "tech",
            ),
            b(
              6,
              "Pull buoy",
              "6 × 25 breathing every 3, 5, 7, changing every 2 laps",
              "20 s rest",
              "tech",
            ),
            b(6, "Fist and catch", "3 fist, 3 open hand", "20 s rest", "tech"),
            b(
              "10 min",
              "Breakout block",
              "25s of freestyle arms with dolphin kick, fins first. The last dolphin kick has to fire into your first arm pull. Never tack a flutter kick onto the end of the underwater.",
              "No clock. Repeat until the timing is automatic",
              "skill",
            ),
            b(
              6,
              "Main set",
              "3 × (25 build to fast + 25 easy)",
              "1:30 cycle",
              "pace",
            ),
            b(6, "Cool-down", "6 easy", "", "easy"),
          ],
        },

        {
          dow: "Thu",
          title: "Speed endurance",
          pool: "25 m",
          laps: 40,
          dist: "1,000 m",
          blocks: [
            b(10, "Warm-up", "4 easy, 4 build, 2 kick", "Continuous", "easy"),
            b(
              6,
              "Pull buoy",
              "6 × 25 sprint arms only, maximum tempo",
              "40 s rest",
              "tech",
            ),
            b(
              4,
              "Board kick",
              "4 × 25 fast, descending 1 to 4",
              "30 s rest",
              "tech",
            ),
            b(
              "6 min",
              "15 m underwater",
              "4 × 15 m dolphin kick, timed. Write down the time and the kick count.",
              "1:30 rest",
              "skill",
            ),
            b(
              14,
              "Main set",
              "4 × 50 all out from push, then 3 × (25 fast + 25 easy)",
              "50s on 3:00, 25s on 2:00. This one hurts",
              "max",
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
              "6 push starts with a perfect breakout. Stop at 15 m, do not swim past it.",
              "Full rest between reps",
              "skill",
            ),
            b(
              16,
              "Main set",
              "2 × 50 maximum with full race execution, 4 × 25 maximum, 8 easy spread between them",
              "50s on 5:00, 25s on 2:00. Time every one",
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
              "2 × 50 board kick fast, 2 × 50 pull buoy at tempo",
              "40 s rest",
              "tech",
            ),
            b(
              "15 min",
              "Dive block",
              "10 to 12 dives. Entry, 5 or 6 dolphin kicks, breakout, 6 strokes at maximum. Time to 15 m on the last four.",
              "Full rest between every dive",
              "skill",
            ),
            b(
              8,
              "Main set",
              "4 × 50 from the blocks, all out",
              "5:00. Treat each one as an actual race",
              "max",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
          note: "Your only session all week on the blocks. Protect the dive block and do not let fatigue eat into it.",
        },

        {
          dow: "Sun",
          title: "Skill polish, light",
          pool: "50 m",
          laps: 16,
          dist: "800 m",
          blocks: [
            b(4, "Warm-up", "Easy freestyle", "Continuous", "easy"),
            b(
              4,
              "Dolphin kick",
              "200 as 50 on back, 50 on front, alternating",
              "30 s rest",
              "tech",
            ),
            b(
              4,
              "Main set",
              "4 × 50 building to maximum on the last 25",
              "3:00",
              "pace",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
          note: "If you are beaten up, take today off completely. Rest is part of the plan, not a failure of it.",
        },
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
              "6 reps. In from 10 m, flip, 5 dolphin kicks, breakout, 5 strokes.",
              "Full rest",
              "skill",
            ),
            b(
              10,
              "Main set",
              "5 × (25 maximum from push + 25 easy back)",
              "2:00 cycle. Target 14.5",
              "max",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
        },
        {
          dow: "Tue",
          title: "Race pace",
          pool: "25 m",
          laps: 28,
          dist: "700 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(4, "Pull buoy", "4 × 25 high arm tempo", "30 s rest", "tech"),
            b(2, "Fist swimming", "1 fist, 1 open hand", "20 s rest", "tech"),
            b(
              "6 min",
              "Vertical dolphin kick",
              "10 s hard, 20 s easy. 8 reps.",
              "Deep corner",
              "skill",
            ),
            b(
              10,
              "Main set",
              "7 × 25 at race pace on 1:00, then 3 easy",
              "Hold 14.5–15.0",
              "pace",
            ),
            b(4, "Cool-down", "4 easy", "", "easy"),
          ],
        },
        REST_DAY(
          "Wed",
          "Taper week. You will feel flat and heavy in the water — that is the taper working. Do not add volume back.",
        ),
        {
          dow: "Thu",
          title: "Speed endurance, trimmed",
          pool: "25 m",
          laps: 28,
          dist: "700 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(4, "Pull buoy", "4 × 25 sprint arms only", "40 s rest", "tech"),
            b(2, "Board kick", "2 × 25 fast", "30 s rest", "tech"),
            b(
              "4 min",
              "15 m underwater",
              "3 × 15 m dolphin kick, timed",
              "1:30 rest",
              "skill",
            ),
            b(
              10,
              "Main set",
              "3 × 50 all out from push, then 2 × (25 fast + 25 easy)",
              "50s on 3:00",
              "max",
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
              "5 push starts with a perfect breakout, stop at 15 m",
              "Full rest",
              "skill",
            ),
            b(
              12,
              "Main set",
              "2 × 50 maximum, 2 × 25 maximum, 6 easy between",
              "50s on 5:00, 25s on 2:00",
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
              "1 × 50 kick fast, 1 × 50 pull at tempo",
              "40 s rest",
              "tech",
            ),
            b(
              "12 min",
              "Dive block",
              "8 dives. Entry, 5 or 6 dolphin kicks, breakout, 6 strokes. Time to 15 m on the last three.",
              "Full rest",
              "skill",
            ),
            b(6, "Main set", "3 × 50 from the blocks, all out", "5:00", "max"),
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
              "4 starts with a perfect breakout. Stop at 15 m.",
              "Full rest",
              "skill",
            ),
          ],
        },
        REST_DAY("Wed", "Rest. Sleep is the session today."),
        {
          dow: "Thu",
          title: "Venue session at Satdobato",
          pool: "25 m",
          laps: 20,
          dist: "500 m",
          blocks: [
            b(8, "Warm-up", "4 easy, 4 build", "Continuous", "easy"),
            b(
              "8 min",
              "Walls and light",
              "Swim the turn from both ends. Look at the backstroke flags, the lane ropes, the light on the water. Find your breathing spots.",
              "Full rest",
              "skill",
            ),
            b(
              4,
              "Main set",
              "2 × 50 from the blocks at 95 percent",
              "5:00",
              "pace",
            ),
            b(8, "Cool-down", "8 easy", "", "easy"),
          ],
          note: "Today is about familiarity, not fitness. Race the clock on Monday, not on Thursday.",
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
          title: "Venue shakeout",
          pool: "25 m",
          laps: 12,
          dist: "300 m",
          blocks: [
            b(6, "Warm-up", "4 easy, 2 build", "Continuous", "easy"),
            b(
              4,
              "Main set",
              "2 × 25 maximum off the blocks",
              "Full rest",
              "max",
            ),
            b(2, "Cool-down", "2 easy", "", "easy"),
          ],
          note: "Thirty minutes at the venue, no more. Leave the pool wanting more.",
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
            "Stay warm in your tracksuit. Relax for 10 minutes.",
            "Let the fatigue clear",
            "easy",
          ),
          b(
            "3",
            "Poolside activation",
            "3 × 5 medicine ball slams, or 3 × 5 hard broad jumps if there is no ball.",
            "Wakes up the nervous system",
            "skill",
          ),
          b(
            "4",
            "Race",
            "Zero breaths on the first 25. No breath into or out of the turn. One or two on the way home.",
            "Start 4 to 8 min after the slams",
            "max",
          ),
        ],
        note: "Splits for 29.9: out in 14.2, home in 15.8. Do not chase the split — chase the wall.",
      };

      var WEEKS = [
        {
          name: "Load",
          sub: "Build power and skill volume",
          start: "2026-09-14",
          days: BASE,
        },
        {
          name: "Peak",
          sub: "The hardest race-pace week",
          start: "2026-09-21",
          days: BASE,
        },
        {
          name: "Taper begins",
          sub: "Cut reps 30 percent, hold every speed",
          start: "2026-09-28",
          days: W3,
        },
        {
          name: "Race week",
          sub: "Everything at maximum speed",
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
