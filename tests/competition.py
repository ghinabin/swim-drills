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
    assert [len(d['sets']) for d in plan['days']]==[11,10,10,11,9,8,0,6,5,5]
    assert [d['date'] for d in plan['days'] if d['kind']=='Rest']==['2026-10-10']
    assert all(list(d['phases'])==['before','am','evening'] for d in plan['days'])
    assert plan['days'][1]['sets'][2]['metres']==30
    assert '2–3' in next(s for s in plan['days'][3]['sets'] if s['group']=='Turns')['prescription']
    assert '3–4 dolphins' in plan['days'][0]['sets'][7]['prescription']
    assert plan['days'][1]['sets'][5]['timers'][0]['seconds']==[90,105,120]
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
          assert page.locator('[data-period]').count()==0
          assert '10 drill blocks' in page.locator('.day-workload').inner_text()
          assert '100 m rhythm' in page.locator('.day-drill-summary').inner_text()
          page.locator('#exercise-before').click()
          assert page.locator('#exercise-dialog-before').is_visible()
          assert 'Bodyweight squat 1 × 10' in page.locator('#exercise-dialog-before').inner_text()
          page.locator('#exercise-dialog-before [data-close-dialog]').click()
          page.wait_for_function('!document.getElementById("exercise-dialog-before").open')
          page.locator('.day-later summary').click()
          assert 'mobility' in page.locator('.day-later').inner_text()
          assert page.locator('.day-later-swim').count()==0
          page.locator('#exercise-evening').click()
          assert 'Wall slides' in page.locator('#exercise-dialog-evening').inner_text()
          page.locator('#exercise-dialog-evening [data-close-dialog]').click()
          page.wait_for_function('!document.getElementById("exercise-dialog-evening").open')
          page.get_by_role('link',name='Open drills',exact=True).click()
          assert page.locator('h1').inner_text()=='AM swim'
          assert page.locator('[data-done]').count()==10
          assert page.locator('[data-period]').count()==0
          page.locator('#exercise-before').click()
          assert page.locator('#exercise-dialog-before').is_visible()
          page.keyboard.press('Escape')
          page.wait_for_function('!document.getElementById("exercise-dialog-before").open')
          assert page.locator('#exercise-before').evaluate('(e)=>e===document.activeElement')
          # The entire card toggles a checkbox; only its title is crossed out.
          assert page.locator('[data-skip],[data-rest-choice],#complete-day,#skip-phase,#block-rest').count()==0
          assert page.locator('#data-open,[data-offline-status],#phase-switch,#day-source,#keep-screen').count()==0
          assert page.locator('[data-done]').first.get_attribute('type')=='checkbox'
          assert page.locator('.drill-card').first.bounding_box()['height']>=48
          page.locator('.pool-prescription').first.click()
          assert page.locator('[data-done]:checked').count()==1
          assert page.locator('.drill-title').first.evaluate('(e)=>getComputedStyle(e).textDecorationLine')=='line-through'
          assert page.locator('.pool-prescription').first.evaluate('(e)=>getComputedStyle(e).textDecorationLine')=='none'
          page.locator('[data-done]').first.press('Space')
          assert page.locator('[data-done]:checked').count()==0
          page.locator('.drill-title').first.click()
          assert page.locator('[data-done]:checked').count()==1
          page.reload()
          assert page.locator('[data-done]:checked').count()==1
          assert page.locator('#next-set,[data-next-set]').count()==0
          page.locator('#timer-dock').click()
          assert page.locator('#rest-dialog select,#rest-dialog input,#timer-toggle,#timer-reset').count()==0
          assert page.locator('[data-duration]').first.bounding_box()['height']>=48
          assert page.locator('[data-duration="105"]').count()==1
          assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
          page.locator('#rest-dialog [data-close-dialog]').click()
          page.wait_for_function('!document.getElementById("rest-dialog").open')
          assert page.locator('#set-am-2').evaluate('(e)=>e.classList.contains("is-next")')
          # Legacy evening swim links resolve to the updated morning workout.
          page.goto(base+'session.html?id=2026-10-05&phase=pm')
          assert page.locator('h1').inner_text()=='AM swim'
          assert 'phase=' not in page.url
          assert page.locator('[data-done]:checked').count()==1
          page.locator('#exercise-evening').click()
          assert 'Wall slides' in page.locator('#exercise-dialog-evening').inner_text()
          page.locator('#exercise-dialog-evening [data-close-dialog]').click()
          page.wait_for_function('!document.getElementById("exercise-dialog-evening").open')
          assert page.locator('#navigation').is_hidden()
          assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
          if width==390:page.screenshot(path='/private/tmp/final-taper-am.png',full_page=True)
          # Every supplied day and every part of day opens without errors/overflow.
          for day in plan['days']:
            for phase in day['phases']:
              page.goto(base+f'session.html?id={day["id"]}&phase={phase}')
              assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,day['id'],phase)
              period='am'
              if phase in ('before','evening'):
                page.locator('#exercise-dialog-'+phase).wait_for(state='visible')
                assert page.locator('#exercise-dialog-'+phase).bounding_box()['width']<=width
                assert page.locator('#exercise-dialog-'+phase+' .preparation-list li').count()==len(day['phases'][phase]['items'])
                page.locator('#exercise-dialog-'+phase+' [data-close-dialog]').click()
                page.wait_for_function('(phase)=>!document.getElementById("exercise-dialog-"+phase).open',arg=phase)
              assert page.locator('[data-done]').count()==len(day['phases'][period]['sets'])
              assert page.locator('[data-period]').count()==0
              if day['phases'][period]['status']=='off':assert page.locator('#timer-footer').is_hidden()
          page.goto(base+'index.html?phase=pm')
          assert page.locator('[data-period]').count()==0
          assert page.locator('#day-title').inner_text()=='100 pace + catch + turns'
          assert not errors,errors
          context.close()
        for date,label,action in [('2026-10-03','Catch + starts + 50 speed','Open drills'),('2026-10-10','Complete rest','View rest day'),('2026-10-11','Pre-race activation','Open drills'),('2026-10-12','50 m freestyle','Open race preparation'),('2026-10-13','100 m freestyle','Open race preparation'),('2026-10-14','Your races are finished.','View results')]:
          context=browser.new_context(timezone_id='Asia/Kathmandu');page=context.new_page()
          page.clock.install(time=datetime.fromisoformat(date+'T08:00:00+05:45'));page.goto(base)
          assert label in page.locator('main').inner_text()
          page.get_by_role('link',name=action,exact=True).click()
          if date in ('2026-10-12','2026-10-13'):assert f'event={50 if date.endswith("12") else 100}' in page.url
          context.close()
        browser.close()
    finally:server.shutdown()
    print('PASS final source contract, dates, all AM/activation/mobility screens, tap and keyboard checkboxes, legacy link recovery, accessible targets and responsive navigation')
if __name__=='__main__':run()
