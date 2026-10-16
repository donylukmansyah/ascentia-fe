import json
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

artifacts = Path(tempfile.mkdtemp(prefix="ascentia-location-popup-"))
results = []
watch = """() => {
  window.popupAudit = {done: false, overflow: [], scroll: []};
  const start = performance.now(), y = scrollY;
  function sample() {
    const container = document.querySelector('.office-popup .maplibregl-popup-content > div');
    if (container) {
      const h = container.clientHeight, sh = container.scrollHeight;
      if (sh > h) window.popupAudit.overflow.push({h, sh, ms: performance.now() - start});
    }
    if (scrollY !== y) window.popupAudit.scroll.push(scrollY - y);
    if (performance.now() - start < 900) requestAnimationFrame(sample);
    else window.popupAudit.done = true;
  }
  requestAnimationFrame(sample);
}"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for route in ("about-us", "contact-us"):
        for width, height in ((1440, 900), (390, 844)):
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(f"http://localhost:3000/{route}", wait_until="domcontentloaded")
            section = page.locator('section[aria-labelledby="about-locations-heading"]')
            for office in ("Jakarta", "Kendari"):
                pin = section.get_by_role("button", name=f"Lihat info kantor {office}")
                pin.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                for opening in (1, 2):
                    page.evaluate(watch)
                    pin.click()
                    page.wait_for_function("window.popupAudit.done")
                    popup = section.locator(".office-popup")
                    assert popup.is_visible(), f"{route}: {office} popup missing"
                    assert pin.get_attribute("aria-expanded") == "true"
                    data = page.evaluate("window.popupAudit")
                    result = {
                        "route": route,
                        "width": width,
                        "office": office,
                        "opening": opening,
                        "overflowFrames": len(data["overflow"]),
                        "scrollFrames": len(data["scroll"]),
                        "errors": errors.copy(),
                    }
                    results.append(result)
                    print(json.dumps(result))
                    if opening == 1:
                        page.screenshot(path=str(artifacts / f"{route}-{width}-{office}.png"))
                    page.keyboard.press("Escape")
                    popup.wait_for(state="detached")
                    assert pin.get_attribute("aria-expanded") == "false"
            context.close()
    browser.close()

(artifacts / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
print(f"Artifacts: {artifacts}")
failures = [r for r in results if r["overflowFrames"] or r["scrollFrames"] or r["errors"]]
assert not failures, f"Popup scrollbar flash/page jump: {failures}"
print(f"PASS: {len(results)} popup openings; no scrollbar flash, page jump, uncaught errors")
