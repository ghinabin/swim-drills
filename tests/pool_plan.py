"""Pool-only taper schedule and UI regression checks."""
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
                page = browser.new_page(viewport={"width": width, "height": 900})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))

                page.goto(base + "index.html")
                assert page.locator("main h1").inner_text() == "Pool drills"
                assert page.locator(".nav-link").all_inner_texts() == [
                    "Overview",
                    "Training plan",
                    "Drill library",
                ]
                assert page.locator('a[href*="progress"], a[href*="race"]').count() == 0
                assert page.locator("#current-session").inner_text().startswith("4 × 50")
                if width == 390:
                    page.screenshot(
                        path=str(Path(tempfile.gettempdir()) / "lane50-pool-overview.png"),
                        full_page=True,
                    )

                page.goto(base + "plan.html")
                assert page.locator(".week").count() == 3
                assert page.locator(".session-card").count() == 19
                assert page.locator(".rest-card").count() == 3
                assert page.locator("#day-w1d4 h3").text_content() == "Starts and turns"
                assert page.locator("#day-w2d6 h3").text_content() == "Starts and race pace"
                assert page.locator("#day-w3d6 h3").text_content() == "Shakeout"

                totals = page.evaluate(
                    """DAYS.map(day => ({
                        date: fmt(day.date),
                        declared: day.laps,
                        counted: day.blocks.reduce(
                          (sum, block) => sum +
                            (typeof block.n === 'number' ? block.n : 0), 0)
                    }))"""
                )
                assert all(row["declared"] == row["counted"] for row in totals)

                page.goto(base + "session.html?id=w1d4")
                assert "25 m pool · 40 laps" in page.locator(".page-intro p").inner_text()
                assert page.locator(".set-title").all_inner_texts() == [
                    "Warm-up",
                    "Kick",
                    "Buoy",
                    "Starts",
                    "Main",
                    "Cool-down",
                ]
                assert page.locator("#complete-all, .session-progress-summary").count() == 0
                assert "permitted and deep enough" in page.locator(
                    ".session-note"
                ).inner_text()

                page.goto(base + "session.html?id=w3d3")
                assert "20 laps" in page.locator(".page-intro p").inner_text()
                assert "4–6 block starts to 15 m" in page.locator("main").inner_text()
                if width == 390:
                    page.screenshot(
                        path=str(Path(tempfile.gettempdir()) / "lane50-block-starts.png"),
                        full_page=True,
                    )

                page.goto(base + "drills.html")
                page.locator("#drill-search").fill("block starts")
                assert page.locator("#drill-count").inner_text() == "1 set found"
                assert page.locator("#drill-results").text_content().find(
                    "4–6 block starts to 15 m"
                ) >= 0

                assert not errors, errors
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                page.close()
            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    run()
    print("PASS pool-only taper schedule, clean navigation, and responsive UI")
