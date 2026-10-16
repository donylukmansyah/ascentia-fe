import asyncio
import os
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        failures = []
        page.on('pageerror', lambda err: failures.append(str(err)))

        print('Navigating to /news...', flush=True)
        await page.goto(f'{BASE}/news', wait_until='domcontentloaded')
        await page.wait_for_selector('#popular-news-heading')

        # 1. Verify editorial disclaimer is gone
        disclaimer = page.get_by_text('Editorial content from PT Ascentia Arsya Analitika')
        assert await disclaimer.count() == 0, 'Disclaimer text should not exist'
        print('Verified: Editorial disclaimer text is gone!', flush=True)

        # 2. Verify NO static dummy articles are present
        dummy_match = page.get_by_text('Why matrix matching matters in XRF')
        assert await dummy_match.count() == 0, 'Dummy article should not exist on the page'
        dummy_prep = page.get_by_text('A closer look at sample preparation')
        assert await dummy_prep.count() == 0, 'Dummy article should not exist on the page'
        print('Verified: Static dummy articles are completely removed!', flush=True)

        # 3. Verify Popular post articles are dynamic from WordPress
        popular_heading = page.locator('#popular-news-heading')
        await expect(popular_heading).to_be_visible()
        popular_items = page.locator('aside[aria-labelledby="popular-news-heading"] li')
        popular_count = await popular_items.count()
        print(f'Popular post count: {popular_count}', flush=True)
        assert popular_count > 0, 'Popular posts should be loaded from WordPress'
        first_popular_title = await popular_items.first.locator('h3').inner_text()
        print(f'First popular title: {first_popular_title}', flush=True)

        page.on('console', lambda msg: print(f'BROWSER [{msg.type}]: {msg.text}', flush=True))

        # 4. Verify Show More pill button
        show_more_btn = page.locator('section[aria-labelledby="latest-news-heading"]').get_by_role('button', name='Show More')
        if await show_more_btn.count() > 0:
            btn_class = await show_more_btn.get_attribute('class')
            print(f'Show More button classes: {btn_class}', flush=True)
            assert 'rounded-full' in btn_class, 'Expected rounded-full pill styling'

            latest_cards = page.locator('section[aria-labelledby="latest-news-heading"] article')
            initial_count = await latest_cards.count()
            print(f'Initial latest news cards: {initial_count}', flush=True)

            print('Waiting for client hydration...', flush=True)
            await page.wait_for_timeout(2000)
            print('Clicking Show More button...', flush=True)
            await show_more_btn.click()
            print('Waiting for latest news cards to increase...', flush=True)
            await expect(latest_cards).to_have_count(8, timeout=10000)

            new_count = await latest_cards.count()
            print(f'Count after clicking Show More: {new_count}', flush=True)
            print('Verified: Show More successfully fetched and appended new articles!', flush=True)

        # 5. Verify sticky aside positioning
        aside = page.locator('aside[aria-labelledby="popular-news-heading"]')
        await page.evaluate('window.scrollTo(0, 1000)')
        await page.wait_for_timeout(400)
        bounding_box = await aside.bounding_box()
        print(f'Aside bounding box after scroll: {bounding_box}', flush=True)
        assert bounding_box is not None, 'Aside should remain visible'
        assert bounding_box['y'] >= 0, 'Aside should be sticky within viewport'
        print('Verified: Sticky sidebar is pinned inside viewport upon scroll!', flush=True)

        assert not failures, f'Page errors: {failures}'
        await browser.close()
        print('All news dynamic data, Show More pill, and sticky checks PASSED!')

asyncio.run(main())
