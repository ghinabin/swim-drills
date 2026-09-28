"""Contract and browser checks for the breaststroke-only competition plan."""
from datetime import datetime
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json
import subprocess

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def run():
    subprocess.run(['node', 'scripts/import-plan.cjs'], cwd=ROOT, check=True)
    data = json.loads((ROOT / 'data/competition-plan.json').read_text(encoding='utf-8'))
    assert data['revision'] == '2026-09-29-breaststroke-v1'
    assert len(data['days']) == 14
    assert [day['date'] for day in data['days'] if day['kind'] == 'Rest'] == ['2026-10-03', '2026-10-10']
    assert sum(day['total'] for day in data['days'][:7]) == 4110
    assert sum(day['total'] for day in data['days'][7:13]) == 1800
    assert [(day['date'], day.get('event')) for day in data['days'] if day['kind'] == 'Race'] == [('2026-10-12', 50)]
    assert 'freestyle' not in json.dumps(data).lower()

    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel='chrome', headless=True)
            for width in (390, 1440):
                context = browser.new_context(viewport={'width': width, 'height': 900}, timezone_id='Asia/Kathmandu', reduced_motion='reduce')
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.clock.install(time=datetime.fromisoformat('2026-09-29T08:00:00+05:45'))

                page.goto(base)
                assert page.locator('.nav-link').all_inner_texts() == ['Today', 'Plan', 'Race']
                assert '50 m breaststroke' in page.locator('.page-intro').inner_text()
                assert 'Baseline + distance per stroke' in page.locator('.prep-hero').inner_text()
                page.get_by_role('link', name='Open session').click()
                assert '850 m' in page.locator('.page-intro').inner_text()
                assert page.locator('.prep-set').count() == 5
                assert '8 × 25 m' in page.locator('#set-s1').inner_text()
                assert 'two-hand touch' in page.locator('#set-s4').inner_text()

                page.locator('[data-done="s1"]').click()
                page.locator('[data-skip="s2"]').click()
                page.reload()
                assert '1 of 5 sets done · 1 skipped' in page.locator('#completion').inner_text()
                page.locator('[data-rest-choice="s3"]').click()
                assert page.locator('#set-rest-options legend').inner_text() == 'After each 25'
                page.locator('[data-set-duration="45"]').click()
                assert page.locator('#timer-clock').inner_text() == '0:45'
                page.get_by_role('button', name='Close rest timer').click()

                page.goto(base + 'plan.html')
                assert page.locator('h1').inner_text() == 'Your breaststroke plan'
                assert page.locator('.prep-day').count() == 14
                assert 'Rest' in page.locator('#day-2026-10-03').inner_text()
                assert '50 m breaststroke competition' in page.locator('#day-2026-10-12').inner_text()
                rules = page.locator('main .prep-details').last
                rules.locator('summary').click()
                assert 'Never make up missed metres' in rules.inner_text()

                for day in data['days']:
                    route = 'race.html?event=50' if day['kind'] == 'Race' else f"session.html?id={day['id']}"
                    page.goto(base + route)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), day['date']
                    if day['kind'] != 'Rest':
                        assert page.locator('.prep-set').count() == len(day['sets'])
                        for index, swim_set in enumerate(day['sets']):
                            assert page.locator('.prep-prescription').nth(index).inner_text() == swim_set['prescription']

                page.goto(base + 'session.html?id=2026-10-05')
                page.locator('[name=p25]').fill('18.10')
                page.locator('[name=p50]').fill('38.40')
                page.locator('[name=stroke25]').fill('9')
                page.locator('[name=stroke50]').fill('11')
                assert '25–50 m: 20.30 s' in page.locator('#derived-50').inner_text()
                page.reload()
                assert page.locator('[name=stroke50]').input_value() == '11'

                page.goto(base + 'race.html?event=100')
                assert '50 m breaststroke' in page.locator('.page-intro').inner_text()
                assert '100 m' not in page.locator('.page-intro').inner_text()
                assert '400 m warm-up · 50 m race · 100 m cool-down' in page.locator('main').inner_text()
                assert 'two-hand touch' in page.locator('#race-cues').inner_text()
                page.locator('#official-result').fill('37.85')
                page.goto(base + 'race.html?view=results')
                assert page.locator('.result-card').count() == 1
                assert '50 m breaststroke' in page.locator('.result-card').inner_text()
                assert '37.85' in page.locator('.result-card').inner_text()
                assert not errors, errors
                context.close()

            final = browser.new_page(timezone_id='Asia/Kathmandu')
            final.clock.install(time=datetime.fromisoformat('2026-10-13T08:00:00+05:45'))
            final.goto(base)
            assert final.locator('h1').inner_text() == 'Plan ended'
            assert 'breaststroke race block has ended' in final.locator('main').inner_text()
            final.close()
            browser.close()
    finally:
        server.shutdown()


if __name__ == '__main__':
    run()
    print('PASS: breaststroke dates, sets, progress, timer, test log, race and layouts')
