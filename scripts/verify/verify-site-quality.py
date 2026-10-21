import argparse
import gzip
import json
import os
import re
from pathlib import Path
from tempfile import gettempdir
from urllib.request import Request, urlopen

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default=os.environ.get('SITE_URL', 'http://localhost:3103'))
parser.add_argument('--output', default=str(Path(gettempdir()) / 'ascentia-quality'))
parser.add_argument('--lighthouse', action='store_true')
args = parser.parse_args()
base = args.url.rstrip('/')
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
failures = []
results = []


def check(label, condition, detail=None):
    results.append({'check': label, 'passed': bool(condition), 'detail': detail})
    print(('PASS ' if condition else 'FAIL ') + label, flush=True)
    if not condition:
        failures.append(label)


with urlopen(base + '/', timeout=45) as response:
    html = response.read().decode()
check('production assets only', 'tanstack-start-dev-client-entry' not in html)
with urlopen(Request(base + '/', headers={'Accept-Encoding': 'gzip'}), timeout=45) as response:
    compressed = response.read()
    encoded = response.headers.get('Content-Encoding') == 'gzip'
    check('HTML compression negotiated', encoded)
    if encoded:
        check('compressed HTML decodes', '<html' in gzip.decompress(compressed).decode())
with urlopen(base + '/robots.txt', timeout=45) as response:
    robots = response.read().decode()
    check('robots is text with crawler rules', 'text/plain' in response.headers.get('Content-Type', '') and 'user-agent:' in robots.lower() and '<html' not in robots.lower())

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width in (390, 1440):
            context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
            errors = []
            writes = []
            mocked = []
            mode = {'failure': True}

            def route_request(route):
                request = route.request
                if request.method not in ('GET', 'HEAD', 'OPTIONS'):
                    writes.append(request.url)
                    if '/_serverFn/' in request.url:
                        mocked.append(request.url)
                        if mode['failure']:
                            route.fulfill(status=503, content_type='text/plain', body='Verification delivery unavailable')
                        else:
                            route.fulfill(status=200, content_type='application/json', body='{}')
                    else:
                        route.abort()
                else:
                    route.continue_()

            context.route('**/*', route_request)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))

            def open_page(path):
                response = page.goto(base + path, wait_until='domcontentloaded', timeout=60000)
                expect(page.locator('main')).to_be_visible()
                page.wait_for_function("document.fonts.status === 'loaded'")
                check(f'{width}px {path} HTTP success', response is not None and response.status == 200)
                check(f'{width}px {path} no overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
                return response

            open_page('/')
            canonical_before = page.locator('link[rel="canonical"]').evaluate_all('(links) => links.map(link => link.href)')
            page.get_by_role('button', name='Search Ascentia', exact=True).filter(visible=True).click()
            dialog = page.get_by_role('dialog', name='Search Ascentia', exact=True)
            expect(dialog).to_be_visible()
            expect(dialog.get_by_role('combobox')).to_be_focused()
            page.keyboard.press('Escape')
            expect(dialog).not_to_be_visible()
            expect(page.get_by_role('button', name='Search Ascentia', exact=True).filter(visible=True)).to_be_focused()
            canonical_after = page.locator('link[rel="canonical"]').evaluate_all('(links) => links.map(link => link.href)')
            check(f'{width}px stable single canonical', len(canonical_after) == 1 and canonical_before == canonical_after, canonical_after)
            check(f'{width}px descriptive About link', page.get_by_role('link', name=re.compile('about ascentia', re.I)).count() > 0)
            logo = page.locator('header img[alt="Ascentia Arsya Analitika"]')
            check(f'{width}px logo intrinsic dimensions', logo.get_attribute('width') is not None and logo.get_attribute('height') is not None)
            contrast = page.evaluate('''() => {
                const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
                function luminance(color) {
                    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
                    return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => {
                        v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
                    }).reduce((n, v, i) => n + v * [.2126, .7152, .0722][i], 0);
                }
                return [...document.querySelectorAll('a')].filter(a => a.classList.contains('group/cta')).map(a => {
                    const style = getComputedStyle(a), fg = luminance(style.color), bg = luminance(style.backgroundColor);
                    return {text: a.innerText, ratio: (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05)};
                });
            }''')
            check(f'{width}px CTA contrast meets WCAG AA', bool(contrast) and all(item['ratio'] >= 4.5 for item in contrast), contrast)
            page.screenshot(path=str(output / f'home-{width}.png'))
            if width == 390:
                toggle = page.get_by_role('button', name='Open navigation menu', exact=True)
                toggle.click()
                expect(page.locator('#mobile-navigation')).to_be_visible()
                page.get_by_role('button', name='Close navigation menu', exact=True).click()

            for path in ('/about-us', '/products/brands', '/products/types', '/products/applications', '/news', '/blogs'):
                open_page(path)
                expect(page.locator('main h1')).to_have_count(1)
                if path == '/products/brands':
                    cards = page.locator('#product-results article a')
                    expect(cards.first).to_be_visible(timeout=45000)
                    href = cards.first.get_attribute('href')
                    cards.first.click()
                    page.wait_for_url('**/products/*')
                    expect(page.locator('#product-detail-heading')).to_be_visible(timeout=45000)
                    check(f'{width}px product detail navigates', href in page.url)
                    nav = page.get_by_role('navigation', name='Product detail sections')
                    nav.get_by_role('button', name='Overview', exact=True).click()
                    expect(page.get_by_role('tab', name='Overview', exact=True)).to_have_attribute('aria-selected', 'true')
                elif path in ('/news', '/blogs'):
                    links = page.locator(f'main article a[href^="{path}/"]')
                    expect(links.first).to_be_visible(timeout=45000)
                    links.first.click()
                    expect(page.locator('.article-rich-text')).to_be_visible(timeout=45000)
                    check(f'{width}px {path} detail navigates', path + '/' in page.url)

            open_page('/contact-us')
            form = page.locator('main form')
            form.get_by_role('button', name='Send enquiry', exact=True).click()
            check(f'{width}px empty form invalid', form.locator('p.text-destructive, [role="alert"]').count() > 0 or not form.evaluate('(form) => form.checkValidity()'))
            form.get_by_role('textbox', name=re.compile('name', re.I)).fill('Browser verification')
            form.get_by_role('textbox', name=re.compile('email', re.I)).fill('invalid-email')
            form.get_by_role('button', name='Send enquiry', exact=True).click()
            check(f'{width}px email validation', form.locator('p.text-destructive, [role="alert"]').count() > 0 or not form.evaluate('(form) => form.checkValidity()'))
            form.get_by_role('textbox', name=re.compile('email', re.I)).fill('verification@example.com')
            form.get_by_role('textbox', name=re.compile('message', re.I)).fill('Intercepted browser verification. Never deliver.')
            form.get_by_role('button', name='Send enquiry', exact=True).click()
            expect(form.get_by_role('alert')).to_be_visible(timeout=15000)
            expect(form.get_by_role('textbox', name=re.compile('message', re.I))).to_have_value('Intercepted browser verification. Never deliver.')
            check(f'{width}px failed submission preserves message', True)
            mode['failure'] = False
            form.get_by_role('button', name='Send enquiry', exact=True).click()
            expect(form.get_by_role('status')).to_contain_text('Thank you', timeout=15000)
            expect(form.get_by_role('textbox', name=re.compile('message', re.I))).to_have_value('')
            check(f'{width}px simulated success resets form', True)
            check(f'{width}px all writes intercepted', len(writes) == len(mocked) and len(mocked) >= 2, writes)
            page.screenshot(path=str(output / f'contact-{width}.png'))
            response = page.goto(base + '/quality-check-missing-page', wait_until='domcontentloaded')
            expect(page.get_by_role('heading', name='Page not found', exact=True)).to_be_visible()
            check(f'{width}px genuine 404 status', response.status == 404, response.status)
            page.get_by_role('link', name='Back to home', exact=True).click()
            expect(page.locator('main h1')).to_be_visible()
            check(f'{width}px no uncaught browser errors', not errors, errors)
            context.close()
    finally:
        browser.close()

(output / 'e2e-results.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
assert not failures, '\n'.join(failures)
print(f'PASS: {len(results)} checks. Evidence: {output}')

if args.lighthouse:
    import subprocess

    with sync_playwright() as p:
        environment = {**os.environ, 'CHROME_PATH': p.chromium.executable_path}
    pnpm = 'pnpm.cmd' if os.name == 'nt' else 'pnpm'
    scores = {}
    for mode in ('mobile', 'desktop'):
        command = [pnpm, 'dlx', 'lighthouse@13.5.0', base + '/', '--chrome-flags=--headless --no-sandbox', '--output=json', '--output=html', f'--output-path={output / ("optimized-" + mode)}', '--only-categories=performance,accessibility,best-practices,seo', '--quiet']
        if mode == 'desktop':
            command.append('--preset=desktop')
        subprocess.run(command, check=True, env=environment, timeout=180)
        report = json.loads((output / f'optimized-{mode}.report.json').read_text(encoding='utf-8'))
        scores[mode] = {key: round(value['score'] * 100) for key, value in report['categories'].items()}
        print(mode, scores[mode], flush=True)
    (output / 'lighthouse-scores.json').write_text(json.dumps(scores, indent=2), encoding='utf-8')
