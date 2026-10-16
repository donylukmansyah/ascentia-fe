from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import TimeoutError, sync_playwright

SCREENSHOTS = Path(gettempdir()) / "ascentia-blogs-listing"
SCREENSHOTS.mkdir(exist_ok=True)


BASE_URL = "http://[::1]:3000"


def open_page(page, path):
    page.goto(f"{BASE_URL}/{path}", wait_until="domcontentloaded")
    try:
        page.wait_for_load_state("networkidle", timeout=3000)
    except TimeoutError:
        pass
    page.evaluate("document.fonts.ready")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width, columns in ((1440, 4), (768, 2), (390, 1), (320, 1)):
        page = browser.new_page(
            viewport={"width": width, "height": 900}, reduced_motion="reduce"
        )
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        open_page(page, "blogs")
        assert page.get_by_role("heading", name="Recent blogs post", exact=True).count() == 1
        section = page.locator("#blogs-content")
        cards = section.locator("li article")
        assert cards.count() == 12
        assert section.locator("ul.grid").evaluate(
            "element => getComputedStyle(element).gridTemplateColumns.split(' ').length"
        ) == columns
        assert cards.first.get_by_role("heading").inner_text() == "Improving Sample Preparation with xrFuse 6"
        assert cards.first.locator("time").inner_text() == "Nov 2, 2028"
        assert "Mba Eva" in cards.first.inner_text()
        assert "5 min read" in cards.first.inner_text()
        assert cards.first.get_by_text("E", exact=True).count() == 1
        image = cards.first.locator("img")
        image.scroll_into_view_if_needed()
        page.wait_for_function(
            """() => {
                const img = document.querySelector('#blogs-content li article img');
                return img.complete && img.naturalWidth > 0;
            }"""
        )
        assert image.get_attribute("src") == "/images/blogs/assets-our-blogs.webp"
        box = image.bounding_box()
        assert abs(box["width"] / box["height"] - 16 / 9) < 0.02
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        if width == 1440:
            first_card = cards.first
            read_time = first_card.locator("span", has_text="min read")
            assert "oklch" in read_time.evaluate("el => getComputedStyle(el).color")
            # motion-reduce correctly suppresses translate-y
            assert first_card.evaluate("el => getComputedStyle(el).translate") == "none"
            link = first_card.locator("a")
            link.focus()
            assert "2px" in link.evaluate("el => getComputedStyle(el).outline")
        navigation = section.get_by_role("navigation", name="pagination")
        assert navigation.get_by_role("button").count() == 6
        assert navigation.get_by_role("button", name="Previous page", exact=True).is_disabled()
        assert navigation.locator('[aria-current="page"]').inner_text() == "1"
        first_href = cards.first.locator("a").get_attribute("href")
        navigation.get_by_role("button", name="Go to page 2", exact=True).click()
        assert navigation.locator('[aria-current="page"]').inner_text() == "2"
        assert cards.count() == 12
        assert cards.first.locator("a").get_attribute("href") != first_href
        navigation.get_by_role("button", name="Go to page 4", exact=True).click()
        assert navigation.get_by_role("button", name="Next page", exact=True).is_disabled()
        navigation.get_by_role("button", name="Previous page", exact=True).click()
        assert navigation.locator('[aria-current="page"]').inner_text() == "3"
        navigation.get_by_role("button", name="Go to page 1", exact=True).focus()
        page.keyboard.press("Enter")
        assert navigation.locator('[aria-current="page"]').inner_text() == "1"
        section.scroll_into_view_if_needed()
        page.screenshot(path=str(SCREENSHOTS / f"blogs-{width}.png"), full_page=True)
        cards.first.locator("a").click()
        page.wait_for_url("**/articles/improving-sample-preparation-with-xrfuse-6-1")
        assert page.get_by_role("heading", name="Improving Sample Preparation with xrFuse 6", exact=True).is_visible()
        assert page.get_by_role("link", name="Back to Blogs", exact=True).get_attribute("href") == "/blogs"
        assert not errors, errors
        print(f"PASS: Blogs {width}px; {columns} columns, 12 cards, pagination, detail link")
        page.close()

    page = browser.new_page(viewport={"width": 1440, "height": 900})
    open_page(page, "products/brands")
    navigation = page.get_by_role("navigation", name="pagination")
    assert navigation.count() == 1
    assert navigation.get_by_role("button", name="Previous page", exact=True).is_disabled()
    navigation.get_by_role("button", name="Go to page 2", exact=True).click()
    assert navigation.locator('[aria-current="page"]').inner_text() == "2"
    print("PASS: Products uses shared pagination")
    open_page(page, "articles/why-matrix-matching-matters-in-xrf")
    assert page.get_by_role("link", name="Back to News", exact=True).get_attribute("href") == "/news"
    print("PASS: News detail return link preserved")

    # Hover test under normal motion
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    open_page(page, "blogs")
    first_card = page.locator("#blogs-content li article").first
    first_card.hover()
    page.wait_for_timeout(350)
    assert first_card.evaluate("el => getComputedStyle(el).translate") == "0px -4px"
    img = first_card.locator("img")
    assert float(img.evaluate("el => getComputedStyle(el).scale")) > 1.0
    print("PASS: Card hover lift and image zoom in normal motion")
    page.close()

    print(f"Screenshots: {SCREENSHOTS}")
    browser.close()
