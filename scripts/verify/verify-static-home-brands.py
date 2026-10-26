import os
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright

base = os.environ.get('SITE_URL', 'http://127.0.0.1:3120').rstrip('/')
logos = Path(__file__).parents[2] / 'public/images/about-us/our-partner-logo'
expected = {'/images/about-us/our-partner-logo/' + path.name for path in logos.glob('*.png')}
assert len(expected) == 6

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width, javascript in ((390, False), (390, True), (1440, False), (1440, True)):
            context = browser.new_context(
                viewport={'width': width, 'height': 900},
                java_script_enabled=javascript,
                reduced_motion='reduce',
            )
            errors = []
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            context.route('**/*', lambda route: route.abort() if '/_serverFn/' in route.request.url or route.request.method not in ('GET', 'HEAD', 'OPTIONS') else route.continue_())
            page.goto(base, wait_until='networkidle', timeout=45000)
            section = page.locator('section[aria-label="Brands we represent"]')
            expect(section).to_be_visible()
            section.scroll_into_view_if_needed()
            images = section.locator('img')
            sources = set(images.evaluate_all('(images) => images.map(image => image.getAttribute("src"))'))
            assert sources == expected, sources
            assert not any(images.evaluate_all('(images) => images.map(image => image.getAttribute("srcset"))'))
            assert images.evaluate_all('(images) => images.filter(image => !image.closest(\'[aria-hidden="true"]\')).every(image => !!image.alt)')
            expect(images.first).to_be_visible()
            images.evaluate_all('(images) => images.forEach(image => image.loading = "eager")')
            page.wait_for_function('selector => [...document.querySelectorAll(selector)].every(image => image.complete && image.naturalWidth > 0)', arg='section[aria-label="Brands we represent"] img')
            assert page.get_by_text('Unable to load brands.', exact=True).count() == 0
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            assert not errors, errors
            context.close()
            print(f'PASS {width}px JS={javascript}: static logos render despite unavailable CMS/server functions, accessible labels, no overflow')
    finally:
        browser.close()

for source in sorted(expected):
    assert urlparse(urljoin(base, source)).netloc == urlparse(base).netloc
    with urlopen(urljoin(base, source), timeout=15) as response:
        assert response.status == 200
        assert response.headers.get('Content-Type', '').startswith('image/png')
print('PASS: all 6 About partner logo assets served from frontend; no CMS media required')
