"""Poolside persistence, backup, failure handling and mobile checks."""
from datetime import datetime
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REVISION = json.loads((ROOT / 'data/competition-plan.json').read_text(encoding='utf-8'))['revision']
PREFIX = f'lane50:{REVISION}:'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel='chrome', headless=True)
            context = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Asia/Kathmandu', reduced_motion='reduce', accept_downloads=True)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.clock.install(time=datetime.fromisoformat('2026-10-05T08:00:00+05:45'))

            def visit(route):
                page.goto(base + route)
                page.locator('#data-open').wait_for()

            def close_dialog(dialog_id):
                page.locator(f'#{dialog_id} [data-close-dialog]').click()
                page.wait_for_function('(id) => !document.getElementById(id).open', arg=dialog_id)

            visit('session.html?id=2026-10-05')
            assert 'Max test + broken 100' in page.locator('h1').inner_text()
            page.locator('[data-done="s1"]').click()
            page.reload()
            assert page.locator('[data-done="s1"]').get_attribute('aria-pressed') == 'true'

            page.locator('[data-rest-choice="s4"]').click()
            assert page.locator('#set-rest-options legend').all_inner_texts() == ['Between 25s', 'After the set']
            page.locator('[data-set-duration="10"]').click()
            assert page.locator('#timer-clock').inner_text() == '0:10'
            page.locator('#timer-toggle').click()
            page.clock.fast_forward(11000)
            assert page.locator('#timer-status').inner_text() == 'Rest complete'
            close_dialog('rest-dialog')

            page.locator('[name=p25]').fill('18.00')
            page.locator('[name=p50]').fill('38.00')
            page.locator('[name=stroke25]').fill('nine')
            assert 'whole-number stroke count' in page.locator('#record-message-50').inner_text()
            page.locator('[name=stroke25]').fill('9')
            page.locator('[name=stroke50]').fill('11')
            assert page.locator('#record-message-50').inner_text() == 'Recorded on this device.'

            page.evaluate('() => { window.originalSet = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw new Error("quota") }; }')
            page.locator('[data-done="s2"]').click()
            assert page.locator('#save-warning').is_visible()
            page.evaluate('() => { Storage.prototype.setItem = window.originalSet; }')
            page.locator('#save-retry').click()
            assert page.locator('#save-warning').is_hidden()

            page.locator('#data-open').click()
            with page.expect_download() as info:
                page.locator('#export-backup').click()
            backup = json.loads(Path(info.value.path()).read_text(encoding='utf-8'))
            assert backup['planRevision'] == REVISION
            assert 'rehearsal:50' in backup['records']
            assert 'rehearsal:100' not in backup['records']
            assert 'timer' not in backup['records']
            close_dialog('data-dialog')

            for width, height in [(320, 640), (390, 844), (667, 375), (1440, 1000)]:
                page.set_viewport_size({'width': width, 'height': height})
                for route in ['index.html', 'plan.html', 'session.html?id=2026-10-05', 'race.html?event=50', 'race.html?view=results']:
                    visit(route)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, route)

            visit('index.html')
            page.evaluate('navigator.serviceWorker.ready')
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
            visit('session.html?id=2026-10-11')
            assert 'Pre-race activation' in page.locator('h1').inner_text()
            visit('race.html')
            assert '50 m breaststroke' in page.locator('main').inner_text()
            context.set_offline(False)
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()


if __name__ == '__main__':
    run()
    print('PASS: breaststroke persistence, timer, validation, backup, offline and layouts')
