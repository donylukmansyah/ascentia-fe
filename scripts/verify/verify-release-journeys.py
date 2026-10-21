import argparse
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:3110')
parser.add_argument('--output', default='release-artifacts')
args = parser.parse_args()
base = args.url.rstrip('/')
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []


def record(name, passed, detail=None):
    results.append({'check': name, 'passed': bool(passed), 'detail': detail})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width in (390, 1440):
            context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
            errors = []
            writes = []
            mode = {'kind': 'failure'}

            def guard(route):
                request = route.request
                if request.method in ('GET', 'HEAD', 'OPTIONS'):
                    route.continue_()
                else:
                    payload = request.post_data or ''
                    if 'release-journey@example.com' in payload:
                        writes.append(payload)
                        if mode['kind'] == 'success':
                            route.fulfill(status=200, content_type='application/json', body='{}')
                        else:
                            route.fulfill(status=503, body='Intercepted release check; not delivered')
                    else:
                        route.abort()

            context.route('**/*', guard)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))

            def scenario(name, callback):
                try:
                    callback()
                    record(f'{width}px {name}', True)
                except Exception as error:
                    record(f'{width}px {name}', False, str(error))

            def listing():
                page.goto(base + '/products/brands', wait_until='networkidle', timeout=60000)
                cards = page.locator('#product-results article')
                expect(cards).to_have_count(8, timeout=30000)
                page.get_by_role('link', name='Go to page 2', exact=True).click()
                expect(page).to_have_url(re.compile(r'page=2'))
                expect(cards).to_have_count(1, timeout=30000)
                page.reload(wait_until='networkidle')
                expect(cards).to_have_count(1)
                page.go_back(wait_until='networkidle')
                expect(cards).to_have_count(8)
                page.locator('#product-results a[href="/products/brands?category=xrf-scientific"]').filter(visible=True).first.click()
                expect(page).to_have_url(re.compile(r'category=xrf-scientific'))
                expect(cards.first).to_be_visible()
                assert 'page=2' not in page.url
                page.goto(base + '/products/brands', wait_until='networkidle')
                search = page.get_by_role('searchbox', name='Search products', exact=True)
                search.fill('Phoenix')
                expect(page).to_have_url(re.compile(r'q=Phoenix'), timeout=15000)
                expect(cards.first).to_be_visible(timeout=20000)
                assert all('Phoenix' in text for text in cards.locator('h3').all_text_contents())
                search.fill('zzzz-release-nonexistent')
                expect(page.get_by_text('No products found', exact=True)).to_be_visible(timeout=20000)
                page.get_by_role('button', name='Clear search', exact=True).click()
                expect(search).to_have_value('')
                expect(cards).to_have_count(8, timeout=20000)

            scenario('pagination/filter/search/empty/reset/reload/Back', listing)

            def search_journey():
                page.goto(base, wait_until='networkidle')
                trigger = page.get_by_role('button', name='Search Ascentia', exact=True).filter(visible=True)
                trigger.click()
                dialog = page.get_by_role('dialog', name='Search Ascentia', exact=True)
                field = dialog.get_by_role('combobox')
                field.fill('xrf')
                options = dialog.get_by_role('option')
                expect(options.first).to_be_visible(timeout=20000)
                field.press('ArrowDown')
                active = field.get_attribute('aria-activedescendant')
                assert active
                href = page.locator(f'[id="{active}"]').get_attribute('href')
                field.press('Enter')
                expect(dialog).not_to_be_visible()
                page.wait_for_url('**' + href, timeout=30000)
                expect(page.locator('main h1')).to_be_visible()

            scenario('global search keyboard result navigation', search_journey)

            def quote():
                page.goto(base + '/products/xrtga-range-thermogravimetric-analyser', wait_until='networkidle')
                trigger = page.get_by_role('button', name='Request a Quote', exact=True)
                trigger.click()
                dialog = page.get_by_role('dialog', name='Request a Quote', exact=True)
                expect(dialog).to_be_visible()
                name = dialog.locator('input[name="name"]')
                expect(name).to_be_focused()
                submit = dialog.get_by_role('button', name='Submit Request', exact=True)
                submit.click()
                expect(name).to_be_focused()
                assert not writes
                name.fill('Release journey')
                dialog.locator('input[name="email"]').fill('release-journey@example.com')
                dialog.locator('textarea').fill('Intercepted quotation. Never deliver.')
                submit.click()
                expect(dialog.get_by_role('alert')).to_be_visible(timeout=15000)
                expect(dialog.locator('textarea')).to_have_value('Intercepted quotation. Never deliver.')
                assert len(writes) == 1
                mode['kind'] = 'success'
                submit.click()
                expect(dialog.get_by_role('status')).to_be_visible(timeout=15000)
                assert len(writes) == 2
                page.keyboard.press('Escape')
                expect(dialog).not_to_be_visible()
                expect(trigger).to_be_focused()
                trigger.click()
                expect(dialog.locator('input[name="name"]')).to_have_value('')
                page.keyboard.press('Escape')

            scenario('quote validation/error preservation/retry/simulated success/focus/reset', quote)

            def locale():
                if width < 1024:
                    page.goto(base + '/id/products/brands?category=xrf-scientific&page=2', wait_until='networkidle')
                    expect(page.locator('html')).to_have_attribute('lang', 'id')
                    page.reload(wait_until='networkidle')
                    expect(page.locator('html')).to_have_attribute('lang', 'id')
                    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
                    return
                page.goto(base + '/products/brands?category=xrf-scientific&page=2#product-results', wait_until='networkidle')
                page.evaluate('scrollTo(0, 900)')
                page.evaluate('scrollTo(0, 400)')
                trigger = page.get_by_role('button', name='EN, English, select language', exact=True)
                trigger.click()
                page.get_by_role('menuitemradio', name='Bahasa Indonesia', exact=True).click()
                expect(page).to_have_url(re.compile(r'/id/products/brands\?'))
                expect(page.locator('html')).to_have_attribute('lang', 'id')
                page.wait_for_timeout(600)
                assert page.evaluate('scrollY') <= 2
                assert parse_qs(urlparse(page.url).query) == {'category': ['xrf-scientific'], 'page': ['2']}
                assert not urlparse(page.url).fragment
                page.get_by_role('button', name='ID, Bahasa Indonesia, select language', exact=True).click()
                page.get_by_role('menuitemradio', name='English', exact=True).click()
                expect(page.locator('html')).to_have_attribute('lang', 'en')
                assert '/id/' not in page.url

            scenario('locale URL/query/hash/reload/scroll', locale)

            if width == 1440:
                def same_locale():
                    page.goto(base, wait_until='networkidle')
                    page.evaluate('scrollTo(0, 1400)')
                    page.wait_for_timeout(500)
                    page.evaluate('scrollBy(0, -120)')
                    page.wait_for_timeout(650)
                    before = page.evaluate('scrollY')
                    page.get_by_role('button', name='EN, English, select language', exact=True).click()
                    page.get_by_role('menuitemradio', name='English', exact=True).click()
                    page.wait_for_timeout(600)
                    after = page.evaluate('scrollY')
                    assert abs(after - before) <= 2, f'Selecting current language shifted scroll: {before} to {after}'

                scenario('selecting current language preserves scroll', same_locale)
            record(f'{width}px no uncaught journey exceptions', not errors, errors)
            page.screenshot(path=str(output / f'journeys-{width}.png'))
            context.close()
    finally:
        browser.close()

(output / 'results.json').write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
failed = [item['check'] for item in results if not item['passed']]
print(f'{len(results) - len(failed)}/{len(results)} journeys passed. No real submissions.', flush=True)
assert not failed, '\n'.join(failed)
