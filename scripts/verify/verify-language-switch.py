import json
import os
import re
from pathlib import Path
from tempfile import gettempdir
from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('SITE_URL', 'http://localhost:3000').rstrip('/')
OUTPUT = Path(gettempdir()) / 'ascentia-language-switch'
OUTPUT.mkdir(exist_ok=True)
RESULTS = []
LABELS = {'en': 'English', 'id': 'Bahasa Indonesia'}


def snapshot(page, label):
    value = page.evaluate('''() => ({
      url: location.pathname + location.search + location.hash,
      y: Math.round(scrollY), lang: document.documentElement.lang,
      key: history.state?.__TSR_key,
      heading: document.querySelector('main h1')?.textContent,
    })''')
    RESULTS.append({'case': label, **value})
    (OUTPUT / 'results.json').write_text(json.dumps(RESULTS, indent=2), encoding='utf-8')
    print(label, json.dumps(value), flush=True)
    return value


def scroll(page, y):
    page.wait_for_function('window.__TSR_ROUTER__?.state.status === "idle"')
    page.evaluate('(y) => scrollTo({top: y, behavior: "instant"})', y)
    page.wait_for_timeout(500)
    page.evaluate('scrollBy({top: -120, behavior: "instant"})')
    page.wait_for_timeout(650)


def change(page, current, target, label, keyboard=False):
    page.wait_for_function('window.__TSR_ROUTER__?.state.status === "idle"')
    page.get_by_role('button', name=f'{current.upper()}, {LABELS[current]}, select language', exact=True).click()
    option = page.get_by_role('menuitemradio', name=LABELS[target], exact=True)
    if keyboard:
        option.focus()
        page.keyboard.press('Enter')
    else:
        option.click()
    trigger = page.get_by_role('button', name=f'{target.upper()}, {LABELS[target]}, select language', exact=True)
    expect(trigger).to_be_visible(timeout=20000)
    expect(trigger).to_have_attribute('aria-expanded', 'false')
    expect(page.locator('html')).to_have_attribute('lang', target)
    expect(page.locator('[role="status"][aria-busy="true"]')).to_have_count(0, timeout=20000)
    page.wait_for_timeout(600)
    value = snapshot(page, label)
    assert value['y'] <= 2, f'{label}: old scroll restored: {value}'
    assert value.get('key'), f'{label}: Router history identity lost: {value}'
    assert urlsplit(page.url).fragment == '', f'{label}: old fragment kept'
    expect(trigger).to_be_focused()
    return value


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for motion in ('no-preference', 'reduce'):
            context = browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion=motion)
            writes = []

            def guard(route):
                if route.request.method not in ('GET', 'HEAD', 'OPTIONS'):
                    writes.append(route.request.url)
                    route.abort()
                else:
                    route.continue_()

            context.route('**/*', guard)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(BASE + '/', wait_until='domcontentloaded')
            trigger = page.get_by_role('button', name='ID, Bahasa Indonesia, select language', exact=True)
            expect(trigger).to_be_visible()
            page.wait_for_timeout(800)
            change(page, 'id', 'en', motion + ' initial EN')
            for index in range(2):
                scroll(page, 1700 + index * 100)
                change(page, 'en', 'id', f'{motion} ID round {index}')
                scroll(page, 2400)
                change(page, 'id', 'en', f'{motion} EN round {index}', keyboard=index == 1)
            scroll(page, 1400)
            before = snapshot(page, motion + ' same language before')
            trigger = page.get_by_role('button', name='EN, English, select language', exact=True)
            trigger.click()
            page.get_by_role('menuitemradio', name='English', exact=True).click()
            page.wait_for_timeout(600)
            after = snapshot(page, motion + ' same language after')
            assert abs(before['y'] - after['y']) <= 2, 'Selecting current language changed scroll'
            assert before.get('key') == after.get('key'), 'Selecting current language replaced history'

            page.goto(BASE + '/products/brands?category=xrf-scientific&page=2#product-results', wait_until='domcontentloaded')
            expect(page.locator('#product-results')).to_be_visible(timeout=30000)
            scroll(page, 1200)
            value = change(page, 'id', 'en', motion + ' listing EN')
            parsed = urlsplit(page.url)
            assert parsed.path == '/en/products/brands', value
            assert parse_qs(parsed.query) == {'category': ['xrf-scientific'], 'page': ['2']}, value
            scroll(page, 1200)
            value = change(page, 'en', 'id', motion + ' listing ID')
            assert urlsplit(page.url).path == '/products/brands', value
            page.reload(wait_until='domcontentloaded')
            expect(page.locator('html')).to_have_attribute('lang', 'id')

            page.goto(BASE + '/products/xrtga-range-thermogravimetric-analyser#applications', wait_until='domcontentloaded')
            expect(page.locator('#product-detail-heading')).to_be_visible(timeout=30000)
            scroll(page, 1300)
            value = change(page, 'id', 'en', motion + ' product EN')
            assert urlsplit(page.url).path == '/en/products/xrtga-range-thermogravimetric-analyser', value
            expect(page.locator('#product-detail-heading')).to_be_visible()

            page.goto(BASE + '/news', wait_until='domcontentloaded')
            article = page.locator('main article a[href^="/news/"]').first
            expect(article).to_be_visible(timeout=30000)
            article.click()
            expect(page.locator('.article-rich-text')).to_be_visible(timeout=30000)
            article_path = urlsplit(page.url).path
            scroll(page, 1000)
            value = change(page, 'id', 'en', motion + ' article EN')
            assert urlsplit(page.url).path == '/en' + article_path, value
            expect(page.locator('.article-rich-text')).to_be_visible()

            page.goto(BASE + '/about-us', wait_until='domcontentloaded')
            expect(page.get_by_role('button', name='ID, Bahasa Indonesia, select language', exact=True)).to_be_visible()
            scroll(page, 1050)
            original_y = page.evaluate('scrollY')
            page.locator('header nav[aria-label="Primary navigation"]').get_by_role('link', name='Home', exact=True).click()
            expect(page).to_have_url(BASE + '/')
            change(page, 'id', 'en', motion + ' home EN before Back')
            page.go_back(wait_until='domcontentloaded')
            expect(page).to_have_url(BASE + '/about-us')
            expect(page.locator('html')).to_have_attribute('lang', 'id')
            page.wait_for_timeout(500)
            assert abs(page.evaluate('scrollY') - original_y) <= 2, 'Back lost original scroll'
            page.go_forward(wait_until='domcontentloaded')
            expect(page.locator('html')).to_have_attribute('lang', 'en')
            assert page.evaluate('scrollY') <= 2, 'Forward did not restore language destination'
            page.screenshot(path=str(OUTPUT / f'home-{motion}.png'))
            assert not errors, errors
            assert not writes, f'Unexpected writes blocked: {writes}'
            context.close()

        mobile = browser.new_page(viewport={'width': 390, 'height': 844})
        mobile.goto(BASE + '/about-us', wait_until='domcontentloaded')
        expect(mobile.locator('html')).to_have_attribute('lang', 'id')
        assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        mobile.reload(wait_until='domcontentloaded')
        expect(mobile.locator('html')).to_have_attribute('lang', 'id')
        mobile.screenshot(path=str(OUTPUT / 'mobile-id.png'))
        print('Mobile locale reload PASS; no visible language switcher exists at this breakpoint.')
    finally:
        browser.close()

print(f'PASS: locale scroll, page/filter identity, hash, reload, Back/Forward, keyboard. Evidence: {OUTPUT}')
