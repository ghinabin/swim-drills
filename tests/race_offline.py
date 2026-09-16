"""Race audio timing, recovery, logs, offline routes, and mobile layout checks."""
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from navigation import QuietHandler, ROOT


def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:' + str(server.server_port) + '/'
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
            for url in ['plan.html', 'session.html?id=w1d0', 'drills.html', 'progress.html', 'race.html']:
                page.goto(base + url)
                page.locator('main h1').wait_for()
            page.goto(base + 'session.html?id=w1d0')
            page.locator('#set-0').click()
            page.reload()
            assert page.locator('#set-0').get_attribute('aria-pressed') == 'true'
            before = page.evaluate('localStorage.getItem("swim:nsa2026:v2")')
            page.goto(base + 'race.html')
            assert page.locator('#arm-race').is_enabled()
            assert page.locator('#race-clock').is_visible()
            assert page.locator('#race-setup').is_visible()
            assert page.locator('[name="finish-mode"]').count() == 0
            # Only shorten the get-ready window; exercise the real audio clock and cues.
            page.locator('#race-delay').evaluate("el => {el.add(new Option('Test', '.05')); el.value = '.05';}")
            page.locator('#arm-race').click()
            assert not page.locator('#finish-race').is_visible()
            assert page.locator('#race-setup').is_visible()
            assert page.locator('#race-stroke-trigger').is_disabled()
            page.wait_for_function('JSON.parse(localStorage.getItem("lane50:active-race")).status === "Swimming"', timeout=20000)
            page.wait_for_timeout(300)
            page.locator('#finish-race').click()
            assert page.locator('#result-copy').inner_text() == 'Saved on this device.'
            assert page.locator('#race-clock').is_visible()
            assert page.locator('#race-clock').inner_text() != '0:00.00'
            rows = page.evaluate('Object.keys(localStorage).filter(k => k.startsWith("lane50:race:")).map(k => JSON.parse(localStorage[k]))')
            assert len(rows) == 1 and 200 <= rows[0]['elapsed'] < 2000
            assert page.evaluate('localStorage.getItem("swim:nsa2026:v2")') == before
            page.locator('#another-race').click()
            page.locator('#arm-race').click()
            page.locator('#cancel-race').click()
            assert 'Start cancelled' in page.locator('#result-heading').inner_text()
            page.reload()
            assert page.locator('.race-record').count() == 2
            # Recover a persisted in-progress stopwatch after a reload.
            page.evaluate('''localStorage.setItem('lane50:active-race', JSON.stringify({id:'recovery',created:Date.now(),started:Date.now()-5000,status:'Swimming',distance:50,pool:25,stroke:'Freestyle',mode:'helper'}))''')
            page.reload()
            page.locator('#finish-race').click()
            assert 'recovered timing' in page.locator('#result-heading').inner_text()
            # Interrupted preparations never become a valid race time.
            page.evaluate('''localStorage.setItem('lane50:active-race', JSON.stringify({id:'interrupted',created:Date.now(),started:Date.now()+5000,status:'Starting',distance:50,pool:25,stroke:'Backstroke',mode:'solo'}))''')
            page.reload()
            assert 'Start interrupted' in page.locator('#result-heading').inner_text()
            page.evaluate('''localStorage.setItem('lane50:active-race', JSON.stringify({id:'solo',created:Date.now(),started:Date.now()-5000,status:'Swimming',distance:50,pool:25,stroke:'Freestyle',mode:'solo'}))''')
            page.reload()
            page.locator('#finish-race').click()
            assert page.locator('#result-heading').inner_text().endswith('Finished · recovered timing')
            assert page.evaluate('JSON.parse(localStorage.getItem("lane50:race:solo")).elapsed') >= 5000
            page.locator('#another-race').click()
            for width, height in [(320,640),(390,844),(667,375),(1440,1000)]:
                page.set_viewport_size({'width':width, 'height':height})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            page.set_viewport_size({'width':390, 'height':844})
            page.evaluate('document.activeElement.blur(); scrollTo(0, 0)')
            page.screenshot(path='/tmp/lane50-race-mobile.png', full_page=True)
            context.set_offline(False)
            page.reload()
            assert page.locator('.race-record').count() == 5
            assert not errors, errors
            print('PASS offline pages, offline progress, audio-clock start, finish, cancellation, reload recovery, unified stopwatch logging, reconnection, and responsive race layouts')
            browser.close()
    finally:
        server.shutdown()

if __name__ == '__main__':
    run()
