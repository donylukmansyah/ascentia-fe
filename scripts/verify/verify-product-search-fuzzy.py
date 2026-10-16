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

        print('Navigating to /products/brands...', flush=True)
        await page.goto(f'{BASE}/products/brands', wait_until='domcontentloaded')

        # 1. Verify search input exists
        search_input = page.locator('#brands-content-search')
        await expect(search_input).to_be_visible()
        print('Waiting for client hydration...', flush=True)
        await page.wait_for_timeout(2000)
        print('Verified: Search input is visible!', flush=True)

        # 2. Type a typo keyword (e.g. "xrfuz")
        print('Typing typo query "xrfuz"...', flush=True)
        await search_input.fill('xrfuz')
        # Wait for debounce 300ms + request
        await page.wait_for_timeout(1500)

        # 3. Verify Clear button (X) is visible
        clear_btn = page.locator('button[aria-label="Clear search input"]')
        await expect(clear_btn).to_be_visible()
        print('Verified: Clear (X) button is visible when input has text!', flush=True)

        # 4. Verify products appear directly without any "Did you mean" or extra banner
        did_you_mean = page.get_by_text('Did you mean:')
        await expect(did_you_mean).to_have_count(0)
        print('Verified: No manual "Did you mean" or clutter!', flush=True)

        # 5. Verify products are found directly with the corrected query
        product_cards = page.locator('section#product-results article')
        await product_cards.first.wait_for(timeout=10000)
        card_count = await product_cards.count()
        print(f'Products found automatically for typo query: {card_count}', flush=True)
        assert card_count > 0, 'Expected products to be displayed directly for typo query'

        # 7. Test Clear (X) button
        print('Clicking Clear (X) button...', flush=True)
        await clear_btn.click()
        await page.wait_for_timeout(800)
        cleared_val = await search_input.input_value()
        assert cleared_val == '', 'Input value should be empty after clear'
        all_cards_count = await product_cards.count()
        print(f'Products count after clear: {all_cards_count}', flush=True)
        assert all_cards_count >= card_count, 'All products should be restored'
        print('Verified: Clear (X) button instantly resets search!', flush=True)

        assert not failures, f'Page errors: {failures}'
        await browser.close()
        print('All product search debounce, clear button, and fuzzy typo checks PASSED!')

asyncio.run(main())
