import re

from playwright.sync_api import expect, sync_playwright


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:3000", wait_until="load")

    header = page.locator("header").filter(
        has=page.locator('button[aria-controls="mobile-navigation"]')
    )
    logo = page.locator('img[alt="Ascentia Arsya Analitika"]')

    expect(header).to_be_visible()
    expect(header).to_have_class(re.compile(r"translate-y-0"))
    expect(logo).to_have_attribute("src", "/brand/logo-white.png")
    expect(logo).to_have_class(re.compile(r"\bh-7\b"))
    expect(page.get_by_role("link", name="Home", exact=True)).to_be_visible()

    page.wait_for_timeout(500)

    language_selector = page.get_by_role(
        "button", name=re.compile(r"Select language, current English")
    )
    expect(language_selector).to_be_visible()
    expect(language_selector.locator('img[src="/icons/flags/gb.svg"]')).to_be_visible()
    expect(page.get_by_role("button", name="Search")).to_be_visible()
    language_selector.click()
    page.get_by_role("menuitemradio", name="Bahasa Indonesia").click()
    expect(
        page.get_by_role(
            "button", name=re.compile(r"Select language, current Bahasa Indonesia")
        )
    ).to_be_visible()

    page.evaluate(
        "() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
    )

    mobile_toggle = page.locator('button[aria-controls="mobile-navigation"]')
    mobile_toggle.evaluate("(button) => button.click()")
    expect(mobile_toggle).to_have_attribute("aria-expanded", "true")
    mobile_toggle.evaluate("(button) => button.click()")
    expect(mobile_toggle).to_have_attribute("aria-expanded", "false")

    page.set_viewport_size({"width": 667, "height": 689})
    mobile_toggle.click()
    expect(mobile_toggle).to_have_attribute("aria-expanded", "true")
    expect(page.locator("#mobile-navigation")).to_be_visible()
    mobile_toggle.click()
    expect(mobile_toggle).to_have_attribute("aria-expanded", "false")
    scroll_position = page.evaluate(
        """
        () => {
          document.documentElement.style.minHeight = '2000px'
          document.body.style.minHeight = '2000px'
          document.documentElement.style.scrollBehavior = 'auto'
          document.body.style.scrollBehavior = 'auto'
          window.scrollTo(0, 600)
          window.dispatchEvent(new Event('scroll'))
          return window.scrollY
        }
        """
    )
    assert scroll_position == 600
    page.wait_for_timeout(300)
    expect(header).to_have_class(re.compile(r"-translate-y-full"))
    page.evaluate("window.scrollTo(0, 588)")
    page.wait_for_timeout(100)
    assert header.evaluate(
        "(element) => element.getBoundingClientRect().bottom <= 0"
    )
    page.evaluate("window.scrollTo(0, 600)")
    page.wait_for_timeout(100)
    assert header.evaluate(
        "(element) => element.getBoundingClientRect().bottom <= 0"
    )

    page.evaluate("window.scrollTo(0, 400)")
    page.wait_for_timeout(100)
    expect(header).not_to_have_class(re.compile(r"-translate-y-full"))
    expect(logo).to_have_attribute("src", "/brand/logo-color.png")
    expect(header).to_have_class(re.compile(r"bg-background/95"))
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_function(
        "document.querySelector('header')?.getBoundingClientRect().top >= 0"
    )
    top_state = header.evaluate(
        "(element) => { const rect = element.getBoundingClientRect(); return { scrollY: window.scrollY, top: rect.top, bottom: rect.bottom, className: element.className, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior } }"
    )
    assert top_state["top"] == 0 and top_state["bottom"] > 0, top_state
    expect(logo).to_have_attribute("src", "/brand/logo-white.png")

    browser.close()
