import argparse
import json
import os
from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default=os.environ.get('SITE_URL', 'http://localhost:3000'))
parser.add_argument('--widths', nargs='+', type=int, default=[390, 768, 1440])
parser.add_argument('--english-prefix', choices=['', '/en'], default='/en')
parser.add_argument('--output', default=str(Path(gettempdir()) / 'ascentia-section-typography'))
args = parser.parse_args()
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []

style_script = '''element => {
    const style = getComputedStyle(element);
    return Object.fromEntries(['fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
        'letterSpacing', 'color', 'textTransform'].map(key => [key, style[key]]));
}'''


def style(locator):
    locator.wait_for(state='attached', timeout=30000)
    return locator.evaluate(style_script)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width in args.widths:
            context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
            context.route('**/*', lambda route: route.abort() if route.request.method not in ('GET', 'HEAD', 'OPTIONS') else route.continue_())
            page = context.new_page()
            detail_paths = []

            def open_page(path):
                resolved_path = (args.english_prefix + path[3:]) or '/'
                response = page.goto(args.url.rstrip('/') + resolved_path, wait_until='domcontentloaded', timeout=60000)
                assert response and response.status == 200, path
                page.wait_for_selector('main h2', state='attached', timeout=30000)
                page.wait_for_function("document.fonts.status === 'loaded' && window.__TSR_ROUTER__?.state.status === 'idle'")

            open_page('/en')
            featured = page.get_by_role('heading', name='Featured products', exact=True)
            title = style(featured)
            kicker = style(featured.locator('xpath=preceding-sibling::p[1]'))
            description = style(featured.locator('xpath=following-sibling::p[1]'))
            assert abs(float(title['fontSize'][:-2]) - max(28, min(width * .029, 40))) < .01, title
            assert title['fontWeight'] == '700' and title['color'] == 'oklch(0.25 0 0)', title
            assert abs(float(title['lineHeight'][:-2]) / float(title['fontSize'][:-2]) - 1.04) < .001, title
            assert abs(float(title['letterSpacing'][:-2]) / float(title['fontSize'][:-2]) + .04) < .001, title
            brand_color = style(page.get_by_role('heading', name='Brands we represent', exact=True))['color']
            assert kicker['color'] == brand_color, kicker
            assert kicker['fontSize'] == ('10px' if width < 640 else '11px'), kicker
            assert description['fontSize'] == ('14px' if width < 640 else '16px'), description
            assert description['color'] == 'rgb(102, 113, 122)', description
            ratio = page.evaluate('''color => {
                const ctx = document.createElement('canvas').getContext('2d');
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, 1, 1);
                const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(n => {
                    n /= 255;
                    return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
                });
                return 1.05 / (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 + .05);
            }''', brand_color)
            if ratio < 4.5:
                print(f'WARN: requested Brands label color contrast {ratio:.2f}:1; small text needs 4.5:1', flush=True)

            def check_heading(heading, label=False, body=False):
                actual = style(heading)
                assert actual == title, {'text': heading.inner_text(), 'actual': actual, 'expected': title}
                if label:
                    assert style(heading.locator('xpath=preceding-sibling::p[1]')) == kicker
                    assert heading.evaluate('''el => parseFloat(getComputedStyle(el).marginTop)
                        + parseFloat(getComputedStyle(el.previousElementSibling).marginBottom)''') == 8
                if body:
                    assert style(heading.locator('xpath=following-sibling::p[1]')) == description
                    assert heading.locator('xpath=following-sibling::p[1]').evaluate('(el) => getComputedStyle(el).marginTop') == '16px'

            def check_page(path, headings):
                for selector, expected in [('main .section-title', title), ('main .section-kicker', kicker), ('main .section-description', description)]:
                    for element in page.locator(selector).all():
                        assert style(element) == expected, {'path': path, 'text': element.inner_text()}
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), path
                results.append({'width': width, 'path': path, 'headings': headings, 'passed': True})
                print(f'PASS {width}px {path}: {headings} section headings, consistent text, no overflow', flush=True)

            check_heading(featured, label=True, body=True)
            check_heading(page.locator('#contact-panel-heading'), label=True, body=True)
            check_page('/en', 2)

            for path, selectors in [
                ('/en/about-us', ['#about-company-heading', '#about-locations-heading', '#about-partners-heading', '#about-gallery-heading']),
                ('/en/products/brands', ['#product-results h2']),
                ('/en/products/types', ['#product-results h2']),
                ('/en/products/applications', ['#product-results h2']),
                ('/en/news', ['#featured-news-heading', '#latest-news-heading', '#popular-news-heading']),
                ('/en/blogs', ['#blogs-list-heading']),
                ('/en/contact-us', ['#contact-panel-heading', '#about-locations-heading']),
            ]:
                open_page(path)
                if '/products/' in path:
                    heading = page.locator('#product-results h2').last
                    check_heading(heading, label=True)
                else:
                    for selector in selectors:
                        check_heading(page.locator(selector), label=path in ('/en/about-us', '/en/contact-us'), body=selector in ('#about-company-heading', '#contact-panel-heading'))
                if path == '/en/contact-us':
                    assert style(page.locator('#jakarta-map-heading').locator('xpath=preceding-sibling::p[1]')) == kicker
                if path == '/en/about-us':
                    check_heading(page.locator('main h2').filter(has_text='Our Customers'))
                    for selector in ('#about-locations-heading', '#about-partners-heading', '#about-gallery-heading'):
                        assert style(page.locator(selector).locator('xpath=../following-sibling::p[1]')) == description
                check_page(path, len(selectors))
                if path in ('/en/products/brands', '/en/news', '/en/blogs'):
                    link = page.locator('main article a').first
                    link.wait_for(state='attached', timeout=30000)
                    detail_paths.append('/en' + link.get_attribute('href').removeprefix('/en'))
            for path in detail_paths:
                open_page(path)
                related = page.locator('#related-products-heading, #related-news-heading')
                related.wait_for(state='attached', timeout=30000)
                check_heading(related, body=True)
                check_page(path, page.locator('main .section-title').count())
            context.close()
    finally:
        browser.close()

(output / 'results.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(f'PASS: {len(results)} page/viewport checks. Evidence: {output}')
