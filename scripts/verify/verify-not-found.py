import os
from pathlib import Path
from tempfile import gettempdir

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SCREENSHOTS = Path(gettempdir()) / "ascentia-not-found"
SCREENSHOTS.mkdir(exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width, previous_width in ((1440, 140.90625), (768, 120.78125), (390, 70.453125), (320, 70.453125)):
        page = browser.new_page(viewport={"width": width, "height": 900}, reduced_motion="reduce")
        response = page.goto(f"{BASE_URL}/mascot-size-check-not-found", wait_until="domcontentloaded")
        assert response.status in (200, 404), response.status
        mascot = page.locator('img[src="/maskot/maskot.webp"]')
        mascot.wait_for()
        page.wait_for_function(
            """() => {
                const image = document.querySelector('img[src="/maskot/maskot.webp"]');
                return image.complete && image.naturalWidth > 0;
            }"""
        )
        page.evaluate("document.fonts.ready")
        bounds = mascot.bounding_box()
        assert bounds["width"] >= previous_width * 1.5, (width, bounds)
        assert abs(bounds["width"] - bounds["height"]) < 1, bounds
        assert bounds["x"] >= 0 and bounds["x"] + bounds["width"] <= width, bounds
        heading = page.get_by_role("heading", name="Page not found", exact=True)
        assert heading.is_visible()
        assert bounds["y"] + bounds["height"] < heading.bounding_box()["y"], bounds
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
        assert page.get_by_role("link", name="Back to home", exact=True).get_attribute("href") == "/"
        page.screenshot(path=str(SCREENSHOTS / f"mascot-{width}.png"), full_page=True)
        print(f"PASS: {width}px; mascot {bounds['width']:.1f}px (was {previous_width:.1f}px); square; no overflow")
        page.close()
    browser.close()
print(f"Screenshots: {SCREENSHOTS}")
