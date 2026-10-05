"""Final October 4–13 taper: source contract and date/mobile navigation."""
from datetime import datetime
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json,subprocess
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_):pass

def run():
    subprocess.run(['node','scripts/import-plan.cjs'],cwd=ROOT,check=True)
    plan=json.loads((ROOT/'data/competition-plan.json').read_text())
    assert [len(d['sets']) for d in plan['days']]==[11,9,10,11,9,8,0,6,5,5]
    assert [d['date'] for d in plan['days'] if d['kind']=='Rest']==['2026-10-10']
    assert [d['date'] for d in plan['days'] if d['phases']['pm']['status']=='optional']==['2026-10-04','2026-10-05','2026-10-07','2026-10-08','2026-10-12']
    assert '3–4 dolphins' in plan['days'][0]['sets'][7]['prescription']
    assert plan['days'][1]['sets'][4]['timers'][0]['seconds']==[90,105,120]
    assert '60 → 70 → 80 → 90%' in plan['days'][2]['sets'][7]['prescription']
    assert '2 dolphins' in plan['days'][3]['sets'][6]['prescription']
    assert plan['days'][3]['sets'][5]['timers'][0]['seconds']==[180]
    assert plan['days'][3]['sets'][7]['timers'][0]['seconds']==[150,165,180]
    assert plan['days'][4]['sets'][4]['timers'][1]['seconds']==[240,270,300]
    assert 'GET OUT' in plan['days'][7]['note']
    assert 'if permitted' in plan['days'][8]['sets'][3]['prescription']
    assert 'HOLD FORM' in plan['days'][9]['raceCues'][2][0]
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/'
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        for width in (320,390,768,1440):
          context=browser.new_context(viewport={'width':width,'height':844},timezone_id='Asia/Kathmandu',reduced_motion='reduce')
          page=context.new_page();errors=[]
          page.on('pageerror',lambda error:errors.append(str(error)))
          page.clock.install(time=datetime.fromisoformat('2026-10-05T08:00:00+05:45'))
          page.goto(base)
          assert page.locator('.nav-link').all_inner_texts()==['Today','Plan','Race']
          assert '100 pace + catch + turns' in page.locator('.prep-hero').inner_text()
          assert page.locator('.day-phase-row').count()==3
          page.get_by_role('link',name='Open AM swim',exact=True).click()
          assert page.locator('h1').inner_text()=='AM swim'
          assert page.locator('[data-done]').count()==9
          assert page.locator('.day-phase-nav').is_hidden()
          # Reading a set never changes completion.
          page.locator('.pool-prescription').first.click()
          assert page.locator('[data-done][aria-pressed=true]').count()==0
          for target in ('[data-done]','[data-rest-choice]','[data-skip]'):
            assert page.locator(target).first.bounding_box()['height']>=56
          page.locator('[data-done]').first.click()
          page.locator('[data-skip]').nth(1).click();page.reload()
          assert page.locator('[data-done][aria-pressed=true]').count()==1
          assert page.locator('[data-skip][aria-pressed=true]').count()==1
          page.locator('#next-set').click()
          assert page.locator('#set-am-3').bounding_box()['y']<100
          page.locator('#phase-switch summary').click()
          page.get_by_role('link',name='PM swim Optional',exact=True).click()
          assert page.locator('h1').inner_text()=='PM swim'
          assert page.locator('[data-done][aria-pressed=true]').count()==0
          page.locator('[data-done]').first.click()
          page.goto(base+'session.html?id=2026-10-05')
          assert page.locator('[data-done][aria-pressed=true]').count()==1
          assert page.locator('#navigation').is_hidden()
          assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
          if width==390:page.screenshot(path='/private/tmp/final-taper-am.png',full_page=True)
          # Every supplied day and every part of day opens without errors/overflow.
          for day in plan['days']:
            for phase in day['phases']:
              page.goto(base+f'session.html?id={day["id"]}&phase={phase}')
              assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,day['id'],phase)
              if phase!='am' or day['kind']!='Race':
                assert page.locator('[data-done]').count()==len(day['phases'][phase]['sets'])
              if phase=='pm' and day['phases'][phase]['status']=='off':assert page.locator('#timer-footer').is_hidden()
          assert not errors,errors
          context.close()
        for date,label,action in [('2026-10-03','Catch + starts + 50 speed','Open AM swim'),('2026-10-10','Complete rest','View rest day'),('2026-10-11','Pre-race activation','Open AM swim'),('2026-10-12','50 m freestyle','Open race preparation'),('2026-10-13','100 m freestyle','Open race preparation'),('2026-10-14','Your races are finished.','View results')]:
          context=browser.new_context(timezone_id='Asia/Kathmandu');page=context.new_page()
          page.clock.install(time=datetime.fromisoformat(date+'T08:00:00+05:45'));page.goto(base)
          assert label in page.locator('main').inner_text()
          page.get_by_role('link',name=action,exact=True).click()
          if date in ('2026-10-12','2026-10-13'):assert f'event={50 if date.endswith("12") else 100}' in page.url
          context.close()
        browser.close()
    finally:server.shutdown()
    print('PASS final source contract, dates, all AM/PM/mobility screens, explicit completion, phase isolation, large targets and responsive navigation')
if __name__=='__main__':run()
