"""Browser checks for the revised swim plan and drill checklist."""
from datetime import datetime, timedelta, timezone
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import tempfile

from playwright.sync_api import sync_playwright

from navigation import QuietHandler, ROOT


def run():
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT))
    )
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel="chrome", headless=True)
            for width in (390, 1440):
                page = browser.new_page(viewport={"width": width, "height": 900}, timezone_id="Asia/Kathmandu")
                page.clock.install(time=datetime(2026, 9, 23, 12, tzinfo=timezone(timedelta(hours=5, minutes=45))))
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))

                page.goto(base + "index.html")
                assert page.locator("main h1").inner_text() == "Pool drills"
                assert page.locator(".nav-link").all_inner_texts() == [
                    "Overview", "Training plan", "Drill library"
                ]
                assert page.locator("#current-session").inner_text() == "Rest day"
                assert "0 m" in page.locator(".hero").inner_text()
                assert "4 × 50" not in page.locator("main").inner_text()

                page.goto(base + "plan.html")
                assert page.locator(".week").count() == 4
                assert page.locator(".session-card").count() == 24
                assert page.locator(".rest-card").count() == 10
                assert page.locator("#day-w2d2 h3").inner_text() == "Rest day"
                assert page.locator("#day-w4d6 h3").text_content() == "Optional pre-meet shakeout"
                assert "4 × 50 all out" not in page.locator("main").inner_text()

                totals = page.evaluate("""DAYS.filter(d => !d.historical && !d.race && !d.rest)
                    .map(d => [d.laps, d.blocks.reduce((n, b) => n + b.n, 0),
                        Number(d.dist.replace(/[^0-9]/g, '')),
                        d.blocks.reduce((n, b) => n + b.meters, 0)])""")
                assert all(laps == counted and meters == counted_meters
                           for laps, counted, meters, counted_meters in totals)

                page.goto(base + "session.html?id=w2d2")
                assert page.locator("main h1").inner_text() == "Rest day"
                assert "0 m" in page.locator(".page-intro").inner_text()
                assert page.locator(".set-card").count() == 0

                page.goto(base + "session.html?id=w2d1")
                assert "36 lengths" in page.locator(".page-intro").inner_text()
                assert "Rest starts after you finish" in page.locator(".timing-note").inner_text()
                assert "45–60 seconds after each 50" in page.locator("main").inner_text()
                assert "2 minutes after each full length" in page.locator("main").inner_text()
                assert page.locator("#session-announcement").inner_text() == "0 of 7 complete"
                page.locator("#set-0 .status-dot").click()
                assert page.locator("#set-0").get_attribute("aria-pressed") == "true"
                assert page.locator("#session-announcement").inner_text() == "1 of 7 complete"
                page.reload()
                assert page.locator("#set-0").get_attribute("aria-pressed") == "true"
                page.locator("#set-1").focus()
                page.keyboard.press("Space")
                assert page.locator("#session-announcement").inner_text() == "2 of 7 complete"
                page.keyboard.press("Enter")
                assert page.locator("#set-1").get_attribute("aria-pressed") == "false"

                page.goto(base + "session.html?id=w2d3")
                assert page.locator('.set-card[aria-pressed="true"]').count() == 0
                page.goto(base + "session.html?id=w2d1")
                assert page.locator("#set-0").get_attribute("aria-pressed") == "true"
                page.locator("#set-0").click()
                page.reload()
                assert page.locator('.set-card[aria-pressed="true"]').count() == 0

                page.goto(base + "session.html?id=w1d0")
                assert page.locator("main h1").inner_text() == "Past date"
                assert page.locator(".set-card").count() == 0

                page.goto(base + "session.html?id=w4d3")
                assert "16 lengths" in page.locator(".page-intro").inner_text()
                assert "at least 3 minutes settled recovery" in page.locator("main").inner_text()
                if width == 390:
                    page.screenshot(
                        path=str(Path(tempfile.gettempdir()) / "lane50-revised-session.png"),
                        full_page=True,
                    )
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")

                page.locator("[data-open-timer]").click()
                assert page.locator("#timer-sheet").is_visible()
                page.locator("#timer-toggle").click()
                assert page.locator("#timer-status").inner_text() == "Running"

                page.goto(base + "drills.html")
                page.locator("#drill-search").fill("4 × 50 all out")
                assert page.locator("#drill-count").inner_text() == "0 sets found"
                page.locator("#drill-search").fill("full 50")
                assert page.locator("#drill-results > details").count() > 0
                page.goto(base + "index.html")
                page.evaluate("navigator.serviceWorker.ready")
                page.wait_for_function("navigator.serviceWorker.controller !== null")
                page.context.set_offline(True)
                page.goto(base + "session.html?id=w2d2")
                assert page.locator("main h1").inner_text() == "Rest day"
                page.context.set_offline(False)
                assert not errors, errors
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                page.close()
            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    run()
    print("PASS revised plan, timing guidance, completion, and responsive UI")
