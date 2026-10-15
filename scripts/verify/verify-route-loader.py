import asyncio
import os

from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 960})
        release = asyncio.Event()
        failures = []
        page.on('pageerror', lambda error: failures.append(str(error)))

        async def hold_request(route):
            await release.wait()
            await route.continue_()

        await page.route('**/_serverFn/**', hold_request)
        await page.goto(f'{BASE}/about-us', wait_until='domcontentloaded')
        await page.wait_for_timeout(1200)
        await page.wait_for_timeout(1000)
        await page.get_by_role('button', name='Browse products', exact=True).click()
        link = page.locator('a[href*="/products/applications"]:visible')
        await link.hover()
        await page.wait_for_timeout(100)
        await link.click()
        loader = page.get_by_role('status').filter(has_text='Loading page…')
        await expect(loader).to_be_visible()
        image = loader.locator('img')
        await expect(image).to_be_visible()
        await page.wait_for_function("document.querySelector('main [role=status] img')?.naturalWidth > 0")
        highlight = loader.locator('.logo-loader-highlight')
        assert await highlight.evaluate('(e) => getComputedStyle(e).animationName') == 'logo-loader-sweep'
        await page.emulate_media(reduced_motion='reduce')
        assert await highlight.evaluate('(e) => getComputedStyle(e).animationName') == 'none'
        overlay = page.locator('main [aria-busy="true"]')
        assert await overlay.evaluate('(e) => { const r = e.getBoundingClientRect(); return r.x === 0 && r.y === 0 && r.width === innerWidth && r.height === innerHeight }')
        assert await overlay.evaluate('(e) => e.contains(document.elementFromPoint(20, 20))')
        await page.set_viewport_size({'width': 390, 'height': 844})
        assert await overlay.evaluate('(e) => { const r = e.getBoundingClientRect(); return r.width === innerWidth && r.height === innerHeight }')
        release.set()
        await expect(page.locator('#products-hero-heading')).to_have_text('All Applications', timeout=30000)
        await expect(loader).to_have_count(0)
        assert not failures, failures
        await browser.close()
        print('PASS: hover-click pending shows branded loader; reduced motion; destination resolves')


asyncio.run(main())
