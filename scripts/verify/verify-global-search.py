import asyncio
import json
import os
from urllib.parse import parse_qs, urlparse
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('SITE_URL', 'http://localhost:3000')


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 950})
        errors = []
        responses = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda response: responses.append(response) if '_server' in response.url else None)
        await page.goto(BASE, wait_until='domcontentloaded')
        try:
            await page.wait_for_load_state('networkidle', timeout=5000)
        except Exception:
            pass
        trigger = page.get_by_role('button', name='Search Ascentia').filter(visible=True)
        await expect(trigger).to_contain_text('K')
        await expect(trigger.locator('svg.lucide-command')).to_be_visible()
        await trigger.click()
        dialog = page.get_by_role('dialog', name='Search Ascentia')
        await expect(dialog).to_be_visible()
        search = dialog.get_by_role('combobox')
        await expect(search).to_be_focused()
        await page.keyboard.press('Tab')
        assert await page.evaluate("document.querySelector('[role=dialog]').contains(document.activeElement)")
        await search.focus()
        await expect(dialog.get_by_text('Type at least 2 characters to get started.', exact=True)).to_be_visible()
        await search.press('Escape')
        await expect(dialog).not_to_be_visible()
        await expect(trigger).to_be_focused()
        await page.keyboard.press('Control+k')
        await expect(dialog).to_be_visible()
        await search.fill('xrf')
        await page.wait_for_timeout(400)
        await page.screenshot(path='C:/Users/Minguri/AppData/Local/Temp/ascentia-search-loading.png')
        await page.wait_for_timeout(16000)
        print('Live search results:', await dialog.get_by_role('option').count(), flush=True)
        print('Live group errors:', await dialog.get_by_role('button', name='Try again').count(), flush=True)
        print('Search server calls:', len(responses), flush=True)
        await page.screenshot(path='C:/Users/Minguri/AppData/Local/Temp/ascentia-search-desktop.png')
        options = dialog.get_by_role('option')
        if await options.count():
            await search.press('ArrowDown')
            assert await search.get_attribute('aria-activedescendant')
            print('Keyboard active option:', await search.get_attribute('aria-activedescendant'), flush=True)
        await search.fill('missing-query-xyz')
        await expect(dialog.get_by_role('option')).to_have_count(0)
        await search.fill('xrf')
        await expect(dialog.get_by_role('option')).to_have_count(8)
        await search.press('ArrowDown')
        active_id = await search.get_attribute('aria-activedescendant')
        selected_url = await page.locator(f'[id="{active_id}"]').get_attribute('href')
        await search.press('Enter')
        await expect(dialog).not_to_be_visible()
        await page.wait_for_url(f'**{selected_url}')
        assert '/products/' in page.url
        await page.goto(BASE, wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        await page.keyboard.press('Control+k')
        await expect(dialog).to_be_visible()

        async def mock_search(route):
            payload = json.loads(parse_qs(urlparse(route.request.url).query)['payload'][0])
            values = payload['t']['p']['v'][0]['p']['v']
            query, group = (value['s'] for value in values)
            if query == 'partial' and group == 'products':
                await route.fulfill(status=503, body='Unavailable')
                return
            if query in ('slow', 'fast'):
                await asyncio.sleep(1 if query == 'slow' else 0.05)
            rows = [] if query == 'empty' else [{
                'id': group, 'title': f'{query} {group}', 'slug': 'example',
                'image': '/brand/logo-mark.png', 'meta': 'Example', 'group': group,
            }]
            root = {'t': 10, 'i': 0, 'p': {'k': ['result', 'error', 'context'], 'v': [
                {'t': 9, 'i': 1, 'a': [
                    {'t': 10, 'i': index + 2, 'p': {'k': list(row), 'v': [{'t': 1, 's': value} for value in row.values()]}, 'o': 0}
                    for index, row in enumerate(rows)
                ], 'o': 0}, {'t': 2, 's': 1}, {'t': 11, 'i': 100, 'p': {'k': [], 'v': []}, 'o': 0}
            ]}, 'o': 0}
            try:
                await route.fulfill(status=200, headers={'content-type': 'application/json', 'x-tss-serialized': 'true'}, body=json.dumps(root))
            except Exception:
                pass

        await page.route('**/_serverFn/**', mock_search)
        await search.fill('empty')
        await expect(dialog.get_by_text('No results found for “empty”', exact=True)).to_be_visible()
        await search.fill('partial')
        await expect(dialog.get_by_role('button', name='Try again')).to_have_count(1)
        await expect(dialog.get_by_role('option')).to_have_count(2)
        await search.fill('slow')
        await page.wait_for_timeout(380)
        await expect(dialog.get_by_text('Searching products, news and blogs.', exact=True)).to_have_count(1)
        await search.fill('fast')
        await expect(dialog.get_by_role('option')).to_have_count(0)
        await expect(dialog.get_by_role('option').filter(has_text='fast')).to_have_count(3)
        await page.wait_for_timeout(1200)
        await expect(dialog.get_by_role('option').filter(has_text='slow')).to_have_count(0)
        await dialog.get_by_role('option').first.locator('img').evaluate("el => el.dispatchEvent(new Event('error'))")
        await expect(dialog.get_by_role('option').first.locator('img')).to_have_count(0)
        await search.press('Escape')
        await expect(dialog).not_to_be_visible()
        await page.evaluate("""() => { const input = document.createElement('input'); input.id='shortcut-guard'; document.body.append(input); input.focus(); }""")
        await page.keyboard.press('Control+k')
        await expect(dialog).not_to_be_visible()
        await page.locator('#shortcut-guard').evaluate('(el) => el.remove()')
        await page.evaluate('window.scrollTo(0, 0)')
        await page.set_viewport_size({'width': 390, 'height': 844})
        await page.wait_for_timeout(600)
        mobile_trigger = page.get_by_role('button', name='Search Ascentia').filter(visible=True)
        assert (await mobile_trigger.inner_text()).strip() == ''
        await mobile_trigger.click()
        await expect(dialog).to_be_visible()
        box = await dialog.bounding_box()
        assert box['x'] >= 0 and box['x'] + box['width'] <= 391, box
        await search.fill('xrf')
        await page.wait_for_timeout(600)
        await page.screenshot(path='C:/Users/Minguri/AppData/Local/Temp/ascentia-search-mobile.png')
        await page.set_viewport_size({'width': 390, 'height': 450})
        compact_box = await dialog.bounding_box()
        assert compact_box['y'] + compact_box['height'] <= 451
        await expect(search).to_be_visible()
        await expect(dialog.get_by_role('button', name='Close search')).to_be_visible()
        await dialog.locator('.overflow-y-auto').evaluate('(el) => el.scrollTop = el.scrollHeight')
        await dialog.get_by_role('button', name='Close search').click()
        await expect(mobile_trigger).to_be_focused()
        mac = await browser.new_context(viewport={'width': 1440, 'height': 900})
        await mac.add_init_script("Object.defineProperty(navigator, 'platform', {get: () => 'MacIntel'})")
        mac_page = await mac.new_page()
        await mac_page.goto(BASE, wait_until='domcontentloaded')
        await mac_page.wait_for_timeout(1500)
        await expect(mac_page.get_by_role('button', name='Search Ascentia').filter(visible=True)).to_contain_text('K')
        await expect(mac_page.get_by_role('button', name='Search Ascentia').filter(visible=True).locator('svg.lucide-command')).to_be_visible()
        await mac_page.keyboard.press('Meta+k')
        await expect(mac_page.get_by_role('dialog', name='Search Ascentia')).to_be_visible()
        linux = await browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
        await linux.add_init_script("Object.defineProperty(navigator, 'platform', {get: () => 'Linux x86_64'})")
        linux_page = await linux.new_page()
        await linux_page.goto(BASE, wait_until='domcontentloaded')
        await linux_page.wait_for_timeout(1500)
        await expect(linux_page.get_by_role('button', name='Search Ascentia').filter(visible=True)).to_contain_text('K')
        await expect(linux_page.get_by_role('button', name='Search Ascentia').filter(visible=True).locator('svg.lucide-command')).to_be_visible()
        await linux_page.get_by_role('button', name='Search Ascentia').filter(visible=True).click()
        await linux_page.get_by_role('button', name='Close search').click()
        await linux_page.keyboard.press('Control+k')
        await expect(linux_page.get_by_role('dialog', name='Search Ascentia')).to_be_visible()
        assert not errors, errors
        await browser.close()
        print('Global search live API, desktop/mobile/OS, keyboard/focus, empty/error, image fallback and stale-query checks passed', flush=True)


asyncio.run(main())
