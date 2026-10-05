"""Final taper poolside: rest contexts, save recovery, migration and offline updates."""
from datetime import datetime
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
PLAN=json.loads((ROOT/'data/competition-plan.json').read_text());REVISION=PLAN['revision']
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_):pass
    def do_GET(self):
        if self.path.split('?')[0]=='/sw.js':
            source=(ROOT/'sw.js').read_text()
            if getattr(self.server,'next_release',False):source=source.replace('v36-compact-checklist','v37-test-update')
            body=source.encode();self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
        else:super().do_GET()

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/'
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(viewport={'width':390,'height':844},timezone_id='Asia/Kathmandu',reduced_motion='reduce',accept_downloads=True)
        page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.clock.install(time=datetime.fromisoformat('2026-10-05T08:00:00+05:45'))
        def visit(path):page.goto(base+path)
        def close(id):
            page.locator('#'+id+' [data-close-dialog]').click();page.wait_for_function('(id)=>!document.getElementById(id).open',arg=id)
        visit('index.html')
        # Carry official logistics/results forward; preserve old workout checks separately.
        old=PLAN['previousRevision']
        page.evaluate('(old)=>localStorage.setItem("lane50:"+old+":records",JSON.stringify({version:1,records:{"session:2026-10-05":{s1:"done"},"race:50":{heat:"3",result:"35.40"},"rehearsal:50":{p25:"16",p50:"35"}}}))',old)
        visit('session.html?id=2026-10-05')
        assert page.locator('[data-done][aria-checked=true]').count()==0
        assert page.locator('#timer-quick-toggle').inner_text()=='Choose'
        assert page.locator('#timer-preview').inner_text()=='—:—'
        page.evaluate('Object.defineProperty(navigator,"wakeLock",{configurable:true,value:undefined})')
        page.locator('#phase-switch summary').click();page.locator('#keep-screen').click()
        assert 'Not supported' in page.locator('#screen-state').inner_text()
        assert page.locator('#keep-screen').get_attribute('aria-pressed')=='false'
        page.locator('#phase-switch summary').click()
        page.locator('[data-done]').first.click()
        assert page.evaluate('(old)=>localStorage.getItem("lane50:"+old+":records")!==null',old)
        visit('race.html?event=50')
        assert page.locator('[data-logistics="heat"]').input_value()=='3'
        assert page.locator('#official-result').input_value()=='35.40'
        visit('session.html?id=2026-10-08')
        page.locator('#timer-dock').click();page.locator('#rest-source').select_option('am-5')
        assert page.locator('#set-rest-options legend').all_inner_texts()==['Between the two 25s','Before broken 50 #2']
        page.locator('[data-set-duration="25"]').click()
        assert page.locator('#timer-clock').inner_text()=='0:25'
        assert page.locator('#timer-status').inner_text()=='Ready'
        page.locator('#timer-toggle').click();page.clock.fast_forward(5000)
        assert page.locator('#timer-clock').inner_text()=='0:20'
        page.locator('#timer-toggle').click();page.clock.fast_forward(5000)
        assert page.locator('#timer-clock').inner_text()=='0:20'
        close('rest-dialog');page.reload()
        assert page.locator('#timer-preview').inner_text()=='0:20'
        assert page.locator('#timer-quick-toggle').inner_text()=='Resume'
        page.locator('#timer-dock').click();page.locator('#rest-source').select_option('am-5');page.locator('[data-set-duration="270"]').click()
        assert page.locator('#timer-clock').inner_text()=='4:30'
        close('rest-dialog')
        page.locator('#timer-dock').click();page.locator('#rest-source').select_option('am-8')
        assert 'full recovery' in page.locator('#set-rest-options').inner_text().lower()
        assert page.locator('[data-set-duration]').count()==0 # no invented full-recovery duration
        page.locator('#rest-source').select_option('block')
        assert page.locator('#set-rest-options legend').inner_text()=='Between different drill blocks'
        page.locator('[data-set-duration="45"]').click();close('rest-dialog')
        assert page.locator('#timer-preview').inner_text()=='0:45'
        # Checking a drill never starts or changes a rest timer.
        page.locator('[data-done]').nth(1).click()
        assert page.locator('#timer-preview').inner_text()=='0:45'
        assert page.locator('#timer-quick-toggle').inner_text()=='Start'
        page.locator('[data-done]').nth(1).click()
        # The footer starts/pauses, while scrolling does not check a card.
        page.locator('#timer-quick-toggle').click();page.clock.fast_forward(5000)
        assert page.locator('#timer-preview').inner_text()=='0:40'
        page.locator('[data-done]').nth(1).scroll_into_view_if_needed()
        assert page.locator('[data-done][aria-checked=true]').count()==0
        page.locator('#timer-quick-toggle').click()
        # Failed writes remain checked in memory, with a visible Retry only on failure.
        assert page.locator('#save-warning').is_hidden()
        assert page.locator('#data-open,[data-offline-status]').count()==0
        page.evaluate('()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error("quota")};}')
        page.locator('[data-done]').first.click();assert page.locator('#save-warning').is_visible()
        assert page.locator('[data-done][aria-checked=true]').count()==1
        assert page.evaluate('LaneStorage.get("session:2026-10-08")["am-1"]')=='done'
        page.evaluate('()=>{Storage.prototype.setItem=window.originalSet;}');page.locator('#save-retry').click();assert page.locator('#save-warning').is_hidden()
        page.reload();assert page.locator('[data-done][aria-checked=true]').count()==1
        visit('session.html?id=2026-10-08&phase=pm')
        assert 'If tired: skip PM' in page.locator('.phase-note').inner_text()
        assert page.locator('[data-done][aria-checked=true]').count()==0
        page.locator('[data-done]').first.click();page.reload()
        assert page.locator('[data-done][aria-checked=true]').count()==1
        page.locator('[data-done]').first.click();page.reload()
        assert page.locator('[data-done][aria-checked=true]').count()==0
        # Historical skips remain stored, but do not mark new checkboxes completed.
        page.evaluate('LaneStorage.save("session:2026-10-08:pm",{"pm-1":"skipped"})');page.reload()
        assert page.locator('[data-done][aria-checked=true]').count()==0
        assert page.locator('#next-set').get_attribute('href')=='#set-pm-1'
        page.locator('[data-done]').first.click();page.reload()
        assert page.locator('[data-done][aria-checked=true]').count()==1
        visit('session.html?id=2026-10-08');assert page.locator('[data-done][aria-checked=true]').count()==1
        # Save recovery, results and reporting remain usable on new race content.
        visit('race.html?event=100');page.locator('#official-result').fill('1:14.20');page.reload();assert page.locator('#official-result').input_value()=='1:14.20'
        assert 'HOLD FORM' in page.locator('#race-cues').inner_text()
        assert page.locator('#timer-footer').is_hidden()
        # Cache the coherent release and verify offline AM, PM and race content.
        page.wait_for_function('navigator.serviceWorker.controller!==null')
        context.set_offline(True)
        for path in ['session.html?id=2026-10-05','session.html?id=2026-10-08&phase=pm','race.html?event=50','tempo.html']:
            visit(path);assert page.locator('h1').count()==1
        context.set_offline(False)
        visit('session.html?id=2026-10-08');server.next_release=True
        page.evaluate('async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()}')
        page.wait_for_function('async()=>!!(await navigator.serviceWorker.getRegistration()).waiting')
        page.locator('#phase-switch summary').click()
        page.locator('#app-update').wait_for(state='visible')
        assert page.locator('[data-done][aria-checked=true]').count()==1
        page.locator('#app-update').click()
        page.wait_for_function('async()=>(await caches.keys()).includes("lane50-shell-v37-test-update")&&!(await navigator.serviceWorker.getRegistration()).waiting')
        assert not errors,errors
        browser.close()
    finally:server.shutdown()
    print('PASS replacement-plan migration, AM/PM isolation, broken-set and block rests, timer pause/reload, tap completion, failed saves/retry, official results and offline updates')
if __name__=='__main__':run()
