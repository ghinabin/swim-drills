"""Simple stopwatch, durable lap timestamps, offline use, and stable layout."""
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from navigation import QuietHandler, ROOT


def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel='chrome', headless=True)
            context = browser.new_context(viewport={'width': 390, 'height': 844})
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(base)
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            page.wait_for_function('document.querySelector(".offline-status").textContent.includes("Ready offline")')
            context.set_offline(True)
            for url in ['plan.html', 'session.html?id=w1d0', 'drills.html', 'progress.html', 'race.html', 'race-tools.html']:
                page.goto(base + url)
                page.locator('main h1').wait_for()
            page.goto(base + 'race.html')
            assert page.locator('#race-setup').count() == 0
            assert page.locator('#mark-race').is_disabled()
            for width, height in [(320,640),(390,844),(667,375),(1440,1000)]:
                page.set_viewport_size({'width':width, 'height':height})
                page.locator('#arm-race').scroll_into_view_if_needed()
                start = page.locator('#arm-race').bounding_box()
                assert start['height'] == 88
                assert page.locator('#mark-race').bounding_box()['height'] == 88
                page.locator('#arm-race').click()
                page.locator('#cancel-race').wait_for(state='visible')
                assert page.locator('#mark-race').is_disabled()
                assert page.locator('#race-cue').inner_text() == 'Get ready'
                assert page.locator('#race-clock').inner_text() == '5 s'
                assert page.locator('#cancel-race').bounding_box() == start, (width, start, page.locator('#cancel-race').bounding_box())
                page.locator('#finish-race').wait_for(state='visible', timeout=25000)
                assert page.evaluate('JSON.parse(localStorage.getItem("lane50:active-race")).status') == 'Swimming'
                clock = page.locator('.clock-face').bounding_box()
                lap = page.locator('#mark-race').bounding_box()
                for _ in range(6):
                    page.locator('#mark-race').click()
                after = page.locator('.clock-face').bounding_box()
                records = page.locator('#race-splits').bounding_box()
                assert 0 <= records['y'] - (clock['y'] + clock['height']) <= 24
                assert after == clock, (clock, after)
                assert abs(after['width'] - after['height']) < 1
                assert page.locator('#mark-race').bounding_box() == lap
                finish = page.locator('#finish-race').bounding_box()
                assert finish['x'] - lap['x'] - lap['width'] >= 39
                assert finish == start, (width, finish, start)
                assert finish['height'] == lap['height'] == 88
                assert finish['y'] == lap['y']
                if height >= 640:
                    assert finish['y'] + finish['height'] <= height
                assert page.locator('#race-splits li').count() == 6
                assert page.locator('#race-splits').evaluate('el => el.clientHeight') == 192
                assert page.locator('#race-splits').evaluate('el => el.scrollHeight > el.clientHeight')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                current = page.locator('#race-clock').inner_text()
                page.wait_for_timeout(100)
                assert page.locator('#race-clock').inner_text() != current
                page.locator('#finish-race').click()
                assert page.locator('#another-race').bounding_box() == start
                stopped = page.locator('#race-clock').inner_text()
                page.wait_for_timeout(100)
                assert page.locator('#race-clock').inner_text() == stopped
                page.locator('#another-race').click()
                assert page.locator('#race-splits li').count() == 0
            page.set_viewport_size({'width':390, 'height':844})
            page.locator('#arm-race').click()
            page.locator('#finish-race').wait_for(state='visible', timeout=25000)
            page.locator('#mark-race').click()
            timestamp = page.locator('#race-splits li').inner_text()
            page.reload()
            assert page.locator('#race-splits li').inner_text() == timestamp
            page.locator('#mark-race').click()
            page.evaluate('document.activeElement.blur()')
            page.screenshot(path='/tmp/lane50-simple-stopwatch.png', full_page=True)
            page.locator('#finish-race').click()
            assert 'recovered' in page.locator('#result-heading').inner_text()
            context.set_offline(False)
            page.goto(base + 'race-tools.html')
            assert page.locator('.race-record').count() == 5
            assert 'undefined' not in page.locator('main').inner_text()
            assert not errors, errors
            browser.close()
            print('PASS five-second preparation, audio start, lap timestamps, fixed circle/buttons, four-row scroll, finish, reset, recovery, history, offline routes')
    finally:
        server.shutdown()


if __name__ == '__main__':
    run()
