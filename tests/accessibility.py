"""Run with: python tests/accessibility.py --axe PATH_TO_AXE_MIN_JS"""
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer
from playwright.sync_api import sync_playwright
from navigation import QuietHandler, ROOT
import argparse
import tempfile

def run(axe_path):
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:' + str(server.server_port) + '/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel='chrome', headless=True)
            page = browser.new_page(viewport={'width':390,'height':844}, reduced_motion='reduce')
            violations=[]
            def audit(label):
                page.add_script_tag(path=str(axe_path))
                result=page.evaluate('async () => (await axe.run(document, {runOnly: {type: "tag", values: ["wcag2a","wcag2aa","wcag21aa","best-practice"]}})).violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.map(n => ({target:n.target,summary:n.failureSummary}))}))')
                if result:
                    violations.append((label,result))
                    print('FAIL '+label+' '+str(result),flush=True)
                else:
                    print('PASS axe '+label,flush=True)
            for width in [390,1440]:
                page.set_viewport_size({'width':width,'height':900})
                for url in ['index.html','plan.html','session.html?id=w1d0','session.html?id=w2d0','session.html?id=w4d2','drills.html','progress.html']:
                    page.goto(base+url)
                    audit(str(width)+' '+url)
                page.locator('#progress-options summary').click()
                page.locator('#reset-progress').click()
                audit(str(width)+' reset confirmation')
                assert page.locator('#cancel-reset').evaluate('(el)=>document.activeElement===el')
                page.locator('#cancel-reset').click()
                assert page.locator('#reset-progress').evaluate('(el)=>document.activeElement===el')
                page.goto(base+'session.html?id=w1d0')
                page.locator('[data-open-timer]:visible').first.click()
                audit(str(width)+' timer dialog')
                for _ in range(12):
                    page.keyboard.press('Tab')
                    assert page.evaluate('!!document.activeElement.closest("#timer-sheet")'), 'Focus escaped dialog'
                page.keyboard.press('Escape')
                page.wait_for_timeout(100)
                assert not page.locator('#timer-sheet').evaluate('(el)=>el.open')
            # Keyboard operates the same controls as touch; feedback is outside hidden tools.
            page.set_viewport_size({'width':390,'height':844})
            page.goto(base+'session.html?id=w1d0')
            page.locator('#set-0').focus()
            page.keyboard.press('Space')
            assert page.locator('#set-0').get_attribute('aria-pressed')=='true'
            assert page.locator('#session-announcement').inner_text()=='1 of 6 complete'
            assert page.locator('#session-announcement').evaluate('(el)=>getComputedStyle(el).display!=="none" && !el.closest("[aria-hidden=true]")')
            name=page.locator('#set-0').aria_snapshot()
            assert 'Warm-up' in name and 'pressed' in name
            print('PASS keyboard set toggle and accessible progress announcement',flush=True)
            page.locator('.dock-timer').click()
            page.locator('#timer-toggle').click()
            page.evaluate('Date.now = () => 9999999999999')
            page.wait_for_timeout(300)
            assert 'Rest finished' in page.locator('#timer-status').inner_text()
            print('PASS timer completion is announced inside dialog',flush=True)
            page.keyboard.press('Escape')
            page.wait_for_timeout(100)
            # The destructive action has a cancel path and does not expire.
            page.goto(base+'progress.html')
            page.locator('#progress-options summary').click()
            page.locator('#reset-progress').click()
            page.wait_for_timeout(5100)
            assert page.locator('#reset-confirmation').is_visible()
            page.locator('#confirm-reset').click()
            assert page.evaluate('Object.keys(JSON.parse(localStorage.getItem("swim:nsa2026:v2")).done).length===0')
            print('PASS untimed reset confirmation and cancel focus',flush=True)
            for url in ['index.html','plan.html','session.html?id=w1d0','session.html?id=w2d0','session.html?id=w4d2','drills.html','progress.html']:
                page.goto(base+url)
                page.evaluate('''() => {const entries=Array.from(document.querySelectorAll('body *')).map(el=>[el,parseFloat(getComputedStyle(el).fontSize)]);entries.forEach(([el,size])=>el.style.fontSize=(size*2)+'px');}''')
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'Enlarged text overflow: '+url
                print('PASS 200% text reflow '+url,flush=True)
            page.goto(base+'session.html?id=w1d0')
            page.emulate_media(forced_colors='active')
            page.locator('#set-0').focus()
            assert page.locator('#set-0').evaluate('(el)=>parseFloat(getComputedStyle(el).outlineWidth)>=3')
            print('PASS forced-colors focus indicator',flush=True)
            page.emulate_media(forced_colors='none')
            page.screenshot(path=str(Path(tempfile.gettempdir())/'lane50-lean-session.png'),full_page=True)
            page.goto(base+'index.html')
            page.screenshot(path=str(Path(tempfile.gettempdir())/'lane50-lean-overview.png'),full_page=True)
            browser.close()
            assert not violations, str(violations)
    finally:
        server.shutdown()

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--axe',type=Path,required=True)
    run(parser.parse_args().axe)
