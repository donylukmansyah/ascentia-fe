import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')
PRODUCT = f'{BASE}/products/xrtga-range-thermogravimetric-analyser'
TEMP = Path(os.environ.get('TEMP', '/tmp'))


def hydrated(page, selector):
    page.wait_for_function(
        '''selector => Object.keys(document.querySelector(
      selector
    ) || {}).some(key => key.startsWith('__reactProps$'))''',
        arg=selector,
    )


def verify_product_lightbox(page, trigger):
    trigger.focus()
    page.keyboard.press('Enter')
    dialog = page.get_by_role('dialog', name='Photo viewer', exact=True)
    expect(dialog).to_be_visible()
    close = dialog.get_by_role('button', name='Close photo viewer', exact=True)
    expect(close).to_be_focused()
    expect(dialog.locator('img')).to_be_visible()
    initial = dialog.locator('img').get_attribute('src')
    page.keyboard.press('ArrowRight')
    expect(dialog.locator('img')).not_to_have_attribute('src', initial)
    page.keyboard.press('ArrowLeft')
    expect(dialog.locator('img')).to_have_attribute('src', initial)
    close.focus()
    page.keyboard.press('Tab')
    expect(
        dialog.get_by_role('button', name='Previous photo', exact=True)
    ).to_be_focused()
    page.keyboard.press('Tab')
    expect(
        dialog.get_by_role('button', name='Next photo', exact=True)
    ).to_be_focused()
    page.keyboard.press('Escape')
    expect(dialog).to_have_count(0)
    expect(trigger).to_be_focused()


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width in (360, 390, 768, 1440):
            page = browser.new_page(viewport={'width': width, 'height': 960})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.emulate_media(reduced_motion='reduce')
            page.goto(PRODUCT + '#applications', wait_until='domcontentloaded')
            trigger = page.get_by_role('button', name='Enlarge product photo', exact=True)
            expect(trigger).to_be_visible(timeout=30000)
            hydrated(page, 'button[aria-label="Enlarge product photo"]')
            expect(page.get_by_role('button', name='Previous thumbnails', exact=True)).to_have_count(0)
            expect(page.get_by_role('button', name='Next thumbnails', exact=True)).to_have_count(0)
            expect(
                page.locator('p').filter(has_text='Photo 1 of 5')
            ).to_have_count(0)

            rail = page.get_by_role('group', name='Choose product photo', exact=True)
            thumbnails = rail.get_by_role('button')
            assert thumbnails.count() == 5
            assert rail.evaluate('''e => {
              const tops = [...e.querySelectorAll('button')].map(c => c.getBoundingClientRect().top);
              return Math.max(...tops) - Math.min(...tops) < 1;
            }''')

            assert rail.evaluate('r => r.scrollLeft') <= 1
            for thumbnail in (thumbnails.last, thumbnails.nth(2), thumbnails.first):
                thumbnail.click()
                expect(thumbnail).to_have_attribute('aria-pressed', 'true')
            assert rail.evaluate('r => r.scrollLeft') <= 1

            preview = trigger.locator('img')
            page.wait_for_timeout(200)
            before = preview.get_attribute('src')
            verify_product_lightbox(page, trigger)
            expect(preview).to_have_attribute('src', before)
            expect(page.get_by_role('tab', name='Applications', exact=True)).to_have_attribute('aria-selected', 'true')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')

            trigger.click()
            dialog = page.get_by_role('dialog', name='Photo viewer', exact=True)
            dialog.get_by_role('button', name='Next photo', exact=True).click()
            page.screenshot(path=str(TEMP / f'ascentia-lightbox-product-{width}.png'))
            dialog.get_by_role('button', name='Close photo viewer', exact=True).click()
            expect(trigger).to_be_focused()

            if width in (390, 1440):
                page.locator('#product').scroll_into_view_if_needed()
                page.screenshot(path=str(TEMP / f'ascentia-clean-gallery-{width}.png'))
            assert not errors, errors
            page.close()
            print(f'PASS: {width}px clean strip, centered first/last, lightbox, keyboard/focus, Applications')

        for width in (390, 1440):
            page = browser.new_page(viewport={'width': width, 'height': 960})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'{BASE}/about-us', wait_until='domcontentloaded')
            about_section = page.locator('[aria-labelledby="about-gallery-heading"]')
            about_photos = about_section.locator('figure')
            expect(about_photos).to_have_count(6, timeout=30000)
            about_photos.first.scroll_into_view_if_needed()
            hydrated(page, '[aria-labelledby="about-gallery-heading"] figure')
            about_photos.first.click()
            about_dialog = page.get_by_role('dialog')
            expect(about_dialog).to_be_visible()
            expect(page.get_by_role('button', name='Previous photo', exact=True)).to_be_visible()
            expect(page.get_by_role('button', name='Next photo', exact=True)).to_be_visible()
            expect(page.get_by_role('status')).to_have_text('1 / 6')
            page.get_by_role('button', name='Next photo', exact=True).click()
            expect(page.get_by_role('status')).to_have_text('2 / 6')
            page.screenshot(path=str(TEMP / f'ascentia-lightbox-about-{width}.png'))
            page.get_by_role('button', name='Close gallery', exact=True).click()
            expect(about_dialog).to_have_count(0)
            assert not errors, errors
            page.close()
            print(f'PASS: About Us {width}px gallery with prev/next buttons matching product lightbox')
    finally:
        browser.close()
