import json
import os
import urllib.request
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')
WP = os.environ.get('WORDPRESS_URL', 'http://ascentia-local.local')
SLUG = 'xrtga-range-thermogravimetric-analyser'
URL = f'{BASE}/products/{SLUG}'
TEMP = Path(os.environ.get('TEMP', '/tmp'))


def read_json(path):
    with urllib.request.urlopen(f'{WP}/wp-json/{path}', timeout=25) as response:
        return json.load(response)


def wait_hydrated(page):
    page.wait_for_function('''() => Object.keys(document.querySelector(
      '[role="tab"]'
    ) || {}).some(key => key.startsWith('__reactProps$'))''')


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        product = read_json(
            f'wp/v2/product?slug={SLUG}&_fields=id,acf&acf_format=standard'
        )[0]
        raw = read_json(f'wc/store/v1/products/{product["id"]}?_fields=images')
        images = [
            {
                'id': str(image['id']),
                'src': image['src'],
                'thumbnail': image['thumbnail'],
                'srcSet': image['srcset'],
                'alt': image['alt'],
            }
            for image in raw['images']
        ]
        assert len(images) > 1, 'Expected multiple photos in the live fixture'
        assert product['acf']['applications'], 'Applications fixture is empty'

        for width in (360, 390, 768, 1440):
            page = browser.new_page(
                viewport={'width': width, 'height': 960},
                is_mobile=width < 768,
                has_touch=width < 768,
            )
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.emulate_media(reduced_motion='reduce')
            page.goto(URL + '#applications', wait_until='domcontentloaded')
            applications = page.get_by_role('tab', name='Applications', exact=True)
            expect(applications).to_have_attribute('aria-selected', 'true', timeout=30000)
            wait_hydrated(page)
            expect(page.locator('#applications-panel')).to_be_visible()
            assert page.get_by_role('tablist').count() == 1

            rail = page.get_by_role('group', name='Choose product photo', exact=True)
            thumbnails = rail.get_by_role('button')
            expect(thumbnails).to_have_count(len(images))
            assert rail.evaluate('''e => {
              const tops = [...e.children].map(c => c.getBoundingClientRect().top);
              return Math.max(...tops) - Math.min(...tops) < 1;
            }'''), f'{width}px: thumbnails wrapped'

            expect(page.get_by_role('button', name='Previous thumbnails', exact=True)).to_have_count(0)
            expect(page.get_by_role('button', name='Next thumbnails', exact=True)).to_have_count(0)

            last = thumbnails.last
            last.click()
            expect(last).to_have_attribute('aria-pressed', 'true')

            nav = page.get_by_role('navigation', name='Product detail sections')
            nav.get_by_role('button', name='Specifications', exact=True).click()
            expect(page.get_by_role('tab', name='Specifications', exact=True)).to_have_attribute('aria-selected', 'true')
            page.wait_for_function("location.hash === '#specifications'")
            nav.get_by_role('button', name='Applications', exact=True).click()
            expect(applications).to_have_attribute('aria-selected', 'true')
            page.wait_for_function("location.hash === '#applications'")
            expect(last).to_have_attribute('aria-pressed', 'true')
            applications.focus()
            page.keyboard.press('ArrowLeft')
            expect(page.get_by_role('tab', name='Specifications', exact=True)).to_be_focused()
            page.keyboard.press('Home')
            expect(page.get_by_role('tab', name='Description', exact=True)).to_be_focused()
            page.keyboard.press('End')
            expect(applications).to_be_focused()
            expect(applications).to_have_attribute('aria-selected', 'true')

            first = thumbnails.first
            first.focus()
            page.keyboard.press('Space')
            expect(first).to_have_attribute('aria-pressed', 'true')
            assert rail.evaluate('r => r.scrollLeft') <= 1

            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            page.locator('#product').scroll_into_view_if_needed()
            if width in (390, 1440):
                page.screenshot(path=str(TEMP / f'ascentia-product-gallery-{width}.png'))
            assert not errors, errors
            page.close()
            print(f'PASS: {width}px gallery, Applications, hashes, keyboard, no overflow')

        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.emulate_media(reduced_motion='reduce')
        page.goto(f'{BASE}/products/modutemp-shaking-fusion-furnace-6-positions#applications', wait_until='domcontentloaded')
        expect(page.get_by_role('tab', name='Description', exact=True)).to_have_attribute('aria-selected', 'true', timeout=30000)
        expect(page.get_by_role('tab', name='Applications', exact=True)).to_have_count(0)
        expect(page.get_by_role('group', name='Choose product photo', exact=True)).to_have_count(0)
        print('PASS: missing Applications falls back; single photo has no thumbnail rail')

        page.goto(URL, wait_until='domcontentloaded')
        expect(page.get_by_role('tab', name='Applications', exact=True)).to_be_visible(timeout=30000)
        wait_hydrated(page)
        page.evaluate('''async () => {
          const [reactModule, domModule, galleryModule] = await Promise.all([
            import('/node_modules/.vite/deps/react.js'),
            import('/node_modules/.vite/deps/react-dom_client.js'),
            import('/src/features/products/components/product-image-gallery.tsx'),
          ]);
          const React = reactModule.default || reactModule;
          const DOM = domModule.default || domModule;
          const host = document.createElement('div');
          host.style.cssText = 'position:fixed;inset:0;z-index:10000;background:white;padding:20px;overflow:auto';
          document.body.append(host);
          const mount = document.createElement('div');
          mount.style.maxWidth = '420px';
          host.append(mount);
          const root = DOM.createRoot(mount);
          window.renderGalleryFixture = (images, key) => root.render(
            React.createElement(galleryModule.ProductImageGallery, {
              images, productName: 'Gallery fixture', key,
            })
          );
        }''')

        def render_fixture(items, key='fixture'):
            page.evaluate('({items,key}) => window.renderGalleryFixture(items,key)', {'items': items, 'key': key})

        fixture = page.get_by_role('group', name='Gallery fixture photos', exact=True)
        render_fixture([])
        expect(fixture.get_by_text('Photo unavailable', exact=True)).to_be_visible()
        expect(fixture.get_by_role('button')).to_have_count(0)
        render_fixture(images[:1])
        expect(fixture.locator('img')).to_have_count(1)
        expect(fixture.get_by_role('group', name='Choose product photo', exact=True)).to_have_count(0)
        render_fixture(images)
        expect(fixture.get_by_role('group', name='Choose product photo', exact=True).get_by_role('button')).to_have_count(len(images))
        page.route('**/gallery-test-broken.png', lambda route: route.abort())
        broken = {**images[0], 'src': f'{BASE}/gallery-test-broken.png', 'srcSet': None}
        render_fixture([broken, images[1]], 'broken')
        expect(fixture.get_by_role('img', name='unavailable', exact=False)).to_be_visible()
        fixture.get_by_role('button', name='Show photo 2', exact=False).click()
        expect(fixture.get_by_role('img', name='unavailable', exact=False)).to_have_count(0)
        page.close()
        print('PASS: reusable gallery zero/one/many, selection fallback/reset, broken image recovery')
    finally:
        browser.close()
