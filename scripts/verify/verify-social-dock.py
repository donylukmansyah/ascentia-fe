import argparse

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--widths", nargs="+", type=int, default=[360, 390, 813, 1440])
args = parser.parse_args()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        for width in args.widths:
            context = browser.new_context(
                viewport={"width": width, "height": 844},
                is_mobile=width < 1024,
                has_touch=True,
            )
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            # Development overlays must not intercept site controls.
            page.route("**/__tsd/console-pipe/sse", lambda route: route.abort())
            page.goto("http://localhost:3000/about-us")
            page.wait_for_load_state("networkidle")
            page.add_style_tag(
                content='button[aria-label="Open TanStack Devtools"] { display: none !important; }'
            )
            section = page.locator("section[aria-labelledby='about-partners-heading']")
            next_button = page.get_by_role("button", name="Next partners", exact=True)
            previous = page.get_by_role("button", name="Previous partners", exact=True)
            selected = section.locator("button[aria-pressed='true']")
            section.scroll_into_view_if_needed()
            section.evaluate(
                "e => e.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}))"
            )
            page.wait_for_timeout(1100)
            next_button.evaluate(
                "e => window.scrollBy(0, e.getBoundingClientRect().y + 18 - 640)"
            )
            page.wait_for_timeout(1100)

            def activate(control):
                box = control.bounding_box()
                x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
                receives_input = control.evaluate(
                    "(e, point) => e.contains(document.elementFromPoint(...point))",
                    [x, y],
                )
                hit = page.evaluate(
                    "point => document.elementFromPoint(...point)?.outerHTML.slice(0, 300)",
                    [x, y],
                )
                assert receives_input, f"{width}px: {control.get_attribute('aria-label')} covered by {hit}"
                if width < 1024:
                    page.touchscreen.tap(x, y)
                else:
                    page.mouse.click(x, y)

            def step(control):
                before = selected.get_attribute("aria-label")
                activate(control)
                expect(selected).not_to_have_attribute("aria-label", before)
                page.wait_for_timeout(700)

            step(next_button)
            step(previous)
            trigger = page.locator("button[aria-controls^='social-dock-menu-']")
            dock = trigger.locator("../..")
            assert dock.evaluate("e => getComputedStyle(e).pointerEvents") == "none"
            activate(trigger)
            expect(trigger).to_have_attribute("aria-expanded", "true")
            menu = page.locator("[role='menu'][aria-label='Kontak Ascentia']")
            items = menu.get_by_role("menuitem")
            expect(items).to_have_count(4)
            page.wait_for_timeout(800)
            for item in items.all():
                assert item.evaluate("e => getComputedStyle(e).pointerEvents") == "auto"
                box = item.bounding_box()
                assert item.evaluate(
                    "(e, point) => e.contains(document.elementFromPoint(...point))",
                    [box["x"] + box["width"] / 2, box["y"] + box["height"] / 2],
                ), f"{width}px: contact item covered"

            menu.evaluate(
                "e => e.addEventListener('click', event => event.preventDefault())"
            )
            activate(items.first)
            expect(trigger).to_have_attribute("aria-expanded", "false")
            assert menu.evaluate("e => e.inert")
            page.wait_for_timeout(800)
            step(next_button)
            activate(trigger)
            expect(trigger).to_have_attribute("aria-expanded", "true")
            page.wait_for_timeout(800)
            activate(trigger)
            expect(trigger).to_have_attribute("aria-expanded", "false")
            page.wait_for_timeout(800)
            activate(trigger)
            expect(trigger).to_have_attribute("aria-expanded", "true")
            page.wait_for_timeout(800)
            page.keyboard.press("Escape")
            expect(trigger).to_have_attribute("aria-expanded", "false")
            expect(trigger).to_be_focused()
            page.wait_for_timeout(800)
            activate(trigger)
            expect(trigger).to_have_attribute("aria-expanded", "true")
            page.wait_for_timeout(800)
            page.mouse.click(10, 640)
            expect(trigger).to_have_attribute("aria-expanded", "false")
            page.wait_for_timeout(800)
            step(next_button)
            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(800)
            expect(dock).to_have_attribute("aria-hidden", "true")
            assert trigger.evaluate("e => getComputedStyle(e).pointerEvents") == "none"
            assert trigger.get_attribute("tabindex") == "-1"
            assert not errors, errors
            print(f"PASS {width}px: Next/Prev, contact toggle/items/Escape/outside click, hidden dock")
            context.close()
    finally:
        browser.close()
