import os
from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import TimeoutError, sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SCREENSHOTS = Path(gettempdir()) / "ascentia-contact-us"
SCREENSHOTS.mkdir(exist_ok=True)


def open_page(page, path):
    page.goto(f"{BASE_URL}{path}", wait_until="domcontentloaded")
    try:
        page.wait_for_load_state("networkidle", timeout=3000)
    except TimeoutError:
        pass
    page.evaluate("document.fonts.ready")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width in (1440, 768, 390, 320):
        context = browser.new_context(
            viewport={"width": width, "height": 900}, reduced_motion="reduce"
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        open_page(page, "/contact-us")
        hero = page.locator('section[aria-labelledby="contact-hero-heading"]')
        hero.wait_for()
        assert page.get_by_role("heading", level=1).inner_text() == "Contact Us"
        image = hero.locator("img")
        assert image.get_attribute("src") == "/images/contact-us/contact-us.webp"
        assert image.get_attribute("fetchpriority") == "high"
        page.wait_for_function(
            """() => {
                const image = document.querySelector('#contact-hero-heading')
                    .closest('section').querySelector('img');
                return image.complete && image.naturalWidth > 0;
            }"""
        )
        assert "Contact Us" in hero.get_by_role("navigation", name="Breadcrumb").inner_text()
        assert hero.get_by_role("link", name="Explore Contact Us content").get_attribute("href") == "#contact-content"
        panel = page.locator("#contact-content")
        assert panel.get_attribute("tabindex") == "-1"
        assert panel.bounding_box()["y"] < hero.bounding_box()["height"]
        assert page.get_by_role("link", name="Open full contact page").count() == 0
        assert "jakarta-map" in panel.get_by_role("link", name="Office").get_attribute("href")
        assert page.locator("form").count() == 1
        assert not panel.locator("form").evaluate("element => element.checkValidity()")
        panel.get_by_role("textbox", name="Name", exact=True).fill("Contact smoke check")
        panel.get_by_role("textbox", name="Work email").fill("invalid-email")
        assert not panel.locator("form").evaluate("element => element.checkValidity()")
        panel.get_by_role("textbox", name="Work email").fill("smoke@example.com")
        panel.get_by_role("textbox", name="Message").fill("Please advise on sample preparation.")
        assert panel.locator("form").evaluate("element => element.checkValidity()")
        panel.get_by_role("button", name="Send enquiry").click()
        assert "not been sent" in panel.get_by_role("status").inner_text()
        assert panel.get_by_role("textbox", name="Message").input_value() == "Please advise on sample preparation."
        locations = page.locator('section[aria-labelledby="about-locations-heading"]')
        locations.scroll_into_view_if_needed()
        locations.get_by_role("button", name="Lihat info kantor Jakarta").wait_for()
        locations.get_by_role("button", name="Lihat info kantor Kendari").wait_for()
        assert locations.bounding_box()["width"] < width
        assert locations.bounding_box()["x"] > 0
        assert locations.locator("canvas").count() == 1
        map_bounds = locations.bounding_box()
        for office in ("Jakarta", "Kendari"):
            bounds = locations.get_by_role("button", name=f"Lihat info kantor {office}").bounding_box()
            assert bounds["x"] >= map_bounds["x"], (office, bounds, map_bounds)
            assert bounds["x"] + bounds["width"] <= map_bounds["x"] + map_bounds["width"], (office, bounds, map_bounds)
        locations.get_by_role("button", name="Lihat info kantor Jakarta").click()
        assert locations.get_by_text("Jakarta Head Office", exact=True).is_visible()
        jakarta_section = page.locator("#jakarta-map")
        canvas = jakarta_section.locator("canvas.maplibregl-canvas")
        canvas.wait_for()
        assert abs(jakarta_section.locator(".relative.h-\\[380px\\]").bounding_box()["width"] - width) < 1
        page.wait_for_selector("#jakarta-map .maplibregl-marker")
        directions = jakarta_section.get_by_role("link", name="Get directions", exact=True)
        assert "destination_place_id=ChIJAfPlzjL3aS4RJgkrqoECgtU" in directions.get_attribute("href")
        assert "Business Park Kebon Jeruk D2-12" in jakarta_section.inner_text()
        page.locator("#jakarta-map").screenshot(path=str(SCREENSHOTS / f"jakarta-map-{width}.png"))
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Overflow at {width}px"
        panel.get_by_role("link", name="Office").click()
        page.wait_for_function("location.hash === '#jakarta-map'")
        hero.get_by_role("link", name="Explore Contact Us content").click()
        page.wait_for_function("location.hash === '#contact-content'")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(SCREENSHOTS / f"contact-{width}.png"), full_page=True)
        about = context.new_page()
        open_page(about, "/about-us")
        about_hero = about.locator('section[aria-labelledby="about-hero-heading"]')
        assert hero.get_attribute("class") == about_hero.get_attribute("class")
        assert hero.bounding_box()["height"] == about_hero.bounding_box()["height"]
        assert about.locator('section[aria-labelledby="about-locations-heading"]').bounding_box()["width"] == width
        assert not errors, errors
        print(f"PASS: Contact Us {width}px; About hero parity; contained locations; Jakarta OfficeMap")
        context.close()

    context = browser.new_context(viewport={"width": 1440, "height": 600}, reduced_motion="reduce")
    page = context.new_page()
    open_page(page, "/contact-us")
    image = page.locator('section[aria-labelledby="contact-hero-heading"] img')
    assert image.evaluate("element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42") == 0
    page.evaluate("window.scrollTo(0, 200)")
    page.wait_for_timeout(200)
    assert image.evaluate("element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42") == 0
    open_page(page, "/")
    assert page.get_by_role("link", name="Open full contact page").count() == 1
    assert page.locator("#contact-content").count() == 0
    print("PASS: reduced motion; homepage contact panel unchanged")
    context.close()
    context = browser.new_context(viewport={"width": 1440, "height": 600}, reduced_motion="no-preference")
    page = context.new_page()
    open_page(page, "/contact-us")
    image = page.locator('section[aria-labelledby="contact-hero-heading"] img')
    before = image.evaluate("element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42")
    page.evaluate("window.scrollTo(0, 200)")
    page.wait_for_timeout(250)
    after = image.evaluate("element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42")
    assert after > before + 20, {"before": before, "after": after}
    print("PASS: contact hero scroll parallax")
    print(f"Screenshots: {SCREENSHOTS}")
    context.close()
    browser.close()
