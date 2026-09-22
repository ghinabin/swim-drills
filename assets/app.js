/* Pool drill schedule and session rendering. */
"use strict";

const page = document.body.dataset.page;
const main = document.getElementById("main");
const icons = {
  overview:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  plan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
  drills:
    '<path d="M3 5c4-2 6-2 9 0 3-2 5-2 9 0v15c-4-2-6-2-9 0-3-2-5-2-9 0zM12 5v15"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
};
const icon = (name) =>
  '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + "</svg>";
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const dateKey = (date) =>
  date.getFullYear() +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0");
const todayKey = dateKey(new Date());
const training = DAYS.filter((day) => !day.rest);
const currentDay =
  DAYS.find((day) => dateKey(day.date) === todayKey) ||
  DAYS.find((day) => dateKey(day.date) > todayKey) ||
  DAYS[DAYS.length - 1];
const href = (day) => SwimNavigation.sessionURL(day.id);

const links = [
  ["overview", "index.html", "Overview"],
  ["plan", "plan.html", "Training plan"],
  ["drills", "drills.html", "Drill library"],
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
  return (
    '<div class="page-intro"><div><h1>' +
    title +
    "</h1>" +
    (description ? "<p>" + description + "</p>" : "") +
    "</div></div>"
  );
}

function sessionMeta(day) {
  return day.rest
    ? "No pool session"
    : day.pool + " pool &middot; " + day.laps + " laps &middot; " + day.dist;
}

function card(day) {
  const today = dateKey(day.date) === todayKey;
  const content =
    '<span class="date-box"><strong>' +
    day.date.getDate() +
    "</strong><small>" +
    MON[day.date.getMonth()] +
    '</small></span><div class="session-info"><h3>' +
    escapeHTML(day.title) +
    "</h3><p>" +
    sessionMeta(day) +
    "</p>" +
    (today ? '<span class="session-state">Today</span>' : "") +
    "</div>" +
    (day.rest
      ? ""
      : '<span class="status-dot" aria-hidden="true">&rarr;</span>');
  if (day.rest)
    return (
      '<article id="day-' +
      day.id +
      '" class="session-card rest-card ' +
      (today ? "today" : "") +
      '">' +
      content +
      "</article>"
    );
  return (
    '<a id="day-' +
    day.id +
    '" class="session-card ' +
    (today ? "today" : "") +
    '" href="' +
    href(day) +
    '">' +
    content +
    "</a>"
  );
}

function raceCountdown() {
  const now = new Date();
  const remaining = Math.ceil(
    (Date.UTC(2026, 9, 12) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      86400000,
  );
  if (remaining > 0) return remaining + " days to the first race";
  if (remaining === 0) return "First race today";
  if (remaining === -1) return "Second race today";
  return "Race block complete";
}

function overview() {
  const next = DAYS.filter((day) => day.date > currentDay.date).slice(0, 2);
  main.innerHTML =
    intro(
      "Pool drills",
      "50 + 100 freestyle &middot; races 12–13 October &middot; all training in a 25 m pool",
    ) +
    '<section class="hero" aria-labelledby="current-session"><div><div class="eyebrow">' +
    (dateKey(currentDay.date) === todayKey ? "Today" : "Next session") +
    '</div><h2 id="current-session">' +
    escapeHTML(currentDay.title) +
    "</h2><p>" +
    currentDay.dow +
    " " +
    fmt(currentDay.date) +
    " &middot; " +
    sessionMeta(currentDay) +
    " &middot; " +
    raceCountdown() +
    "</p>" +
    (currentDay.rest
      ? '<a class="button secondary" href="plan.html">View training plan</a>'
      : '<a class="button" href="' +
        href(currentDay) +
        '">Open drills ' +
        icon("arrow") +
        "</a>") +
    "</div></section>" +
    (next.length
      ? '<section class="upcoming"><div class="section-title"><h2>Coming up</h2><a class="text-link" href="plan.html">Full plan &rarr;</a></div>' +
        next.map(card).join("") +
        "</section>"
      : "");
}

function plan() {
  main.innerHTML =
    intro(
      "Training plan",
      "The pool-only taper from 23 September through the final shakeout.",
    ) +
    '<nav class="week-jump" aria-label="Jump to phase">' +
    WEEKS.map(
      (week, wi) =>
        '<a href="#week-' +
        (wi + 1) +
        '" data-jump>Phase ' +
        (wi + 1) +
        "<small>" +
        escapeHTML(week.name) +
        "</small></a>",
    ).join("") +
    "</nav>" +
    '<div class="plan-actions"><a class="text-link" data-jump href="#day-' +
    currentDay.id +
    '">Find current day</a><button class="text-button" id="expand-weeks">Expand all phases</button></div>' +
    WEEKS.map((week, wi) => {
      const days = DAYS.filter((day) => day.wi === wi);
      return (
        '<details class="week" id="week-' +
        (wi + 1) +
        '" ' +
        (wi === currentDay.wi ? "open" : "") +
        '><summary><span class="week-number">0' +
        (wi + 1) +
        "</span><span><h2>" +
        escapeHTML(week.name) +
        "</h2><small>" +
        fmt(days[0].date) +
        " &ndash; " +
        fmt(days[days.length - 1].date) +
        '</small></span><span class="week-count">' +
        days.filter((day) => !day.rest).length +
        ' swims</span></summary><div class="week-body"><p>' +
        escapeHTML(week.sub) +
        "</p>" +
        days.map(card).join("") +
        "</div></details>"
      );
    }).join("");

  const expand = document.getElementById("expand-weeks");
  const phases = Array.from(main.querySelectorAll(".week"));
  const sync = () => {
    expand.textContent = phases.every((element) => element.open)
      ? "Collapse all phases"
      : "Expand all phases";
  };
  phases.forEach((element) => element.addEventListener("toggle", sync));
  expand.onclick = () => {
    const open = !phases.every((element) => element.open);
    phases.forEach((element) => (element.open = open));
    sync();
  };
  sync();
}

let activeSession;
function session() {
  const id = new URLSearchParams(location.search).get("id");
  activeSession = id ? DAYS.find((day) => day.id === id) : currentDay;
  if (!activeSession) {
    main.innerHTML =
      intro(
        "Session not found",
        "This link does not match the current taper plan.",
      ) + '<a class="button" href="plan.html">View training plan</a>';
    return;
  }

  const day = activeSession;
  document.title = day.title + " | Lane 50";
  document.querySelector(".site-header").innerHTML =
    '<a class="context-back" aria-label="Back to ' +
    escapeHTML(SwimNavigation.returnLabel()) +
    '" data-return href="' +
    escapeHTML(SwimNavigation.returnURL()) +
    '">' +
    icon("back") +
    "<span>" +
    escapeHTML(SwimNavigation.returnLabel()) +
    '</span></a><div class="context-title"><strong>' +
    day.dow +
    " " +
    fmt(day.date) +
    "</strong><small>" +
    escapeHTML(day.weekName) +
    "</small></div>";

  if (day.rest) {
    main.innerHTML =
      intro("Rest", day.dow + " " + fmt(day.date)) +
      '<section class="panel"><h2>No pool session</h2><p>Return for the next scheduled swim.</p><div class="actions"><a class="button" data-return href="' +
      escapeHTML(SwimNavigation.returnURL()) +
      '">Back to ' +
      escapeHTML(SwimNavigation.returnLabel().toLowerCase()) +
      "</a></div></section>";
    return;
  }

  main.innerHTML =
    intro(
      escapeHTML(day.title),
      day.dow +
        " " +
        fmt(day.date) +
        " &middot; " +
        sessionMeta(day) +
        " &middot; " +
        day.blocks.length +
        " sets",
    ) +
    (day.note
      ? '<aside class="callout session-note" aria-label="Session note"><strong>Session note</strong><p>' +
        escapeHTML(day.note) +
        "</p></aside>"
      : "") +
    '<div class="session-layout"><section class="workout" aria-labelledby="sets-heading"><div class="section-title"><h2 id="sets-heading">Session drills</h2></div><div class="set-list">' +
    day.blocks
      .map(
        (block, i) =>
          '<article id="set-' +
          i +
          '" class="set-card" data-kind="' +
          block.k +
          '"><span class="set-number">' +
          escapeHTML(String(block.n).replace(" min", "").replace(" reps", "")) +
          "<small>" +
          (typeof block.n === "number"
            ? "LAPS"
            : String(block.n).includes("min")
              ? "MIN"
              : "REPS") +
          '</small></span><span class="set-content"><span class="set-order">' +
          (i + 1) +
          ". " +
          LAB[block.k] +
          '</span><span class="set-title">' +
          escapeHTML(block.t) +
          '</span><span class="set-description">' +
          escapeHTML(block.d) +
          "</span>" +
          (block.r
            ? '<span class="target">' + escapeHTML(block.r) + "</span>"
            : "") +
          "</span></article>",
      )
      .join("") +
    '</div><div class="session-finish"><a class="button secondary" data-return href="' +
    escapeHTML(SwimNavigation.returnURL()) +
    '">Back to ' +
    escapeHTML(SwimNavigation.returnLabel().toLowerCase()) +
    '</a></div></section></div><div class="session-dock timer-only"><button class="dock-timer" data-open-timer><span>Rest timer</span><strong data-timer-preview>00:30</strong></button></div><dialog class="timer-sheet" id="timer-sheet" aria-labelledby="timer-heading"><div class="sheet-header"><div><h2 id="timer-heading">Rest timer</h2></div><button class="icon-button" data-close-dialog aria-label="Close rest timer">&#10005;</button></div><p>The timer keeps running when closed.</p><div class="timer-value" id="timer" role="timer" aria-label="Rest time remaining">00:30</div><div class="timer-presets" role="group" aria-label="Timer duration"><button data-seconds="30" class="active" aria-pressed="true">30 sec</button><button data-seconds="60" aria-pressed="false">1 min</button><button data-seconds="120" aria-pressed="false">2 min</button><button data-seconds="300" aria-pressed="false">5 min</button></div><div class="timer-actions"><button id="timer-toggle" class="button">Start</button><button id="timer-reset" class="button secondary">Reset</button></div><p id="timer-status" role="status">Choose your rest, then start.</p></dialog>';

  document.querySelectorAll("[data-open-timer]").forEach(
    (button) =>
      (button.onclick = () =>
        SwimNavigation.openDialog(
          document.getElementById("timer-sheet"),
          button,
        )),
  );
  setupTimer();
}

let toastTimeout;
function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => element.classList.remove("show"), 3200);
}

function vibrate() {
  try {
    if (navigator.vibrate) navigator.vibrate(12);
  } catch (_) {}
}

function setupTimer() {
  let duration = 30;
  let remaining = 30;
  let deadline = 0;
  let interval = null;
  const display = document.getElementById("timer");
  const toggle = document.getElementById("timer-toggle");

  function paint() {
    display.textContent =
      String(Math.floor(remaining / 60)).padStart(2, "0") +
      ":" +
      String(remaining % 60).padStart(2, "0");
    document
      .querySelectorAll("[data-timer-preview]")
      .forEach((element) => (element.textContent = display.textContent));
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
      toast("Rest finished. Ready for your next set.");
      document.getElementById("timer-status").textContent =
        "Rest finished. Ready for your next set.";
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
        "Timer running. You can close this panel.";
      paint();
    }
  };
  document.getElementById("timer-reset").onclick = () => {
    stop();
    remaining = duration;
    document.getElementById("timer-status").textContent =
      "Timer reset. Ready to start.";
    paint();
  };
  document.querySelectorAll("[data-seconds]").forEach(
    (button) =>
      (button.onclick = () => {
        stop();
        duration = remaining = Number(button.dataset.seconds);
        document.querySelectorAll("[data-seconds]").forEach((candidate) => {
          candidate.classList.toggle("active", candidate === button);
          candidate.setAttribute(
            "aria-pressed",
            String(candidate === button),
          );
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
    intro("Drill library", "Search every set in the taper plan.") +
    '<div class="toolbar"><label class="filter-field"><span>Search drills</span><input type="search" id="drill-search" aria-label="Search drills" placeholder="e.g. kick"></label><label class="filter-field"><span>Training focus</span><select id="drill-filter" aria-label="Training focus"><option value="all">All training focuses</option>' +
    Object.entries(LAB)
      .map(
        ([key, label]) =>
          '<option value="' + key + '">' + label + "</option>",
      )
      .join("") +
    '</select></label></div><h2 class="sr-only">Matching sets</h2><p id="drill-count" role="status" class="drill-count"></p><div id="drill-results" class="drill-grid"></div>';

  const seen = new Set();
  const library = [];
  training.forEach((day) =>
    day.blocks.forEach((block) => {
      const key =
        block.n +
        "|" +
        block.t +
        "|" +
        block.d +
        "|" +
        block.r +
        "|" +
        block.k;
      if (!seen.has(key)) {
        seen.add(key);
        library.push(block);
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
      (block) =>
        (kind === "all" || block.k === kind) &&
        (block.t + " " + block.d + " " + block.r)
          .toLowerCase()
          .includes(query),
    );
    document.getElementById("drill-count").textContent =
      matches.length + (matches.length === 1 ? " set found" : " sets found");
    document.getElementById("drill-results").innerHTML = matches.length
      ? matches
          .map((block) => {
            const day = training.find((candidate) =>
              candidate.blocks.includes(block),
            );
            return (
              '<details class="panel" id="drill-' +
              library.indexOf(block) +
              '"><summary><span class="pill">' +
              LAB[block.k] +
              "</span><h3>" +
              escapeHTML(block.t) +
              "</h3><small>" +
              (typeof block.n === "number"
                ? block.n + " laps"
                : escapeHTML(block.n)) +
              "</small></summary><p>" +
              escapeHTML(block.d) +
              "</p>" +
              (block.r
                ? '<p class="target">' + escapeHTML(block.r) + "</p>"
                : "") +
              '<a class="text-link drill-session-link" aria-label="Open session: ' +
              escapeHTML(day.title + ", " + fmt(day.date)) +
              '" href="' +
              href(day) +
              '">Open session &rarr;</a></details>'
            );
          })
          .join("")
      : '<p class="empty">No matching sets. Try another search or focus.</p>';
  }
  document.getElementById("drill-search").addEventListener("input", filter);
  document.getElementById("drill-filter").addEventListener("change", filter);
  filter();
}

if (page !== "race") {
  const render = ({ overview, plan, session, drills })[page] || overview;
  render();
  SwimNavigation.ready();
}

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
  .forEach((element) => chromeObserver.observe(element));
