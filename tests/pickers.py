"""Themed dropdown selection, dismissal, history, focus, and mobile layout."""
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from navigation import QuietHandler, ROOT

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        for width in [320, 390, 768, 1440]:
            page = browser.new_page(viewport={'width': width, 'height': 844}, has_touch=width < 500)
            for route in ['race.html', 'drills.html']:
                page.goto(base + route)
                if route == 'race.html':
                    assert page.locator('#swim-options').is_hidden()
                    page.locator('#edit-swim').click()
                for trigger in page.locator('.picker-trigger').all():
                    picker_id = trigger.get_attribute('aria-controls')
                    dialog = page.locator('#' + picker_id)
                    select = page.locator('#' + picker_id.removesuffix('-picker'))
                    trigger.click()
                    assert dialog.is_visible()
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                    if width < 500:
                        bounds = dialog.bounding_box()
                        assert abs(bounds['y'] + bounds['height'] - 844) < 2
                    page.keyboard.press('Escape')
                    dialog.wait_for(state='hidden')
                    assert trigger.evaluate('e => e === document.activeElement')
                    count = select.locator('option').count()
                    for index in range(count):
                        trigger.click()
                        dialog.locator('.picker-option').nth(index).click()
                        dialog.wait_for(state='hidden')
                        page.wait_for_function('(args) => document.getElementById(args[0]).selectedIndex === args[1]', arg=[select.get_attribute('id'), index])
                        assert trigger.inner_text() == select.locator('option').nth(index).inner_text()
                    trigger.click()
                    page.keyboard.press('Home')
                    page.keyboard.press('ArrowDown')
                    page.keyboard.press('Enter')
                    dialog.wait_for(state='hidden')
                    page.wait_for_function('(id) => document.getElementById(id).selectedIndex === 1', arg=select.get_attribute('id'))
                    trigger.click()
                    page.go_back()
                    dialog.wait_for(state='hidden')
                    page.wait_for_function('(id) => document.getElementById(id).selectedIndex === 1', arg=select.get_attribute('id'))
                    page.go_forward()
                    dialog.wait_for(state='visible')
                    dialog.locator('.picker-close').click()
                    dialog.wait_for(state='hidden')
                    assert trigger.evaluate('e => e === document.activeElement')
                if route == 'drills.html':
                    assert 'focus=' in page.url
                elif width == 390:
                    page.locator('#race-stroke-trigger').click()
                    page.screenshot(path='/private/tmp/swim-themed-picker.png')
                    page.keyboard.press('Escape')
                    page.locator('#race-stroke-picker').wait_for(state='hidden')
                    assert page.locator('#swim-summary-main').inner_text() == '100 m Backstroke'
                    assert '50 m pool' in page.locator('#swim-summary-detail').inner_text()
                    page.locator('#done-swim').click()
                    assert page.locator('#swim-options').is_hidden()
                    assert page.locator('#edit-swim').get_attribute('aria-expanded') == 'false'
                    page.screenshot(path='/private/tmp/swim-disclosure-mobile.png')
                    page.locator('a[href="race-tools.html"]').click()
                    page.locator('.stopwatch-back').click()
                    assert page.locator('#swim-summary-main').inner_text() == '100 m Backstroke'
                    assert page.locator('#swim-options').is_hidden()
            page.close()
        browser.close()
    print('PASS themed options, selection, keyboard, Escape, Back/Forward, focus, filters, and responsive bottom sheets')
finally:
    server.shutdown()
