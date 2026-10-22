import json
import os
from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('SITE_URL', 'http://localhost:3000').rstrip('/')
ARTIFACTS = Path(gettempdir()) / 'ascentia-header-transitions'
ARTIFACTS.mkdir(exist_ok=True)
TRACES = []
FAILURES = []
RECORD = '''(() => {
  window.headerFrames = [];
  window.stopHeaderFrames = false;
  let previous = '';
  function sample() {
    const header = document.querySelector('header[data-header-state]');
    const image = header?.querySelector('img[alt="Ascentia Arsya Analitika"]');
    const heading = document.querySelector('main h1');
    if (image && heading) {
      const style = getComputedStyle(header);
      const row = {
        ms: Math.round(performance.now()), y: scrollY,
        heading: heading.textContent, logo: image.getAttribute('src'),
        mode: header.dataset.headerState, background: style.backgroundColor,
        borderTop: style.borderTopColor, borderWidth: style.borderTopWidth,
        top: header.getBoundingClientRect().top,
      };
      const key = JSON.stringify({...row, ms: 0});
      if (key !== previous) { window.headerFrames.push(row); previous = key; }
    }
    if (!window.stopHeaderFrames) requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
})()'''


def check(condition, message):
    if not condition:
        FAILURES.append(message)
        print('FAIL:', message, flush=True)


def save(page, label):
    rows = page.evaluate('window.headerFrames')
    TRACES.append({'case': label, 'frames': rows})
    page.evaluate('window.headerFrames = []')
    return rows


def check_top(rows, label):
    top = [row for row in rows if row['y'] <= 12 and row['heading'] == 'About Us']
    check(bool(top), f'{label}: top frames captured')
    for row in top:
        if 'logo-white' not in row['logo'] or row['background'] != 'rgba(0, 0, 0, 0)':
            check(False, f'{label}: stale hero tone at top: {row}')
            break


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width, motion in ((1440, 'no-preference'), (390, 'no-preference'), (1440, 'reduce')):
            context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion=motion)
            context.add_init_script(RECORD)
            context.route('**/*', lambda route: route.continue_() if route.request.method in ('GET', 'HEAD', 'OPTIONS') else route.abort())
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(BASE + '/about-us', wait_until='domcontentloaded')
            page.wait_for_function('!!window.__TSR_ROUTER__')
            expect(page.get_by_role('heading', name='About Us', exact=True)).to_be_visible()
            page.wait_for_timeout(700)
            header = page.locator('header[data-header-state]')
            label = f'{width}px {motion}'
            check_top(save(page, label + ' direct'), label + ' direct')
            primary_border = header.evaluate('''header => {
              const sample = document.createElement('span');
              sample.style.color = 'var(--primary)'; document.body.append(sample);
              const color = getComputedStyle(sample).color; sample.remove();
              return {color, actual: getComputedStyle(header).borderTopColor,
                width: getComputedStyle(header).borderTopWidth};
            }''')
            check(primary_border['actual'] == primary_border['color'] and primary_border['width'] == '3px', f'{label}: 3px primary top border: {primary_border}')

            page.evaluate("document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 900)")
            expect(header).to_have_attribute('data-header-state', 'hidden-initial')
            page.evaluate('scrollTo(0, 700)')
            expect(header).to_have_attribute('data-header-state', 'visible')
            expect(header.locator('img').first).to_have_attribute('src', '/brand/logo-color.webp')
            page.wait_for_timeout(600)
            save(page, label + ' scrolled')
            page.evaluate('scrollTo(0, 0)')
            page.wait_for_timeout(650)
            check_top(save(page, label + ' return top'), label + ' return top')

            if width == 1440:
                page.evaluate('scrollTo(0, 900)')
                expect(header).to_have_attribute('data-header-state', 'hidden-initial')
                page.evaluate('scrollTo(0, 700)')
                expect(header).to_have_attribute('data-header-state', 'visible')
                page.wait_for_timeout(550)
                header.get_by_role('button', name='Browse products', exact=True).click()
                page.evaluate('scrollTo(0, 840)')
                expect(header).to_have_attribute('data-header-state', 'visible')
                page.keyboard.press('Escape')
                header.get_by_role('link', name='Home', exact=True).click()
                page.wait_for_url(BASE + '/')
                page.wait_for_timeout(650)
                save(page, label + ' Home navigation')
                header.get_by_role('link', name='About Us', exact=True).click()
                expect(page.get_by_role('heading', name='About Us', exact=True)).to_be_visible()
                page.wait_for_timeout(700)
                check_top(save(page, label + ' hero navigation'), label + ' hero navigation')
                page.evaluate('scrollTo(0, 700)')
                page.wait_for_timeout(250)
                page.evaluate('scrollTo(0, 650)')
                expect(header).to_have_attribute('data-header-state', 'visible')
                page.wait_for_timeout(550)
                header.get_by_role('link', name='Home', exact=True).click()
                expect(page.get_by_role('heading', name='About Us', exact=True)).to_have_count(0)
                page.go_back(wait_until='domcontentloaded')
                expect(page.get_by_role('heading', name='About Us', exact=True)).to_be_visible()
                page.wait_for_timeout(650)
                check(abs(page.evaluate('scrollY') - 650) <= 2, f'{label}: Back restores original scroll')
                check(header.get_attribute('data-header-state') != 'transparent', f'{label}: Back retains solid scroll tone')
                save(page, label + ' history restoration')
            else:
                header.get_by_role('button', name='Open navigation menu', exact=True).click()
                expect(header.locator('img').first).to_have_attribute('src', '/brand/logo-color.webp')
                page.keyboard.press('Escape')
                expect(header.locator('img').first).to_have_attribute('src', '/brand/logo-white.webp')
                page.wait_for_timeout(200)
                save(page, label + ' mobile menu')

            page.evaluate('scrollTo(0, 700)')
            page.wait_for_timeout(250)
            page.reload(wait_until='domcontentloaded')
            page.wait_for_timeout(1000)
            restored_y = page.evaluate('scrollY')
            check(restored_y > 12, f'{label}: browser restored nonzero scroll: {restored_y}')
            check(header.get_attribute('data-header-state') != 'transparent', f'{label}: restored scroll not transparent')
            save(page, label + ' restored reload')
            page.evaluate('scrollTo(0, 0)')
            page.wait_for_timeout(650)
            check_top(save(page, label + ' restored return'), label + ' restored return')
            page.screenshot(path=str(ARTIFACTS / f'about-{width}-{motion}.png'))
            check(not errors, f'{label}: page errors {errors}')
            context.close()

        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        context.add_init_script(RECORD)
        context.route('**/*', lambda route: route.continue_() if route.request.method in ('GET', 'HEAD', 'OPTIONS') else route.abort())
        page = context.new_page()
        page.goto(BASE + '/header-logo-missing-page', wait_until='domcontentloaded')
        expect(page.get_by_role('heading', name='Page not found', exact=True)).to_be_visible()
        header = page.locator('header[data-header-state]')
        expect(header.locator('img').first).to_have_attribute('src', '/brand/logo-color.webp')
        save(page, 'not found direct')
        header.get_by_role('link', name='About Us', exact=True).click()
        expect(page.get_by_role('heading', name='About Us', exact=True)).to_be_visible()
        page.wait_for_timeout(700)
        check_top(save(page, 'not found to About'), 'not found to About')
        page.goto(BASE + '/news', wait_until='domcontentloaded')
        news_link = header.get_by_role('link', name='News', exact=True)
        expect(news_link).to_have_attribute('aria-current', 'page')
        expect(header.locator('img').first).to_have_attribute('src', '/brand/logo-white.webp')
        link = page.locator('main article a[href^="/news/"]').first
        expect(link).to_be_visible(timeout=30000)
        link.click()
        expect(page.locator('.article-rich-text')).to_be_visible(timeout=30000)
        expect(header.locator('img').first).to_have_attribute('src', '/brand/logo-color.webp')
        save(page, 'news detail')
        header.get_by_role('link', name='About Us', exact=True).click()
        expect(page.get_by_role('heading', name='About Us', exact=True)).to_be_visible()
        page.wait_for_timeout(700)
        rows = save(page, 'news detail to About')
        check_top(rows, 'news detail to About')
        old_article = [row for row in rows if row['heading'] != 'About Us']
        check(all('logo-color' in row['logo'] for row in old_article), 'editorial tone follows rendered article until navigation commits')
        context.close()
    finally:
        browser.close()

(ARTIFACTS / 'traces.json').write_text(json.dumps(TRACES, indent=2), encoding='utf-8')
assert not FAILURES, '\n'.join(FAILURES)
print(f'PASS: header transitions, restored scroll, menus, primary line. Evidence: {ARTIFACTS}')
