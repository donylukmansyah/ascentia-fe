# WordPress fetching dan TanStack Query — Ascentia

Tanggal: 2026-10-13. Riset saja; tanpa perubahan kode aplikasi.

## Kesimpulan

Gunakan native `fetch` sebagai transport, TanStack Query sebagai pengelola server state, TanStack Router sebagai pengelola URL dan koordinasi loading. Rekomendasi: pembacaan publik melalui server function Start, pagination/filter di WooCommerce, satu definisi `queryOptions` per resource. Query bukan pengganti `fetch`, bukan cache bersama seluruh pengunjung, bukan mekanisme otomatis menerima perubahan WordPress. [S1–S6]

## Fakta repo dan backend

Sumber: `AGENTS.md`, `docs/architecture/folder-conventions.md`, `docs/architecture/wordpress-content-model.md`; pemeriksaan langsung HTTP oleh sesi utama. Agen riset membaca dokumentasi primer; sesi utama memverifikasi backend dan dependency lokal.

- Terpasang: Query `^5.104.1`, Router `1.170.41`, Start `1.168.60`, React 19, `sanitize-html`. `getRouter()` sudah membuat router baru, `defaultPreload: 'intent'`, `defaultPreloadStaleTime: 0`. Belum ada QueryClient, context/provider, atau integrasi hidrasi Query.
- Store `/wc/store/v1/products`: 9 produk publik; description/images/categories tersedia, `slug` response tidak tersedia, `short_description` kosong, extensions kosong. `featured=true`: 4 produk. WP `/wp/v2/product`: slug tersedia, seluruh 9 produk memiliki `acf=[]`.
- Hierarki `product_cat`: Brands 102, Types 103, Applications 104. Enam brand sudah memiliki gambar/logo; hanya XRF Scientific memiliki produk. Type **dan** Application multi-select; xrFuse2 termasuk Analytical dan Consumables. Jangan paksa Type menjadi scalar.
- `products?category=105,116&category_operator=and&per_page=2&page=2`: 200, total 5, totalPages 3, dua xrFuse. `search=xrfuse&per_page=2`: 200, total 3/pages 2. Operator terdaftar: `in`, `not_in`, `and`. Pengujian `category=113,114&category_operator=in`: 8 produk; `and`: 2 produk.
- Argumen lokal: page minimum 1; per_page default 10, maksimum 100, minimum terdaftar 0. Kebijakan frontend tetap 1–100; jangan gunakan 0 sebagai cara mengambil seluruh katalog. per_page 101 menghasilkan 400. Header total/totalPages/Link terekspos lewat CORS localhost; origin produksi belum terbukti.
- `products?slug=not-an-existing-ascentia-product&per_page=1`: tetap produk 1692, total 9. Slug benar-benar **diabaikan** oleh koleksi Store lokal; route index tidak mendaftarkan argumen slug. Dokumentasi modern memiliki slug filter, field slug, dan endpoint detail slug; jangan anggap instalasi lokal mendukungnya. [S10]
- Lookup terukur: `/wp/v2/product?slug=xrfuse-2-automatic-electric-fusion-machine-2-positions&_fields=id,slug,acf` mengembalikan tepat id 1318. Alur detail terbatas: WP lookup slug → Store `/products/{id}`. Jangan scan seluruh katalog. Validasi hasil kosong/ambigu, cocokkan ID, tangani 404.
- Store `_fields` terukur: `?per_page=8&page=2&_fields=id,name,images,categories,permalink` hanya mengembalikan field diminta, total 9/pages 2, satu produk 1316. Daftar kecil tidak membutuhkan seluruh HTML detail.
- Store categories hanya mendaftarkan context/page/per_page/search/exclude/include/order/orderby/hide_empty; **tidak ada parent filter**. Ambil terms secara paginated, kelompokkan berdasarkan parent lokal; alternatif endpoint WP `product_cat` dengan parent setelah memastikan kontrak deploy. `per_page=2&page=1`: total 15/pages 8, parent/image normal. Pemeriksaan sebelumnya per_page 100 tidak menyertakan total headers: jangan mengasumsikan metadata selalu hadir. Tidak adanya header bukan total 0.
- Brand OREAS kategori 106 menghasilkan `[]`, total 0/pages 0: empty state sah, bukan error.
- `product-grid.tsx` sekarang menghitung halaman dari `products.length`, lalu slice. Mode remote harus menerima total server dan langsung merender item halaman; jangan double slicing. pageSize 8 bisa dipertahankan.
- `product-listing-page` memakai local activeId/query/page; routes belum memiliki validateSearch/loaderDeps. Pencarian lokal mencocokkan name/brand/category/application. Perbedaan terukur: `search=Mining` menghasilkan 0 meski lima produk memiliki kategori Mining. Keyword Store bukan pengganti ekuivalen pencocokan application lokal. Tentukan perilaku pencarian produk secara eksplisit.
- Header hanya memiliki tautan tetap Browse Brands/Types/Applications. Tidak perlu mengganti tautan tersebut dengan daftar taxonomy dinamis.

## Arsitektur rekomendasi

1. **Transport:** `createServerFn({ method: 'GET' })` untuk pembacaan publik. Handler mengakses origin WordPress yang dikonfigurasi server, memanggil native fetch, memeriksa HTTP status, memvalidasi response, membaca metadata pagination, memetakan data. Validasi input server: page integer ≥1, per_page 1–100, kategori/operator/sort yang diizinkan, batas keyword/slug. Jangan menerima upstream URL arbitrer. Server function dapat dipanggil loader/component; loader biasa juga berjalan di browser sehingga bukan batas keamanan. [S1, S7, S8]
2. **Keamanan:** Store API menyediakan data produk publik tanpa consumer key. Origin/credential privileged hanya konfigurasi server; tidak pernah `VITE_*`, query key, response, atau payload hidrasi. Gunakan boundary server-only Start untuk modul sensitif. Public server function tetap dapat dipanggil pengunjung; validasi bukan opsional. Browser langsung ke WP hanya setelah CORS origin produksi terbukti. [S7–S10]
3. **Query:** satu `QueryClient` dibuat **di dalam `getRouter()`**, baru setiap request SSR; client browser bertahan sepanjang navigasi router. Ketik root dengan `createRootRouteWithContext<{ queryClient: QueryClient }>()`, teruskan context. Tambahkan adapter resmi `@tanstack/react-router-ssr-query` yang belum terpasang, gunakan `setupRouterSsrQueryIntegration({ router, queryClient })`. Adapter menangani provider/dehydration/hydration/streaming; jangan membuat client kedua atau hidrasi manual ganda. Cocokkan versi/peer dependencies saat implementasi. [S1, S2]
4. **Satu kontrak query:** fungsi feature-owned `queryOptions` menyatukan key, queryFn, freshness. Loader dan `useQuery`/`useSuspenseQuery` menggunakannya bersama; jangan simpan response yang sama sebagai state lokal dan loader data terpisah. `defaultPreloadStaleTime: 0` yang sudah ada memungkinkan Query menentukan freshness preload. [S1–S3]
5. **Freshness loader:** gunakan `queryClient.query(queryOptions)` untuk kode baru. API ini sudah terverifikasi pada source dependency lokal Query 5.104.1: memakai cache jika fresh, menunggu fetch jika stale. Versi terpasang menandai `fetchQuery` dan `ensureQueryData` deprecated. Untuk memahami kode lama: `ensureQueryData` mengembalikan cache yang ada meski stale; `revalidateIfStale: true` memulai refresh background, bukan menunggu data fresh. Komponen daftar memakai observer Query untuk refresh dan transisi halaman. Jangan memaksakan `staleTime: 'static'` pada katalog yang berubah. [S4; `node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/src/queryClient.ts`]
6. **URL:** `validateSearch` menormalkan page/category/search/sort; `loaderDeps` mengambil semua nilai yang memengaruhi fetch. Query key memasukkan page, per_page, kategori, operator, keyword, sort, featured bila relevan; detail menggunakan identitas slug/ID yang konsisten. Normalize kategori unordered agar key stabil. Perubahan kategori/keyword reset page ke 1; gunakan URL sebagai sumber state filter, bukan salinan local state. [S5, S9]
7. **Pagination:** `useQuery` dengan `placeholderData: keepPreviousData` menjaga halaman sebelumnya selama request baru. Gunakan `isPlaceholderData`/`isFetching` untuk status, kontrol Next menurut metadata server; data placeholder bukan hasil filter terbaru. `useSuspenseQuery` tidak menyediakan `placeholderData`; jangan kombinasikan dengan `keepPreviousData`. Grid paginated memakai `useQuery`; Suspense opsional untuk data awal/detail blocking. Tangani halaman di luar batas, hasil kosong, error HTTP. [S6]
8. **Cancellation:** queryFn menerima AbortSignal; teruskan ke native fetch. Untuk server function, teruskan signal pada panggilan RPC sesuai API Start, kemudian uji apakah abort juga menghentikan fetch upstream. Jangan menjanjikan propagasi lintas proses otomatis. Dokumen Query menyatakan cancellation tidak bekerja pada hooks Suspense; prefer useQuery untuk pencarian/filter yang sering berubah. [S7, S11]

## Defaults dan skala

- Query menganggap cache stale secara default (`staleTime: 0`). Observer stale dapat refetch saat mount/focus/reconnect. Browser inactive cache dikumpulkan setelah 5 menit (`gcTime`); SSR default gcTime Infinity. Observer browser retry default 3, server 0; imperative fetchQuery tidak retry secara default kecuali dikonfigurasi. Sesuaikan retry untuk transient failure; jangan retry tanpa guna 400/404. [S4, S12, S13]
- Titik awal **rekomendasi, bukan aturan vendor**: produk staleTime 60 detik; taxonomy/logo 5–10 menit; gcTime browser default cukup. Pilih menurut toleransi editorial. Kedaluwarsa staleTime sendiri bukan timer fetch; butuh mount/focus/reconnect/invalidation/polling atau request baru. [S12]
- Banyak produk: bounded server pagination, server filters, `_fields` daftar, detail lazy, metadata total dari header. Jangan unduh katalog ke browser untuk slice/filter. Query menyimpan halaman yang dikunjungi, bukan seluruh katalog; jangan prefetch seluruh katalog. Query tidak mempercepat SQL WordPress atau mengurangi request SSR antar pengunjung secara otomatis. [S6, S10, S14, S15]
- Query cache request-isolated berbeda dari cache bersama server/CDN. Shared HTTP cache memerlukan kebijakan tersendiri untuk response publik, TTL, variasi query, dan invalidasi; jangan publikasikan personalized response. Mulai tanpa Redis/cache framework baru; tambahkan cache HTTP jika pengukuran trafik/upstream latency membuktikan kebutuhan. [S1, S13]
- Publish WordPress tidak otomatis memberi tahu Query/CDN. Tanpa webhook/purge/refetch/invalidation, pengguna dapat melihat data lama sampai jalur refresh terjadi; freshness browser dan cache upstream harus diperhitungkan terpisah. `invalidateQueries` hanya menyasar cache Query, `router.invalidate` data/context milik Router, bukan CDN. [S1, S12]

## Kontrak WooCommerce/WordPress

- Docs modern Store products mencantumkan search, category, category_operator, featured, include/exclude, order/orderby, price/stock/attributes, slug. Gunakan subset terverifikasi instalasi lokal; brand API modern bukan pengganti otomatis taxonomy brands yang kini anak `product_cat`. Operator `and` berarti semua term dipenuhi, bukan otomatis OR di dalam grup dan AND antargrup. Pertahankan UX awal single-select per halaman. Kombinasi OR dalam grup dan AND antargrup baru dibuat bila diminta, dengan kontrak backend terverifikasi; bukan client filtering satu halaman. [S10]
- Mapper membangun indeks term ID dan ancestor; kategori bawah 102 menjadi brands, bawah 103 menjadi types[], bawah 104 menjadi applications[]. Pertahankan semua keanggotaan, deduplikasi ID. Pengambilan seluruh taxonomy paginated dapat masuk akal untuk 15 term sekarang; jangan perluas prinsip itu ke seluruh produk. Parent/ancestor classification merupakan model lokal, bukan jaminan API vendor. [S16]
- Core WP REST `_fields` membatasi payload dan dapat menghindari komputasi field yang tidak dibutuhkan. `_embed` hanya untuk relasi embeddable; sejak WP 5.4 dapat dibatasi ke nama relasi. Bila menggabungkan `_fields` dan `_embed`, sertakan `_links` serta `_embedded`. Jangan gunakan `_embed` global untuk semua halaman. Store dukungan embed modern jangan diasumsikan pada versi lokal. [S10, S15]
- HTML CMS tetap untrusted: gunakan `sanitize-html` terpasang dengan allowlist tag/atribut/URL scheme/host media yang eksplisit sebelum render; bukan sekadar memakai default. Larang script, event handlers, arbitrary styles/classes, iframe tak disetujui. Mapper memberikan frontend model, bukan Divi output. ACF kosong berarti konten detail belum siap; jangan mengarang benefit/specification atau menganggap kontrak ACF sudah populated. [S17; dokumen arsitektur repo]

## Struktur minimum saat implementasi

Target, bukan folder yang dibuat sekarang. Modul hanya ketika benar-benar diperlukan.

```text
src/
  router.tsx                         # QueryClient/context/adapter
  routes/
    __root.tsx                       # typed router context
    products/...                     # URL/search/loader; tanpa markup page
  features/products/
    api/
      product-api.ts                 # server reads, mapping, queryOptions
    types/
      product.ts                     # frontend model, items + totals
    pages/
      product-listing-page.tsx       # konsumsi Query/filter URL
    components/
      product-grid.tsx               # render page; tanpa slice lokal
  lib/
    wordpress.ts                     # generic HTTP helper; hanya bila dibagi
```

Jika queryOptions perlu dipisahkan dari server handler untuk boundary/import yang jelas, baru pecah `api/product-queries.ts` dan modul server-only. Sanitizer shared hanya bila dipakai lintas fitur. Tidak perlu custom hook, repository/service layer, QueryClient per domain, Zustand, fetch dependency, barrel baru, atau scaffold artikel sebelum implementasi. Arah tetap `routes → features → components/hooks/lib`; shared module tidak mengimpor feature. Homepage boleh mengonsumsi produk dari feature products; data editorial tetap feature articles setelah model publishing diverifikasi.

## Dua alternatif

| Alternatif | Manfaat | Batas |
| --- | --- | --- |
| Native fetch + loader Router, tanpa Query | Paling sedikit integrasi; loader SSR/hidrasi Router sudah tersedia | Cocok data route sederhana; harus memilih ownership cache sendiri, reuse/background refresh lintas komponen kurang nyaman. Jangan tulis ulang Query untuk menggantinya. [S5] |
| Browser direct Store fetch + Query/loader | Mengurangi hop server Start; tetap cache/pagination Query | CORS deploy wajib, hanya public reads, header expose wajib; SSR dan browser perlu kontrak seragam, tidak boleh membawa secret. Rekomendasi utama server function menghindari ketergantungan browser CORS, bukan menghapus kebutuhan validasi upstream. [S7, S8, S10] |

## Verifikasi tersisa

- Versi WooCommerce/Store aktual; detail ID, kontrak slug/ACF, perubahan setelah upgrade. Jangan memakai slug Store lokal yang diabaikan.
- CORS origin produksi; header total/Link pada semua ukuran halaman; kategori header hilang, akhir pagination, invalid/out-of-range page, kategori kosong.
- Pilihan keyword semantics: hanya teks produk atau tetap mencakup brand/type/application; backend search bukan drop-in replacement filter lokal.
- Pemisahan grup kategori, kombinasi multi-select, hide_empty untuk menampilkan brand tanpa produk.
- SSR HTML berisi data; hidrasi tidak fetch duplikat saat fresh; client request-isolated; preload/retry/error boundary benar; abort RPC/upstream terukur; adapter kompatibel installed versions.
- ACF REST field group diaktifkan dan diisi; sanitize allowlist, media-host policy, payload size, upstream latency/error, kebijakan shared HTTP cache bila kelak diperlukan.

## Sumber primer

- S1: [Start: TanStack Query](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query).
- S2: [Router: Query integration](https://tanstack.com/router/latest/docs/integrations/query), [contoh router resmi](https://github.com/TanStack/router/blob/main/examples/react/start-basic-react-query/src/router.tsx).
- S3: [Query options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options).
- S4: [QueryClient reference](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClient).
- S5: [Router data loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading), [external data loading](https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading).
- S6: [Paginated queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries).
- S7: [Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions).
- S8: [Start execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model).
- S9: [Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params), [Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys).
- S10: [Woo Store API](https://developer.woocommerce.com/docs/apis/store-api/), [Products API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/).
- S11: [Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation).
- S12: [Important defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).
- S13: [SSR/hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr).
- S14: [WP pagination](https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/).
- S15: [WP global parameters](https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/).
- S16: [Store product categories](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-categories/).
- S17: [sanitize-html official README](https://github.com/apostrophecms/sanitize-html).

Metode: pencarian 9router dicoba; route belum dikonfigurasi. Fallback fetch URL resmi dan source Markdown resmi. URL Start `guide/data-loading` menghasilkan 404; dipakai Router data-loading dan Start guide/tanstack-query yang ditautkan dokumentasi resmi. Sesi utama memverifikasi URL sumber, contoh router resmi, source Query lokal, serta filter gabungan/pagination/logo/lookup slug dengan assertion HTTP yang lulus. Dokumen latest tidak selalu identik dengan versi lokal; fakta backend di atas berasal dari pengujian langsung, bukan asumsi docs modern.
