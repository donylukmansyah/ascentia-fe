import asyncio
import os
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})

        print('1. Testing Search Dialog with offline / error routes...')
        await page.goto(BASE, wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)

        # Trigger search dialog
        trigger = page.locator('[data-site-search-trigger]').first
        await trigger.click()
        dialog = page.get_by_role('dialog', name='Search Ascentia')
        await expect(dialog).to_be_visible()

        search_input = dialog.get_by_role('combobox')
        await search_input.fill('xyzunknownkeyword')
        await page.wait_for_timeout(500)
        # Empty state
        await expect(dialog.get_by_text('No results found')).to_be_visible()
        print('   Empty state verified.')

        # Test fuzzy suggestion for typo "phenix" -> "Phoenix"
        await search_input.fill('phenix')
        await page.wait_for_timeout(500)
        suggestion_btn = dialog.get_by_role('button', name='Phoenix')
        await expect(suggestion_btn).to_be_visible()
        print('   Fuzzy suggestion "Did you mean Phoenix?" verified.')

        # Clicking suggestion populates search
        await suggestion_btn.click()
        await expect(search_input).to_have_value('Phoenix')
        print('   Suggestion click updated input successfully.')

        # Close dialog
        await page.keyboard.press('Escape')
        await expect(dialog).not_to_be_visible()

        print('\n2. Testing /blogs page resilience...')
        await page.goto(f'{BASE}/blogs', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        blogs_heading = page.get_by_role('heading', name='Recent blogs post')
        await expect(blogs_heading).to_be_visible()
        # Either cards are loaded or QueryErrorState is rendered (no silent empty trap on server error)
        error_state = page.locator('#blogs-content [role="alert"]')
        has_error = await error_state.count() > 0
        if has_error:
            await expect(error_state.get_by_role('button', name='Try again')).to_be_visible()
            print('   Backend offline: Blogs QueryErrorState with "Try again" correctly displayed.')
        else:
            cards = page.locator('#blogs-content article')
            print(f'   Backend online/cached: {await cards.count()} blog cards rendered.')

        print('\n3. Testing /news page resilience...')
        await page.goto(f'{BASE}/news', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        news_heading = page.get_by_role('heading', name='Features Events')
        await expect(news_heading).to_be_visible()
        news_error = page.locator('#news-content [role="alert"]')
        has_news_error = await news_error.count() > 0
        if has_news_error:
            await expect(news_error.first.get_by_role('button', name='Try again')).to_be_visible()
            print('   Backend offline: News QueryErrorState with "Try again" correctly displayed.')
        else:
            print('   Backend online/cached: News sections rendered.')

        print('\n4. Testing /products page resilience...')
        await page.goto(f'{BASE}/products', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        prod_error = page.locator('[role="alert"]')
        has_prod_error = await prod_error.count() > 0
        if has_prod_error:
            await expect(prod_error.first.get_by_role('button', name='Try again')).to_be_visible()
            print('   Backend offline: Product QueryErrorState with "Try again" correctly displayed.')
        else:
            print('   Backend online/cached: Product catalog rendered.')

        print('\n5. Testing simulated backend offline (HTTP 503) error states...')
        # Intercept server query routes to simulate WordPress backend offline
        await page.route('**/_serverFn/**', lambda route: route.fulfill(status=503, body='Unavailable'))

        # Search dialog with simulated backend error
        await page.goto(BASE, wait_until='domcontentloaded')
        await page.wait_for_timeout(500)
        await page.locator('[data-site-search-trigger]').first.click()
        search_input = dialog.get_by_role('combobox')
        await search_input.fill('offline-test')
        await page.wait_for_timeout(1000)
        search_error = dialog.locator('[role="alert"]')
        await expect(search_error).to_be_visible()
        await expect(search_error.get_by_text('Search unavailable')).to_be_visible()
        await expect(search_error.get_by_role('button', name='Try again')).to_be_visible()
        print('   Search dialog simulated offline: QueryErrorState successfully rendered!')

        # Unroute for cleanup
        await page.unroute('**/_serverFn/**')

        print('\nALL RESILIENCE, OFFLINE STATES, AND FUZZY SEARCH VERIFICATIONS PASSED!')
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
