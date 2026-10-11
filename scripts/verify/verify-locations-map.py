from playwright.sync_api import sync_playwright

errors = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto("http://localhost:3000/about-us", wait_until="load")
    page.wait_for_timeout(6000)
    canvas = page.locator(".maplibregl-canvas").first
    print("canvas count:", canvas.count())
    if canvas.count():
        box = canvas.bounding_box()
        print("canvas box:", box)
        px = page.evaluate(
            """() => {
              const c = document.querySelector('.maplibregl-canvas');
              if (!c) return null;
              const t = document.createElement('canvas');
              t.width = 32; t.height = 32;
              const g = t.getContext('2d');
              g.drawImage(c, 0, 0, 32, 32);
              const d = g.getImageData(0, 0, 32, 32).data;
              const set = new Set();
              for (let i = 0; i < d.length; i += 4) set.add(d[i] + ',' + d[i+1] + ',' + d[i+2]);
              return {unique: set.size, sample: [...set].slice(0, 8)};
            }"""
        )
        print("pixels:", px)
    tiles = page.evaluate(
        """() => performance.getEntriesByType('resource')
          .filter(r => r.name.includes('basemaps') || r.name.includes('tiles'))
          .map(r => r.name.slice(0, 90))"""
    )
    print("tile reqs:", len(tiles))
    for t in tiles[:6]:
        print(" -", t)
    pins = page.locator("text=Jakarta").count()
    print("jakarta pin:", pins)
    page.locator("#about-locations-heading").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="scripts/verify/map-debug.png")
    print("screenshot: scripts/verify/map-debug.png")
    browser.close()
print("console errors:", len(errors))
for e in errors[:10]:
    print("ERR:", e[:200])
