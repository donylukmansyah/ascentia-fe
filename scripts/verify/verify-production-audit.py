import argparse
import gzip
import json
import re
import time
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:3103')
parser.add_argument('--output', default='audit-artifacts')
args = parser.parse_args()
base = args.url.rstrip('/')
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []


def check(name, passed, detail=None):
    results.append({'check': name, 'passed': bool(passed), 'detail': detail})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)


with urlopen(base, timeout=45) as response:
    html = response.read().decode()
assets = list(dict.fromkeys(re.findall(r'(?:href|src)="([^\"]+\.(?:css|js))"', html)))
for extension in ('.css', '.js'):
    path = next(asset for asset in assets if asset.endswith(extension))
    with urlopen(Request(base + path, headers={'Accept-Encoding': 'gzip'}), timeout=30) as response:
        encoded = response.read()
        check(f'{extension} gzip negotiated', response.headers.get('Content-Encoding') == 'gzip')
        decoded = gzip.decompress(encoded)
    with urlopen(Request(base + path, headers={'Accept-Encoding': 'identity'}), timeout=30) as response:
        check(f'{extension} gzip preserves content', decoded == response.read())
    with urlopen(Request(base + path, headers={'Accept-Encoding': 'br'}), timeout=30) as response:
        check(f'{extension} Brotli negotiated', response.headers.get('Content-Encoding') == 'br')
with urlopen(base + '/brand/logo-white.webp', timeout=30) as response:
    check('unversioned brand image cache bounded', response.headers.get('Cache-Control') == 'public, max-age=86400')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width in (360, 390, 768, 1440):
            context = browser.new_context(
                viewport={'width': width, 'height': 900},
                reduced_motion='reduce',
            )
            errors = []
            blocked_writes = []

            def guard(route):
                if route.request.method not in ('GET', 'HEAD', 'OPTIONS'):
                    if 'Audit intercepted' in (route.request.post_data or ''):
                        blocked_writes.append(route.request.url)
                    route.fulfill(status=503, body='Audit: simulated failure. Nothing delivered.')
                else:
                    route.continue_()

            context.route('**/*', guard)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            try:
                for path in ('/', '/about-us', '/products/brands', '/products/types',
                             '/products/applications', '/news', '/blogs', '/contact-us'):
                    response = page.goto(base + path, wait_until='domcontentloaded', timeout=60000)
                    expect(page.locator('main h1')).to_be_visible(timeout=20000)
                    page.wait_for_function("document.fonts.status === 'loaded'")
                    check(f'{width}px {path} status 200', response.status == 200)
                    check(f'{width}px {path} no overflow', page.evaluate(
                        'document.documentElement.scrollWidth <= innerWidth + 1'))
                    if path == '/':
                        trigger = page.get_by_role('button', name='Search Ascentia', exact=True).filter(visible=True)
                        trigger.click()
                        dialog = page.get_by_role('dialog', name='Search Ascentia', exact=True)
                        expect(dialog.get_by_role('combobox')).to_be_focused()
                        page.keyboard.press('Escape')
                        expect(dialog).not_to_be_visible()
                        expect(trigger).to_be_focused()
                        check(f'{width}px search keyboard focus restored', True)
                        if width < 1024:
                            page.get_by_role('button', name='Open navigation menu', exact=True).click()
                            expect(page.locator('#mobile-navigation')).to_be_visible()
                            page.get_by_role('button', name='Close navigation menu', exact=True).click()
                            check(f'{width}px mobile navigation', True)
                    elif path == '/products/brands':
                        cards = page.locator('#product-results article a')
                        expect(cards.first).to_be_visible(timeout=25000)
                        product_path = cards.first.get_attribute('href')
                        page.goto(base + product_path, wait_until='networkidle', timeout=60000)
                        expect(page.locator('#product-detail-heading')).to_be_visible()
                        check(f'{width}px product tabs available', page.get_by_role('tab').count() > 0)
                        tabs = page.get_by_role('tab')
                        tabs.first.focus()
                        page.keyboard.press('End')
                        expect(tabs.last).to_have_attribute('aria-selected', 'true')
                        page.keyboard.press('Home')
                        expect(tabs.first).to_have_attribute('aria-selected', 'true')
                        check(f'{width}px product keyboard tabs', True)
                        if width == 390:
                            link = page.locator('a[href^="https://wa.me/"][aria-label*="product"]')
                            message = parse_qs(urlparse(link.get_attribute('href')).query).get('text', [''])[0]
                            check('direct product WhatsApp contains product URL', product_path in message, message)
                    elif path in ('/news', '/blogs'):
                        articles = page.locator(f'main article a[href^="{path}/"]')
                        expect(articles.first).to_be_visible(timeout=25000)
                        articles.first.click()
                        expect(page.locator('.article-rich-text')).to_be_visible(timeout=25000)
                        check(f'{width}px {path} article detail', True)
                    elif path == '/contact-us':
                        form = page.locator('main form')
                        submit = form.get_by_role('button', name='Send enquiry', exact=True)
                        submit.click()
                        expect(form.locator('input[name="name"]')).to_be_focused()
                        check(f'{width}px empty contact validation', not blocked_writes)
                        form.locator('input[name="name"]').fill('Audit intercepted')
                        form.locator('input[name="email"]').fill('invalid-email')
                        form.locator('textarea[name="message"]').fill('Audit failure preservation check. Never deliver.')
                        submit.click()
                        expect(form.locator('input[name="email"]')).to_be_focused()
                        check(f'{width}px invalid email blocked', not blocked_writes)
                        form.locator('input[name="email"]').fill('audit@example.com')
                        submit.click()
                        expect(form.get_by_role('alert')).to_be_visible(timeout=15000)
                        expect(form.locator('textarea')).to_have_value('Audit failure preservation check. Never deliver.')
                        check(f'{width}px failed contact preserves input', len(blocked_writes) == 1)
                        page.screenshot(path=str(output / f'contact-{width}.png'))
                response = page.goto(base + '/audit-page-that-does-not-exist', wait_until='domcontentloaded')
                expect(page.get_by_role('heading', name='Page not found', exact=True)).to_be_visible()
                check(f'{width}px genuine 404', response.status == 404)
                check(f'{width}px no uncaught exceptions', not errors, errors)
            except Exception as error:
                check(f'{width}px scenario completed', False, str(error))
            finally:
                context.close()

        for failure in (False, True):
            context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
            context.route('**/*', lambda route: route.abort() if route.request.method not in ('GET', 'HEAD', 'OPTIONS') else route.continue_())
            page = context.new_page()
            try:
                if failure:
                    page.route('**/basemaps.cartocdn.com/**', lambda route: route.abort())
                page.goto(base + '/contact-us', wait_until='networkidle')
                check(f'maps remain unloaded above fold failure={failure}', page.locator('.maplibregl-canvas').count() == 0)
                page.locator('#jakarta-map').scroll_into_view_if_needed()
                if failure:
                    alert = page.locator('#jakarta-map [role="alert"]')
                    expect(alert).to_be_visible(timeout=30000)
                    check('map failure preserves external directions', alert.get_by_role('link', name='Open in Google Maps').count() == 1)
                    page.unroute('**/basemaps.cartocdn.com/**')
                    alert.get_by_role('button', name='Try again').click()
                    expect(alert).to_have_count(0, timeout=30000)
                    check('map recovers after retry', True)
                expect(page.locator('#jakarta-map .maplibregl-canvas')).to_be_visible(timeout=30000)
                expect(page.locator('#jakarta-map [role="dialog"]')).to_have_attribute('aria-label', 'Office info', timeout=15000)
                check(f'lazy map initializes with named popup failure={failure}', True)
            except Exception as error:
                check(f'map scenario failure={failure}', False, str(error))
            finally:
                context.close()

        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        context.route('**/*', lambda route: route.abort() if route.request.method not in ('GET', 'HEAD', 'OPTIONS') else route.continue_())
        page = context.new_page()
        try:
            page.route('**/_serverFn/**', lambda route: route.fulfill(status=503, body='Audit offline simulation'))
            page.goto(base, wait_until='networkidle', timeout=60000)
            page.get_by_role('button', name='Search Ascentia', exact=True).filter(visible=True).click()
            dialog = page.get_by_role('dialog', name='Search Ascentia', exact=True)
            dialog.get_by_role('combobox').fill('audit-offline-probe')
            alert = dialog.get_by_role('alert').first
            expect(alert).to_be_visible(timeout=15000)
            check('search 503 exposes retry', alert.get_by_role('button', name='Try again').count() > 0)
            page.unroute('**/_serverFn/**')
            alert.get_by_role('button', name='Try again').click()
            expect(dialog.get_by_role('alert')).to_have_count(0, timeout=20000)
            check('search recovers after retry', True)
        except Exception as error:
            check('search failure/recovery scenario completed', False, str(error))
        finally:
            context.close()

        context = browser.new_context(viewport={'width': 390, 'height': 844})
        context.route('**/*', lambda route: route.abort() if route.request.method not in ('GET', 'HEAD', 'OPTIONS') else route.continue_())
        page = context.new_page()
        try:
            session = context.new_cdp_session(page)
            session.send('Network.enable')
            session.send('Network.emulateNetworkConditions', {
                'offline': False, 'latency': 150,
                'downloadThroughput': 1_600_000 / 8,
                'uploadThroughput': 750_000 / 8,
            })
            session.send('Emulation.setCPUThrottlingRate', {'rate': 4})
            started = time.monotonic()
            page.goto(base, wait_until='domcontentloaded', timeout=90000)
            trigger = page.get_by_role('button', name='Search Ascentia', exact=True).filter(visible=True)
            trigger.click(timeout=60000)
            first_click_state = {'aria_expanded': page.locator('[data-site-search-trigger][aria-expanded="true"]').count() > 0}
            dialog = page.get_by_role('dialog', name='Search Ascentia', exact=True)
            try:
                expect(dialog).to_be_visible(timeout=5000)
                first_click = True
            except AssertionError:
                first_click = False
            check('slow network first search click opens dialog', first_click, first_click_state)
            page.wait_for_load_state('networkidle', timeout=60000)
            if not dialog.is_visible():
                trigger.click()
            expect(dialog).to_be_visible(timeout=15000)
            check('slow network search works after hydration', True, {'navigation_to_open_seconds': round(time.monotonic() - started, 2)})
            page.keyboard.press('Escape')
            page.screenshot(path=str(output / 'slow-mobile.png'))
        except Exception as error:
            check('slow network/CPU scenario completed', False, str(error))
        finally:
            context.close()
    finally:
        browser.close()

(output / 'results.json').write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
failures = [result['check'] for result in results if not result['passed']]
print(f'{len(results) - len(failures)}/{len(results)} checks passed. Evidence: {output}', flush=True)
assert not failures, '\n'.join(failures)
