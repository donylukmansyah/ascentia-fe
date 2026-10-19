# Riset Mendalam: Integrasi Yoast SEO pada Headless WordPress dan Frontend SSR Ascentia

Tanggal: 2026-10-19  
Status: Riset awal; diperbarui oleh [analisis ulang end-to-end](./end-to-end-seo-architecture.md). Jangan gunakan dokumen awal ini sebagai bukti kesiapan produksi.  
Ruang lingkup: Yoast SEO (Free) di WordPress/WooCommerce, TanStack Start (SSR), TanStack Router Head Management, Google Search Indexing, Schema.org, dan Sitemap.

---

## Ringkasan Eksekutif

1. **Yoast di WordPress tidak otomatis tampil ke Google pada website headless.**  
   Pada arsitektur headless, pengunjung dan crawler mesin pencari (Googlebot, Bingbot) mengakses server frontend (`https://ascentia.co.id`), bukan server WordPress (`https://cms.ascentia.co.id`). Googlebot membaca `<head>` (tag `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph, dan JSON-LD Schema) yang dihasilkan oleh SSR TanStack Start.
2. **Input manual Yoast tersimpan di database WordPress, bukan di frontend.**  
   Nilai yang diketik pada metabox Yoast di admin WP (seperti _Focus Keyphrase_, _SEO Title_, _Meta Description_) disimpan dalam tabel `wp_postmeta`. Frontend saat ini belum membaca field Yoast tersebut dan mengandalkan fallback lokal (nama produk dan `summaryHtml`).
3. **Yoast menyediakan REST API resmi (`yoast_head_json` dan `yoast_head`).**  
   Yoast menyematkan metadata SEO ke endpoint WP REST API standar (`wp/v2/posts`, `wp/v2/pages`, `wp/v2/product`). Frontend dapat mengonsumsi `yoast_head_json` untuk mengisi title dan description yang dikustomisasi oleh editor.
4. **Bahaya fatal: Canonical URL & Sitemap membocorkan subdomain CMS.**  
   Yoast dapat menghasilkan URL kanonis dan sitemap berdasarkan URL CMS. Menyalinnya tanpa pemetaan menimbulkan sinyal canonical yang salah; hasil indexing tetap diputuskan Google, bukan kepastian otomatis.
5. **Rekomendasi arsitektur:** Gunakan **Pendekatan Hibrida (Normalized Yoast Mapping)**. Frontend mengambil `yoast_head_json.title` dan `yoast_head_json.description` dari REST API, namun tetap mengontrol `canonical URL`, `og:url`, dan Schema ID menggunakan domain frontend (`https://ascentia.co.id`).

---

## 1. Anatomi Masalah: Headless vs Monolithic SEO

| Dimensi             | WordPress Tradisional (Monolithic)                                     | Ascentia Headless (TanStack Start + WP)                                    |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Eksekusi HTML**   | Tema PHP WordPress merender seluruh halaman dan memanggil `wp_head()`. | Nitro / Node.js merender HTML via TanStack Router SSR.                     |
| **Peran Yoast**     | Menginjeksi tag HTML `<head>` langsung ke browser/crawler.             | Hanya menulis metadata ke database WP dan mengeksposnya via REST API.      |
| **Pratinjau Admin** | Akurat; URL pratinjau sama dengan URL yang dikunjungi user.            | Menampilkan URL CMS (misal `ascentia-local.local`), bukan domain frontend. |
| **Analisis Konten** | Menganalisis editor utama (`post_content`).                            | Butuh konfigurasi tambahan untuk menganalisis custom field ACF.            |
| **Konsumen Google** | Google merayapi server PHP WordPress.                                  | Google merayapi server Node frontend; WordPress tersembunyi sebagai API.   |

---

## 2. Kemampuan REST API Yoast SEO (Sumber Primer)

Dokumentasi resmi Yoast Developer Portal (`developer.yoast.com/customization/apis/rest-api/`) mendefinisikan dua format output pada REST API:

### A. Format Prefabricated (`yoast_head`)

String HTML siap pakai yang berisi tag `<title>`, `<meta>`, `<link rel="canonical">`, Open Graph, Twitter Cards, dan `<script type="application/ld+json">`.

- **Kelebihan:** Komprehensif, mencakup logika internal Yoast.
- **Kelemahan pada Headless:** String HTML ini berisi URL absolut CMS (`cms.ascentia.co.id`) dan format slug WordPress (`/product/xyz/`). Menimpa string ini di frontend rentan terhadap bug replace yang merusak URL gambar atau schema.

### B. Format Terstruktur (`yoast_head_json`)

Objek JSON murni yang memecah seluruh komponen metadata:

```json
{
  "title": "TGA 1100 Thermogravimetric Analyser XRF Scientific - Ascentia",
  "description": "TGA adalah Automated macro thermogravimetric dari XRF Scientific...",
  "robots": {
    "index": "index",
    "follow": "follow",
    "max-snippet": "max-snippet:-1",
    "max-image-preview": "max-image-preview:large"
  },
  "canonical": "https://cms.ascentia.co.id/product/tga-1100/",
  "og_title": "...",
  "og_description": "...",
  "og_image": [
    {
      "url": "https://cms.ascentia.co.id/wp-content/uploads/...",
      "width": 1200,
      "height": 630
    }
  ],
  "schema": {
    "@context": "https://schema.org",
    "@graph": [...]
  }
}
```

### C. Endpoint Khusus (`/wp-json/yoast/v1/get_head?url=`)

Yoast menyediakan endpoint query URL independen:
`GET /wp-json/yoast/v1/get_head?url=https://cms.ascentia.co.id/product/tga-1100/`  
Endpoint ini mengembalikan `{ html, json, status }`. Namun, pendekatan ini menambah satu network round-trip terpisah untuk setiap request halaman di frontend.

---

## 3. Titik Kritis dan Bahaya Headless SEO

### 1. Pembatasan Field REST API Saat Ini (`_fields`)

Di file `src/features/products/api/product-source.server.ts` baris 238:

```ts
request(
  'wp/v2/product',
  {
    slug,
    per_page: '2',
    _fields: 'id,slug,status,date,modified,acf',
    acf_format: 'standard',
  },
  signal,
)
```

WordPress REST API secara ketat memfilter payload hanya pada daftar `_fields`. Karena `yoast_head_json` tidak didaftarkan, data SEO dari Yoast saat ini **terbuang dan tidak pernah sampai ke frontend**.

### 2. Tabrakan Domain Kanonis (Canonical URL Hijacking)

Jika nilai `canonical` diambil langsung dari Yoast, nilainya akan berupa:
`https://cms.ascentia.co.id/product/tga-1100/`  
Padahal halaman publik frontend beralamat di:
`https://ascentia.co.id/products/tga-1100`  
Jika ini dibiarkan:

- Canonical yang salah memberi sinyal konsolidasi ke URL CMS.
- Google dapat memilih URL berbeda dari yang diinginkan.
- Dampak indeks/ranking perlu diperiksa di Search Console; tidak dapat dipastikan dari tag saja.

### 3. Divergensi Struktur Slug Permalinks

- Pola standar WooCommerce: `/product/:slug/` (tunggal).
- Pola rute TanStack Router Ascentia: `/products/:slug` (jamak).
  Pemetaan SEO wajib memastikan semua tautan kanonis dan sitemap mengarah ke format URL frontend.

### 4. Keterbatasan Indikator Lampu Hijau Yoast di WP Admin

Pada tangkapan layar user, terlihat skor SEO Hijau dan Keterbacaan Oranye.

- Skor ini dihitung oleh library JavaScript Yoast di browser admin WP berdasarkan isi `post_content` (editor teks standar).
- Konten teknis Ascentia (spesifikasi, manfaat produk, aplikasi) disimpan dalam custom field **ACF**.
- Cakupan analisis field ACF pada instalasi aktual belum diverifikasi. Jangan menganggap semua field kustom dianalisis atau menambah plugin tanpa memeriksa integrasinya. Lampu hijau admin tidak membuktikan kesesuaian HTML frontend yang dilihat Google.

### 5. Kebocoran Sitemap XML

Yoast secara otomatis membuat sitemap di `https://cms.ascentia.co.id/sitemap_index.xml`.

- Sitemap tersebut mendaftar URL internal CMS.
- Jangan submit sitemap yang masih mendaftar URL CMS sebagai halaman publik.
- Pilihan sederhana repo ini: sitemap frontend dengan URL publik yang benar. Sitemap yang sudah dinormalisasi atau cross-site sitemap juga sah jika mengikuti verifikasi Google; nama file tidak wajib `/sitemap.xml`.

---

## 4. Perbandingan Opsi Arsitektur

| Kriteria                 | Opsi 1: Generator Mandiri Frontend (Status Quo)                            | Opsi 2: Hibrida Yoast + Normalisasi Frontend (Direkomendasikan)                          | Opsi 3: Injeksi Mentah `yoast_head`                                        |
| ------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Mekanisme**            | Frontend membuat meta tag dari `product.name`, gambar, dan ringkasan teks. | Frontend membaca `yoast_head_json`, memakai title/desc manual, menimpa domain canonical. | Mengambil string HTML `yoast_head` dan me-replace string domain via regex. |
| **Kepatuhan Tim Konten** | Kustomisasi Yoast belum digunakan.                                         | Metadata editorial dapat dipakai frontend; tampilan Google tidak dijamin.                | Metadata tersedia, tetapi pemetaan URL dan validasi tetap diperlukan.      |
| **Keamanan Canonical**   | Sangat Aman (Terkunci ke `ascentia.co.id` via `src/lib/seo.ts`).           | Sangat Aman (Canonical dikontrol penuh oleh modul router frontend).                      | Berisiko Tinggi (Potensi kebocoran URL CMS ke tag canonical & schema).     |
| **Kinerja & Latensi**    | Tanpa read metadata Yoast tambahan.                                        | Dapat memakai request WP yang sama; overhead aktual perlu diukur.                        | Ukuran dan pemrosesan HTML perlu diukur, bukan diasumsikan lebih lambat.   |
| **Kompatibilitas SSR**   | Sudah teruji dengan `createSeoMeta()`.                                     | Kompatibel penuh dengan `createSeoMeta()`.                                               | Sulit dikawinkan dengan API `head` TanStack Router.                        |

---

## 5. Rencana Arsitektur & Alur Data yang Direkomendasikan (Opsi 2)

### A. Alur Permintaan Data (Data Fetching Flow)

```text
Browser / Googlebot (Request https://ascentia.co.id/products/tga-1100)
    │
    ▼
Node.js / Nitro SSR (TanStack Router Loader)
    │
    ├── Memanggil WP REST: wp/v2/product?slug=tga-1100&_fields=id,slug,status,acf,yoast_head_json
    │
    ├── Ekstraksi Payload:
    │     ├── title: yoast_head_json.title ?? `${product.name} | Ascentia`
    │     ├── description: yoast_head_json.description ?? sanitize(product.short_description)
    │     ├── image: yoast_head_json.og_image[0].url ?? product.image
    │     └── canonical: https://ascentia.co.id/products/${slug} (Dihasilkan frontend)
    │
    ▼
TanStack Router `head` handler
    │
    ▼
Output HTML awal dengan tag SEO lengkap dan valid langsung ke Googlebot
```

### B. Aturan Normalisasi Domain & Fallback

1. **Title:**
   - Prioritas 1: `yoast_head_json.title` (jika editor mengisi SEO Title khusus).
   - Fallback: `${product.name} | Ascentia Arsya Analitika`.
2. **Description:**
   - Prioritas 1: `yoast_head_json.description` (jika editor mengisi Meta Description khusus).
   - Fallback: Ringkasan bersih yang relevan, bukan template generik semua produk. Google tidak menetapkan batas wajib 160 karakter.
3. **Canonical URL:**
   - **Wajib independen:** Selalu buat URL kanonis menggunakan konstanta frontend `https://ascentia.co.id/products/${slug}`. Jangan mengambil nilai `yoast_head_json.canonical`.
4. **Open Graph & Twitter Cards:**
   - Ambil gambar dari `yoast_head_json.og_image` jika ada; fallback ke gambar utama produk WooCommerce.
   - Pakai `og:url` yang menunjuk ke frontend `https://ascentia.co.id/...`.
5. **Robots Directive:**
   - Pisahkan noindex editorial dari perlindungan host CMS. Jangan menyalin larangan host/global WordPress ke seluruh frontend. Keputusan noindex halaman dari editor tetap dihormati melalui kontrak yang jelas.

---

## 6. Konfigurasi Produksi & Keamanan Mesin Pencari (Search Engine Safety)

### 1. Perlindungan Subdomain CMS (`cms.ascentia.co.id`)

Agar konten di WordPress tidak dianggap duplikat oleh Google:

- Pilih redirect HTML CMS ke padanan frontend atau noindex khusus halaman HTML CMS yang tidak ingin diindeks; jangan menyentuh akses admin/API/media tanpa kebutuhan.
- Jangan memasangkan `Disallow: /` dengan harapan Google membaca noindex pada halaman yang diblokir: crawler perlu mengakses response untuk membaca directive tersebut.
- Jangan blanket noindex gambar/PDF yang masih diinginkan di hasil pencarian. Noindex bukan autentikasi atau perlindungan data.

### 2. Sitemap XML Frontend

Frontend TanStack Start harus menyediakan rute server `routes/sitemap.xml.ts` yang:

- Mengambil seluruh produk aktif secara paginated dan memperoleh slug lewat kontrak terverifikasi; Store live saat audit memakai permalink, bukan asumsi field slug.
- Mengambil seluruh daftar artikel dari `wp/v2/posts`.
- Merender format XML standar dengan URL awal `https://ascentia.co.id/...`.
- Mendaftarkan sitemap ini ke Google Search Console untuk properti `https://ascentia.co.id`.

### 3. Redirect 301 untuk URL Lama

Kumpulkan seluruh URL dari situs WordPress lama (terutama jika sebelumnya ada perbedaan struktur seperti `/product/` vs `/products/`):

- Siapkan pemetaan 301 server-side di Nitro (`nitro.config.ts`) atau `.htaccess` frontend.
- Setiap URL lama harus mendarat di produk yang ekuivalen pada frontend baru, bukan dialihkan massal ke homepage.

---

## 7. Kesimpulan & Rekomendasi Langkah Kerja

1. **Jangka Pendek (Deploy Awal):**
   - Gunakan `createSeoMeta()` sebagai fondasi, bukan bukti siap rilis.
   - Selesaikan gate URL, kestabilan SSR, taxonomy CMS, canonical pagination/brand, media, dan sitemap pada analisis ulang sebelum switch.
   - Pisahkan perlindungan indexing CMS dari kebijakan halaman frontend; uji header dan payload Yoast secara terpisah.

2. **Jangka Menengah (Menyambungkan Yoast ke Frontend):**
   - Tambahkan `yoast_head_json` ke parameter `_fields` pada `product-source.server.ts` dan `article-source.server.ts`.
   - Perbarui tipe data dan mapper frontend untuk mengekstrak `seoTitle` dan `seoDescription`.
   - Sambungkan nilai tersebut ke `head` di `src/routes/products/$slug.tsx`, `src/routes/news/$slug.tsx`, dan `src/routes/blogs/$slug.tsx`.
   - Buat rute sitemap XML dinamis di frontend.

---

## Sumber Primer & Referensi Teknis

1. **Yoast Developer Portal — REST API Technical Specification:**  
   https://developer.yoast.com/customization/apis/rest-api/
2. **Yoast Developer Portal — Integration Standards & Headless Behavior:**  
   https://developer.yoast.com/development/integrating/
3. **Google Search Central — JavaScript SEO Basics & Server-Side Rendering:**  
   https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
4. **Google Search Central — Consolidate Duplicate URLs & Rel Canonical:**  
   https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
5. **Google Search Central — Site Moves and Migrations:**  
   https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
