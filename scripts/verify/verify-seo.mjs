import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const requests = []
let failing = false
const taxonomy = [
  { id: 100, slug: 'brands', name: 'Brands', parent: 0, count: 9, image: null },
  {
    id: 101,
    slug: 'xrf-scientific',
    name: 'XRF Scientific',
    parent: 100,
    count: 9,
    image: null,
  },
  { id: 200, slug: 'types', name: 'Types', parent: 0, count: 9, image: null },
  {
    id: 300,
    slug: 'applications',
    name: 'Applications',
    parent: 0,
    count: 9,
    image: null,
  },
]
const product = (id) => ({
  id,
  slug: `product-${id}`,
  name: `Product ${id}`,
  permalink: `https://cms.example.com/product/product-${id}/`,
  status: 'publish',
  date: '2026-10-18T01:00:00',
  modified: '2026-10-19T01:00:00',
  modified_gmt: '2026-10-19T01:00:00',
  categories: [{ id: 101 }],
  images: [
    { id: 1, src: 'https://cms.example.com/image.png', alt: 'Product image' },
  ],
  acf: {},
  description: '<p>Real product description</p>',
  short_description: '',
  yoast_head_json: {
    title: `Editor title ${id} &#8211; Ascentia`,
    description: 'Editor description',
    canonical: 'https://cms.example.com/wrong-canonical/',
    robots: { index: id === 2 ? 'noindex' : 'index' },
    og_image: [
      {
        url: 'https://cms.example.com/image.png',
        width: 292,
        height: 292,
        type: 'image/png',
      },
    ],
  },
})
const article = {
  id: 201,
  slug: 'editorial-article',
  title: { rendered: 'Article title' },
  excerpt: { rendered: '<p>Article excerpt</p>' },
  content: { rendered: '<p>Article content</p>' },
  date: '2026-10-18T01:00:00',
  modified_gmt: '2026-10-19T01:00:00',
  categories: [20],
  _embedded: { 'wp:term': [[{ id: 20, name: 'Blogs', slug: 'blogs' }]] },
  yoast_head_json: {
    title: 'Editorial blog title',
    robots: { index: 'index' },
  },
}
const fixture = createServer((request, response) => {
  const url = new URL(request.url, 'http://fixture')
  requests.push(url)
  response.setHeader('Content-Type', 'application/json')
  if (failing) {
    response.writeHead(503).end('{}')
    return
  }
  let data = []
  let total = 1
  let totalPages = 1
  if (url.pathname.endsWith('/categories')) data = taxonomy
  else if (url.pathname === '/wp-json/wp/v2/product') {
    if (url.searchParams.has('slug')) {
      const id = Number(url.searchParams.get('slug').replace('product-', ''))
      data = id > 0 && id <= 101 ? [product(id)] : []
    } else {
      total = 101
      totalPages = 2
      data =
        url.searchParams.get('page') === '2'
          ? [product(101)]
          : Array.from({ length: 100 }, (_, index) => product(index + 1))
    }
  } else if (url.pathname === '/wp-json/wc/store/v1/products') {
    const page = Number(url.searchParams.get('page') || 1)
    const perPage = Number(url.searchParams.get('per_page') || 8)
    total = 9
    totalPages = Math.ceil(total / perPage)
    data = Array.from(
      { length: Math.max(0, Math.min(perPage, total - (page - 1) * perPage)) },
      (_, index) => product((page - 1) * perPage + index + 1),
    )
  } else if (url.pathname.startsWith('/wp-json/wc/store/v1/products/')) {
    data = product(Number(url.pathname.split('/').at(-1)))
  } else if (url.pathname === '/wp-json/wp/v2/posts') {
    data = [article]
  }
  response.setHeader('X-WP-Total', String(total))
  response.setHeader('X-WP-TotalPages', String(totalPages))
  response.end(JSON.stringify(data))
})
await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve))
const cms = `http://127.0.0.1:${fixture.address().port}`
let child
let logs = ''
let origin
async function start() {
  const portServer = createServer()
  await new Promise((resolve) => portServer.listen(0, '127.0.0.1', resolve))
  const port = portServer.address().port
  await new Promise((resolve) => portServer.close(resolve))
  origin = `http://127.0.0.1:${port}`
  child = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SITE_INDEXABLE: failing ? 'false' : 'true',
      WORDPRESS_URL: cms,
      PORT: String(port),
      NITRO_PORT: String(port),
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', (data) => {
    logs += data
  })
  child.stderr.on('data', (data) => {
    logs += data
  })
  for (let attempt = 0; attempt < 60; attempt++) {
    assert.equal(child.exitCode, null, logs)
    try {
      await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(500) })
      return
    } catch {
      await sleep(100)
    }
  }
  throw new Error(`Server startup failed: ${logs}`)
}
async function stop() {
  if (!child || child.exitCode !== null) return
  await new Promise((resolve) => {
    child.once('exit', resolve)
    child.kill()
  })
}
async function get(path) {
  return fetch(origin + path, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
  })
}
try {
  await start()
  let response = await get('/product/product-1/')
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), '/products/product-1')
  response = await get('/sitemap_index.xml')
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), '/sitemap.xml')
  response = await get('/products/product-1')
  assert.equal(response.status, 200)
  let html = await response.text()
  assert.ok(html.includes('<title>Editor title 1 – Ascentia</title>'))
  assert.ok(html.includes('name="description" content="Editor description"'))
  assert.ok(
    html.includes(
      'rel="canonical" href="https://ascentia.co.id/products/product-1"',
    ),
  )
  assert.ok(!html.includes('wrong-canonical'))
  assert.ok(html.includes('property="og:image:width" content="292"'))
  assert.ok(!html.includes('property="og:image:width" content="1200"'))
  const schemas = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
    ),
  ].map((match) => JSON.parse(match[1]))
  assert.ok(schemas.some((schema) => schema['@type'] === 'BreadcrumbList'))
  assert.ok(
    schemas.some((schema) => schema['@type'] === 'Product' && !schema.offers),
  )
  response = await get('/products/product-2')
  assert.ok(
    (await response.text()).includes('name="robots" content="noindex, follow"'),
  )
  response = await get('/products/brands?category=xrf-scientific&page=2')
  html = await response.text()
  assert.equal(response.status, 200)
  assert.ok(html.includes('XRF Scientific | Ascentia Arsya Analitika | Page 2'))
  assert.ok(
    html.includes(
      'rel="canonical" href="https://ascentia.co.id/products/brands?category=xrf-scientific&amp;page=2"',
    ),
  )
  assert.ok(html.includes('href="/products/brands?category=xrf-scientific"'))
  response = await get('/products/brands')
  html = await response.text()
  assert.ok(html.includes('href="/products/brands?page=2"'))
  assert.ok(html.includes('href="/products/brands?category=xrf-scientific"'))
  response = await get('/products/brands?q=example')
  assert.ok(
    (await response.text()).includes('name="robots" content="noindex, follow"'),
  )
  response = await get('/blogs/editorial-article')
  assert.equal(response.status, 200)
  assert.ok(
    (await response.text()).includes('<title>Editorial blog title</title>'),
  )
  response = await get('/news/editorial-article')
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), '/blogs/editorial-article')
  response = await get('/sitemap.xml')
  assert.equal(response.status, 200)
  const xml = await response.text()
  assert.ok(xml.includes('https://ascentia.co.id/products/product-101'))
  assert.ok(
    !xml.includes('<loc>https://ascentia.co.id/products/product-2</loc>'),
  )
  assert.ok(xml.includes('https://ascentia.co.id/blogs/editorial-article'))
  assert.ok(!xml.includes('https://ascentia.co.id/news/editorial-article'))
  assert.ok(
    requests.some(
      (url) =>
        url.pathname.endsWith('/wp/v2/product') &&
        url.searchParams.get('page') === '2',
    ),
  )
  response = await get('/wp-content/uploads/test.png')
  assert.equal(response.status, 301)
  assert.equal(
    response.headers.get('location'),
    `${cms}/wp-content/uploads/test.png`,
  )
  response = await get('/not-a-real-page')
  assert.equal(response.status, 404)
  await stop()
  failing = true
  await start()
  response = await get('/sitemap.xml')
  assert.equal(response.status, 503)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
  console.log(
    'PASS: production SSR Yoast, canonical, pagination, schema, redirects, paginated sitemap/noindex, upstream failure',
  )
} catch (error) {
  console.error(logs)
  throw error
} finally {
  await stop()
  await new Promise((resolve) => fixture.close(resolve))
}
