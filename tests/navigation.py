"""Browser regression checks. Run: python tests/navigation.py (requires Playwright and Chrome)."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright
import tempfile

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:' + str(server.server_port) + '/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel='chrome', headless=True)
            context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            def check(condition, label):
                assert condition, label
                print('PASS ' + label, flush=True)
            def visit(url):
                page.goto(base + url)
                page.locator('main h1').wait_for()
                page.wait_for_timeout(100)
            def click_session(selector):
                page.locator(selector).click()
                page.wait_for_url('**/session.html?*')
                page.locator('.session-dock').wait_for(state='attached')
            def back_to(url):
                page.locator('.context-back').click()
                page.wait_for_url('**/' + url + '*')
                page.wait_for_timeout(200)
            # Enter far down an expanded plan, change days, and return once.
            visit('plan.html')
            page.locator('[href="#week-3"]').click()
            page.locator('#day-w3d4').scroll_into_view_if_needed()
            y = page.evaluate('scrollY')
            click_session('#day-w3d4')
            check(page.locator('.context-back').inner_text().strip() == 'Training plan', 'Contextual return to plan')
            page.locator('#choose-day').select_option('w3d5')
            check('id=w3d4' in page.url, 'Day selection does not navigate automatically')
            page.locator('#view-day').click()
            page.wait_for_url('**id=w3d5*')
            page.locator('#choose-day').select_option('w3d6')
            page.locator('#view-day').click()
            page.wait_for_url('**id=w3d6*')
            back_to('plan.html')
            check(page.locator('#week-3').get_attribute('open') is not None, 'Expanded week restored')
            check(abs(page.evaluate('scrollY') - y) < 4, 'Exact plan scroll restored after switching sessions')
            check(page.evaluate('document.activeElement.id') == 'day-w3d4', 'Keyboard focus returns to entered session')
            # Browser Back uses the same restoration path.
            click_session('#day-w3d4')
            page.go_back()
            page.wait_for_timeout(200)
            check('plan.html' in page.url and abs(page.evaluate('scrollY') - y) < 4, 'Native browser Back preserves plan position')
            # Library is another real parent, including search and expanded drill.
            visit('drills.html')
            page.locator('#drill-search').fill('fist')
            page.locator('#drill-filter').select_option('tech')
            detail = page.locator('#drill-results details').first
            detail.locator('summary').click()
            drill_id = detail.get_attribute('id')
            detail.locator('.drill-session-link').scroll_into_view_if_needed()
            library_y = page.evaluate('scrollY')
            click_session('#' + drill_id + ' .drill-session-link')
            check(page.locator('.context-back').inner_text().strip() == 'Drill library', 'Session remembers library origin')
            back_to('drills.html')
            check(page.locator('#drill-search').input_value() == 'fist' and page.locator('#drill-filter').input_value() == 'tech', 'Library query and focus restored')
            check(page.locator('#' + drill_id).get_attribute('open') is not None, 'Expanded drill restored')
            check(abs(page.evaluate('scrollY') - library_y) < 4, 'Library scroll restored')
            # Overview also returns to its own position rather than the plan.
            visit('index.html')
            page.locator('.hero .button').click()
            page.wait_for_url('**/session.html?*')
            check(page.locator('.context-back').inner_text().strip() == 'Overview', 'Session remembers overview origin')
            back_to('index.html')
            # A direct link has a safe, useful fallback.
            visit('session.html?id=w4d4')
            back_to('plan.html')
            check(page.locator('#week-4').get_attribute('open') is not None, 'Direct session returns to its expanded week')
            rect = page.locator('#day-w4d4').bounding_box()
            header_bottom = page.locator('.week-jump').bounding_box()
            check(rect['y'] >= header_bottom['y'] + header_bottom['height'], 'Anchor is below sticky navigation')
            # Poolside controls do not move checked cards; next-set action is explicit.
            visit('session.html?id=w1d0')
            page.locator('.dock-next').click()
            page.wait_for_timeout(100)
            first = page.locator('#set-0').bounding_box()
            check(first['y'] >= page.locator('.site-header').bounding_box()['height'], 'Next set stays below header')
            before = page.evaluate('scrollY')
            page.locator('#set-0').click()
            check(abs(page.evaluate('scrollY') - before) < 4, 'Checking a set does not jump the page')
            page.locator('.dock-next').click()
            check(page.evaluate('document.activeElement.id') == 'set-1', 'Next unfinished set receives focus')
            # Modal traps focus, locks background, closes on Back/Escape, preserves scroll.
            before = page.evaluate('scrollY')
            page.locator('.dock-timer').click()
            check(page.locator('#timer-sheet').evaluate('(el) => el.open'), 'Timer opens as native dialog')
            check(page.locator('body').evaluate('(el) => getComputedStyle(el).overflow') == 'hidden', 'Background scroll locked while timer is open')
            page.locator('[data-seconds="60"]').click()
            page.locator('#timer-toggle').click()
            page.wait_for_timeout(1100)
            check(page.locator('#timer').inner_text() == '00:59', 'Rest timer runs')
            page.go_back()
            page.wait_for_timeout(150)
            check('session.html' in page.url and not page.locator('#timer-sheet').evaluate('(el) => el.open'), 'Browser Back dismisses timer without leaving session')
            check(abs(page.evaluate('scrollY') - before) < 4, 'Closing timer preserves workout position')
            check(page.locator('.dock-timer').evaluate('(el) => el === document.activeElement'), 'Timer close restores trigger focus')
            page.wait_for_timeout(1100)
            check(page.locator('.dock-timer [data-timer-preview]').inner_text() < '00:59', 'Timer continues while sheet is closed')
            page.go_forward()
            page.wait_for_timeout(100)
            check(page.locator('#timer-sheet').evaluate('(el) => el.open'), 'Browser Forward reopens timer')
            page.reload()
            page.wait_for_timeout(150)
            check(page.locator('#timer-sheet').evaluate('(el) => el.open'), 'Reload restores open timer sheet')
            page.keyboard.press('Escape')
            page.wait_for_timeout(150)
            check(not page.locator('#timer-sheet').evaluate('(el) => el.open'), 'Escape closes timer')
            page.reload()
            check(page.locator('#set-0').get_attribute('aria-pressed') == 'true', 'Set persists through reload')
            # Complete + progress parent return.
            page.locator('#complete-all').click()
            visit('progress.html')
            click_session('#day-w1d0')
            check(page.locator('.context-back').inner_text().strip() == 'Progress', 'Session remembers progress origin')
            back_to('progress.html')
            # All page sizes, including short landscape, with no hidden final actions.
            for width, height in [(320, 640), (390, 844), (667, 375), (768, 900), (1440, 1000)]:
                page.set_viewport_size({'width': width, 'height': height})
                for url in ['index.html', 'plan.html', 'session.html?id=w1d0', 'drills.html', 'progress.html']:
                    visit(url)
                    check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), str(width) + 'x' + str(height) + ' ' + url + ' no horizontal overflow')
                    if 'session' not in url and width <= 760:
                        nav = page.locator('.navigation').bounding_box()
                        check(abs(nav['y'] + nav['height'] - height) < 2, 'Mobile navigation remains at bottom')
                    if 'session' in url:
                        page.evaluate('scrollTo(0,document.documentElement.scrollHeight)')
                        rect = page.locator('.session-pager').bounding_box()
                        dock = page.locator('.session-dock').bounding_box()
                        check(rect['y'] + rect['height'] <= (dock['y'] if dock else height) + 1, 'Last session links clear fixed controls')
            check(not errors, 'No browser JavaScript errors')
            page.set_viewport_size({'width': 390, 'height': 844})
            visit('session.html?id=w1d1')
            page.screenshot(path=str(Path(tempfile.gettempdir()) / 'lane50-session-navigation.png'), full_page=True)
            page.locator('.dock-timer').click()
            page.screenshot(path=str(Path(tempfile.gettempdir()) / 'lane50-timer-sheet.png'))
            touch = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
            mobile = touch.new_page()
            mobile.goto(base + 'session.html?id=w1d0')
            mobile.locator('.dock-next').tap()
            mobile.locator('#set-0').tap()
            check(mobile.locator('#set-0').get_attribute('aria-pressed') == 'true', 'Touch tap completes a set')
            mobile.locator('.dock-timer').tap()
            mobile.locator('[data-close-dialog]').tap()
            mobile.wait_for_timeout(150)
            check(not mobile.locator('#timer-sheet').evaluate('(el) => el.open'), 'Touch close dismisses timer')
            browser.close()
    finally:
        server.shutdown()

if __name__ == '__main__':
    run()
