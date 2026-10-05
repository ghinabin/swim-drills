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
            if getattr(self.server,'next_release',False):source=source.replace('v34-final-taper','v35-test-update')
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
        def open_data():
            if page.locator('#phase-switch').count() and not page.locator('#phase-switch').evaluate('(e)=>e.open'):page.locator('#phase-switch summary').click()
            page.locator('#data-open').click()
        def close(id):
            page.locator('#'+id+' [data-close-dialog]').click();page.wait_for_function('(id)=>!document.getElementById(id).open',arg=id)
        visit('index.html')
        # Carry official logistics/results forward; preserve old workout checks separately.
        old=PLAN['previousRevision']
        page.evaluate('(old)=>localStorage.setItem("lane50:"+old+":records",JSON.stringify({version:1,records:{"session:2026-10-05":{s1:"done"},"race:50":{heat:"3",result:"35.40"},"rehearsal:50":{p25:"16",p50:"35"}}}))',old)
        visit('session.html?id=2026-10-05')
        assert page.locator('[data-done][aria-pressed=true]').count()==0
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
        page.locator('[data-rest-choice="am-5"]').click()
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
        page.locator('[data-rest-choice="am-5"]').click();page.locator('[data-set-duration="270"]').click()
        assert page.locator('#timer-clock').inner_text()=='4:30'
        close('rest-dialog')
        assert page.locator('#set-am-8 [data-rest-choice]').count()==0 # full recovery has no invented countdown
        page.get_by_text('Rest between drill blocks',exact=True).click();page.locator('#block-rest').click()
        assert page.locator('#set-rest-options legend').inner_text()=='Between different drill blocks'
        page.locator('[data-set-duration="45"]').click();close('rest-dialog')
        assert page.locator('#timer-preview').inner_text()=='0:45'
        # Failed writes persist in memory, warning/retry and backups.
        page.evaluate('()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error("quota")};}')
        page.locator('[data-done]').first.click();assert page.locator('#save-warning').is_visible()
        open_data()
        with page.expect_download() as download:page.locator('#export-backup').click()
        backup=json.loads(Path(download.value.path()).read_text());assert backup['records']['session:2026-10-08']['am-1']=='done'
        assert 'timer' not in backup['records'];close('data-dialog')
        page.evaluate('()=>{Storage.prototype.setItem=window.originalSet;}');page.locator('#save-retry').click();assert page.locator('#save-warning').is_hidden()
        visit('session.html?id=2026-10-08&phase=pm')
        assert 'If tired: skip PM' in page.locator('.phase-note').inner_text()
        page.locator('#skip-phase').click();assert page.locator('[data-skip][aria-pressed=true]').count()==4
        page.reload();assert page.locator('[data-skip][aria-pressed=true]').count()==4
        page.locator('#skip-phase').click();page.locator('[data-done]').first.click();page.locator('#skip-phase').click()
        assert page.locator('[data-done][aria-pressed=true]').count()==1
        assert page.locator('[data-skip][aria-pressed=true]').count()==3
        page.locator('#skip-phase').click()
        assert page.locator('[data-done][aria-pressed=true]').count()==1
        assert page.locator('[data-skip][aria-pressed=true]').count()==0
        page.locator('#skip-phase').click()
        visit('session.html?id=2026-10-08');assert page.locator('[data-done][aria-pressed=true]').count()==1
        # Phase records export and validate; unknown set IDs cannot be restored.
        open_data()
        with page.expect_download() as download:page.locator('#export-backup').click()
        backup=json.loads(Path(download.value.path()).read_text())
        assert len(backup['records']['session:2026-10-08:pm'])==4
        invalid=json.loads(json.dumps(backup));invalid['records']['session:2026-10-08:pm']['am-99']='done'
        def choose(data):page.locator('#backup-file').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
        choose(invalid);page.wait_for_function('document.getElementById("restore-status").textContent.includes("unknown set")');assert page.locator('#restore-backup').is_hidden()
        choose(backup);page.locator('#restore-backup').wait_for(state='visible')
        before=page.evaluate('localStorage.getItem("lane50:portable-v1")')
        page.evaluate('()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error("quota")};}')
        page.locator('#restore-backup').click();assert 'Existing records have not changed' in page.locator('#restore-status').inner_text()
        assert page.evaluate('localStorage.getItem("lane50:portable-v1")')==before
        page.evaluate('()=>{Storage.prototype.setItem=window.originalSet;}');page.locator('#restore-backup').click();close('data-dialog')
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
        assert page.locator('[data-done][aria-pressed=true]').count()==1
        page.locator('#app-update').click()
        page.wait_for_function('async()=>(await caches.keys()).includes("lane50-shell-v35-test-update")&&!(await navigator.serviceWorker.getRegistration()).waiting')
        assert not errors,errors
        browser.close()
    finally:server.shutdown()
    print('PASS replacement-plan migration, AM/PM isolation, broken-set and block rests, timer pause/reload, failed saves, atomic backup, official results and offline updates')
if __name__=='__main__':run()
