import json
import os
import re
from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import TimeoutError, expect, sync_playwright

BASE = os.environ.get('SITE_URL', 'http://localhost:3000').rstrip('/')
OUTPUT = Path(gettempdir()) / 'ascentia-search-opening'
OUTPUT.mkdir(exist_ok=True)
RESULTS = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for locale, width, motion, shortcut in (
            ('en', 1440, 'no-preference', None),
            ('id', 1440, 'no-preference', 'Control+k'),
            ('en', 390, 'no-preference', None),
            ('id', 390, 'reduce', None),
            ('en', 1440, 'reduce', 'Meta+k'),
        ):
            context = browser.new_context(
                viewport={'width': width, 'height': 844},
                reduced_motion=motion,
                service_workers='block',
            )
            if shortcut == 'Meta+k':
                context.add_init_script("Object.defineProperty(navigator, 'platform', {get: () => 'MacIntel'})")
            cold = {'blocked': False}
            scripts = []
            rpc = []
            errors = []

            def intercept(route):
                request = route.request
                if request.method not in ('GET', 'HEAD', 'OPTIONS'):
                    route.abort()
                elif cold['blocked'] and request.resource_type == 'script':
                    scripts.append(request.url)
                    route.abort()
                elif '/_serverFn/' in request.url:
                    rpc.append(request.url)
                    route.fulfill(status=503, content_type='text/plain', body='Search temporarily unavailable')
                else:
                    route.continue_()

            context.route('**/*', intercept)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(BASE + ('/en/about-us' if locale == 'en' else '/about-us'), wait_until='domcontentloaded', timeout=60000)
            page.wait_for_function('window.__TSR_ROUTER__?.state.status === "idle"')
            expect(page.locator('html')).to_have_attribute('lang', locale)
            try:
                page.wait_for_load_state('networkidle', timeout=3000)
            except TimeoutError:
                pass
            trigger = page.locator('button[data-site-search-trigger]:visible')
            expect(trigger).to_be_visible()
            trigger.focus()
            cold['blocked'] = True
            before_rpc = len(rpc)
            page.evaluate('''() => {
              window.searchOpenAudit = {started: 0, inserted: null, focused: null, loading: false};
              const audit = window.searchOpenAudit;
              const start = () => { if (!audit.started) audit.started = performance.now(); };
              document.addEventListener('click', start, {capture: true, once: true});
              document.addEventListener('keydown', start, {capture: true, once: true});
              document.addEventListener('focusin', event => {
                if (event.target.id === 'global-search-input' && audit.focused === null)
                  audit.focused = performance.now();
              });
              const observe = () => {
                if (document.querySelector('[role="dialog"]') && audit.inserted === null)
                  audit.inserted = performance.now();
                if ([...document.querySelectorAll('[role="status"]')].some(e =>
                    /Loading search|Memuat pencarian/i.test(e.textContent))) audit.loading = true;
              };
              new MutationObserver(observe).observe(document.body, {subtree: true, childList: true, characterData: true});
            }''')
            if shortcut:
                page.keyboard.press(shortcut)
            else:
                trigger.click()
            dialog = page.locator('#site-search-dialog')
            expect(dialog).to_be_visible(timeout=2000)
            search = dialog.get_by_role('combobox')
            expect(search).to_be_focused()
            audit = page.evaluate('window.searchOpenAudit')
            assert not scripts, f'Search opening required new JavaScript downloads: {scripts}'
            assert len(rpc) == before_rpc, 'Opening an empty dialog requested search results'
            assert not audit['loading'], f'Loading-search banner appeared: {audit}'
            result = {
                'locale': locale, 'width': width, 'motion': motion,
                'shortcut': shortcut, 'insertMs': round(audit['inserted'] - audit['started']),
                'focusMs': round(audit['focused'] - audit['started']),
                'newScriptRequests': len(scripts), 'initialSearchRequests': len(rpc) - before_rpc,
            }
            RESULTS.append(result)
            print(json.dumps(result), flush=True)
            page.screenshot(path=str(OUTPUT / f'{locale}-{width}-{motion}.png'))
            page.keyboard.press('Tab')
            assert dialog.evaluate('(dialog) => dialog.contains(document.activeElement)'), 'Focus escaped dialog'
            page.keyboard.press('Escape')
            expect(dialog).not_to_be_visible()
            expect(trigger).to_be_focused()
            trigger.click()
            expect(dialog).to_be_visible()
            expect(search).to_be_focused()
            search.fill('xrf')
            page.wait_for_function('document.querySelector("#global-search-input")?.value === "xrf"')
            page.wait_for_timeout(800)
            assert len(rpc) > before_rpc, 'Typing did not request results'
            expect(dialog).to_be_visible()
            expect(dialog.get_by_role('button', name=re.compile('Try again|Coba lagi', re.I)).first).to_be_visible()
            assert not scripts, scripts
            assert not errors, errors
            page.keyboard.press('Escape')
            expect(trigger).to_be_focused()
            context.close()
    finally:
        browser.close()

(OUTPUT / 'results.json').write_text(json.dumps(RESULTS, indent=2), encoding='utf-8')
print(f'PASS: cold click/shortcut opening without new JS or search requests; keyboard/focus, locales, mobile, reduced motion. Evidence: {OUTPUT}')
