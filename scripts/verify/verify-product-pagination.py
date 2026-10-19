import asyncio
import os
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
        release = asyncio.Event()

        async def hold_request(route):
            await release.wait()
            await route.continue_()

        async def skip_media(route):
            if route.request.resource_type in ('image', 'media'):
                await route.abort()
            else:
                await route.continue_()

        try:
            await page.route('**/*', skip_media)
            await page.goto(f'{BASE}/products/brands', wait_until='domcontentloaded')
            next_page = page.locator('a[aria-label="Go to page 2"]')
            await expect(next_page).to_be_visible(timeout=30000)
            await expect(page.locator('section').filter(
                has=page.get_by_role('heading', name='Explore our recommendations', exact=True)
            ).locator('a[href^="/products/"]').first).to_be_visible(timeout=30000)
            canonical = await page.locator('link[rel="canonical"]').get_attribute('href')
            await page.route('**/_serverFn/**', hold_request)
            await next_page.click()
            await page.wait_for_timeout(1000)
            await expect(page.get_by_text('Loading page…', exact=True)).to_have_count(0)
            await expect(page.get_by_role('heading', name='All Brands', exact=True)).to_be_visible()
            await expect(page.locator('#product-results li.animate-pulse')).to_have_count(8)
            release.set()
            await page.wait_for_url('**/products/brands?page=2')
            await expect(page.locator('#product-results li.animate-pulse')).to_have_count(0, timeout=30000)
            await expect(page.locator('link[rel="canonical"]')).to_have_attribute('href', f'{canonical}?page=2')
            release.clear()
            await page.get_by_role('button', name='Browse products', exact=True).click()
            await page.locator('a[href="/products/types"]').filter(visible=True).click()
            await expect(page.get_by_text('Loading page…', exact=True)).to_be_visible(timeout=5000)
            release.set()
            await page.wait_for_url('**/products/types')
            await expect(page.get_by_role('heading', name='All Types', exact=True)).to_be_visible(timeout=30000)
            await expect(page.get_by_text('Loading page…', exact=True)).to_have_count(0)
            print('PASS: pagination uses card skeletons; changing product pages uses full-page loader')
        finally:
            release.set()
            await page.unroute_all(behavior='wait')
            await browser.close()


asyncio.run(main())
