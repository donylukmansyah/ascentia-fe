from playwright.sync_api import sync_playwright

SECTIONS = [
    'section[aria-label="Brands we represent"]',
    'section[aria-labelledby="who-we-are-heading"]',
    'section[aria-labelledby="featured-products-heading"]',
    'section[aria-labelledby="contact-panel-heading"]',
]


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:3000/", wait_until="domcontentloaded")
    page.wait_for_timeout(200)

    for selector in SECTIONS:
        initial = page.locator(selector).evaluate(
            """element => {
                const style = getComputedStyle(element.parentElement)
                return { opacity: Number(style.opacity), transform: style.transform }
            }"""
        )
        assert initial["opacity"] < 1 or initial["transform"] != "none", {
            "selector": selector,
            "initial": initial,
            "message": "Section lacks an offscreen scroll-reveal state.",
        }

        page.locator(selector).evaluate(
            "element => element.scrollIntoView({ block: 'center' })"
        )
        page.wait_for_timeout(900)
        revealed = page.locator(selector).evaluate(
            """element => {
                const style = getComputedStyle(element.parentElement)
                return { opacity: Number(style.opacity), transform: style.transform }
            }"""
        )
        assert revealed["opacity"] == 1 and revealed["transform"] == "none", {
            "selector": selector,
            "revealed": revealed,
            "message": "Section did not finish its scroll reveal.",
        }

    browser.close()
