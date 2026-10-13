from playwright.sync_api import sync_playwright


WIDTHS = (320, 375, 414, 540, 640)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    for width in WIDTHS:
        page = browser.new_page(viewport={"width": width, "height": 812})
        page.goto("http://localhost:3000/products/brands", wait_until="load")
        page.get_by_role("heading", name="All Brands", exact=True).wait_for()
        result = page.evaluate(
            """() => {
              const viewport = document.documentElement.clientWidth
              const grid = document.querySelector(
                'section[aria-label="Browse products by brand"] > div'
              )
              const gridRect = grid.getBoundingClientRect()
              const offenders = [...document.querySelectorAll('*')]
                .map((node) => {
                  const rect = node.getBoundingClientRect()
                  return {
                    tag: node.tagName,
                    className: node.className,
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width),
                  }
                })
                .filter((item) => item.right > viewport + 1)
                .slice(0, 12)

              return {
                viewport,
                scrollWidth: document.documentElement.scrollWidth,
                grid: {
                  className: grid.className,
                  left: Math.round(gridRect.left),
                  right: Math.round(gridRect.right),
                  width: Math.round(gridRect.width),
                  gridTemplateColumns: getComputedStyle(grid).gridTemplateColumns,
                  children: [...grid.children].map((node) => {
                    const rect = node.getBoundingClientRect()
                    return {
                      className: node.className,
                      left: Math.round(rect.left),
                      right: Math.round(rect.right),
                      width: Math.round(rect.width),
                    }
                  }),
                },
                offenders,
              }
            }"""
        )
        assert result["scrollWidth"] <= result["viewport"], result
        page.close()

    browser.close()
