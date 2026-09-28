"""Poolside release: persistence, backups, contextual rest, results, and mobile layouts."""
from datetime import datetime
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REVISION = json.loads((ROOT/'data/competition-plan.json').read_text())['revision']
PREFIX = 'lane50:' + REVISION + ':'
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass
    def do_GET(self):
        if self.path.split('?')[0]=='/sw.js':
            source=(ROOT/'sw.js').read_text()
            if getattr(self.server,'next_release',False):source=source.replace('v32-poolside','v33-update-test')
            body=source.encode()
            self.send_response(200);self.send_header('Content-Type','application/javascript')
            self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)))
            self.end_headers();self.wfile.write(body)
        else:super().do_GET()

def run():
    server = ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(viewport={'width':390,'height':844},timezone_id='Asia/Kathmandu',reduced_motion='reduce',accept_downloads=True)
        page=context.new_page(); errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.clock.install(time=datetime.fromisoformat('2026-09-28T08:00:00+05:45'))
        def visit(route):
            page.goto(base+route)
            page.locator('#data-open').wait_for()
        def close_dialog(id):
            page.locator('#'+id+' [data-close-dialog]').click()
            page.wait_for_function('(id)=>!document.getElementById(id).open',arg=id)
        def choose_backup(data):
            page.locator('#backup-file').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
        visit('index.html')
        # Read prior-release records; first write migrates all records without deleting them.
        page.evaluate('(p)=>{localStorage.setItem(p+"session:2026-09-28",JSON.stringify({s1:"done"}));localStorage.setItem(p+"race:50",JSON.stringify({result:"35.40"}));}',PREFIX)
        visit('session.html?id=2026-09-28')
        assert page.locator('[data-done="s1"]').get_attribute('aria-pressed')=='true'
        assert page.locator('#next-set').get_attribute('href')=='#set-s2'
        page.locator('[data-done="s2"]').click()
        assert page.evaluate('(p)=>JSON.parse(localStorage.getItem(p+"records")).records["race:50"].result',PREFIX)=='35.40'
        assert page.evaluate('(p)=>localStorage.getItem(p+"race:50")',PREFIX) is not None
        # Failed writes remain visibly unsaved; retry persists the latest in-memory state.
        page.evaluate('() => {window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new Error("quota")};}')
        page.locator('[data-done="s3"]').click()
        page.clock.fast_forward(6500)
        assert page.locator('#save-warning').is_visible()
        assert page.locator('[data-done="s3"]').get_attribute('aria-pressed')=='true'
        page.locator('#data-open').click()
        with page.expect_download() as pending_info:page.locator('#export-backup').click()
        pending_backup=json.loads(Path(pending_info.value.path()).read_text())
        assert pending_backup['records']['session:2026-09-28']['s3']=='done'
        close_dialog('data-dialog')
        page.evaluate('() => {Storage.prototype.setItem=window.originalSet;}')
        page.locator('#save-retry').click()
        assert page.locator('#save-warning').is_hidden()
        page.reload()
        assert page.locator('[data-done="s3"]').get_attribute('aria-pressed')=='true'
        # Explicit between-repetition vs between-round choices; never start automatically.
        page.locator('[data-rest-choice="s4"]').click()
        assert page.locator('#other-rest').get_attribute('open') is None
        assert page.locator('#set-rest-options legend').all_inner_texts()==['Between 25s','Between rounds']
        page.locator('[data-set-duration="25"]').click()
        assert page.locator('#timer-clock').inner_text()=='0:25'
        assert 'Between 25s' in page.locator('#timer-context').inner_text()
        page.locator('[data-set-duration="240"]').click()
        assert page.locator('#timer-clock').inner_text()=='4:00'
        assert page.locator('#timer-status').inner_text()=='Ready'
        page.locator('#timer-toggle').click()
        assert page.locator('[data-set-duration="25"]').is_disabled()
        page.clock.fast_forward(5000)
        assert page.locator('#timer-clock').inner_text()=='3:55'
        page.locator('#timer-toggle').click()
        close_dialog('rest-dialog')
        page.locator('#next-set').click()
        assert page.evaluate('document.activeElement.id')=='set-s4'
        visit('session.html?id=2026-09-30')
        assert page.locator('#timer-dock').is_hidden()
        assert page.locator('[data-rest-choice]').count()==0
        assert page.locator('#next-set').is_visible()
        # Optional work stays optional even when using bulk completion.
        visit('race.html?event=50')
        assert page.locator('#start-warmup').bounding_box()['y']<600
        page.locator('#complete-day').click()
        assert page.locator('[data-done][aria-pressed=true]').count()==5
        assert page.locator('[data-done="s6"]').get_attribute('aria-pressed')=='false'
        assert page.locator('#session-complete-message').inner_text()=='Warm-up complete.'
        assert page.locator('#start-warmup').get_attribute('href')=='#race-cues'
        page.locator('#reporting-summary').click()
        page.locator('#reporting-time').fill('09:15')
        page.locator('[data-logistics="heat"]').fill('3')
        page.locator('[data-logistics="lane"]').fill('4')
        page.locator('#official-result').fill('34.85')
        # A single bad cumulative split flags that input only. Final-time-only is valid.
        visit('session.html?id=2026-10-02')
        page.locator('[name=p25]').fill('20')
        page.locator('[name=p50]').fill('15')
        assert page.locator('input[aria-invalid=true]').count()==1
        assert page.locator('[name=p50]').get_attribute('aria-invalid')=='true'
        assert 'Draft saved' in page.locator('#record-message-100').inner_text()
        page.reload()
        assert page.locator('[name=p50]').input_value()=='15'
        page.locator('[name=p25]').fill('')
        page.locator('[name=p50]').fill('')
        page.locator('[name=p100]').fill('1:20.50')
        assert page.locator('#record-message-100').inner_text()=='Recorded on this device.'
        visit('race.html?view=results')
        assert '34.85' in page.locator('.result-card').first.inner_text()
        assert '1:20.50' in page.locator('.result-card').nth(1).inner_text()
        # Clipboard fallback includes official results and rehearsal context.
        page.evaluate('() => {Object.defineProperty(navigator,"clipboard",{value:{writeText:()=>Promise.reject(new Error("blocked"))},configurable:true})}')
        page.locator('#copy-results').click()
        assert 'Official result: 34.85' in page.locator('#copy-fallback').input_value()
        assert '1:20.50' in page.locator('#copy-fallback').input_value()
        # Backup round trip through the real download/upload UI.
        page.locator('#data-open').click()
        with page.expect_download() as info: page.locator('#export-backup').click()
        backup=json.loads(Path(info.value.path()).read_text())
        assert backup['planRevision']==REVISION
        assert 'timer' not in backup['records']
        assert backup['records']['race:50']['heat']=='3'
        altered=json.loads(json.dumps(backup));altered['planRevision']='wrong-plan'
        choose_backup(altered)
        page.wait_for_function('document.querySelector("#restore-status").textContent.includes("different plan")')
        assert page.locator('#restore-backup').is_hidden()
        altered=json.loads(json.dumps(backup));altered['records']['session:2026-09-28']['unknown']='done'
        choose_backup(altered)
        page.wait_for_function('document.querySelector("#restore-status").textContent.includes("unknown set")')
        assert page.locator('#restore-backup').is_hidden()
        altered=json.loads(json.dumps(backup));altered['records']['race:50']['result']='33.21'
        choose_backup(altered)
        page.locator('#restore-backup').wait_for(state='visible')
        before=page.evaluate('(p)=>localStorage.getItem(p+"records")',PREFIX)
        page.evaluate('() => {window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new Error("quota")};}')
        page.locator('#restore-backup').click()
        assert 'Existing records have not changed' in page.locator('#restore-status').inner_text()
        assert page.evaluate('(p)=>localStorage.getItem(p+"records")',PREFIX)==before
        page.evaluate('() => {Storage.prototype.setItem=window.originalSet;}')
        page.locator('#restore-backup').click()
        page.locator('#reload-restored').click()
        page.wait_for_function('!document.querySelector("#data-dialog").open')
        page.wait_for_function('document.querySelector(".result-card").textContent.includes("33.21")')
        # New assets and both results stay available offline.
        page.evaluate('navigator.serviceWorker.ready')
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        context.set_offline(True)
        visit('race.html?view=results')
        assert '33.21' in page.locator('.result-card').first.inner_text()
        page.locator('#data-open').click()
        assert page.locator('#export-backup').is_visible()
        context.set_offline(False)
        close_dialog('data-dialog')
        for width,height in [(320,640),(390,844),(667,375),(1440,1000)]:
            page.set_viewport_size({'width':width,'height':height})
            for route in ['index.html','plan.html','session.html?id=2026-09-28','race.html?event=50','race.html?view=results']:
                visit(route)
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
            visit('session.html?id=2026-09-28')
            page.locator('#next-set').click()
            assert page.locator('#next-set').bounding_box()['y']>=0
            page.locator('#data-open').click()
            assert page.locator('#data-dialog').bounding_box()['width']<=width
            close_dialog('data-dialog')
        # Date-based completion copy and direct results destination.
        final=browser.new_page(viewport={'width':390,'height':844},timezone_id='Asia/Kathmandu')
        final.clock.install(time=datetime.fromisoformat('2026-10-14T08:00:00+05:45'))
        final.goto(base)
        assert final.locator('h1').inner_text()=='Plan ended'
        final.get_by_role('link',name='View results',exact=True).click()
        assert final.locator('h1').inner_text()=='Your results'
        # An installed update must wait while a session is open, then activate explicitly.
        visit('session.html?id=2026-09-28')
        page.locator('#next-set').click()
        previous_url=page.url
        server.next_release=True
        page.evaluate('async () => {const r=await navigator.serviceWorker.getRegistration();await r.update();}')
        page.wait_for_function('async () => !!(await navigator.serviceWorker.getRegistration()).waiting')
        page.locator('#app-update').wait_for(state='visible')
        assert page.url==previous_url
        assert page.locator('[data-done="s3"]').get_attribute('aria-pressed')=='true'
        page.locator('#app-update').click()
        page.wait_for_function('async () => (await caches.keys()).includes("lane50-shell-v33-update-test") && !(await navigator.serviceWorker.getRegistration()).waiting')
        page.wait_for_load_state('networkidle')
        assert page.locator('[data-done="s3"]').get_attribute('aria-pressed')=='true'
        assert not errors,errors
        browser.close()
    finally: server.shutdown()
    print('PASS: migration, failed saves/retry, contextual rest, optional work, field errors, results, atomic backup/restore, offline and layouts')

if __name__=='__main__':run()
