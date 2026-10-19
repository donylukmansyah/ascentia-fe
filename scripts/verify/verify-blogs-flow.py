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

        print('Testing /blogs listing...', flush=True)
        await page.goto(f'{BASE}/blogs', wait_until='domcontentloaded')
        await page.wait_for_selector('#blogs-hero-heading')
        await expect(page.locator('#blogs-hero-heading')).to_have_text('Our Blogs')
        await expect(page.locator('#blogs-list-heading')).to_have_text('Recent blogs post')

        # Check blog cards rendered from WordPress
        blog_articles = page.locator('section[aria-labelledby="blogs-list-heading"] article')
        await blog_articles.first.wait_for()
        count = await blog_articles.count()
        print(f'Found {count} blog post(s)', flush=True)
        assert count > 0, 'No blog posts found'

        first_blog_link = blog_articles.first.locator('a[href*="/blogs/"]')
        href = await first_blog_link.get_attribute('href')
        print(f'Navigating to blog detail: {href}', flush=True)

        # Click the first blog card
        await blog_articles.first.locator('h3').click()
        await page.wait_for_url(f'**{href}*')
        assert '/blogs/' in page.url, f'Expected /blogs/ URL, got: {page.url}'
        print(f'Landed on blog detail page: {page.url}', flush=True)

        # Check header in dark content mode
        header_logo = page.locator('header img[src*="logo-color.webp"]')
        await expect(header_logo).to_be_visible()
        print('Header color logo verified!', flush=True)

        # Check breadcrumbs
        breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
        await expect(breadcrumb).to_be_visible()
        await expect(breadcrumb.get_by_text('Home')).to_be_visible()
        await expect(breadcrumb.get_by_text('Blogs').first).to_be_visible()
        print('Breadcrumbs verified!', flush=True)

        # Check rich text content
        rich_text = page.locator('.article-rich-text')
        await expect(rich_text).to_be_visible()
        print('Rich text content verified!', flush=True)

        # Check bookmark button
        bookmark_btn = page.locator('button[aria-label*="Bookmark"]').first
        await expect(bookmark_btn).to_be_visible()
        print('Bookmark button verified!', flush=True)

        # Test smart legacy redirect for blog
        slug = href.split('/blogs/')[1].split('?')[0]
        print(f'Testing legacy redirect from /articles/{slug}...', flush=True)
        await page.goto(f'{BASE}/articles/{slug}')
        assert f'/blogs/{slug}' in page.url, f'Expected redirect to /blogs/{slug}, got: {page.url}'
        print('Legacy redirect to /blogs/ successfully followed!', flush=True)

        assert not failures, f'Page errors encountered: {failures}'
        await browser.close()
        print('PASS: Blogs listing, detail page, and smart legacy redirect verified successfully!', flush=True)


asyncio.run(main())
