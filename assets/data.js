/* Pool-only taper plan for the 50 m and 100 m freestyle. */
function b(n, t, d, r, k) {
  return { n: n, t: t, d: d, r: r || "", k: k || "easy" };
}

function restDay(dow) {
  return {
    dow: dow,
    title: "Rest",
    pool: "—",
    laps: 0,
    dist: "—",
    rest: 1,
    blocks: [],
    note: "No pool session today.",
  };
}

var LAST_LOAD = [
  {
    dow: "Wed",
    title: "4 × 50 test #1 (100 speed)",
    pool: "25 m",
    laps: 40,
    dist: "1,000 m",
    blocks: [
      b(10, "Warm-up", "4 easy · 2 with 5 dolphin kicks off each wall · 2 kick · 2 build", "Continuous", "easy"),
      b(4, "Kick", "4 × 25 board, fast", "30 s", "tech"),
      b(4, "Fist / buoy", "2 fist · 2 buoy", "20 s", "tech"),
      b("8 min", "Turns", "8 reps: sprint in from 10 m → flip → 5 kicks → breakout → 5 strokes", "Full rest", "skill"),
      b(16, "Main", "4 × 50 all out from push on 2:00 (8 laps) · 4 easy · 4 × 25 at 100 race pace on :45", "Write down all four 50 times and the average", "max"),
      b(6, "Cool-down", "Easy, long strokes", "", "easy"),
    ],
  },
  {
    dow: "Thu",
    title: "50 speed",
    pool: "25 m",
    laps: 40,
    dist: "1,000 m",
    blocks: [
      b(10, "Warm-up", "4 easy · 4 build · 2 kick", "Continuous", "easy"),
      b(6, "Kick", "6 × 25 board, fast", "30 s", "tech"),
      b(4, "Buoy", "4 × 25 high arm tempo", "30 s", "tech"),
      b("6 min", "15 m underwater", "4 × 15 m dolphin kick, timed. Note kick count", "1:30", "skill"),
      b(14, "Main", "7 × (25 max from push + 25 easy back)", "2:00 cycle · target 14.5", "max"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
  },
  {
    dow: "Fri",
    title: "100 race pace",
    pool: "25 m",
    laps: 40,
    dist: "1,000 m",
    blocks: [
      b(10, "Warm-up", "4 easy · 4 build · 2 kick", "Continuous", "easy"),
      b(4, "Kick", "4 × 25 board, fast", "30 s", "tech"),
      b(4, "Fist / buoy", "2 fist · 2 buoy tempo", "20 s", "tech"),
      b("8 min", "Turns at speed", "8 reps: sprint in from 10 m → flip → 5 kicks → breakout → 5 strokes", "Full rest", "skill"),
      b(16, "Main", "16 × 25 at 100 race pace on :45. Miss once: sit one out. End after the third miss or two misses in a row; swim the rest easy", "Target 16.5–17.5", "pace"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
  },
  restDay("Sat"),
  {
    dow: "Sun",
    title: "Starts and turns",
    pool: "25 m",
    laps: 40,
    dist: "1,000 m",
    blocks: [
      b(10, "Warm-up", "4 easy · 2 with 5 dolphin kicks off each wall · 2 kick · 2 build", "Continuous", "easy"),
      b(4, "Kick", "4 × 25 board, fast", "30 s", "tech"),
      b(4, "Buoy", "4 × 25 high arm tempo", "30 s", "tech"),
      b("10 min", "Starts", "10 starts → 5–6 dolphin kicks → breakout → stop at 15 m", "Full rest", "skill"),
      b(16, "Main", "2 × 50 all out from a start (4 laps) · 1 × 100 at 95% from push (4 laps) · 8 easy spread between", "5:00 between hard swims", "max"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
    note: "Dive from the edge only if diving is allowed and the water is deep enough. Otherwise use a hard push in a tight streamline. Never dive into shallow water.",
  },
];

var TAPER = [
  {
    dow: "Mon",
    title: "50 speed",
    pool: "25 m",
    laps: 30,
    dist: "750 m",
    blocks: [
      b(8, "Warm-up", "4 easy · 2 dolphin off walls · 2 build", "Continuous", "easy"),
      b(4, "Kick", "4 × 25 fast", "30 s", "tech"),
      b("6 min", "Turns", "6 reps: sprint in → flip → kicks → breakout", "Full rest", "skill"),
      b(12, "Main", "6 × (25 max + 25 easy back)", "2:00 · target 14.5", "max"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
  },
  {
    dow: "Tue",
    title: "100 race pace",
    pool: "25 m",
    laps: 30,
    dist: "750 m",
    blocks: [
      b(8, "Warm-up", "4 easy · 4 build", "Continuous", "easy"),
      b(4, "Fist / buoy", "2 fist · 2 buoy", "20 s", "tech"),
      b("6 min", "Vertical kick", "10 s hard / 20 s easy × 8", "Deep corner", "skill"),
      b(12, "Main", "12 × 25 at 100 race pace on :45. Miss once: sit one out. End after the third miss or two misses in a row", "Target 16.5–17.5", "pace"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
  },
  {
    dow: "Wed",
    title: "Recovery and breakouts",
    pool: "25 m",
    laps: 30,
    dist: "750 m",
    blocks: [
      b(10, "Warm-up", "Easy free / back mix", "Continuous", "easy"),
      b(6, "Board", "Moderate, loose ankles", "20 s", "tech"),
      b(6, "Buoy", "Breathing 3 / 5 / 7", "20 s", "tech"),
      b("10 min", "Breakouts", "The last dolphin kick fires into the first arm pull. No flutter kick at the end of the underwater", "No clock", "skill"),
      b(2, "Main", "2 × 25 build to fast", "Easy", "pace"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
  },
  {
    dow: "Thu",
    title: "4 × 50 test #2",
    pool: "25 m",
    laps: 30,
    dist: "750 m",
    blocks: [
      b(10, "Warm-up", "4 easy · 4 build · 2 × 25 fast", "Continuous", "easy"),
      b(8, "Main", "4 × 50 all out from push on 2:00", "Compare the average with 23 Sep", "max"),
      b(6, "Flush", "Very easy", "", "easy"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
    note: "If the average is faster than 23 Sep, the taper is working. If it is slower, keep race week exactly as written and sleep more.",
  },
  {
    dow: "Fri",
    title: "Race rehearsal — both events",
    pool: "25 m",
    laps: 30,
    dist: "750 m",
    blocks: [
      b(10, "Warm-up", "4 easy · 4 build · 2 kick", "Continuous", "easy"),
      b("5 min", "Starts", "5 push starts, perfect breakout, stop at 15 m", "Full rest", "skill"),
      b(12, "Main", "1 × 50 max (2 laps) · 4 easy · broken 100: 4 × 25 at 100 pace with 10 s rest (4 laps) · 2 easy", "Add the four 25s for your broken 100", "max"),
      b(8, "Cool-down", "Easy", "", "easy"),
    ],
  },
  restDay("Sat"),
  {
    dow: "Sun",
    title: "Starts and race pace",
    pool: "25 m",
    laps: 30,
    dist: "750 m",
    blocks: [
      b(8, "Warm-up", "4 easy · 2 dolphin off walls · 2 build", "Continuous", "easy"),
      b(4, "Kick", "4 × 25 fast", "30 s", "tech"),
      b("8 min", "Starts", "8 starts, stop at 15 m. Time the last 3", "Full rest", "skill"),
      b(12, "Main", "2 × 50 max from a start (4 laps) · 4 easy · 4 × 25 at 100 race pace on :45 (4 laps)", "50s on 5:00", "max"),
      b(6, "Cool-down", "Easy", "", "easy"),
    ],
    note: "Dive from the edge only if diving is allowed and the water is deep enough. Otherwise use a hard push in a tight streamline. Never dive into shallow water.",
  },
];

var RACE_WEEK = [
  {
    dow: "Mon",
    title: "Short and sharp",
    pool: "25 m",
    laps: 24,
    dist: "600 m",
    blocks: [
      b(6, "Warm-up", "Easy, finish with builds", "Continuous", "easy"),
      b(10, "50 speed", "5 × (25 max + 25 easy)", "2:30", "max"),
      b(4, "100 pace", "4 × 25 at 100 race pace", ":45", "pace"),
      b(4, "Cool-down", "Easy", "", "easy"),
    ],
  },
  {
    dow: "Tue",
    title: "First-50 pace",
    pool: "25 m",
    laps: 20,
    dist: "500 m",
    blocks: [
      b(8, "Warm-up", "Easy, finish with builds", "Continuous", "easy"),
      b(4, "Main", "2 × 50 at your first-50 split for the 100", "3:00", "pace"),
      b(4, "Easy", "4 easy", "", "easy"),
      b("3 reps", "Push starts", "Hard push in a tight streamline → underwater kicks → breakout → stop at 15 m", "Full rest", "skill"),
      b(4, "Cool-down", "Easy", "", "easy"),
    ],
  },
  {
    dow: "Wed",
    title: "Light speed",
    pool: "25 m",
    laps: 16,
    dist: "400 m",
    blocks: [
      b(8, "Warm-up", "Easy", "Continuous", "easy"),
      b(4, "Main", "4 × 25 fast", "Full rest", "max"),
      b(4, "Cool-down", "Easy", "", "easy"),
    ],
    note: "Keep this light.",
  },
  {
    dow: "Thu",
    title: "Venue session at Satdobato",
    pool: "25 m",
    laps: 20,
    dist: "500 m",
    blocks: [
      b(8, "Warm-up", "Easy, finish with builds", "Continuous", "easy"),
      b("8 min", "Walls and surroundings", "Learn both walls, the flags, lane ropes and light on the water", "Full rest", "skill"),
      b("4–6 reps", "Block starts", "4–6 starts off the blocks, stopping at 15 m. Feel the block, height and entry", "Full rest", "skill"),
      b(4, "50 pace", "2 × 50 from the blocks at 95%", "5:00", "pace"),
      b(4, "Broken 100", "4 × 25 at 100 race pace with 10 s rest", "10 s between 25s", "pace"),
      b(4, "Cool-down", "Easy", "", "easy"),
    ],
    note: "Your only real-block practice before racing. Starts are a timed skill block and do not add laps; total stays at 20.",
  },
  {
    dow: "Fri",
    title: "Touch the speed",
    pool: "25 m",
    laps: 16,
    dist: "400 m",
    blocks: [
      b(6, "Warm-up", "Easy, finish with builds", "Continuous", "easy"),
      b(4, "50 speed", "4 × 25 max", "2:30", "max"),
      b(2, "100 pace", "2 × 25 at 100 race pace", "Full rest", "pace"),
      b(4, "Cool-down", "Easy", "", "easy"),
    ],
  },
  restDay("Sat"),
  {
    dow: "Sun",
    title: "Shakeout",
    pool: "25 m",
    laps: 12,
    dist: "300 m",
    blocks: [
      b(6, "Warm-up", "4 easy · 2 build", "Continuous", "easy"),
      b(4, "Main", "2 × 25 max from a start (2 laps) · 1 × 50 at 100 race pace (2 laps)", "Full rest", "max"),
      b(2, "Cool-down", "Easy", "", "easy"),
    ],
    note: "At Satdobato if you can get in; otherwise use your normal pool. Maximum 30 minutes. Leave wanting more. Dive only where it is allowed and deep enough; otherwise use a push start.",
  },
];

var WEEKS = [
  {
    name: "Last load",
    sub: "Final hard work and the first 4 × 50 test.",
    start: "2026-09-23",
    days: LAST_LOAD,
  },
  {
    name: "Taper",
    sub: "Less volume, the same speed, and the second 4 × 50 test.",
    start: "2026-09-28",
    days: TAPER,
  },
  {
    name: "Race week",
    sub: "Sharp, short and fast. Nothing tiring.",
    start: "2026-10-05",
    days: RACE_WEEK,
  },
];

var RACE_DATE = new Date(2026, 9, 12);
var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var LAB = {
  easy: "easy",
  tech: "technique",
  skill: "skill",
  pace: "race pace",
  max: "maximum",
};

var DAYS = [];
WEEKS.forEach(function (week, wi) {
  var start = new Date(week.start + "T00:00:00");
  week.days.forEach(function (day, di) {
    var date = new Date(start.getTime());
    date.setDate(start.getDate() + di);
    DAYS.push(
      Object.assign({}, day, {
        id: "w" + (wi + 1) + "d" + di,
        wi: wi,
        di: di,
        date: date,
        weekName: week.name,
      }),
    );
  });
});

function fmt(date) {
  return date.getDate() + " " + MON[date.getMonth()];
}

function total(day) {
  return day.blocks.length;
}
