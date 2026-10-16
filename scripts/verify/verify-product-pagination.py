import asyncio
import os

from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 960})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(f'{BASE}/products/brands', wait_until='domcontentloaded')
        await page.wait_for_timeout(1200)
        grid = page.locator('#product-results [aria-busy]')
        await expect(grid).to_have_attribute('aria-busy', 'false')
        await expect(grid.locator('article')).to_have_count(8)
        release = asyncio.Event()

        async def hold(route):
            await release.wait()
            await route.continue_()

        await page.route('**/_serverFn/**', hold)
        await page.get_by_role('button', name='Next page', exact=True).click()
        await expect(grid.locator('li.animate-pulse')).to_have_count(8)
        await expect(grid.locator('article')).to_have_count(0)
        await expect(page.get_by_role('button', name='Go to page 2', exact=True)).to_be_disabled()
        await expect(grid.locator('[role="status"]').first).to_contain_text('Loading products…')
        assert page.url.endswith('/products/brands?page=2'), page.url
        release.set()
        await expect(grid).to_have_attribute('aria-busy', 'false', timeout=30000)
        assert await grid.locator('article').count() > 0
        await page.get_by_role('button', name='Previous page', exact=True).click()
        await expect(grid.locator('article')).to_have_count(8)
        await expect(grid.locator('li.animate-pulse')).to_have_count(0)
        assert page.url.endswith('/products/brands'), page.url
        response = await page.goto(f'{BASE}/vnoavajav', wait_until='domcontentloaded')
        assert response.status in (404, 200), response.status
        await expect(page.get_by_role('heading', name='Page not found', exact=True)).to_be_visible()
        await page.wait_for_function("document.querySelector('img[src=\"/maskot/maskot.webp\"]')?.naturalWidth > 0")
        await page.set_viewport_size({'width': 390, 'height': 844})
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        await page.get_by_role('link', name='Back to home', exact=True).click()
        await expect(page.get_by_role('heading', name='Page not found', exact=True)).to_have_count(0)
        assert not errors, errors
        await browser.close()
        print('PASS: pagination skeleton, disabled controls, cached return, clean URL, HTTP 404, mascot, home link')


asyncio.run(main())
