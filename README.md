# Lane 50

A responsive, framework-free pool drill companion for the 50 m and 100 m
freestyle taper before the NSA Cup.

## Current plan

The visible schedule runs from Wednesday 23 September through Sunday
11 October 2026:

- Last load: 23–27 September
- Taper: 28 September–4 October
- Race week: 5–11 October
- Race dates: 12–13 October

All training sessions use a 25 m pool. Saturdays are full rest days. The three
Sunday sessions are the 25 m replacements, and the 8 October venue session
includes 4–6 real-block starts without increasing its 20-lap total.

## Pages

- `index.html`: current or next pool session and the following two days
- `plan.html`: the complete 19-day taper schedule
- `session.html?id=w1d0`: one session's drill checklist and rest timer
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

- `assets/data.js`: dated taper sessions and drill details
- `assets/app.js`: schedule, session, library, and rest-timer rendering
- `assets/navigation.js`: return context, history, focus, and scroll restoration
- `assets/styles.css` and `assets/interactions.css`: responsive presentation
- `sw.js`: offline shell for the four visible app screens

## Checks

Run `python tests/pool_plan.py` with Python, Playwright, and Chrome installed.
It checks both mobile and desktop layouts, all 19 dates, exact lap totals, the
three replacement Sundays, the 8 October block-start session, clean navigation,
drill search, and browser JavaScript errors.
