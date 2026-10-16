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
        page.on('console', lambda msg: print(f'CONSOLE [{msg.type}]: {msg.text}', flush=True))

        print('Testing /news listing...', flush=True)
        await page.goto(f'{BASE}/news', wait_until='domcontentloaded')
        await page.wait_for_selector('#news-hero-heading')
        await expect(page.locator('#news-hero-heading')).to_have_text('Our News')
        await expect(page.locator('#featured-news-heading')).to_have_text('Features Events')
        await expect(page.locator('#latest-news-heading')).to_have_text('Latest News')
        await expect(page.locator('#popular-news-heading')).to_have_text('Popular post')

        featured_articles = page.locator('section[aria-labelledby="featured-news-heading"] article')
        latest_articles = page.locator('section[aria-labelledby="latest-news-heading"] article')
        await featured_articles.first.wait_for()
        assert await featured_articles.count() > 0, 'No featured events found'
        assert await latest_articles.count() > 0, 'No latest news found'

        first_article_link = featured_articles.first.locator('a[href*="/news/"]')
        href = await first_article_link.get_attribute('href')
        print(f'Article link found: {href}', flush=True)

        print(f'Navigating directly to {BASE}{href}...', flush=True)
        await page.goto(f'{BASE}{href}', wait_until='domcontentloaded')
        print(f'Current URL: {page.url}', flush=True)

        await page.wait_for_selector('.article-rich-text', timeout=15000)
        print('Article rich text is visible!', flush=True)

        header_logo = page.locator('header img[src*="logo-color.png"]')
        await expect(header_logo).to_be_visible()
        print('Header color logo is visible!', flush=True)

        breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
        await expect(breadcrumb).to_be_visible()
        await expect(breadcrumb.get_by_text('Home')).to_be_visible()
        await expect(breadcrumb.get_by_text('News')).to_be_visible()
        print('Breadcrumbs verified!', flush=True)

        rich_text = page.locator('.article-rich-text')
        await expect(rich_text).to_be_visible()

        bookmark_btn = page.locator('button[aria-label*="Bookmark"]').first
        await expect(bookmark_btn).to_be_visible()
        print('Bookmark button verified!', flush=True)


        # Test clicking link from news listing using client-side navigate
        print('Testing client-side navigation from /news...', flush=True)
        await page.goto(f'{BASE}/news', wait_until='domcontentloaded')
        await page.wait_for_selector('a[href*="/news/"]')
        # Click the link title element
        await page.locator('section[aria-labelledby="featured-news-heading"] h3').first.click()
        await page.wait_for_url(f'**{href}*')
        print(f'Client-side navigated to: {page.url}', flush=True)

        slug = href.split('/news/')[1].split('?')[0]
        print(f'Testing legacy redirect for slug: {slug}', flush=True)
        await page.goto(f'{BASE}/articles/{slug}')
        assert f'/news/{slug}' in page.url, f'Expected redirect to /news/{slug}, got: {page.url}'
        print('Redirect successfully followed!', flush=True)

        assert not failures, f'Page errors encountered: {failures}'
        await browser.close()
        print('PASS: News listing, detail page, and client-side navigation verified successfully!', flush=True)


asyncio.run(main())
