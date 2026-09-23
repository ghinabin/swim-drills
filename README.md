# Lane 50

A responsive, framework-free pool drill companion for the 50 m freestyle
taper before the NSA Cup.

## Current plan

The visible schedule runs from Friday 18 September through Sunday
11 October 2026:

- Reset: 18–20 September
- Connect and rehearse: 21–27 September
- Taper: 28 September–4 October
- Race week: 5–11 October
- Race dates: 12–13 October

All training sessions use a 25 m pool. Wednesdays and Saturdays are rest days;
Sunday 11 October is an optional shakeout. Rest is measured after each
repetition, as specified by the revised plan.

## Pages

- `index.html`: current or next pool session and the following two days
- `plan.html`: the revised 24-day training schedule
- `session.html?id=w2d1`: one session's drill checklist and rest timer
- `drills.html`: searchable, filterable set library

The main UI intentionally has no progress log, workout history, race log,
progression gates, or dry-land workout content.

Tap a drill card to check it off, and tap again to undo. Checks are saved per
session in this browser, including offline, and remain after reloading.

## Run

Run `python -m http.server 8000` in this directory and open
http://localhost:8000. There are no application dependencies or build steps.
Use HTTPS or localhost to make the four main screens available offline.

## Organization

- `SWIMMING-PLAN.md`: source plan
- `assets/data.js`: dated taper sessions and drill details generated with
  `node scripts/import-plan.cjs`
- `assets/app.js`: schedule, session, library, and rest-timer rendering
- `assets/navigation.js`: return context, history, focus, and scroll restoration
- `assets/styles.css` and `assets/interactions.css`: responsive presentation
- `sw.js`: offline shell for the four visible app screens

## Checks

Run `python tests/pool_plan.py` with Python, Playwright, and Chrome installed.
It checks mobile and desktop layouts, the revised dates and distances,
completion controls, timing guidance, drill search, and browser JavaScript errors.
