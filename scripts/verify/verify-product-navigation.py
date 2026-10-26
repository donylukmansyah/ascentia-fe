import asyncio
import os

from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page()
        failures = []
        page.on('pageerror', lambda error: failures.append(str(error)))
        release = asyncio.Event()

        async def hold_data(route):
            await release.wait()
            await route.continue_()

        await page.route('**/_serverFn/**', hold_data)
        await page.goto(f'{BASE}/about-us', wait_until='domcontentloaded')
        await page.wait_for_function("!!window.__TSR_ROUTER__")
        await page.evaluate("window.__TSR_ROUTER__.navigate({ to: '/products/brands', search: { category: '', q: '', page: 1 } })")
        await expect(page.locator('#products-hero-heading')).to_have_text('All Brands')
        grid = page.locator('#product-results [aria-busy]')
        await expect(grid).to_have_attribute('aria-busy', 'true')
        await expect(grid.locator('li.animate-pulse')).to_have_count(8)
        await expect(grid.locator('[role="status"]').first).to_contain_text('Loading products…')
        release.set()
        await expect(grid).to_have_attribute('aria-busy', 'false', timeout=30000)
        assert await grid.locator('article').count() > 0, 'Products did not load'

        await page.evaluate("window.__TSR_ROUTER__.navigate({ to: '/' })")
        await expect(page.locator('#product-results')).to_have_count(0)
        await expect(page.get_by_role('heading', name='Featured products', exact=True)).to_be_visible()
        release.clear()
        home = await browser.new_page()
        home.on('pageerror', lambda error: failures.append(str(error)))
        await home.route('**/_serverFn/**', hold_data)
        await home.goto(f'{BASE}/about-us', wait_until='domcontentloaded')
        await home.wait_for_function("!!window.__TSR_ROUTER__")
        await home.evaluate("window.__TSR_ROUTER__.navigate({ to: '/' })")
        featured = home.locator('section').filter(has=home.get_by_role('heading', name='Featured products', exact=True))
        await expect(featured.locator('[aria-busy="true"]')).to_be_visible()
        await expect(home.get_by_role('heading', name='Brands we represent', exact=True)).to_be_visible()
        await expect(home.locator('section[aria-label="Brands we represent"] img').first).to_have_attribute('src', '/images/about-us/our-partner-logo/xrf-scientific.png')
        release.set()
        await expect(featured.locator('article').first).to_be_visible(timeout=30000)
        assert not failures, failures
        await browser.close()
        print('PASS: listing and Home render skeletons before data; products resolve; cached Home renders')


asyncio.run(main())
