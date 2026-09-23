# Lane 50

A responsive, framework-free pool drill companion for the 50 m and 100 m freestyle
taper before the NSA Cup.

## Current plan

The visible schedule runs from Wednesday 23 September through Sunday
11 October 2026:

- Last load: 23–27 September
- Taper: 28 September–4 October
- Race week: 5–11 October
- Race dates: 12–13 October

All training sessions use a 25 m pool. Saturdays are rest days. This app shows
the desktop schedule published on 22 September. `SWIMMING-PLAN.md` is a separate,
conflicting revision and is not the source for the displayed sessions.

## Pages

- `index.html`: current or next pool session and the following two days
- `plan.html`: the 19-day desktop training schedule
- `session.html?id=w1d0`: one session's drill checklist and rest timer
- `drills.html`: searchable, filterable set library

The main UI intentionally has no progress log, workout history, race log,
progression gates, or dry-land workout content.

Tap a drill card to check it off, and tap again to undo. Checks are saved per
session in this browser, including offline, and remain after reloading.
The timing note explains start intervals such as “on 2:00” and “on :45”; the
cards display those intervals in minutes and seconds.

## Run

Run `python -m http.server 8000` in this directory and open
http://localhost:8000. There are no application dependencies or build steps.
Use HTTPS or localhost to make the four main screens available offline.

## Organization

- `assets/data.js`: dated desktop sessions and drill details
- `SWIMMING-PLAN.md` and `scripts/import-plan.cjs`: a separate revised plan;
  running the importer changes the displayed schedule
- `assets/app.js`: schedule, session, library, and rest-timer rendering
- `assets/navigation.js`: return context, history, focus, and scroll restoration
- `assets/styles.css` and `assets/interactions.css`: responsive presentation
- `sw.js`: offline shell for the four visible app screens

## Checks

Run `python tests/pool_plan.py` with Python, Playwright, and Chrome installed.
It checks mobile and desktop layouts, the desktop dates and distances,
completion controls, timing guidance, drill search, and browser JavaScript errors.
