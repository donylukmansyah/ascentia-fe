# Analisis ulang SEO end-to-end Ascentia

Tanggal: 2026-10-19. Riset saja; tidak mengubah aplikasi, WordPress, DNS, atau hosting.
Dokumen ini menggantikan kesimpulan audit sebelumnya yang terlalu pasti.

## Kesimpulan

Headless WordPress + Yoast + TanStack Start SSR layak untuk SEO. Namun frontend
saat ini **belum terbukti siap switch domain produksi**. Hambatan utamanya
bukan plugin SEO: kontinuitas URL, kompatibilitas data CMS, canonical listing,
penemuan halaman lanjutan, serta kestabilan response server.

Pola kerja yang direkomendasikan:

- WordPress/Yoast: sumber konten dan pengaturan editorial SEO.
- Frontend: pemilik URL publik, SSR, canonical, robots publik, sitemap, schema.
- Server/domain: pemilik routing aplikasi, redirect lama, HTTPS, ketersediaan.
- Search Console: bukti indexing, trafik, dan canonical pilihan Google.

Yoast membantu menyunting metadata; lampu hijau bukan sertifikat SEO produksi.
Tidak ada jaminan ranking tetap atau naik setelah migrasi. [S1–S8]

## 1. Koreksi penting dari jawaban terdahulu

| Klaim terdahulu                                    | Koreksi                                                                                                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sembilan produk sudah terindeks Google             | Terbukti ada di sitemap dan HTTP 200. Status indeks/ranking belum diketahui tanpa Search Console/URL Inspection. Sitemap bukan bukti indexing. [S4]                                                                           |
| Sitemap index hanya empat bagian                   | Ada tujuh: posts, pages, projects, products, categories, product categories, authors.                                                                                                                                         |
| SSR menjamin lebih cepat/SEO bagus                 | SSR membantu penyajian konten; tidak membuktikan performa, uptime, indexing, atau ranking. CWV belum diukur. [S7, S8]                                                                                                         |
| Semua canonical aman karena domain dikunci         | Domain benar belum cukup: listing membuang parameter kategori dan pagination.                                                                                                                                                 |
| `Disallow: /` setara dengan `noindex`              | Tidak. Google perlu merayapi response untuk membaca `noindex`; jangan memblokir URL yang sedang perlu dibaca directive-nya. [S2]                                                                                              |
| Tempel robots Yoast setelah seluruh CMS di-noindex | Berisiko menyalin larangan indexing CMS ke frontend publik. Kebijakan host harus dipisahkan dari keputusan editorial halaman.                                                                                                 |
| Schema lama hanya berasal dari Yoast               | Lima dari sembilan produk juga mempunyai blok Product/Offer terpisah. Asal plugin blok kedua belum diverifikasi.                                                                                                              |
| Metadata Yoast menjamin teks sama di Google        | Google dapat memilih title/snippet berbeda. `yoast_head_json` adalah output terhitung, termasuk template/fallback, bukan hanya input manual. [S1, S9]                                                                         |
| Meta description maksimal 160 karakter             | Bukan batas Google; pemotongan snippet tergantung tampilan. Ringkas dan deskriptif adalah pedoman editorial. [S9]                                                                                                             |
| Sitemap wajib dibuat sendiri dalam semua headless  | Tidak universal. Yang penting URL sitemap benar. Untuk repo ini generator frontend lebih sederhana daripada memodifikasi semua URL sitemap WP. Cross-site sitemap juga didukung dengan verifikasi sesuai panduan Google. [S4] |

## 2. Metode dan batas bukti

Pemeriksaan read-only terhadap:

- `robots.txt`, sitemap index, seluruh tujuh child sitemap produksi.
- Seluruh **34 URL halaman unik** yang ditemukan pada child sitemap.
- HTML mentah: status, canonical, title, description, robots, headings, JSON-LD.
- Redirect HTTP/HTTPS dan www/non-www, satu URL tidak ada.
- Endpoint publik WordPress/WooCommerce, termasuk metadata Yoast.
- Source frontend dan response HTTP server lokal yang sudah berjalan.

Crawler kecil memakai Python stdlib, maksimum tiga request paralel. Tidak
login, tidak mengirim POST, tidak mengubah data. Tidak ada akses Search
Console, analytics, server log, Rich Results Test, atau audit CWV.

Bukti HTTP mentah/JSON sesi ini tersimpan sementara di:
`C:\Users\Minguri\AppData\Local\Temp\ascentia-seo-review-g90_wnvi`

File bukti: `sitemaps.json`, `pages.json`, `backend.json`, `local.json`,
`legacy-local.json`, `targets-local.json`, serta body response `.txt`.
Direktori temp bukan arsip permanen; temuan inti dicatat dalam dokumen ini.

## 3. Kondisi website produksi sekarang

### Inventory sitemap

| Child sitemap              |   Entri halaman, tidak menghitung image:loc |
| -------------------------- | ------------------------------------------: |
| `/page-sitemap.xml`        |                                          15 |
| `/product-sitemap.xml`     |           10: arsip `/products/` + 9 detail |
| `/post-sitemap.xml`        |                                           1 |
| `/project-sitemap.xml`     |                                           2 |
| `/category-sitemap.xml`    |                                           1 |
| `/product_cat-sitemap.xml` |                                           5 |
| `/author-sitemap.xml`      |                                           1 |
| Jumlah                     | 35 entri; 34 unik karena `/products/` ganda |

Seluruh 34 URL berakhir HTTP 200 saat pengujian; `/checkout/` melalui 302 ke
`/cart/`. Ini hanya inventory sitemap, bukan seluruh URL/backlink situs.

### Yang sudah berfungsi

- Homepage dan sembilan produk mengirim title, description, canonical dan
  konten melalui HTML server; bukan hanya JavaScript browser.
- Produk mempunyai description spesifik, bukan sekadar template umum.
- `http://ascentia.co.id/` dan `https://www.ascentia.co.id/` memberi 301 ke
  `https://ascentia.co.id/`.
- URL acak yang tidak ada menghasilkan HTTP 404 dan `noindex`.
- Yoast REST tersedia tanpa kredensial pada endpoint produk dan posts. [S1]

Contoh terverifikasi:
`/wp-json/wp/v2/product?slug=xrfuse-2-automatic-electric-fusion-machine-2-positions&_fields=id,slug,link,yoast_head_json`

Response HTTP 200, produk ID 1318, mempunyai `title`, `description`, `robots`,
`canonical`, Open Graph dan `schema`. Endpoint posts juga mempunyai field Yoast.
API mengirim header `X-Robots-Tag: noindex` sementara JSON halaman produk
memuat `robots.index: index`: robots dokumen API berbeda dari robots halaman.

### Kekurangan situs lama yang jangan diwariskan

1. Description homepage masih generik:
   `Informasi mengenai Home dari Ascentia . Lihat selengkapnya di sini.`
   Halaman produk lebih spesifik. Yoast aktif tidak berarti semua metadata bagus.
2. `/laman-contoh/`, `/halo-dunia/`, `/project/`, `/project/home/`, arsip kategori
   umum dan author masuk sitemap. Tinjau nilai kontennya, bukan otomatis pindah
   semua. `/project/` dan `/project/home/` menampilkan `under construction`.
3. Sitemap memuat `/cart/`, `/checkout/`, `/my-account/`, tetapi response akhir
   ketiganya memiliki `noindex`. Sitemap publik sebaiknya berisi URL canonical
   yang memang diinginkan di Search. [S4]
4. Canonical kategori `/product-category/xrf-scientific/` mengarah ke
   `/product-category/by-manufacturer/xrf-scientific/`; target juga HTTP 200.
   Kedua pola URL perlu masuk inventory migrasi.
5. Banyak H1 pada homepage/produk, termasuk heading footer. Hierarki heading
   layak diperbaiki; jumlah H1 saja bukan bukti penalti Google.
6. Lima produk memiliki Product/Offer JSON-LD berisi `price: 0.00`,
   `priceCurrency: USD`, `availability: InStock`. Konfirmasi apakah benar
   penawaran gratis/stok tersedia. Jika sebenarnya request quotation, jangan
   mewariskan harga nol fiktif demi rich result. [S5, S6]
7. Gambar OG xrFuse 2 berukuran nyata 292×292. Bukan gambar sosial 1200×630;
   metadata harus jujur terhadap gambar yang dipakai.

`X-Robots-Tag: noindex` pada sitemap/robots.txt sendiri **tidak** berarti
halaman HTML yang dirujuk ikut noindex. Directive berlaku pada response URL
tersebut; HTML halaman telah diperiksa secara terpisah.

## 4. Temuan frontend baru: sudah baik, tetapi belum siap produksi

### Terverifikasi baik di lokal

`http://localhost:3000/products/xrfuse-2-automatic-electric-fusion-machine-2-positions`
sempat menghasilkan HTTP 200 dengan nama, deskripsi teknis, spesifikasi, dan
canonical di HTML awal. Listing mengandung delapan tautan produk, page 2 satu
produk. Ini membuktikan SSR berjalan pada sampel, bukan seluruh deployment.

### Masalah yang sudah direproduksi

| Prioritas | Temuan                                           | Bukti                                                                                                                                                                                                                                      |
| --------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0        | URL lama belum dilayani                          | Seluruh sembilan `/product/:slug/` memberi HTTP 404 di frontend lokal; `/articles/` juga 404.                                                                                                                                              |
| P0        | Target baru belum stabil                         | Pengujian lanjutan sembilan `/products/:slug` semuanya HTTP 500, body `{"status":500,"unhandled":true,"message":"HTTPError"}`. Sebelumnya satu produk 200. Penyebab belum diketahui; bukan bukti produksi WordPress error.                 |
| P0        | Live CMS belum sesuai model frontend             | Exact request taxonomy frontend dengan `hide_empty=false` menghasilkan 23 kategori; `mapTaxonomies()` aktual memetakan semuanya menjadi `brands: [], types: [], applications: []`. Root `brands/types/applications` belum ada di live CMS. |
| P1        | Yoast belum digunakan                            | `_fields` lookup produk tidak memuat `yoast_head_json`; mapper artikel tidak mengembalikan SEO.                                                                                                                                            |
| P1        | Description produk dapat regresi                 | xrFuse 2 lokal memakai `Analytical instrument from Ascentia Arsya Analitika.`; live lama punya description spesifik. Seluruh sembilan live short_description kosong.                                                                       |
| P1        | Canonical pagination salah untuk halaman berbeda | `?page=2` canonical ke `/products/brands`, bukan halaman kedua. [S3]                                                                                                                                                                       |
| P1        | Brand belum menjadi landing SEO tersendiri       | `?category=xrf-scientific` masih title `All Brands`, canonical ke listing umum. Redirect brand lama ke URL ini saja belum mempertahankan identitas brand.                                                                                  |
| P1        | Pagination tidak punya link crawlable            | SSR page 1 tidak punya `<a href>` page 2; `PagePagination` menggunakan Button/onClick. Google umumnya tidak mengeklik tombol. [S3]                                                                                                         |
| P1        | Sitemap frontend belum tersedia                  | `/sitemap.xml` dan `/sitemap_index.xml` HTTP 404 lokal. `public/robots.txt` hanya Allow.                                                                                                                                                   |
| P1        | URL media lama belum tersedia di Node lokal      | `/wp-content/uploads/2023/04/xrfuse_2.png` HTTP 404 lokal. Apache hosting mungkin berbeda; harus diuji saat deploy.                                                                                                                        |
| P2        | Metadata gambar tidak sesuai setiap gambar       | `src/lib/seo.ts` selalu menulis 1200×630 image/png, termasuk gambar produk 292×292.                                                                                                                                                        |
| P2        | Structured data belum ada pada sampel frontend   | Tidak ditemukan JSON-LD di homepage/listing/detail yang diperiksa maupun source search.                                                                                                                                                    |
| P2        | Bahasa perlu keputusan editorial                 | Shell `lang=en`, sebagian konten teknis Indonesia; rencanakan bahasa aktual per halaman, jangan membuat hreflang palsu tanpa terjemahan nyata.                                                                                             |

P0 berarti jangan switch sebelum tervalidasi. P1 perlu dibereskan untuk
migrasi SEO yang terkendali; prioritas bukan ukuran pasti dampak ranking.

File utama: `src/lib/seo.ts`, `src/routes/products/-listing.ts`,
`src/routes/products/brands.tsx`, `src/routes/products/$slug.tsx`,
`src/components/ui/pagination.tsx`, `src/features/products/api/product-mapper.ts`,
`src/features/products/api/product-source.server.ts`,
`src/features/articles/api/article-mapper.ts`, `public/robots.txt`.

### Perbedaan database lokal dengan produksi

- Live News kategori 19 dan Articles kategori 20 masing-masing nol posts.
- Lokal `/news` berisi sejumlah artikel; ini tidak membuktikan konten itu ada
  di database produksi atau sudah disetujui untuk publikasi.
- Live lookup kesembilan produk mengekspos `acf: []`. Bisa belum berisi atau
  belum terekspos; bukan bukti pasti tidak ada field tersimpan di admin.
- Sampel deskripsi Store produk 1318 berisi HTML nyata tanpa shortcode Divi,
  sehingga migrasi konten harus dinilai per field; jangan otomatis menganggap
  seluruh katalog perlu diparsing dari builder.
- Sampel HTML masih memiliki link ke `dynatech-int.com` serta kategori lama.
  Review editorial/internal link perlu dilakukan saat migrasi.

Artinya: sekadar mengganti `WORDPRESS_URL` ke clone live belum cukup. Tentukan
CMS final, samakan taxonomy/ACF/konten dengan kontrak frontend sebelum SEO diuji.

## 5. Rekomendasi end-to-end

### A. Satu pemilik untuk setiap keputusan

| Sumber                             | Tanggung jawab                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Editor WordPress/Yoast             | Nama/deskripsi konten, SEO title/description, gambar sosial, keputusan editorial indexing |
| WordPress REST                     | Data publik terstruktur; bukan HTML layout frontend                                       |
| Frontend route/loader              | URL final, pemetaan slug, data SSR, not-found                                             |
| `createSeoMeta` dan metadata route | Emit satu set tag; fallback saat field kosong; canonical sesuai kebijakan URL             |
| Frontend/server SEO                | Sitemap, structured data jujur, redirect URL lama, status HTTP                            |
| Konfigurasi CMS host               | Mencegah halaman CMS menjadi situs publik kedua; tidak diwariskan ke frontend             |

Tidak perlu dependency SEO baru, GraphQL, plugin berbayar, atau endpoint
Yoast terpisah untuk sekadar membaca title/description yang sudah tersedia.

### B. Yoast JSON sebagai input editorial, bukan HTML yang ditempel mentah

- Tambah field Yoast ke read detail yang sudah ada; tidak perlu setiap card
  listing membawa seluruh schema graph.
- Validasi bentuk response di server; gunakan string nonkosong, decode entity
  yang diperlukan. JSON Yoast dapat berisi title hasil template.
- Prioritas: title/description Yoast valid; fallback data halaman yang relevan.
  Jangan menambah suffix merek dua kali jika title Yoast sudah memilikinya.
- Canonical/og:url normal dihasilkan dari route publik yang benar. Jika editor
  benar-benar butuh canonical override, sediakan kebijakan validasi eksplisit;
  jangan otomatis menyalin URL CMS atau mengabaikan semua override selamanya.
- URL media boleh tetap `cms.ascentia.co.id/wp-content/uploads/...` jika publik,
  HTTPS, crawlable. Jangan replace seluruh URL JSON secara membabi buta.
- Frontend harus mengirim metadata dan konten pada response SSR, bukan baru
  di `useEffect`. Google tetap menentukan apa yang diindeks/ditampilkan. [S1, S7, S9]

### C. Pisahkan larangan indexing CMS dari indexing halaman frontend

Untuk CMS headless yang tidak dimaksudkan sebagai website publik, pilih salah
satu kebijakan teruji: redirect halaman HTML CMS ke padanan frontend, atau
beri `noindex` khusus HTML CMS yang tidak ingin diindeks. Biarkan admin/API/media
berjalan sesuai kebutuhannya. Staging dapat dilindungi autentikasi.

**Jangan** memasang `Disallow: /` lalu mengandalkan crawler membaca noindex
halaman yang diblokir. Jangan pula memberi blanket noindex pada media yang
masih diinginkan di Google Images. `noindex` bukan kontrol akses keamanan. [S2]

Jika mengonsumsi `yoast_head_json.robots`, uji bahwa pengaturan host CMS atau
WordPress Reading tidak membuat semua response SEO JSON ikut `noindex`.
Pilihan host-only dapat diletakkan di response webserver, terpisah dari nilai
editorial halaman. Jangan menyalin header API/CMS ke HTML frontend. Halaman
publik yang memang disetel noindex oleh editor tetap harus dihormati melalui
kontrak editorial yang bisa dibedakan dari perlindungan host.

### D. Pilih kebijakan URL sebelum membuat redirect

- Mengganti framework tidak mengharuskan mengganti URL. Mempertahankan URL
  publik lama adalah opsi paling sedikit perubahan. [S8]
- Jika mempertahankan rute frontend `/products/:slug`, itu juga sah: petakan
  sembilan URL lama ke produk yang sama, satu hop 301/308, target HTTP 200.
- Jangan menerapkan redirect sebelum semua target, slug, dan kontennya lolos.
- Pertahankan `http`/`www` normalization dan pilih satu trailing-slash policy.
- Simpan redirect setidaknya satu tahun; pertimbangkan lebih lama untuk backlink. [S8]
- Halaman yang dihapus tanpa pengganti relevan boleh HTTP 404/410, bukan semuanya
  diarahkan ke homepage.

**Brand/category:** URL query boleh menjadi landing SEO. Tidak wajib menambah
rute baru hanya untuk SEO. Tetapi brand terpilih harus punya konten dan meta
relevan, canonical spesifik, tautan crawlable, serta kebijakan index yang jelas.
Jika dianggap filter UX saja, jangan menjadikannya tujuan migrasi landing
brand penting tanpa menilai kehilangan konten dan trafik.

**Pagination:** halaman 2 dan seterusnya punya URL/canonical sendiri dan
`<a href>` antarhalaman. Query pencarian dan kombinasi filter sembarang dapat
dikecualikan dari indexing; jangan menyamaratakan dengan landing brand. [S3]

### E. Sitemap dan schema bukan pengganti URL/konten

- Sitemap berisi URL frontend canonical, HTTP 200, publish, indexable.
- Sertakan seluruh produk melalui pagination; kontrak Store live tidak boleh
  diasumsikan menyediakan slug langsung. Repo kini memperoleh slug dari
  permalink; alternatif WP REST untuk enumeration perlu mengikuti data nyata.
- `lastmod` memakai tanggal perubahan bermakna, bukan waktu request.
- Pertahankan `/sitemap_index.xml` sebagai endpoint valid atau redirect ke sitemap
  baru jika itu URL yang sebelumnya didaftarkan. Nama tidak wajib `/sitemap.xml`.
- Tambahkan referensi sitemap ke robots.txt; submit lewat Search Console.
  Sitemap membantu discovery, tidak menjamin indexing. [S4]
- Organization/WebSite/BreadcrumbList serta Article untuk artikel nyata adalah
  baseline yang masuk akal. Schema URL/ID mengikuti URL publik final.
- Product markup boleh mendeskripsikan produk, tetapi kelayakan rich snippet
  Google punya syarat tambahan. Tanpa Offer/review/rating asli, jangan mengarang
  data atau harga Rp0/USD0 untuk memenuhi validator. [S5, S6]

### F. Media, cache, dan kegagalan server

- Simpan atau arahkan `/wp-content/uploads/...` lama ke file CMS yang sama.
  Domain frontend baru jangan membuat semua backlink gambar/PDF 404. [S8]
- Publish/perubahan Yoast harus terlihat setelah kebijakan cache yang jelas.
  Repo mempunyai cache server TTL 60 detik dan Query cache; perubahan CMS
  tidak otomatis mem-purge semua layer hosting/CDN/browser.
- Produk tidak ada: HTTP 404. Upstream sementara gagal: jangan mengubahnya
  menjadi produk hilang, dummy content, atau halaman kosong berstatus sukses.
- Uji kestabilan SSR di staging produksi, bukan hanya keberhasilan build.
  Error lokal HTTP 500 masih perlu diagnosis terpisah sebelum readiness dinilai.

## 6. Urutan rilis yang disarankan

1. Backup file/database; ekspor Search Console pages/query/klik dan URL penting,
   sitemap, link gambar/PDF. Ambil periode yang cukup untuk musim bisnis.
2. Tentukan CMS final, sinkronkan taxonomy/ACF/editorial content; pastikan API
   produksi sesuai kontrak frontend. Jangan meng-overwrite database aktif secara
   sembarangan dengan database development.
3. Jalankan staging terpisah, terlindung dari indexing; tes produk/halaman/API.
4. Selesaikan URL mapping, canonical per jenis halaman, metadata Yoast, sitemap,
   media continuity, schema yang jujur. Verifikasi semua target HTTP 200.
5. Uji production build pada hosting Node yang sebenarnya, termasuk error paths,
   restart, timeout, update konten, dan response ke crawler tanpa challenge WAF.
6. Saat trafik rendah, hentikan editing sebentar untuk final sync; switch routing
   domain utama, tes ulang. Simpan konfigurasi sebelumnya untuk rollback.
7. Submit sitemap, URL Inspection pada produk utama, pantau 404/5xx, indexing,
   clicks/impressions dan canonical pilihan Google. Fluktuasi mungkin terjadi.

Domain publik tetap `ascentia.co.id`, maka **jangan** memakai Search Console
Change of Address ke `cms.ascentia.co.id`. Itu bukan domain publik baru. [S8]

### Gate sebelum switch

- Tidak ada 5xx pada sampel penting dan seluruh target redirect.
- Sembilan produk lama tetap 200 atau satu hop redirect ke padanan 200.
- Brand/category/articles/privacy lama punya keputusan retain/redirect/remove.
- Canonical/detail/page 2 benar; satu title/description yang relevan dalam SSR.
- CMS/staging noindex tidak ikut frontend; aset publik tetap dapat dirayapi.
- Sitemap XML valid; hanya URL indexable, tanpa placeholder/cart/redirect.
- Gambar/PDF lama tersedia atau redirect tepat.
- Baseline Search Console, monitoring, backup, rollback tersedia.

**Belum ada klaim seluruh gate terpenuhi. Tidak ada perubahan implementasi.**

## 7. Sumber primer

- S1 Yoast REST API: https://developer.yoast.com/customization/apis/rest-api/
- S2 Google noindex/crawl prerequisite: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- S3 Google pagination/canonical/crawlable links: https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
- S4 Google sitemap/canonical/lastmod/submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- S5 Google Product snippet required data: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- S6 Google structured-data truthfulness: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- S7 Google JavaScript SEO/SSR: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- S8 Google migration/redirect duration: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- S9 Google snippet/description: https://developers.google.com/search/docs/appearance/snippet
- S10 Google canonical signals: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- S11 Yoast focus keyphrase/analysis: https://yoast.com/focus-keyword/
- S12 Google CWV: https://developers.google.com/search/docs/appearance/core-web-vitals

Sumber situs live: https://ascentia.co.id/robots.txt,
https://ascentia.co.id/sitemap_index.xml dan seluruh child sitemap pada bagian 3;
endpoint API publik dan sembilan halaman produk yang dirujuk di sana.

Pencarian 9router tidak tersedia; rujukan diperoleh langsung dari dokumentasi
resmi. Tidak ada pengukuran ranking, CWV, atau validasi indeks Google dalam
sesi ini. Pengujian lokal menggunakan server yang sedang berubah oleh pekerjaan
paralel; response 200 awal dan 500 berikutnya harus dibaca dengan batas itu.
