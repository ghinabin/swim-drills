"""Sequential week unlocking and preview regression tests."""
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from pathlib import Path
from playwright.sync_api import sync_playwright
from navigation import QuietHandler, ROOT
import tempfile

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    base='http://127.0.0.1:'+str(server.server_port)+'/'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(channel='chrome',headless=True)
            context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
            page=context.new_page()
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            def check(ok,label):
                assert ok,label
                print('PASS '+label,flush=True)
            def visit(url):
                page.goto(base+url)
                page.locator('main h1').wait_for()
            visit('plan.html')
            check(page.locator('#week-1 .week-access').inner_text()=='Unlocked','Week 1 starts unlocked')
            for wi in [2,3,4]:
                check('Locked' in page.locator('#week-'+str(wi)+' .week-access').inner_text(),'Week '+str(wi)+' starts locked')
            page.locator('#week-2 summary').click()
            check(page.locator('#day-w2d0').is_visible(),'Locked week expands to show sessions')
            page.locator('#day-w2d0').click()
            check(page.locator('#week-lock').is_visible() and page.locator('#set-0 .set-description').is_visible(),'Locked session content stays readable')
            before=page.evaluate('localStorage.getItem("swim:nsa2026:v2")')
            # Explicit DOM dispatch also cannot bypass the mutation guard.
            page.locator('#set-0').evaluate('(el)=>el.click()')
            page.locator('#set-0').focus()
            page.keyboard.press('Space')
            page.locator('#complete-all').evaluate('(el)=>el.dispatchEvent(new MouseEvent("click"))')
            check(page.evaluate('localStorage.getItem("swim:nsa2026:v2")')==before,'Locked mouse, keyboard, and bulk actions do not change progress')
            check(page.locator('#set-0').get_attribute('aria-disabled')=='true' and page.locator('#complete-all').is_disabled(),'Locked actions expose disabled state')
            page.locator('.dock-next').click()
            page.wait_for_url('**id=w1d0*')
            check(page.locator('#complete-all').is_enabled(),'Continue action opens unfinished prerequisite')
            visit('session.html?id=w4d0')
            check('Week 1' in page.locator('#week-lock-description').inner_text(),'Direct links cannot skip prerequisites')
            # A partial last day is insufficient; completing its last set unlocks week 2.
            for di in range(6):
                visit('session.html?id=w1d'+str(di))
                page.locator('#complete-all').click()
            visit('session.html?id=w1d6')
            sets=page.locator('[data-set]').count()
            for i in range(sets-1):
                page.locator('#set-'+str(i)).click()
            check(not page.evaluate('weekUnlocked(1)'),'Partial week does not unlock next week')
            page.locator('#set-'+str(sets-1)).click()
            check(page.evaluate('weekUnlocked(1)') and not page.evaluate('weekUnlocked(2)'),'Final required set unlocks only next week')
            check('Week 2 unlocked' in page.locator('#toast').inner_text(),'Unlock announced at completion')
            check(page.locator('#next-week-link').is_visible(),'Completion provides next week link')
            check('locked' not in page.locator('#choose-day option[value="w2d0"]').inner_text(),'Day selector updates after unlock')
            visit('session.html?id=w2d0')
            check(page.locator('#complete-all').is_enabled(),'Week 2 accepts tracking after reload')
            page.locator('#set-0').click()
            saved=page.evaluate('JSON.parse(localStorage.getItem("swim:nsa2026:v2")).done.w2d0')
            # Undoing a prerequisite relocks a currently open page in another tab.
            other=context.new_page()
            other.goto(base+'session.html?id=w1d0')
            other.locator('#set-0').click()
            page.wait_for_function('document.getElementById("complete-all").disabled')
            check(page.locator('#week-lock').is_visible(),'Cross-tab prerequisite undo relocks tracking')
            check(page.evaluate('JSON.parse(localStorage.getItem("swim:nsa2026:v2")).done.w2d0')==saved,'Relocking retains existing later-week progress')
            other.locator('#set-0').click()
            page.wait_for_function('!document.getElementById("complete-all").disabled')
            check(page.locator('#set-0').get_attribute('aria-pressed')=='true','Restoring prerequisite unlocks saved progress')
            other.close()
            # Finish each later week through real session controls, including recovery.
            for wi in [2,3]:
                for di in range(7):
                    visit('session.html?id=w'+str(wi)+'d'+str(di))
                    if page.locator('#complete-all').inner_text()!='Uncheck all sets':
                        page.locator('#complete-all').click()
                check(page.evaluate('weekUnlocked('+str(wi)+')'),'Completing Week '+str(wi)+' unlocks Week '+str(wi+1))
            visit('session.html?id=w4d0')
            check(page.locator('#complete-all').is_enabled(),'Week 4 tracking available after prior weeks')
            visit('progress.html')
            page.locator('#progress-options summary').click()
            page.locator('#reset-progress').click()
            page.locator('#confirm-reset').click()
            visit('session.html?id=w2d0')
            check(page.locator('#complete-all').is_disabled(),'Reset returns later weeks to preview')
            # Saved out-of-order legacy progress cannot bypass an unfinished earlier week.
            page.evaluate('''() => {const done={};DAYS.filter(d=>d.wi===1).forEach(d=>{done[d.id]={};d.blocks.forEach((_,i)=>done[d.id]['b'+i]=1)});localStorage.setItem('swim:nsa2026:v2',JSON.stringify({done}));}''')
            visit('session.html?id=w3d0')
            check(page.locator('#complete-all').is_disabled() and 'Week 1' in page.locator('#week-lock-description').inner_text(),'All earlier weeks are required, including with legacy checks')
            check(not errors,'No browser errors in unlock flow')
            page.screenshot(path=str(Path(tempfile.gettempdir())/'lane50-locked-preview.png'),full_page=True)
            browser.close()
    finally:
        server.shutdown()

if __name__=='__main__':
    run()
