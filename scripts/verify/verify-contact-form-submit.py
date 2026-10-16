import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        print('Opening http://localhost:3000/contact-us...', flush=True)
        await page.goto('http://localhost:3000/contact-us', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        # Fill inputs
        name_input = page.locator('input[name="name"]')
        email_input = page.locator('input[name="email"]')
        msg_input = page.locator('textarea[name="message"]')
        submit_btn = page.locator('button[type="submit"]')

        await name_input.fill('Dony Test Browser')
        await email_input.fill('mingurigatto@gmail.com')
        await msg_input.fill('Halo ini adalah test langsung dari form contact us localhost 3000!')

        print('Clicking submit button...', flush=True)
        await submit_btn.click()

        # Wait for success status
        success_status = page.locator('[role="status"]')
        await expect(success_status).to_be_visible(timeout=10000)
        success_text = await success_status.inner_text()
        print(f'Success status verified: {success_text}', flush=True)

        await browser.close()
        print('All frontend form submit checks PASSED!', flush=True)

asyncio.run(main())
