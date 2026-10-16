import asyncio
import os

from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')


async def main(group):
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 960})
        release = asyncio.Event()
        logo_release = asyncio.Event()
        failures = []
        page.on('pageerror', lambda error: failures.append(str(error)))

        async def hold_request(route):
            await release.wait()
            await route.continue_()

        async def hold_logo(route):
            await logo_release.wait()
            await route.continue_()

        await page.route('**/brand/logo-mark.png', hold_logo)
        await page.route('**/_serverFn/**', hold_request)
        await page.goto(f'{BASE}/about-us', wait_until='domcontentloaded')
        await page.wait_for_timeout(1200)
        await page.wait_for_timeout(1000)
        await page.get_by_role('button', name='Browse products', exact=True).click()
        link = page.locator(f'a[href*="/products/{group}"]:visible')
        await link.hover()
        await page.wait_for_timeout(100)
        await link.click()
        loader = page.get_by_role('status').filter(has_text='Loading page…')
        await expect(loader).to_be_visible()
        image = loader.locator('img')
        await expect(image).to_be_visible()
        state = await image.evaluate('(img) => ({ complete: img.complete, width: img.naturalWidth })')
        print('Logo at loader appearance:', state)
        if not state['complete'] or state['width'] == 0:
            logo_release.set()
            release.set()
            await page.unroute_all(behavior='wait')
            await browser.close()
            raise AssertionError('BUG: Loading page is visible before its logo is ready')
        highlight = loader.locator('.logo-loader-highlight')
        source = await image.get_attribute('src')
        assert source.startswith('data:image/png;base64,'), source
        assert source in await highlight.evaluate('(e) => getComputedStyle(e).maskImage')
        assert await highlight.evaluate('(e) => getComputedStyle(e).animationName') == 'logo-loader-sweep'
        await page.emulate_media(reduced_motion='reduce')
        assert await highlight.evaluate('(e) => getComputedStyle(e).animationName') == 'none'
        overlay = page.locator('main [aria-busy="true"]')
        assert await overlay.evaluate('(e) => { const r = e.getBoundingClientRect(); return r.x === 0 && r.y === 0 && r.width === innerWidth && r.height === innerHeight }')
        assert await overlay.evaluate('(e) => e.contains(document.elementFromPoint(20, 20))')
        await page.set_viewport_size({'width': 390, 'height': 844})
        assert await overlay.evaluate('(e) => { const r = e.getBoundingClientRect(); return r.width === innerWidth && r.height === innerHeight }')
        logo_release.set()
        release.set()
        await expect(page.locator('#products-hero-heading')).to_have_text(f'All {group.title()}', timeout=30000)
        await expect(loader).to_have_count(0)
        assert not failures, failures
        await browser.close()
        print(f'PASS: {group}; logo ready with external image held; reduced motion; destination resolves')


for group in ('types', 'applications'):
    asyncio.run(main(group))
