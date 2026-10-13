import os
import re
from pathlib import Path

from playwright.sync_api import sync_playwright


URL = os.environ.get(
    "PRODUCT_DETAIL_URL",
    "http://localhost:3000/products/xrfuse-2",
)
SCREENSHOT = Path(os.environ["TEMP"]) / "ascentia-product-detail.png"
MOBILE_SCREENSHOT = Path(os.environ["TEMP"]) / "ascentia-product-detail-mobile.png"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 960})
    failures: list[str] = []

    page.on("pageerror", lambda error: failures.append(str(error)))
    page.on(
        "console",
        lambda message: failures.append(message.text)
        if message.type == "error"
        else None,
    )
    page.goto(URL)
    page.wait_for_load_state("networkidle")

    require(
        page.locator("h1#product-detail-heading").is_visible(),
        "product hero heading is missing",
    )
    section_nav = page.get_by_role("navigation", name="Product detail sections")
    require(section_nav.is_visible(), "detail section navigation is missing")

    section_nav.get_by_role("link", name="Specifications", exact=True).click()
    page.wait_for_timeout(250)
    require(
        page.get_by_role("tab", name="Specifications", exact=True).get_attribute(
            "aria-selected"
        )
        == "true",
        "specifications tab did not activate",
    )
    require(
        page.locator("#specifications").is_visible(),
        "specifications panel is hidden",
    )
    require(
        page.locator("#related-products article a").count() == 4,
        "related product count is not four",
    )
    page.screenshot(path=str(SCREENSHOT), full_page=True)

    page.set_viewport_size({"width": 390, "height": 844})
    page.reload()
    page.wait_for_load_state("networkidle")
    require(
        section_nav.locator("ul").evaluate(
            "(element) => element.scrollWidth >= element.clientWidth"
        ),
        "mobile section navigation cannot scroll",
    )
    page.screenshot(path=str(MOBILE_SCREENSHOT), full_page=True)
    page.locator("#related-products article a").first.click()
    page.wait_for_url(re.compile(r".*/products/(?!xrfuse-2$)[^/?#]+$"))

    browser.close()

    require(not failures, f"browser errors: {failures}")
    print(
        "Verified product detail. "
        f"Screenshots: {SCREENSHOT}, {MOBILE_SCREENSHOT}"
    )
