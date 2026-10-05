"""Tempo calibration, player recovery, portable backup and offline UI."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_): pass

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True)
        page=context.new_page(); errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        base=f'http://127.0.0.1:{server.server_port}/'
        page.goto(base+'tempo.html')
        assert page.locator('.nav-link').all_inner_texts()==['Today','Plan','Race']
        assert page.locator('#tempo-player').is_hidden()
        page.locator('[data-pace="hundred"]').click()
        form=page.locator('#calibration-form')
        form.locator('[name="count"]').fill('18');form.locator('[name="seconds"]').fill('16')
        form.locator('button[type="submit"]').click()
        assert '67.5' in page.locator('#calibration-result').inner_text()
        page.locator('#save-calibration').click()
        page.wait_for_function('!document.getElementById("calibration-dialog").open')
        assert page.locator('#player-rate').inner_text()=='67.5'
        assert '0.89' in page.locator('#player-interval').inner_text()
        page.locator('#player-settings summary').click()
        page.locator('#beep-mode').select_option('cycles')
        assert page.locator('#player-rate').inner_text()=='33.8'
        assert '1.78' in page.locator('#player-interval').inner_text()
        page.locator('#player-start').click()
        page.wait_for_function('document.getElementById("player-state").textContent === "Playing"')
        page.locator('#player-pause').click()
        assert page.locator('#player-state').inner_text()=='Paused'
        page.locator('#player-start').click()
        page.wait_for_function('document.getElementById("player-state").textContent === "Playing"')
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
        assert 'Page hidden' in page.locator('#player-state').inner_text()
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false})")
        page.locator('#player-stop').click()
        page.reload()
        assert '67.5' in page.locator('[data-pace="hundred"]').locator('..').inner_text()
        page.locator('[data-pace="custom"]').click();page.locator('#custom-rate').fill('72')
        page.locator('#custom-form button').click()
        page.wait_for_function('!document.getElementById("custom-dialog").open')
        assert page.locator('#player-rate').inner_text()=='36.0'
        with page.expect_download() as download:page.locator('#export-tempos').click()
        backup=json.loads(Path(download.value.path()).read_text())
        assert backup['records']['tempo:profile']['targets']['custom']==72
        backup['planRevision']='different-plan'
        page.locator('#data-open').click()
        page.locator('#backup-file').set_input_files({'name':'tempo.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
        page.locator('#restore-backup').wait_for(state='visible')
        page.locator('#data-dialog [data-close-dialog]').click()
        page.wait_for_function('!document.getElementById("data-dialog").open')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.screenshot(path='/private/tmp/swim-tempo-mobile.png',full_page=True)
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        context.set_offline(True);page.reload()
        assert page.locator('[data-pace="hundred"]').is_visible()
        context.set_offline(False)
        page.set_viewport_size({'width':320,'height':740})
        page.locator('#find-tempo').click()
        form.locator('[name="method"]').select_option('measured')
        form.locator('[name="unit"]').select_option('cycles')
        form.locator('[name="count"]').fill('10');form.locator('[name="seconds"]').fill('10')
        form.locator('button[type="submit"]').click()
        assert '120.0' in page.locator('#calibration-result').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.locator('#save-calibration').click()
        page.wait_for_function('!document.getElementById("calibration-dialog").open')
        assert page.locator('#player-rate').inner_text()=='60.0'
        assert not errors,errors
        browser.close()
        print('PASS tempo calibration, cycle mode, audio controls/interruption, persistence, portable backup, mobile and offline')
    finally:server.shutdown()
if __name__=='__main__':run()
