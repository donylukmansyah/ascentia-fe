import os

from playwright.sync_api import sync_playwright

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')
PATH = '/products/modutemp-shaking-fusion-furnace-6-positions#product'

SAMPLE = """async ({top, duration = 650, reverseAfter}) => {
  const header = document.querySelector('header');
  const nav = document.querySelector('nav[aria-label="Product detail sections"]');
  const start = performance.now();
  const frames = [];
  let reversed = false;
  window.scrollTo({top, behavior: 'instant'});
  do {
    await new Promise(requestAnimationFrame);
    const elapsed = performance.now() - start;
    if (reverseAfter !== undefined && elapsed >= reverseAfter && !reversed) {
      window.scrollTo({top: top + 140, behavior: 'instant'});
      reversed = true;
    }
    const h = header.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    frames.push({
      elapsed: Math.round(elapsed),
      headerBottom: h.bottom,
      navTop: n.top,
      gap: n.top - Math.max(0, h.bottom),
    });
  } while (performance.now() - start < duration);
  return frames;
}"""


def check_frames(page, label, **options):
    frames = page.evaluate(SAMPLE, options)
    worst = max(frames, key=lambda frame: abs(frame['gap']))
    assert abs(worst['gap']) <= 2, f'{label}: detached or overlapping: {worst}'
    print(f'PASS: {label}; maximum gap/overlap {abs(worst["gap"]):.2f}px')
    return frames[-1]


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    try:
        for width, height in ((1440, 900), (390, 844)):
            page = browser.new_page(viewport={'width': width, 'height': height})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(BASE + PATH, wait_until='domcontentloaded')
            nav = page.get_by_role('navigation', name='Product detail sections')
            nav.wait_for()
            page.wait_for_function("""() => Object.keys(document.querySelector(
              'nav[aria-label="Product detail sections"] button'
            ) || {}).some(key => key.startsWith('__reactProps$'))""")
            page.wait_for_timeout(500)
            for error in errors:
                print(f'PAGE LOAD WARNING: {error.splitlines()[0]}')
            errors.clear()
            page.evaluate("document.documentElement.style.scrollBehavior = 'auto'")
            down = check_frames(page, f'{width}px initial downward scroll', top=750)
            assert down['headerBottom'] <= 1, down
            up = check_frames(page, f'{width}px scroll upward', top=650)
            assert up['headerBottom'] > 50, up
            down = check_frames(page, f'{width}px scroll downward', top=790)
            assert down['headerBottom'] <= 1, down
            check_frames(page, f'{width}px reverse during reveal', top=650, reverseAfter=100)

            page.emulate_media(reduced_motion='reduce')
            up = check_frames(page, f'{width}px reduced motion upward', top=600, duration=150)
            assert up['headerBottom'] > 50, up
            check_frames(page, f'{width}px reduced motion downward', top=750, duration=150)
            page.emulate_media(reduced_motion='no-preference')

            if width >= 1024:
                check_frames(page, 'desktop reveal before dropdown', top=650)
                page.get_by_role('button', name='Browse products', exact=True).click()
                pinned = check_frames(page, 'desktop dropdown pins both bars', top=790)
                assert pinned['headerBottom'] > 50, pinned
                page.keyboard.press('Escape')

            nav.get_by_role('button', name='Description', exact=True).click()
            page.wait_for_function("location.hash === '#description'")
            assert page.get_by_role('tab', name='Description', exact=True).get_attribute('aria-selected') == 'true'
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert not errors, errors
            page.close()
    finally:
        browser.close()
