from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import TimeoutError, sync_playwright

BASE_URL = "http://[::1]:3000"
DESCRIPTION = (
    "Analytical instruments, trusted materials, and technical support "
    "for the work behind reliable results."
)
SCREENSHOTS = Path(gettempdir()) / "ascentia-blogs-hero"
SCREENSHOTS.mkdir(exist_ok=True)


def open_page(page, path):
    page.goto(f"{BASE_URL}/{path}", wait_until="domcontentloaded")
    try:
        page.wait_for_load_state("networkidle", timeout=3000)
    except TimeoutError:
        pass
    page.evaluate("document.fonts.ready")


def image_y(image):
    return image.evaluate(
        """element => {
            const style = getComputedStyle(element);
            const translate = style.translate === 'none'
                ? 0 : parseFloat(style.translate.split(' ')[1] || '0');
            return new DOMMatrixReadOnly(style.transform).m42 + translate;
        }"""
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width in (1440, 768, 390):
        context = browser.new_context(
            viewport={"width": width, "height": 900},
            reduced_motion="no-preference",
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        open_page(page, "blogs")
        assert page.get_by_role("heading", name="Our Blogs", exact=True).count() == 1
        hero = page.locator('section[aria-labelledby="blogs-hero-heading"]')
        assert hero.locator("p").inner_text() == DESCRIPTION
        breadcrumb = hero.get_by_role("navigation", name="Breadcrumb")
        assert breadcrumb.get_by_role("link", name="Home").get_attribute("href") == "/"
        assert "Blogs" in breadcrumb.inner_text()
        image = hero.locator("img")
        assert image.get_attribute("src") == "/images/blogs/assets-our-blogs.webp"
        page.wait_for_function(
            """() => {
                const image = document.querySelector('#blogs-hero-heading')
                    .closest('section').querySelector('img');
                return image.complete && image.naturalWidth > 0;
            }"""
        )
        assert image.get_attribute("alt") == ""
        assert image.get_attribute("fetchpriority") == "high"
        cta = hero.get_by_role("link", name="Explore Blogs content")
        assert cta.get_attribute("href") == "#blogs-content"
        assert page.locator("#blogs-content").get_attribute("tabindex") == "-1"
        assert page.evaluate(
            "document.documentElement.scrollWidth <= window.innerWidth"
        ), f"Horizontal overflow at {width}px"

        news = context.new_page()
        open_page(news, "news")
        news_hero = news.locator('section[aria-labelledby="news-hero-heading"]')
        assert hero.get_attribute("class") == news_hero.get_attribute("class")
        assert hero.bounding_box()["height"] == news_hero.bounding_box()["height"]
        assert hero.locator("h1").get_attribute("class") == news_hero.locator("h1").get_attribute("class")
        assert hero.locator("p").get_attribute("class") == news_hero.locator("p").get_attribute("class")
        page.screenshot(path=str(SCREENSHOTS / f"blogs-{width}.png"))

        if width == 1440:
            page.set_viewport_size({"width": width, "height": 600})
            page.wait_for_timeout(200)
            before = image_y(image)
            page.evaluate("window.scrollTo(0, 200)")
            page.wait_for_function("window.scrollY >= 190")
            page.wait_for_timeout(200)
            after = image_y(image)
            assert after > before + 20, {"before": before, "after": after}
        cta.click()
        page.wait_for_function("location.hash === '#blogs-content'")
        assert not errors, errors
        print(f"PASS: Blogs hero {width}px; News styles match")
        context.close()

    context = browser.new_context(
        viewport={"width": 1440, "height": 600}, reduced_motion="reduce"
    )
    page = context.new_page()
    open_page(page, "blogs")
    image = page.locator('section[aria-labelledby="blogs-hero-heading"] img')
    assert abs(image_y(image)) < 0.01
    assert page.locator(".hero-carousel__copy").evaluate(
        "element => getComputedStyle(element).animationName"
    ) == "none"
    page.evaluate("window.scrollTo(0, 200)")
    page.wait_for_timeout(200)
    assert abs(image_y(image)) < 0.01
    print("PASS: reduced motion disables parallax and copy animation")
    print(f"Screenshots: {SCREENSHOTS}")
    context.close()
    browser.close()
