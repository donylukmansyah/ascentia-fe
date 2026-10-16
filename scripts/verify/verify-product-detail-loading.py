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
        await page.goto(f'{BASE}/products/brands')
        await page.wait_for_timeout(1200)
        release = asyncio.Event()

        async def hold(route):
            await release.wait()
            await route.continue_()

        await page.route('**/_serverFn/**', hold)
        await page.locator('#product-results article a').first.click()
        skeleton = page.get_by_role('status').filter(has_text='Loading product')
        await expect(skeleton).to_be_visible()
        hero = skeleton.locator('.bg-foreground')
        assert await hero.evaluate('(e) => e.getBoundingClientRect().height') >= 516
        related_skel = skeleton.get_by_label('Loading related products')
        await expect(related_skel).to_be_visible()
        assert await related_skel.locator('li').count() == 4
        await page.set_viewport_size({'width': 390, 'height': 844})
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        release.set()
        await expect(page.locator('#product-detail-heading')).to_be_visible(timeout=30000)
        await expect(skeleton).to_have_count(0)
        assert not errors, errors
        await browser.close()
        print('PASS: real card detail skeleton matches hero layout, mobile fits, data resolves')


asyncio.run(main())
