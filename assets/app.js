/* Shared rendering and persistent training progress. */
"use strict";
const page = document.body.dataset.page;
const main = document.getElementById("main");
const KEY = "swim:nsa2026:v2";
let state = { done: {}, sequenceVersion: 1 };
let persistent = true;
const progressKey = (d, i) => d.blocks[i].progressKey || "b" + i;
function normalize(saved) {
  const done = {};
  DAYS.forEach((d) => {
    const checks = saved && saved.done && saved.done[d.id];
    if (checks && typeof checks === "object") {
      done[d.id] = {};
      d.blocks.forEach((block, i) => {
        const key = progressKey(d, i);
        // The old October 6 Dives check included both starts and cool-down.
        const legacy = !saved.sequenceVersion && block.legacyProgressKey;
        if (checks[key] || (legacy && checks[legacy])) done[d.id][key] = 1;
      });
    }
  });
  return { done, sequenceVersion: 1 };
}
try {
  state = normalize(JSON.parse(localStorage.getItem(KEY) || "null"));
} catch (_) {
  persistent = false;
}
const icons = {
  overview:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  plan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
  drills:
    '<path d="M3 5c4-2 6-2 9 0 3-2 5-2 9 0v15c-4-2-6-2-9 0-3-2-5-2-9 0zM12 5v15"/>',
  progress: '<path d="M4 20V10m8 10V4m8 16v-7M2 21h20"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
};
const icon = (name) =>
  '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + "</svg>";
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const dateKey = (d) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");
const todayKey = dateKey(new Date());
const checked = (d, i) => !!(state.done[d.id] && state.done[d.id][progressKey(d, i)]);
const finished = (d) => d.blocks.filter((_, i) => checked(d, i)).length;
const completed = (d) => d.blocks.length > 0 && finished(d) === d.blocks.length;
const training = DAYS.filter((d) => !d.rest && !d.race);
// Week access is derived from saved checks, never from the calendar date.
const weekDays = (wi) => DAYS.filter((d) => !d.race && d.wi === wi);
const weekComplete = (wi) => weekDays(wi).every(completed);
const weekUnlocked = (wi) =>
  WEEKS.slice(0, wi).every((_, previous) => weekComplete(previous));
const sessionUnlocked = (d) => !!d.race || weekUnlocked(d.wi);
function requiredWeek(wi) {
  return WEEKS.findIndex(
    (_, previous) => previous < wi && !weekComplete(previous),
  );
}
function unlockRequirement(wi) {
  const first = requiredWeek(wi) + 1;
  return (
    "Finish Week " +
    first +
    (first < wi ? " through Week " + wi : "") +
    " to unlock tracking."
  );
}
function suggestedDay() {
  if (sessionUnlocked(currentDay) && !completed(currentDay)) return currentDay;
  return DAYS.find((d) => sessionUnlocked(d) && !completed(d)) || currentDay;
}
function weekStatus(wi) {
  if (!weekUnlocked(wi)) return "Locked - preview";
  return weekComplete(wi) ? "Complete" : "Unlocked";
}
function completionMessage(d, previouslyComplete) {
  if (
    !d.race &&
    !previouslyComplete &&
    weekComplete(d.wi) &&
    d.wi < WEEKS.length - 1
  ) {
    return (
      "Week " + (d.wi + 1) + " complete. Week " + (d.wi + 2) + " unlocked."
    );
  }
  return "Session complete. Progress saved.";
}

const currentDay =
  DAYS.find((d) => dateKey(d.date) === todayKey) ||
  DAYS.find((d) => dateKey(d.date) > todayKey) ||
  DAYS[DAYS.length - 1];
const href = (d) => SwimNavigation.sessionURL(d.id);
let toastTimeout;
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove("show"), 3200);
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    persistent = true;
    return true;
  } catch (_) {
    persistent = false;
    toast("Storage unavailable. Progress lasts only on this page.");
    return false;
  }
}
function vibrate() {
  try {
    if (navigator.vibrate) navigator.vibrate(12);
  } catch (_) {}
}
const links = [
  ["overview", "index.html", "Overview"],
  ["plan", "plan.html", "Training plan"],
  ["drills", "drills.html", "Drill library"],
  ["progress", "progress.html", "Progress"],
];
document.getElementById("navigation").innerHTML = links
  .map(
    ([key, url, label]) =>
      '<a class="nav-link ' +
      (page === key || (page === "session" && key === "plan") ? "active" : "") +
      '" href="' +
      url +
      '" ' +
      (page === key
        ? 'aria-current="page"'
        : page === "session" && key === "plan"
          ? 'aria-current="true"'
          : "") +
      ">" +
      icon(key) +
      "<span>" +
      label +
      "</span></a>",
  )
  .join("");
function intro(title, description = "") {
  return `<div class="page-intro"><div><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div></div>`;
}
// Native disclosures stay separate from completion buttons.
function moreDetails(items, id, label) {
  if (!items || !items.length) return "";
  return `<details class="copy-details" id="${id}"><summary><span class="copy-more">More</span><span class="copy-less">Less</span><span class="sr-only">: ${escapeHTML(label)}</span></summary><ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></details>`;
}
function sessionNote(note) {
  if (!note) return "";
  const sentences = note.split(/(?<=\.)\s+/);
  const compact = note.length > 160 && sentences.length > 1;
  return `<aside class="callout session-note" aria-label="Session focus"><strong>Session focus</strong><p>${escapeHTML(compact ? sentences[0] : note)}</p>${compact ? moreDetails(sentences.slice(1), "session-note-details", "session focus") : ""}</aside>`;
}
function card(d) {
  const status = !sessionUnlocked(d)
    ? "Locked - preview"
    : completed(d)
      ? "Complete"
      : finished(d)
        ? `${finished(d)} of ${d.blocks.length} done`
        : "";
  const today = dateKey(d.date) === todayKey;
  return `<a id="day-${d.id}" class="session-card ${today ? "today" : ""}" href="${href(d)}"><span class="date-box"><strong>${d.date.getDate()}</strong><small>${MON[d.date.getMonth()]}</small></span><div class="session-info"><h3>${escapeHTML(d.title)}</h3><p>${d.rest ? "Recovery" : d.race ? "50 m freestyle" : d.pool + " pool &middot; " + d.dist}</p>${today || status ? `<span class="session-state">${[today ? "Today" : "", status].filter(Boolean).join(" &middot; ")}</span>` : ""}</div><span class="status-dot ${completed(d) ? "done" : ""}" aria-hidden="true">${completed(d) ? "&#10003;" : "&rarr;"}</span></a>`;
}
function stats() {
  const done = training.filter(completed).length;
  const meters = training
    .filter(completed)
    .reduce((sum, d) => sum + Number(d.dist.replace(/[^0-9.]/g, "")), 0);
  return `<dl class="stats"><div class="stat"><dt>Sessions complete</dt><dd><strong>${done}<span class="stat-unit"> of ${training.length}</span></strong></dd></div><div class="stat"><dt>Distance completed</dt><dd><strong>${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}<span class="stat-unit"> km</span></strong></dd></div></dl>`;
}
function overview() {
  const now = new Date();
  const remaining = Math.ceil(
    (Date.UTC(2026, 9, 12) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      86400000,
  );
  const selected = suggestedDay();
  const next = DAYS.filter((d) => d.date > selected.date).slice(0, 2);
  const raceLabel =
    remaining > 0
      ? `${remaining} days to race`
      : remaining === 0
        ? "Race day"
        : "Race completed";
  main.innerHTML =
    intro(
      "Training overview",
      `NSA Cup &middot; 12 October &middot; Target 29.9 s`,
    ) +
    `<section class="hero" aria-labelledby="current-session"><div><div class="eyebrow">${dateKey(selected.date) === todayKey ? "Today" : remaining < 0 ? "Race checklist" : "Next session"}</div><h2 id="current-session">${escapeHTML(selected.title)}</h2><p>${selected.dow} ${fmt(selected.date)} &middot; ${selected.rest ? "Recovery" : selected.race ? "50 m freestyle" : selected.pool + " pool &middot; " + selected.dist}</p><a class="button" href="${href(selected)}">${completed(selected) ? "Review session" : "Open session"}${icon("arrow")}</a></div><p class="race-summary">${raceLabel}</p></section>` +
    `<section class="panel race-entry"><div><h2>Race practice</h2><p>Practise starts and save swim times.</p></div><a class="button" href="race.html">Race &rarr;</a></section>` +
    (next.length
      ? `<section class="upcoming"><div class="section-title"><h2>Coming up</h2><a class="text-link" href="plan.html">Full plan &rarr;</a></div>${next.map(card).join("")}</section>`
      : '<a class="button secondary" href="progress.html">View progress</a>');
}
function plan() {
  main.innerHTML =
    intro(
      "Training plan",
      "Complete 7 days to unlock the next week. Preview any week.",
    ) +
    '<nav class="week-jump" aria-label="Jump to week">' +
    WEEKS.map(
      (w, wi) =>
        `<a href="#week-${wi + 1}" data-jump>Week ${wi + 1}<small>${w.name}</small></a>`,
    ).join("") +
    '<a href="#day-race" data-jump>Race<small>12 Oct</small></a></nav>' +
    '<div class="plan-actions"><a class="text-link" data-jump href="#day-' +
    suggestedDay().id +
    '">Find current session</a><button class="text-button" id="expand-weeks">Expand all weeks</button></div>' +
    WEEKS.map((w, wi) => {
      const days = DAYS.filter((d) => d.wi === wi);
      const locked = !weekUnlocked(wi);
      return `<details class="week" id="week-${wi + 1}" ${wi === Math.min(suggestedDay().wi, 3) ? "open" : ""}><summary><span class="week-number">0${wi + 1}</span><span><h2>${w.name}</h2><small>${fmt(days[0].date)} &ndash; ${fmt(days[6].date)}</small><span class="week-access">${weekStatus(wi)}</span></span><span class="week-count">${days.filter(completed).length} / ${days.length} days</span></summary><div class="week-body">${locked ? `<p class="week-requirement">${unlockRequirement(wi)} Preview available.</p>` : ""}<p>${w.sub}</p>${days.map(card).join("")}</div></details>`;
    }).join("") +
    '<section class="race-section" aria-label="Race day">' +
    card(DAYS[DAYS.length - 1]) +
    "</section>";
  const expand = document.getElementById("expand-weeks");
  const sync = () => {
    expand.textContent = Array.from(main.querySelectorAll(".week")).every(
      (el) => el.open,
    )
      ? "Collapse all weeks"
      : "Expand all weeks";
  };
  main
    .querySelectorAll(".week")
    .forEach((el) => el.addEventListener("toggle", sync));
  expand.onclick = () => {
    const open = !Array.from(main.querySelectorAll(".week")).every(
      (el) => el.open,
    );
    main.querySelectorAll(".week").forEach((el) => (el.open = open));
    sync();
  };
}
let activeSession;
function session() {
  const id = new URLSearchParams(location.search).get("id");
  activeSession = id ? DAYS.find((d) => d.id === id) : suggestedDay();
  if (!activeSession) {
    main.innerHTML =
      intro(
        "Session not found",
        "Choose a session from the plan.",
      ) + '<a class="button" href="plan.html">View training plan</a>';
    return;
  }
  const d = activeSession;
  document.title = d.title + " | Lane 50";
  document.querySelector(".site-header").innerHTML =
    `<a class="context-back" aria-label="Back to ${SwimNavigation.returnLabel()}" data-return href="${escapeHTML(SwimNavigation.returnURL())}">${icon("back")}<span>${SwimNavigation.returnLabel()}</span></a><div class="context-title"><strong>${d.dow} ${fmt(d.date)}</strong><small>${d.race ? "Race day" : "Week " + (d.wi + 1)}</small></div>`;
  main.innerHTML =
    intro(
      escapeHTML(d.title),
      `${d.dow} ${fmt(d.date)} &middot; ${d.rest ? "Mobility and sleep" : d.race ? "50 m freestyle &middot; Satdobato" : d.pool + " pool &middot; " + d.dist + " &middot; " + d.blocks.length + " sets"}`,
    ) +
    '<aside id="week-lock" class="week-lock" aria-labelledby="week-lock-title" hidden><strong id="week-lock-title">Locked week preview</strong><p id="week-lock-description"></p></aside>' +
    sessionNote(d.note) +
    `<div class="session-layout"><section class="workout" aria-labelledby="sets-heading"><div class="section-title"><h2 id="sets-heading">${d.rest ? "Recovery checklist" : d.race ? "Race checklist" : "Session sets"}</h2></div><p class="set-hint" id="set-hint">Tap to check or uncheck.</p><div class="set-list">` +
    d.blocks
      .map(
        (b, i) =>
          `<div class="set-item"><button type="button" id="set-${i}" aria-labelledby="set-title-${i} set-amount-${i}" aria-describedby="week-lock-description set-order-${i} set-desc-${i}${b.r ? " set-target-" + i : ""}" class="set-card" data-set="${i}" data-kind="${b.k}" aria-pressed="${checked(d, i)}"><span class="set-number" id="set-amount-${i}">${b.n === 0 ? "&#8226;" : escapeHTML(String(b.n).replace(" min", ""))}<small>${d.race ? "STEP" : typeof b.n === "number" ? (b.n ? "LAPS" : "") : String(b.n).includes("min") ? "MIN" : ""}</small></span><span class="set-content"><span class="set-order" id="set-order-${i}">${i + 1}. ${LAB[b.k]}</span><span class="set-title" id="set-title-${i}">${escapeHTML(b.t)}</span><span class="set-description" id="set-desc-${i}">${escapeHTML(b.d)}</span>${b.r ? `<span class="target" id="set-target-${i}">${escapeHTML(b.r)}</span>` : ""}</span><span class="status-dot" aria-hidden="true">${checked(d, i) ? "&#10003;" : ""}</span></button>${moreDetails(b.details, "set-details-" + i, b.t)}</div>`,
      )
      .join("") +
    `</div><section class="session-finish" id="session-finish" tabindex="-1"><h2 id="finish-heading">Finish this session</h2><div class="actions"><button id="complete-all" class="button secondary" aria-describedby="week-lock-description"></button><a class="button" data-return href="${escapeHTML(SwimNavigation.returnURL())}">Back to ${SwimNavigation.returnLabel().toLowerCase()}</a></div></section></section></div>` +
    `<p id="session-announcement" class="sr-only" role="status" aria-atomic="true"></p><div class="session-dock" role="group" aria-label="Session actions"><div class="session-progress-summary"><span id="dock-count"></span><div class="progress-track" role="progressbar" aria-label="Completed sets" aria-valuemin="0" aria-valuemax="${d.blocks.length}" id="session-progress"><span id="session-bar"></span></div></div>${d.rest ? "" : '<button class="dock-timer" data-open-timer><span>Rest timer</span><strong data-timer-preview>00:30</strong></button>'}</div><dialog class="timer-sheet" id="timer-sheet" aria-labelledby="timer-heading"><div class="sheet-header"><div><h2 id="timer-heading">Rest timer</h2></div><button class="icon-button" data-close-dialog aria-label="Close rest timer">&#10005;</button></div><p>Runs while closed.</p><div class="timer-value" id="timer" role="timer" aria-label="Rest time remaining">00:30</div><div class="timer-presets" role="group" aria-label="Timer duration"><button data-seconds="30" class="active" aria-pressed="true">30 sec</button><button data-seconds="60" aria-pressed="false">1 min</button><button data-seconds="120" aria-pressed="false">2 min</button></div><div class="timer-actions"><button id="timer-toggle" class="button">Start</button><button id="timer-reset" class="button secondary">Reset</button></div><p id="timer-status" role="status">Choose rest time, then start.</p></dialog>`;
  main.querySelectorAll("[data-set]").forEach((button) =>
    button.addEventListener("click", () => {
      if (!sessionUnlocked(d)) return;
      const previouslyComplete = !d.race && weekComplete(d.wi);
      const i = Number(button.dataset.set);
      if (!state.done[d.id]) state.done[d.id] = {};
      if (checked(d, i)) delete state.done[d.id][progressKey(d, i)];
      else state.done[d.id][progressKey(d, i)] = 1;
      const saved = save();
      vibrate();
      updateSession();
      if (saved && completed(d))
        toast(completionMessage(d, previouslyComplete));
    }),
  );
  document.getElementById("complete-all").onclick = () => {
    if (!sessionUnlocked(d)) return;
    const previouslyComplete = !d.race && weekComplete(d.wi);
    const finish = !completed(d);
    state.done[d.id] = {};
    if (finish) d.blocks.forEach((_, i) => (state.done[d.id][progressKey(d, i)] = 1));
    const saved = save();
    updateSession();
    if (saved)
      toast(
        finish
          ? completionMessage(d, previouslyComplete)
          : "Session checks cleared.",
      );
  };
  main
    .querySelectorAll("[data-open-timer]")
    .forEach(
      (button) =>
        (button.onclick = () =>
          SwimNavigation.openDialog(
            document.getElementById("timer-sheet"),
            button,
          )),
    );
  updateSession();
  setupTimer();
}
function updateSession() {
  const d = activeSession,
    n = finished(d);
  const locked = !sessionUnlocked(d);
  const reason = locked ? unlockRequirement(d.wi) : "";
  document.getElementById("week-lock").hidden = !locked;
  document.getElementById("week-lock-description").textContent = reason;
  document.getElementById("set-hint").textContent = locked
    ? "Preview only. Unlock to track sets."
    : "Tap to check or uncheck.";
  main.querySelectorAll("[data-set]").forEach((button) => {
    const done = checked(d, Number(button.dataset.set));
    button.setAttribute("aria-pressed", String(done));
    button.setAttribute("aria-disabled", String(locked));
    button.querySelector(".status-dot").textContent = done ? "\u2713" : "";
  });
  document.getElementById("session-bar").style.width =
    (d.blocks.length ? (n / d.blocks.length) * 100 : 0) + "%";
  document.getElementById("session-progress").setAttribute("aria-valuenow", n);
  document.getElementById("dock-count").textContent = locked
    ? "Locked preview"
    : n +
      " of " +
      d.blocks.length +
      (d.rest ? " checks complete" : " sets complete");
  document.getElementById("finish-heading").textContent = locked
    ? "Preview only"
    : completed(d)
      ? "Session complete"
      : "Finish this session";
  document.getElementById("session-announcement").textContent = locked
    ? "Locked preview. " + reason
    : n + " of " + d.blocks.length + " complete";
  const all = document.getElementById("complete-all");
  all.disabled = locked || !d.blocks.length;
  all.textContent = locked
    ? "Week locked"
    : completed(d)
      ? "Uncheck all sets"
      : "Complete all sets";
}
function setupTimer() {
  let duration = 30,
    remaining = 30,
    deadline = 0,
    interval = null;
  const display = document.getElementById("timer"),
    toggle = document.getElementById("timer-toggle");
  function paint() {
    display.textContent =
      String(Math.floor(remaining / 60)).padStart(2, "0") +
      ":" +
      String(remaining % 60).padStart(2, "0");
    document
      .querySelectorAll("[data-timer-preview]")
      .forEach((el) => (el.textContent = display.textContent));
  }
  function stop() {
    clearInterval(interval);
    interval = null;
    toggle.textContent = "Start";
  }
  function tick() {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    paint();
    if (remaining === 0) {
      stop();
      vibrate();
      toast("Rest done. Next set.");
      document.getElementById("timer-status").textContent =
        "Rest done. Next set.";
    }
  }
  toggle.onclick = () => {
    if (interval) {
      tick();
      stop();
      if (remaining > 0) toggle.textContent = "Resume";
      document.getElementById("timer-status").textContent = "Timer paused.";
    } else {
      if (remaining === 0) remaining = duration;
      deadline = Date.now() + remaining * 1000;
      interval = setInterval(tick, 200);
      toggle.textContent = "Pause";
      document.getElementById("timer-status").textContent =
        "Running. Close anytime.";
      paint();
    }
  };
  document.getElementById("timer-reset").onclick = () => {
    stop();
    remaining = duration;
    document.getElementById("timer-status").textContent =
      "Timer reset.";
    paint();
  };
  document.querySelectorAll("[data-seconds]").forEach(
    (button) =>
      (button.onclick = () => {
        stop();
        duration = remaining = Number(button.dataset.seconds);
        document.querySelectorAll("[data-seconds]").forEach((b) => {
          b.classList.toggle("active", b === button);
          b.setAttribute("aria-pressed", String(b === button));
        });
        paint();
      }),
  );
  document.addEventListener("visibilitychange", () => {
    if (interval) tick();
  });
}
function drills() {
  const queryParams = new URLSearchParams(location.search);
  main.innerHTML =
    intro("Drill library", "Find a set and view its instructions.") +
    '<div class="toolbar"><label class="filter-field"><span>Search drills</span><input type="search" id="drill-search" aria-label="Search drills" placeholder="e.g. kick"></label><label class="filter-field"><span>Training focus</span><select id="drill-filter" aria-label="Training focus"><option value="all">All focuses</option>' +
    Object.entries(LAB)
      .map(([k, label]) => '<option value="' + k + '">' + label + "</option>")
      .join("") +
    '</select></label></div><h2 class="sr-only">Matching sets</h2><p id="drill-count" role="status" style="font-size:12px;margin-bottom:16px"></p><div id="drill-results" class="drill-grid"></div>';
  const seen = new Set();
  const library = [];
  DAYS.filter((d) => !d.rest && !d.race).forEach((d) =>
    d.blocks.forEach((b) => {
      const key = b.n + "|" + b.t + "|" + b.d + "|" + b.r + "|" + b.k;
      if (!seen.has(key)) {
        seen.add(key);
        library.push(b);
      }
    }),
  );
  document.getElementById("drill-search").value = queryParams.get("q") || "";
  document.getElementById("drill-filter").value = Object.hasOwn(
    LAB,
    queryParams.get("focus"),
  )
    ? queryParams.get("focus")
    : "all";
  function filter() {
    const query = document
      .getElementById("drill-search")
      .value.toLowerCase()
      .trim();
    const kind = document.getElementById("drill-filter").value;
    const url = new URL(location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    if (kind !== "all") url.searchParams.set("focus", kind);
    else url.searchParams.delete("focus");
    history.replaceState(history.state, "", url);
    const matches = library.filter(
      (b) =>
        (kind === "all" || b.k === kind) &&
        (b.t + " " + b.d + " " + b.r + " " + (b.details || []).join(" ")).toLowerCase().includes(query),
    );
    document.getElementById("drill-count").textContent =
      matches.length + " sets found";
    document.getElementById("drill-results").innerHTML = matches.length
      ? matches
          .map(
            (b) =>
              '<details class="panel" id="drill-' +
              library.indexOf(b) +
              '"><summary><span class="pill">' +
              LAB[b.k] +
              "</span><h3>" +
              escapeHTML(b.t) +
              "</h3><small>" +
              (typeof b.n === "number" ? b.n + " laps" : escapeHTML(b.n)) +
              "</small></summary><p>" +
              escapeHTML(b.d) +
              "</p>" +
              (b.r ? '<p class="target">' + escapeHTML(b.r) + "</p>" : "") +
              (b.details ? '<ul class="drill-notes">' + b.details.map((item) => '<li>' + escapeHTML(item) + '</li>').join("") + '</ul>' : "") +
              (() => {
                const day = training.find((d) =>
                  d.blocks.some(
                    (bl) =>
                      bl.n === b.n &&
                      bl.t === b.t &&
                      bl.d === b.d &&
                      bl.r === b.r &&
                      bl.k === b.k,
                  ),
                );
                return day
                  ? '<a class="text-link drill-session-link" aria-label="Open session: ' +
                      escapeHTML(day.title + ", " + fmt(day.date)) +
                      '" href="' +
                      href(day) +
                      '">Open session &rarr;</a>'
                  : "";
              })() +
              "</details>",
          )
          .join("")
      : '<p class="empty">No matching sets. Try another search or focus.</p>';
  }
  document.getElementById("drill-search").addEventListener("input", filter);
  document.getElementById("drill-filter").addEventListener("change", filter);
  filter();
}
function progress() {
  const history = training.filter((d) => finished(d) > 0);
  main.innerHTML =
    intro("Your progress", "Completed swim sessions.") +
    stats() +
    '<div class="columns"><section class="panel"><div class="section-title"><h2>Week by week</h2><small>Completed swims</small></div>' +
    WEEKS.map((w, wi) => {
      const days = training.filter((d) => d.wi === wi);
      const n = days.filter(completed).length;
      return (
        '<div class="week-progress"><h3>0' +
        (wi + 1) +
        " · " +
        w.name +
        "<span>" +
        n +
        " / " +
        days.length +
        '</span></h3><div class="progress-track"><span style="width:' +
        (n / days.length) * 100 +
        '%"></span></div></div>'
      );
    }).join("") +
    '<p class="callout">Recovery and race day are excluded.</p></section><section class="panel"><div class="section-title"><h2>Session activity</h2></div>' +
    (history.length
      ? history.map(card).join("")
      : '<div class="empty"><h3>No sessions logged</h3><p style="margin:12px 0 20px">Complete a set to start tracking.</p><a class="button" href="' +
        href(currentDay) +
        '">Open your session ' +
        icon("arrow") +
        "</a></div>") +
    '</section></div><details class="progress-options" id="progress-options"><summary>Manage progress</summary><p>Saved on this browser only.</p><div class="actions"><button class="button secondary" id="export-progress">Export progress</button><button class="button secondary danger" id="reset-progress">Clear all progress</button></div><div id="reset-confirmation" role="group" aria-labelledby="reset-question" hidden><p id="reset-question">Clear all saved checks?</p><div class="actions"><button class="button secondary" id="cancel-reset">Cancel</button><button class="button secondary danger" id="confirm-reset">Clear progress</button></div></div></details>';
  document.getElementById("export-progress").onclick = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), ...state },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lane50-progress-" + todayKey + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Progress exported.");
  };
  document.getElementById("reset-progress").onclick = () => {
    document.getElementById("reset-confirmation").hidden = false;
    document.getElementById("cancel-reset").focus();
  };
  document.getElementById("cancel-reset").onclick = () => {
    document.getElementById("reset-confirmation").hidden = true;
    document.getElementById("reset-progress").focus();
  };
  document.getElementById("confirm-reset").onclick = () => {
    state = { done: {}, sequenceVersion: 1 };
    const saved = save();
    progress();
    document.getElementById("progress-options").open = true;
    document.getElementById("reset-progress").focus();
    if (saved) toast("Progress cleared.");
  };
}
function refreshView() {
  const snapshot = SwimNavigation.snapshot();
  try {
    state = normalize(JSON.parse(localStorage.getItem(KEY) || "null"));
  } catch (_) {}
  if (page === "race") return;
  if (page === "session" && activeSession) updateSession();
  else if (page !== "drills")
    (({ overview, plan, progress })[page] || overview)();
  if (snapshot) SwimNavigation.restore(snapshot, false);
}
if (page !== "race") (({ overview, plan, session, drills, progress })[page] || overview)();
SwimNavigation.ready();
if (!persistent)
  toast("Storage unavailable. Progress may not survive leaving this page.");
document.addEventListener("lane:resume", refreshView);
window.addEventListener("storage", (event) => {
  if (event.key !== KEY && event.key !== null) return;
  SwimNavigation.capture();
  refreshView();
});

// Measure fixed controls so anchors and focused sets remain visible at any text size.
const chromeObserver = new ResizeObserver(() => {
  const header = document.querySelector(".site-header");
  const dock = document.querySelector(
    page === "session" ? ".session-dock" : ".navigation",
  );
  const jump = document.querySelector(".week-jump");
  document.documentElement.style.setProperty(
    "--header-height",
    header.getBoundingClientRect().height + "px",
  );
  if (dock && (page === "session" || matchMedia("(max-width:760px)").matches))
    document.documentElement.style.setProperty(
      "--dock-height",
      dock.getBoundingClientRect().height + "px",
    );
  if (jump)
    document.documentElement.style.setProperty(
      "--jump-height",
      jump.getBoundingClientRect().height + "px",
    );
});
document
  .querySelectorAll(".site-header,.navigation,.session-dock,.week-jump")
  .forEach((el) => chromeObserver.observe(el));
