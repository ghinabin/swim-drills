"""Contract and browser checks for the September 26 competition preparation."""
from datetime import datetime, timezone, timedelta
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json, subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass

def run():
    subprocess.run(['node','scripts/import-plan.cjs'],cwd=ROOT,check=True)
    data=json.loads((ROOT/'data/competition-plan.json').read_text())
    assert sum(d['total'] for d in data['days'][9:16])==3150
    assert [d['date'] for d in data['days'] if d['kind']=='Rest']==['2026-09-26','2026-10-03','2026-10-10']
    for key in ('2026-09-28','2026-10-06'):
        d=next(d for d in data['days'] if d['date']==key)
        s=next(s for s in d['sets'] if s['name']=='100 m race rhythm')
        assert s['prescription']=='2 rounds × 4 × 25 m'
        assert s['timers'][1]['seconds']==[240]
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        for width in (390,1440):
          context=browser.new_context(viewport={'width':width,'height':900},timezone_id='Asia/Kathmandu',reduced_motion='reduce')
          page=context.new_page();errors=[]
          page.on('pageerror',lambda error:errors.append(str(error)))
          page.clock.install(time=datetime(2026,9,28,8,tzinfo=timezone(timedelta(hours=5,minutes=45))))
          page.goto(base)
          assert page.locator('.nav-link').all_inner_texts()==['Today','Plan','Race']
          assert '100 m speed endurance' in page.locator('.prep-hero').inner_text()
          page.get_by_role('link',name='Open session').click()
          assert '1,000 m' in page.locator('.page-intro').inner_text()
          assert page.locator('.prep-set').count()==6
          # Opening effort help must not mark a set complete.
          page.locator('[data-effort]').first.click()
          assert page.locator('#effort-dialog').is_visible()
          page.get_by_role('button',name='Close effort guide').click()
          page.wait_for_function("!document.querySelector('#effort-dialog').open")
          assert page.locator('[data-done][aria-pressed=true]').count()==0
          page.locator('[data-done]').first.click()
          page.locator('[data-skip]').nth(1).click()
          page.reload()
          assert '1 of 6 sets done · 1 skipped' in page.locator('#completion').inner_text()
          page.locator('[data-done]').first.click()
          assert page.locator('[data-done][aria-pressed=true]').count()==0
          # Repetition and round rests remain distinct. Timer survives navigation.
          page.locator('#set-s4 [data-timer-index="1"]').click()
          assert page.locator('#timer-clock').inner_text()=='4:00'
          page.locator('#timer-toggle').click();page.clock.fast_forward(5000)
          assert page.locator('#timer-clock').inner_text()=='3:55'
          page.get_by_role('button',name='Close rest timer').click()
          page.wait_for_function("!document.querySelector('#rest-dialog').open")
          page.goto(base+'plan.html')
          assert page.locator('.prep-day').count()==18
          assert page.locator('#timer-preview').inner_text()=='3:55'
          page.locator('#timer-dock').click();page.locator('#timer-toggle').click()
          page.get_by_role('button',name='Close rest timer').click()
          page.wait_for_function("!document.querySelector('#rest-dialog').open")
          # Navigate from plan and restore its scroll position.
          link=page.locator('#day-2026-10-08');link.scroll_into_view_if_needed()
          y=page.evaluate('scrollY');link.click();page.locator('[data-return]').click()
          page.wait_for_url('**/plan.html');page.wait_for_timeout(150)
          assert abs(page.evaluate('scrollY')-y)<5
          page.goto(base+'session.html?id=2026-09-27')
          page.locator('#set-s1 [data-timer-set]').click()
          page.locator('[data-duration="30"]').click()
          page.locator('#timer-toggle').click();page.clock.fast_forward(31000)
          assert page.locator('#timer-clock').inner_text()=='0:00'
          assert page.locator('#timer-status').inner_text()=='Rest complete'
          page.reload()
          assert page.locator('#timer-preview').inner_text()=='0:00'
          page.wait_for_function("document.querySelector('#rest-dialog').open")
          page.locator('#timer-dismiss').click()
          page.wait_for_function("!document.querySelector('#rest-dialog').open")
          assert page.locator('#timer-dock').is_hidden()
          for d in data['days']:
            url='race.html?event='+str(d['event']) if d['kind']=='Race' else 'session.html?id='+d['id']
            page.goto(base+url)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),d['date']
            if d['kind']!='Rest':
              assert page.locator('.prep-set').count()==len(d['sets'])
              for i,s in enumerate(d['sets']):
                assert page.locator('.prep-prescription').nth(i).inner_text()==s['prescription']
            if d.get('noTimer'):
              assert page.locator('[data-timer-set]').count()==0
              assert page.locator('#timer-dock').is_hidden()
          page.goto(base+'session.html?id=2026-10-01')
          page.locator('[name=p25]').fill('17.20');page.locator('[name=p50]').fill('36.50')
          page.locator('[name=turn]').select_option('Good')
          assert '25–50 m: 19.30 s' in page.locator('#derived-50').inner_text()
          page.reload();assert page.locator('[name=p50]').input_value()=='36.50'
          page.goto(base+'session.html?id=2026-10-02')
          for k,v in [('p25','18'),('p50','38'),('p75','59'),('p100','1:20.50')]:page.locator('[name='+k+']').fill(v)
          assert '75–100 m: 21.50 s' in page.locator('#derived-100').inner_text()
          page.locator('[name=p75]').fill('30')
          assert 'must increase' in page.locator('#record-message-100').inner_text()
          page.reload();assert page.locator('[name=p75]').input_value()=='30'
          page.locator('[name=p75]').fill('59')
          page.goto(base+'race.html?event=50')
          assert '500 m + optional 50–100 m' in page.locator('main').inner_text()
          page.get_by_role('link',name='Race cues',exact=True).click()
          assert page.locator('#race-cues').evaluate('(e) => e.getBoundingClientRect().top') < 100
          page.get_by_role('link',name='Results',exact=True).click()
          assert page.locator('#official-result').evaluate('(e) => { const r=e.getBoundingClientRect(); return r.top >= 0 && r.bottom < innerHeight-70; }')
          page.locator('#reporting-summary').click();page.locator('#reporting-time').fill('09:15');page.locator('#official-result').fill('35.40');page.reload()
          assert page.locator('#reporting-time').input_value()=='09:15'
          page.locator('#rehearsal-results > summary').click()
          assert page.locator('[data-record="50"] [name=p50]').input_value()=='36.50'
          assert page.locator('[data-record="100"] [name=p100]').input_value()=='1:20.50'
          # Storage failure is visible and does not stop session use.
          page.goto(base+'session.html?id=2026-09-27')
          page.evaluate("() => { Storage.prototype.setItem=()=>{throw new DOMException('blocked','SecurityError')}; }")
          page.locator('[data-done]').first.click()
          assert 'Not saved' in page.locator('#toast').inner_text()
          assert page.locator('#toast').is_visible()
          page.wait_for_timeout(250)
          assert page.locator('#toast').evaluate('(e) => getComputedStyle(e).opacity')=='1'
          assert page.locator('[data-done]').first.get_attribute('aria-pressed')=='true'
          page.goto(base)
          page.evaluate('navigator.serviceWorker.ready')
          page.wait_for_function('navigator.serviceWorker.controller !== null')
          context.set_offline(True)
          page.goto(base+'race.html?event=100')
          assert '550–600 m warm-up' in page.locator('main').inner_text()
          page.goto(base+'session.html?id=2026-10-06')
          assert '2 rounds × 4 × 25 m' in page.locator('main').inner_text()
          context.set_offline(False)
          # Legacy drill links cannot expose old workouts.
          page.goto(base+'drills.html');page.wait_for_url('**/plan.html')
          page.goto(base+'session.html?id=w1d0');assert page.locator('h1').inner_text()=='Session not found'
          if width==390:
            page.goto(base+'session.html?id=2026-09-28');page.screenshot(path='/private/tmp/preparation-session.png',full_page=True)
            page.goto(base);page.screenshot(path='/private/tmp/preparation-today.png',full_page=True)
            page.goto(base+'race.html?event=100');page.screenshot(path='/private/tmp/preparation-race.png',full_page=True)
          assert not errors,errors
          context.close()
        upgrade=browser.new_context()
        up=upgrade.new_page();up.goto(base+'assets/styles.css')
        up.evaluate("async () => { const c=await caches.open('lane50-shell-v25'); await c.put('old-plan',new Response('old drills')); }")
        up.goto(base)
        up.wait_for_function("navigator.serviceWorker.controller !== null")
        up.wait_for_function("async () => !(await caches.keys()).includes('lane50-shell-v25')")
        up.wait_for_load_state('networkidle')
        assert up.locator('.nav-link').all_inner_texts()==['Today','Plan','Race']
        upgrade.close()
        # Date transitions, independently of any saved state.
        for date,title in [('2026-09-25','Rest'),('2026-09-26','Rest'),('2026-09-30','Active recovery'),('2026-10-01','50 m race rehearsal'),('2026-10-02','100 m race rehearsal'),('2026-10-12','50 m race'),('2026-10-13','100 m race'),('2026-10-14','Preparation complete')]:
          page=browser.new_page(timezone_id='Asia/Kathmandu')
          page.clock.install(time=datetime.fromisoformat(date+'T08:00:00+05:45'))
          page.goto(base)
          assert title in page.locator('main').inner_text(),date
          if date=='2026-09-25':assert 'plan starts' in page.locator('main').inner_text().lower()
          page.close()
        browser.close()
    finally:server.shutdown()

if __name__=='__main__':
    run()
    print('PASS: content, mobile/desktop, dates, progress, rest timer, splits, navigation, storage failures, and offline race preparation')
