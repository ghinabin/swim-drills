"""Latest dated plan, history migration, logs, optional rest and offline access."""
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
            def visit(route):
                page.goto(base+route)
                page.locator('main h1').wait_for()
            def check(ok,label):
                assert ok,label
                print('PASS '+label,flush=True)
            visit('plan.html')
            check(page.locator('.week-access').all_text_contents()==['Scheduled']*4,'No week locks')
            check(page.locator('#day-race').count()==1 and page.locator('#day-race2').count()==1,'Both race dates on plan')
            visit('session.html?id=w4d0')
            page.locator('#set-0').click()
            page.reload()
            check(page.locator('#set-0').get_attribute('aria-pressed')=='true','Later weeks track without prerequisites')
            # Old checks must remain records of the old prescription only.
            page.evaluate('''() => localStorage.setItem('swim:nsa2026:v2',JSON.stringify({sequenceVersion:1,done:{w1d0:{b0:1},w1d4:{b3:1},w4d1:{b2:1}}}))''')
            visit('session.html?id=w1d4')
            check(page.locator('[data-set][aria-pressed="true"]').count()==0,'Replaced set does not inherit a check')
            page.locator('#set-0').click()
            page.reload()
            check(page.evaluate('JSON.parse(localStorage.getItem("swim:nsa2026:v2")).archived.length')==2,'Previous checks archived and persisted')
            visit('session.html?id=w1d0')
            check(page.locator('#set-0').get_attribute('aria-pressed')=='true','Historical check retained')
            page.locator('#set-0').evaluate('(el)=>el.click()')
            check(page.locator('#set-0').get_attribute('aria-pressed')=='true' and page.locator('#complete-all').is_disabled(),'Historical records read only')
            visit('progress.html')
            page.locator('#previous-progress > summary').click()
            check(page.locator('#archive-0').count()==1,'Archived prescriptions available in Progress')
            visit('session.html?id=w2d4')
            detail=page.locator('#set-details-4')
            check(not detail.evaluate('(el)=>el.open'),'Race details collapsed')
            detail.locator('summary').focus()
            page.keyboard.press('Enter')
            check(detail.evaluate('(el)=>el.open') and page.locator('#set-4').get_attribute('aria-pressed')=='false','Keyboard More does not check a set')
            page.keyboard.press('Space')
            check(not detail.evaluate('(el)=>el.open'),'Keyboard Less collapses')
            page.locator('[data-open-timer]').click()
            page.locator('[data-seconds="20"]').click()
            check(page.locator('#timer').inner_text()=='00:20','Broken-50 pause available in timer')
            page.locator('#timer-sheet [data-close-dialog]').click()
            page.locator('#session-log > summary').click()
            for name,value in [('meters','600'),('effort','4'),('cue','Breathe comfortably'),('pool','25'),('start','push'),('split','16'),('time','35')]:
                page.locator('[name="'+name+'"]').fill(value)
            page.locator('#log-form button[type="submit"]').click()
            check(page.locator('#log-status').inner_text()=='Log saved. Second 25: 19.00 s.','Quick log saved')
            page.reload()
            page.locator('#session-log > summary').click() if not page.locator('#session-log').evaluate('(el)=>el.open') else None
            check(page.locator('[name="meters"]').input_value()=='600','Log survives reload')
            page.locator('[name="split"]').fill('40')
            page.locator('#log-form button[type="submit"]').click()
            check('must not exceed' in page.locator('#log-status').inner_text(),'Invalid split rejected')
            visit('progress.html')
            check('0.6' in page.locator('.stats').inner_text(),'Progress uses actual metres')
            visit('session.html?id=w4d6')
            page.locator('#choose-rest').click()
            page.reload()
            check(page.locator('#dock-count').inner_text()=='Rest chosen','Optional rest persists')
            check(page.locator('[data-set][aria-pressed="true"]').count()==0,'Rest does not mark swimming complete')
            page.locator('#set-0').click()
            check(page.locator('#choose-rest').inner_text()=='Choose rest instead','Resuming swim clears rest choice')
            for day in ['w1d5','w2d5','w3d5','w4d5']:
                visit('session.html?id='+day)
                check(page.locator('[data-set]').count()==1 and page.locator('[data-open-timer]').count()==0,day+' Saturday is rest')
            visit('drills.html')
            for phrase in ['underwater','vertical dolphin','14.5']:
                page.locator('#drill-search').fill(phrase)
                check(page.locator('#drill-results > details').count()==0,'Historical '+phrase+' excluded from library')
            for width in [320,390,1280]:
                page.set_viewport_size({'width':width,'height':900})
                for route in ['index.html','plan.html','session.html?id=w2d4','session.html?id=race2','progress.html','drills.html','race.html','race-tools.html']:
                    visit(route)
                    check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'),str(width)+'px '+route)
            # Check every session renders with the imported set count.
            visit('plan.html')
            days=page.evaluate('DAYS.map(d=>({id:d.id,count:d.blocks.length}))')
            for day in days:
                visit('session.html?id='+day['id'])
                assert page.locator('[data-set]').count()==day['count'],day['id']
            print('PASS all 30 daily sessions render',flush=True)
            page.evaluate('navigator.serviceWorker.ready')
            page.reload()
            context.set_offline(True)
            visit('session.html?id=race2')
            check('13 Oct' in page.locator('.context-title').inner_text(),'October 13 works offline')
            page.locator('#plan-guidance > summary').click()
            with page.expect_download() as download:
                page.locator('[download]').click()
            check('Saturdays are reserved for family/rest' in Path(download.value.path()).read_text(),'Written plan downloads offline')
            context.set_offline(False)
            visit('progress.html')
            page.locator('#progress-options > summary').click()
            with page.expect_download() as exported:
                page.locator('#export-progress').click()
            import json
            backup=json.loads(Path(exported.value.path()).read_text())
            check(len(backup['archived'])==2 and backup['logs']['w2d4']['meters']==600,'Export includes previous checks and current logs')
            page.locator('#reset-progress').click()
            page.locator('#confirm-reset').click()
            check(page.evaluate('Object.keys(JSON.parse(localStorage.getItem("swim:nsa2026:v2")).logs).length')==0,'Reset clears logs')
            visit('session.html?id=w4d0')
            check(page.locator('#complete-all').is_enabled(),'Reset never locks the calendar')
            check(not errors,'No browser errors')
            page.set_viewport_size({'width':390,'height':844})
            visit('session.html?id=w2d4')
            page.locator('#set-4').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'lane50-updated-plan.png'))
            browser.close()
    finally:
        server.shutdown()

if __name__=='__main__':
    run()
