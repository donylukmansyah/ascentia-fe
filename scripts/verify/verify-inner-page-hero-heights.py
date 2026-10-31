import argparse
import json
import os
from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import TimeoutError, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default=os.environ.get('SITE_URL', 'http://localhost:3000'))
parser.add_argument('--output', default=str(Path(gettempdir()) / 'ascentia-hero-heights'))
parser.add_argument('--widths', nargs='+', type=int, default=[320, 390, 768, 1024, 1440])
args = parser.parse_args()
base = args.url.rstrip('/')
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []


def check(label, passed, detail=None):
    results.append({'check': label, 'passed': bool(passed), 'detail': detail})
    print(('PASS ' if passed else 'FAIL ') + label, flush=True)
    (output / 'results.json').write_text(json.dumps(results, indent=2), encoding='utf-8')


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(reduced_motion='reduce', service_workers='block')
    writes = []

    def readonly(route):
        if route.request.method not in ('GET', 'HEAD', 'OPTIONS'):
            writes.append(route.request.url)
            route.fulfill(status=200, content_type='application/json', body='{"success":false,"views":0}')
        else:
            route.continue_()

    context.route('**/*', readonly)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def open_page(path):
        response = page.goto(base + path, wait_until='domcontentloaded', timeout=60000)
        page.locator('main h1').first.wait_for(state='visible')
        page.evaluate('document.fonts.ready')
        try:
            page.wait_for_load_state('networkidle', timeout=2000)
        except TimeoutError:
            pass
        assert response.status == 200, (path, response.status)

    for width in args.widths:
        page.set_viewport_size({'width': width, 'height': 900})
        for locale in ('', '/en'):
            prefix = f'{width}px {locale or "id"}'
            article_path = None
            open_page(locale + '/products/brands')
            baseline = page.locator('section[aria-labelledby="products-hero-heading"]').bounding_box()['height']
            expected = 440 if width >= 1024 else 400 if width >= 640 else 340
            check(prefix + ' Products baseline unchanged', abs(baseline - expected) < 1, baseline)
            for path, heading in (
                ('/about-us', 'about-hero-heading'),
                ('/news', 'news-hero-heading'),
                ('/blogs', 'blogs-hero-heading'),
                ('/contact-us', 'contact-hero-heading'),
            ):
                open_page(locale + path)
                hero = page.locator(f'section[aria-labelledby="{heading}"]')
                dimensions = hero.evaluate('''e => {
                    const rect = e.getBoundingClientRect();
                    const text = e.querySelector('.hero-carousel__copy').getBoundingClientRect();
                    const heading = e.querySelector('h1').getBoundingClientRect();
                    const header = document.querySelector('header').getBoundingClientRect();
                    return {height: rect.height, textBottom: text.bottom, bottom: rect.bottom,
                        textInside: text.top >= rect.top && text.bottom <= rect.bottom,
                        belowHeader: heading.top >= header.bottom,
                        noOverflow: document.documentElement.scrollWidth <= innerWidth + 1};
                }''')
                check(prefix + path + ' matches Products', abs(dimensions['height'] - baseline) < 1, dimensions)
                check(prefix + path + ' text safe', dimensions['textInside'] and dimensions['belowHeader'] and dimensions['noOverflow'])
                image = hero.locator('img')
                check(prefix + path + ' hero image loaded', image.evaluate('e => e.complete && e.naturalWidth > 0'))
                check(prefix + path + ' reduced motion', image.evaluate('e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m42 === 0'))
                if path == '/contact-us':
                    panel = page.locator('#contact-content').bounding_box()
                    check(prefix + path + ' panel below hero copy', panel['y'] >= dimensions['textBottom'] + 8, panel['y'] - dimensions['textBottom'])
                if width in (390, 1440) and not locale:
                    page.screenshot(path=str(output / f'{heading}-{width}.png'))
                if path == '/blogs':
                    article_link = page.locator('main article a[href*="/blogs/"]').first
                    article_path = article_link.get_attribute('href') if article_link.count() else None
                hero.locator('a[href^="#"]').click()
                page.wait_for_function('location.hash.length > 1')
                target = page.locator(page.evaluate('location.hash'))
                check(prefix + path + ' content anchor works', target.count() == 1)
            if article_path:
                open_page(article_path)
                header = page.locator('main article > div').first.locator(':scope > div').first
                minimum = header.evaluate('e => parseFloat(getComputedStyle(e).minHeight)')
                check(prefix + ' editorial header baseline', abs(minimum - baseline) < 1, minimum)
                check(prefix + ' editorial title not clipped', header.evaluate('''e => {
                    const h = e.querySelector('h1').getBoundingClientRect(), r = e.getBoundingClientRect();
                    return h.top >= document.querySelector('header').getBoundingClientRect().bottom &&
                        h.bottom <= r.bottom && document.documentElement.scrollWidth <= innerWidth + 1;
                }'''))
                original = page.locator('main h1').inner_text()
                page.locator('main h1').evaluate('(e, title) => e.textContent = title.repeat(4)', original + ' ')
                check(prefix + ' long title grows safely', header.evaluate('''e => {
                    const h = e.querySelector('h1').getBoundingClientRect(), r = e.getBoundingClientRect();
                    return h.bottom <= r.bottom && e.scrollHeight <= e.clientHeight + 1 &&
                        document.documentElement.scrollWidth <= innerWidth + 1;
                }'''))
                if width in (390, 1440) and not locale:
                    page.locator('main h1').evaluate('(e, title) => e.textContent = title', original)
                    page.screenshot(path=str(output / f'article-detail-{width}.png'))
            else:
                check(prefix + ' editorial fixture available', False)
        open_page('/')
        homepage = page.locator('section.hero-carousel')
        check(f'{width}px homepage full height unchanged', homepage.bounding_box()['height'] >= 900)
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.emulate_media(reduced_motion='no-preference')
    for path, heading in (('/about-us', 'about'), ('/news', 'news'), ('/blogs', 'blogs'), ('/contact-us', 'contact')):
        open_page(path)
        image = page.locator(f'section[aria-labelledby="{heading}-hero-heading"] img')
        before = image.evaluate('e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m42')
        page.evaluate('scrollTo(0, 200)')
        page.wait_for_function('scrollY >= 190')
        page.wait_for_timeout(150)
        after = image.evaluate('e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m42')
        check(path + ' parallax retained', after > before, {'before': before, 'after': after})
    check('no uncaught browser errors', not errors, errors)
    context.close()
    browser.close()

assert all(row['passed'] for row in results), 'Hero height or content safety regression; see results.json'
print(f'PASS: {len(results)} checks. Browser writes intercepted: {len(writes)}. Evidence: {output}')
