from playwright.sync_api import sync_playwright

HERO_IMAGE = 'section[aria-labelledby="about-hero-heading"] img'


def translate_y(page):
    return page.locator(HERO_IMAGE).evaluate(
        """element => Number(getComputedStyle(element).translate.split(' ')[1].replace('px', ''))"""
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(
        viewport={"width": 1440, "height": 900}, reduced_motion="no-preference"
    )
    page.goto("http://localhost:3000/about-us", wait_until="domcontentloaded")
    page.wait_for_timeout(500)

    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(100)
    before = translate_y(page)

    page.evaluate("window.scrollTo(0, 200)")
    page.wait_for_timeout(100)
    after = translate_y(page)

    assert after - before >= 40, {
        "before": before,
        "after": after,
        "movement": after - before,
        "message": "Hero image parallax must visibly move down over 200px scroll.",
    }
    browser.close()
