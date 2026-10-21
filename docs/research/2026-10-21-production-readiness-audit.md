# Audit production readiness, performa, dan ketahanan Ascentia

Tanggal: 21 Oktober 2026. Status baseline: **belum layak diberi persetujuan rilis tanpa perbaikan dan pengujian ulang**.

Update: perbaikan kode dan pengujian ulang tersedia di [hasil implementasi](2026-10-21-production-audit-fixes.md). Temuan/angka di bawah tetap merupakan snapshot sebelum perbaikan.

## Ringkasan

Skor 36 pada screenshot berasal dari `http://localhost:3000/` dengan development tooling aktif, bukan ukuran build production. Incognito mengurangi gangguan ekstensi/cache; tidak mengubah `pnpm dev` menjadi production.

Pengujian ulang development mereproduksi masalah: **Performance 32, LCP 122,20 detik, payload 21,29 MiB**, Best Practices 81. Build production menghapus sebagian besar beban tersebut, tetapi belum menyelesaikan performa mobile.

Hasil production dengan CMS terhubung:

- Homepage mobile: **57 / 58 / 58**, LCP sekitar **9 detik**.
- Homepage desktop: **88**, LCP **1,78 detik**.
- Contact mobile: **32 dan 42**, LCP **16,72 dan 14,08 detik**; map menjadi beban besar.
- Product detail mobile: **56**, LCP **13,38 detik**.
- News mobile: **57**, LCP **9,77 detik**.
- Browser: **110 dari 112 pemeriksaan lolos**; dua kegagalan mereproduksi URL WhatsApp yang salah dan klik search sebelum hydration yang hilang.
- Dua pemeriksaan batas data gagal: pembatalan request mencemari caller cache lain; respons contact `success: false` tetap dianggap resolved.
- Build, TypeScript, ESLint, Prettier lolos. Ini **tidak** berarti semua pengujian aplikasi lolos.

**Cakupan penting:** audit memakai **build production lokal**, bukan deployment publik. URL deployment frontend belum diberikan. TLS/CDN/cPanel, kapasitas hosting, dan pengalaman pengguna nyata belum dibuktikan. Tidak ada kode aplikasi yang diperbaiki dalam audit ini.

## 1. Lingkungan dan bukti

| Item                   | Nilai                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Project                | `ascentia-fe`                                                                                  |
| HEAD                   | `8c2b367cdeabf51ffa80d9a6d73d2ab8f54987ab`                                                     |
| Snapshot               | Working tree sudah memiliki 76 modified dan 16 untracked files sebelum audit; bukan clean HEAD |
| Build                  | `pnpm build`                                                                                   |
| Runtime                | `NODE_ENV=production`, `node --env-file=.env .output/server/index.mjs`                         |
| Frontend audit         | `http://127.0.0.1:3103`                                                                        |
| CMS                    | `WORDPRESS_URL=http://ascentia-local.local`                                                    |
| Tools                  | Node 24.14.0, pnpm 10.32.1, Python 3.12.10, Lighthouse 13.5.0, Chrome 155                      |
| Mobile Lighthouse      | 412 × 823, DPR 1,75, simulated throttling, RTT 150 ms, throughput 1638,4 Kbps, CPU ×4          |
| Desktop Lighthouse     | 1350 × 940, simulated throttling, RTT 40 ms, throughput 10240 Kbps, CPU ×1                     |
| Browser fungsional     | Chromium Playwright; 360, 390, 768, 1440 px                                                    |
| Browser kondisi lambat | CDP, 1,6 Mbps download, 750 Kbps upload, latency 150 ms, CPU ×4                                |

Bukti permanen: [evidence.json](2026-10-21-production-audit/evidence.json). Berisi skor, nilai mentah, konfigurasi, temuan Lighthouse, hasil browser, header aset, hasil concurrency kecil, dan status command.

Laporan Lighthouse HTML/JSON lengkap tersedia pada mesin audit:

```text
C:\Users\Minguri\AppData\Local\Temp\ascentia-production-audit\
```

File Temp dapat terhapus. Ringkasan bukti yang diperlukan tetap disimpan di repo; jangan mengandalkan Temp sebagai arsip jangka panjang.

### Koreksi baseline selama audit

Percobaan production pertama tidak memiliki `WORDPRESS_URL`: `.env` lokal hanya berisi nama konfigurasi lama `VITE_WP_API_BASE_URL` dan `VITE_WC_API_BASE_URL`. Production tidak memakai fallback development.

Percobaan tidak valid ini menghasilkan mobile 59, desktop 90, Best Practices 100, tetapi bagian CMS kosong/error. **Angka tersebut tidak dipakai sebagai baseline situs lengkap.** Setelah `WORDPRESS_URL` diberikan ke proses Node, produk/artikel tampil dan Best Practices kembali 81 karena media CMS masih HTTP.

## 2. Lighthouse: hasil terukur

Semua waktu berikut dalam detik kecuali TBT dalam milidetik. A/B/S berarti Accessibility / Best Practices / SEO.

| Target                           | Performance | A/B/S      | FCP   | LCP    | TBT  | CLS    | Speed Index | Payload   |
| -------------------------------- | ----------- | ---------- | ----- | ------ | ---- | ------ | ----------- | --------- |
| Screenshot pengguna, development | 36          | 96/81/100  | 2,00  | 120,30 | 2050 | 0      | 18,00       | 21804 KiB |
| Development, audit ulang         | 32          | 96/81/100  | 61,45 | 122,20 | 1093 | 0      | 61,45       | 21,29 MiB |
| Production home mobile #1        | 57          | 96/81/100  | 7,17  | 9,07   | 2,5  | 0      | 9,00        | 1,40 MiB  |
| Production home mobile #2        | 58          | 96/81/100  | 7,06  | 9,02   | 1,5  | 0      | 7,18        | 1,40 MiB  |
| Production home mobile #3        | 58          | 96/81/100  | 7,08  | 9,03   | 5    | 0      | 7,08        | 1,40 MiB  |
| Production home desktop          | 88          | 96/81/100  | 1,37  | 1,78   | 0    | 0      | 1,37        | 1,43 MiB  |
| Production contact mobile #1     | 32          | 93/100/100 | 12,47 | 16,72  | 1135 | 0      | 12,47       | 3,14 MiB  |
| Production contact mobile #2     | 42          | 93/100/100 | 12,22 | 14,08  | 549  | 0      | 12,22       | 2,57 MiB  |
| Production product detail mobile | 56          | 97/81/100  | 6,08  | 13,38  | 73,5 | <0,001 | 9,81        | 2,21 MiB  |
| Production news mobile           | 57          | 96/81/100  | 6,61  | 9,77   | 4,5  | 0      | 8,75        | 2,20 MiB  |

Homepage mobile median: Performance **58**, LCP **9,03 detik**. Contact hanya dua run; variasi tile map/CPU cukup besar. Product/news masing-masing satu run: indikasi kuat masalah, bukan distribusi statistik.

Tidak semua request Lighthouse selalu cold di cache server. Browser/storage direset oleh Lighthouse, tetapi cache WordPress dan cache proses Node adalah lapisan berbeda. Home document response tercatat 3786 ms, 2544 ms, lalu 22 ms. Jangan mencampurkan angka cold dan warm menjadi satu SLA.

### Kenapa skor development sangat buruk?

Audit development menemukan:

- JavaScript ditransfer sekitar **20,68 MiB**.
- `lucide-react.js` sekitar **5,23 MiB**, `react-dom_client.js` **2,99 MiB**, `zod.js` **2,25 MiB**, `motion_react.js` **1,94 MiB** dalam dependency development.
- Audit minification memperkirakan penghematan **16809 KiB**, sama dengan keluhan awal.
- Devtools router ikut memakai CPU.

Pada production, audit `unminified-javascript` lolos; payload homepage lengkap turun sekitar **93%**. Ini alasan utama mengapa skor development tidak boleh menjadi kriteria rilis. Bukan alasan mengabaikan skor mobile production yang masih rendah.

LCP homepage production yang diidentifikasi Lighthouse adalah **logo header**, bukan otomatis gambar hero. Perbaikan harus mengikuti trace aktual, bukan mengasumsikan semua LCP berasal dari hero.

### Kenapa Best Practices masih 81?

Audit `is-on-https` menemukan media `http://ascentia-local.local/wp-content/uploads/...`: 8 request pada home mobile, 10 pada desktop, 12 pada product, 6 pada news. Localhost frontend mendapat perlakuan khusus sebagai origin lokal; media WordPress HTTP tetap ditandai.

Halaman contact tidak memuat media CMS HTTP yang sama dan mendapat Best Practices 100. Dengan demikian skor 81 pada lingkungan ini mempunyai penjelasan konkret: **URL media tidak HTTPS**, bukan indikator bahwa semua praktik coding buruk.

Pada deployment HTTPS, browser bisa mencoba upgrade gambar HTTP ke HTTPS atau memblokirnya jika tidak tersedia. Belum ada bukti deployment publik mempunyai masalah ini; wajib diuji pada origin sebenarnya.

## 3. Eksperimen pembeda: kompresi aset

Tidak mengubah aplikasi. Proxy lokal sementara pada port 3104 menambahkan gzip untuk aset teks yang belum dikompresi, meneruskan konten dari port 3103.

| Ukuran      | Baseline home mobile #3 | Proxy gzip, satu run |
| ----------- | ----------------------- | -------------------- |
| Performance | 58                      | 68                   |
| FCP         | 7,08 s                  | 3,40 s               |
| LCP         | 9,03 s                  | 5,37 s               |
| Payload     | 1,40 MiB                | 0,72 MiB             |
| TBT         | 5 ms                    | 23,5 ms              |

Header langsung membuktikan HTML sudah gzip, tetapi CSS/JS tidak memiliki `Content-Encoding`, sekalipun request menawarkan `gzip, br`. Sebanyak 24 aset CSS/JS yang ditemukan dalam HTML berjumlah **945266 byte**; estimasi gzip lokal **297786 byte**.

Eksperimen mendukung kompresi sebagai perbaikan berdaya ungkit tinggi. **Bukan skor setelah fix**, bukan jaminan mencapai 90. Proxy HTTP sederhana juga mengubah lapisan serving/latency, bukan benchmark produksi identik; kategori selain performa tidak digunakan sebagai pembanding eksperimen.

## 4. Audit health score

Penilaian teknis scoped, bukan skor Lighthouse dan bukan sertifikasi WCAG.

| Dimensi                   | Skor /4   | Dasar                                                                                                       |
| ------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| Accessibility             | 2         | Kontras gagal lintas halaman; popup map tanpa accessible name; keyboard dasar bekerja                       |
| Performance               | 1         | Mobile LCP 9–17 s; eager map; aset teks belum terkompresi                                                   |
| Responsive                | 3         | Tidak ada overflow pada 4 lebar × 8 halaman; beberapa kontrol berukuran kurang dari target kenyamanan 44 px |
| Theming                   | 3         | Token terpusat; sebagian warna metadata hard-coded; dark mode tidak menjadi cakupan uji                     |
| Anti-pattern implementasi | 3         | Tidak ada alasan untuk redesign total; fokus pada preload/eager work dan interaksi, bukan selera visual     |
| **Total**                 | **12/20** | **Acceptable: masih memerlukan perbaikan signifikan**                                                       |

Anti-pattern verdict: **tidak ada dasar objektif untuk menyebut seluruh situs “AI-generated”**. Identitas brand dan komponen sudah konsisten. Efek dekoratif bukan prioritas dibanding transfer, map, validasi, dan hydration. Penilaian estetika menyeluruh tidak dilakukan.

## 5. Temuan prioritas

Total: **15 temuan**, terdiri dari **0 P0, 9 P1, 6 P2, 0 P3**. “Terkonfirmasi” berarti dapat direproduksi pada scope yang disebut, bukan klaim sudah terjadi pada pengguna publik.

### P1-01 — Konfigurasi production kehilangan WordPress origin

- **Kategori/lokasi:** deployment; `src/features/products/api/product-source.server.ts:32–34`; `src/features/contact/api/contact-source.server.ts:10–13`.
- **Bukti:** `.env` lokal hanya memiliki dua nama `VITE_*` lama. Proses production tanpa `WORDPRESS_URL` menampilkan `Unable to load products`, filter gagal, recommended products gagal.
- **Dampak:** katalog/form tidak dapat berfungsi bila konfigurasi lokal ini disalin apa adanya ke hosting; HTTP 200 halaman tidak menjamin kontennya sehat.
- **Rekomendasi minimum:** konfigurasi `WORDPRESS_URL` pada proses Node, pakai origin HTTPS deployment, uji isi katalog setelah restart. Jangan menaruh credential di `VITE_*`.
- **Batas:** README sudah menjelaskan nama baru; ini masalah setup runtime yang terkonfirmasi, bukan bukti setting cPanel saat ini salah.

### P1-02 — CSS dan JavaScript production belum terkompresi

- **Kategori/lokasi:** performance/serving; `src/server.ts:53` hanya mengompresi HTML; aset Nitro/reverse proxy memerlukan pengaturan sendiri.
- **Bukti:** CSS **130324 byte**, entry JS **443530 byte**, `Content-Encoding` tidak ada. HTML memiliki `Content-Encoding: gzip`. Eksperimen di bagian 3 memperbaiki FCP/LCP secara material.
- **Dampak:** download mobile dan waktu sebelum hydration membesar. CSS menjadi render-blocking; Lighthouse memperkirakan penghematan render blocking sekitar 600–750 ms.
- **Rekomendasi minimum:** aktifkan Brotli/gzip aset teks pada reverse proxy/CDN/static serving. Verifikasi header dan ukuran transfer pada URL deployment. Tidak perlu menambah library kompresi client.

### P1-03 — Map dimuat sebelum dibutuhkan, contact mobile sangat berat

- **Kategori/lokasi:** performance; `src/components/ui/map.tsx:1–4,56`; `src/features/contact/pages/contact-page.tsx:97`.
- **Bukti:** MapLibre import statis; `new MapLibreGL.Map` dijalankan saat mount, tidak menunggu map terlihat. Chunk `locations-section-*.js` sekitar **1,01 MiB**. Tile Carto menambah request besar. Contact TBT **549–1135 ms**, payload **2,57–3,14 MiB**.
- **Dampak:** pengguna menunggu/render utama terganggu untuk map di bagian bawah halaman; perangkat lemah dapat terasa lag ketika hydration dan map berjalan bersamaan.
- **Rekomendasi minimum:** lazy-load modul dan inisialisasi map saat mendekati viewport atau setelah klik “Lihat peta”. Alamat/kontak/link Google Maps tetap tersedia tanpa map interaktif. Uji ulang `/about-us` yang memakai komponen sama.

### P1-04 — Media CMS HTTP menurunkan Best Practices

- **Kategori/lokasi:** transport/security deployment; URL dari Store API/WordPress dan komponen gambar CMS.
- **Bukti:** `is-on-https` gagal; daftar URL tersimpan di `evidence.json`.
- **Dampak:** transfer media tidak terenkripsi di lingkungan lokal; risiko upgrade gagal/mixed content saat frontend HTTPS bila URL lama terbawa.
- **Rekomendasi minimum:** WordPress/media origin harus HTTPS; migrasikan URL CMS lewat prosedur WordPress yang aman, bukan replace database mentah. Verifikasi `src`, `srcset`, brochure, iframe, dan rich text pada deployment.
- **Batas:** temuan HTTPS lokal; jangan menyebut deployment publik gagal sebelum benar-benar diuji.

### P1-05 — Response HTML bergantung pada upstream CMS dan cache warm

- **Kategori/lokasi:** performance/resilience; `src/routes/index.tsx:12–16`; `src/features/products/api/product-source.server.ts:44,106,148`.
- **Bukti:** SSR menunggu taxonomy dan featured products. Taxonomy dapat menambah request metadata logo. Home response Lighthouse **3,79 s**, **2,54 s**, lalu **22 ms**. Uji terbatas 12 GET dengan 4 worker menghasilkan semua HTTP 200, tetapi response-header latency cold mencapai **7,89 s**; beberapa request warm **0–47 ms**.
- **Dampak:** pengunjung pertama, restart Node, atau cache expired dapat melihat halaman lambat walau kunjungan berikutnya cepat. Backend lambat bukan diselesaikan dengan memoization React.
- **Rekomendasi minimum:** ukur per-endpoint WordPress cold/warm, kurangi fetch metadata logo berantai, pertahankan cache aman; tentukan konten below-fold yang boleh tidak memblokir shell SSR. Jangan cache seluruh HTML personal tanpa mengaudit variasinya.
- **Batas:** concurrency kecil terhadap WordPress lokal, **bukan load test kapasitas production**. Timeout upstream ada dan sudah diuji.

### P1-06 — Kontras teks gagal WCAG AA

- **Kategori/lokasi:** accessibility/theming; `src/components/ui/cta-link.tsx:19`, `src/styles.css:109,115`, `src/features/articles/components/article-card.tsx:33`.
- **Bukti:** putih pada orange CTA/ticker **2,81:1**; primary biru pada putih **3,97:1**; chip produk **3,73:1**; metadata news **3,81:1**. Ukuran teks tersebut memerlukan **4,5:1**.
- **Dampak:** teks utama tombol/metadata sulit dibaca bagi pengguna low vision dan layar dengan kondisi kurang baik. Accessibility 96 tidak berarti patuh WCAG.
- **Rekomendasi minimum:** sesuaikan pasangan warna foreground/background, bukan sekadar menebalkan teks kecil. Uji seluruh CTA normal/hover/focus, ticker, badge, dan metadata.
- **Standar:** WCAG 2.2 SC 1.4.3.

### P1-07 — Klik search sebelum hydration hilang pada jaringan lambat

- **Kategori/lokasi:** interaction/performance; `src/components/layout/site-header/index.tsx:216,249`; `src/features/search/components/global-search.tsx:6,60`.
- **Bukti:** pada 1,6 Mbps dan CPU ×4, klik pertama berhasil mengenai tombol yang terlihat, tetapi `aria-expanded` tetap `false`, tidak muncul dialog setelah 5 detik. Reproduksi tambahan tetap `false` setelah network idle. Klik berikutnya setelah hydration membuka dialog; satu run mencatat sekitar 12 detik dari navigasi sampai dialog berhasil dibuka.
- **Dampak:** tombol terlihat siap tetapi tidak bereaksi; pengguna mengira situs macet. Juga ada potensi jeda ketika chunk dialog dimuat karena `Suspense fallback={null}`.
- **Rekomendasi minimum:** kurangi download/initial JS, tampilkan state kesiapan/loading yang jelas; jangan menyajikan kontrol seolah siap sebelum handler tersedia. Bila loading dialog dilakukan, berikan feedback yang dapat diakses. Jangan menganggap menambah timeout tes memperbaiki bug.
- **Pemeriksaan:** `verify-production-audit.py`, kasus `slow network first search click opens dialog`.

### P1-08 — Pembatalan caller pertama membatalkan cache bersama

- **Kategori/lokasi:** resilience/concurrency; `src/lib/cache.ts:17`.
- **Bukti:** `load(key, signal)` memakai signal caller pertama untuk promise dalam `pending`. Dua caller pada key sama sama-sama rejected ketika hanya controller pertama dibatalkan; signal caller kedua tetap tidak aborted.
- **Dampak:** pada cache miss, pengguna yang masih menunggu dapat ikut menerima error akibat request lain dibatalkan. Berlaku pada pemakai keyed cache; taxonomy cache terpisah tidak mempunyai pola yang sama.
- **Rekomendasi minimum:** pisahkan lifetime shared fetch dari signal masing-masing caller; tetap batalkan penantian caller secara individual. Tambahkan regression test dua caller, bukan hanya satu caller yang abort.
- **Batas:** defect fungsi cache terkonfirmasi; seberapa sering disconnect browser diteruskan sebagai abort oleh transport deployment belum diukur.
- **Pemeriksaan:** `node scripts/verify/verify-audit-boundaries.mjs`.

### P1-09 — Contact menerima HTTP 200 tanpa memastikan acceptance

- **Kategori/lokasi:** validation/data-loss risk; `src/features/contact/api/contact-source.server.ts:40`; `src/features/contact/components/contact-form.tsx:105–120`.
- **Bukti:** fetch yang dimock menjadi HTTP 200 dengan `{ "success": false, "message": "Not stored" }` tetap resolve. Type assertion bukan validasi. Form membersihkan input setelah promise resolve.
- **Dampak:** bila upstream/proxy mengembalikan JSON contract tak sesuai, UI dapat menyatakan sukses dan menghapus pesan padahal penyimpanan belum dikonfirmasi.
- **Rekomendasi minimum:** validasi respons di server boundary; wajib `success === true` serta field kontrak yang diperlukan sebelum resolve. Respons invalid harus menjadi error dan mempertahankan input/id retry.
- **Batas:** respons abnormal disimulasikan tanpa pengiriman. Tidak ada bukti WordPress saat ini benar-benar mengirim `success: false` berstatus 200.
- **Pemeriksaan:** `node scripts/verify/verify-audit-boundaries.mjs`.

### P2-01 — WhatsApp product detail mengirim URL katalog umum

- **Kategori/lokasi:** correctness/hydration; `src/features/products/components/product-detail-content.tsx:24–30`.
- **Bukti runtime:** membuka langsung `/products/xrtga-range-thermogravimetric-analyser` menghasilkan pesan WhatsApp dengan `Link: https://ascentia.co.id/products`, bukan detail produk. Tidak ada uncaught exception; bug tetap terjadi.
- **Penyebab:** server memakai fallback URL umum, render browser pertama memakai `window.location.href`; atribut hasil SSR dapat tetap dipertahankan.
- **Dampak:** sales menerima link salah, kehilangan konteks produk.
- **Rekomendasi minimum:** bentuk URL detail deterministik dari canonical origin dan slug; identik di server/client.

### P2-02 — Logo marquee tidak memiliki ukuran intrinsik

- **Kategori/lokasi:** performance/layout; `src/components/ui/logo-marquee.tsx:49`.
- **Bukti:** `unsized-images` gagal pada logo CMS; komponen tidak menerima width/height. Banyak node duplikat marquee mewakili aset sama, bukan semua download unik.
- **Dampak:** browser belum bisa memastikan rasio sebelum gambar selesai; berisiko perubahan geometri track. CLS run ini tetap 0, jadi jangan melaporkan CLS buruk yang tidak terjadi.
- **Rekomendasi minimum:** bawa ukuran/rasio gambar dari mapper atau gunakan slot dengan rasio eksplisit.

### P2-03 — Cache policy aset publik dan ukuran gambar perlu dibenahi

- **Kategori/lokasi:** performance/serving; `/brand/*.webp`, `/images/homepage/*.webp`, media CMS.
- **Bukti:** hashed `/assets/*` sudah `max-age=31536000, immutable`; gambar publik lokal tidak memiliki `Cache-Control`. Home Lighthouse mengestimasi cache savings **336 KiB**, image delivery **244 KiB** pada run #3.
- **Dampak:** kunjungan ulang dan jaringan terbatas membayar transfer lebih besar dari kebutuhan.
- **Rekomendasi minimum:** TTL yang disengaja untuk public images, versioned URL bila cache panjang; responsive image/compression CMS. Jangan memberi immutable setahun pada nama file yang tetap ditimpa.
- **Batas:** angka Lighthouse adalah estimasi; jangan dijumlahkan sebagai penghematan pasti karena peluang dapat overlap.

### P2-04 — Pemeriksaan kualitas lama memberi false confidence atau berhenti terlalu awal

- **Kategori/lokasi:** verification; `scripts/verify/verify-site-quality.py:108,128–129`; `src/features/products/api/product-taxonomy-cache.test.ts:30`.
- **Bukti:** pemeriksaan CTA menerima rasio **2,8**, padahal teks kecil memerlukan 4,5. Suite berhenti mencari tab “Description”, sementara English UI memakai “Overview”. Unit taxonomy mengharapkan rejection setelah expiry, tetapi implementasi kini sengaja mengembalikan stale cache, sehingga `Missing expected rejection`.
- **Dampak:** bisa menganggap aksesibilitas baik padahal gagal; bagian suite setelah selector usang tidak pernah diuji.
- **Rekomendasi minimum:** sesuaikan assertion terhadap kontrak sekarang, selector semantik yang tepat, contrast 4,5. Tetapkan stale-cache policy secara eksplisit sebelum mengubah tes; jangan mengubah aplikasi hanya supaya assertion lama lolos.
- **Status:** 6 dari 7 file unit yang dijalankan lolos. Tiga file test lain tidak dijalankan pada audit ini.

### P2-05 — Accessible name map dan label desktop tidak konsisten

- **Kategori/lokasi:** accessibility; `src/components/ui/map.tsx:203–206`; `src/components/layout/site-header/language-picker.tsx:46`; header dan selector slide desktop.
- **Bukti:** popup `role="dialog"` tanpa nama; label diambil dari `trigger.textContent`, sedangkan marker icon tidak memiliki teks. Desktop Lighthouse menandai label “EN”, “Search K”, dan nomor slide yang tidak termuat dalam accessible name.
- **Dampak:** konteks popup tidak jelas bagi screen reader; voice-control berdasarkan label visual dapat tidak cocok.
- **Rekomendasi minimum:** ambil nama marker dari accessible label eksplisit atau gunakan `aria-labelledby`; tandai shortcut/nomor dekoratif secara tepat atau samakan nama dengan label yang terlihat.
- **Standar:** accessible-name best practice, WCAG 2.5.3 untuk label-in-name. Perlu retest assistive technology; bukan semua warning membuktikan seluruh dialog tidak bisa digunakan.

### P2-06 — Initial JS masih besar meski sudah production

- **Kategori/lokasi:** performance; root/shell, reveal, shared form primitives, route chunks.
- **Bukti:** home production memuat sekitar **900 KiB** script transfer. Lighthouse mengestimasi unused JS **409 KiB**, termasuk entry **203 KiB**, shared form chunk **63 KiB**, reveal **52 KiB**. Nilai adalah coverage saat load, bukan bukti semua kode bisa dihapus.
- **Dampak:** download/parse dan hydration memperpanjang periode kontrol belum siap, terutama perangkat lemah.
- **Rekomendasi minimum:** setelah kompresi/map diperbaiki, profil chunk dengan coverage nyata; tunda fitur below-fold atau berbasis aksi. Hapus dependensi hanya bila bukti menunjukkan tidak digunakan; jangan menambah memoization massal tanpa profiling.

## 6. Pengujian fungsional dan kondisi khusus

### Yang dijalankan

| Area                                     | Hasil                                                               |
| ---------------------------------------- | ------------------------------------------------------------------- |
| 8 halaman utama pada 360/390/768/1440 px | HTTP 200, tidak ada horizontal overflow                             |
| Product detail                           | Navigasi dan tab tersedia; Home/End keyboard mengubah selection     |
| News/blog detail                         | Artikel dapat dibuka, rich content terlihat                         |
| Search                                   | Focus input, Escape, focus restoration lolos                        |
| Mobile menu                              | Buka/tutup lolos pada 360/390/768 px                                |
| Contact kosong/email invalid             | Tidak mengirim submission contact; fokus ke field invalid           |
| Contact HTTP 503 simulasi                | Alert terlihat; isi pesan tetap tersimpan; semua write dicegat      |
| Search server function 503               | Error/retry terlihat; pulih setelah interception dicabut            |
| Product API 503                          | Dua attempt; error UI dapat dipulihkan                              |
| Product API malformed JSON               | Satu attempt; tidak retry sia-sia                                   |
| Product API timeout                      | Dua attempt; pulih melalui retry                                    |
| URL tidak ada                            | Status 404 asli dan UI not-found                                    |
| Browser exception                        | Tidak ada uncaught page error dalam skenario normal yang dijalankan |
| Network/CPU lambat                       | Klik search pertama gagal; bekerja setelah hydration                |
| Cache cancellation                       | Gagal isolasi caller                                                |
| Contact acknowledgment abnormal          | Tidak ditolak oleh server boundary                                  |
| 12 GET, maksimum 4 worker lokal          | Semua HTTP 200; cold response-header latency sampai 7,89 s          |

Form valid **tidak dikirim ke WordPress** pada audit browser baru. POST/non-read request dicegat dan dijawab error untuk menguji preservasi input; pemeriksaan contract memakai mock fetch. Tes lama `verify-contact-form-submit.py` sengaja tidak dijalankan karena benar-benar mengirim enquiry.

### Perintah dan status

```bash
pnpm build
pnpm exec tsc --noEmit -p tsconfig.json
pnpm lint
pnpm check
```

Keempatnya exit 0. Build menghasilkan warning dependency `use client` dari bundler; tidak ada bukti warning tersebut menjadi error runtime pada skenario teruji.

```bash
python scripts/verify/verify-product-upstream-errors.py
```

Exit 0: HTTP 503, JSON invalid, timeout, recovery, no page exception. Script memakai mock upstream dan proses production tersendiri.

```bash
python scripts/verify/verify-production-audit.py --url http://127.0.0.1:3103 --output audit-artifacts
node scripts/verify/verify-audit-boundaries.mjs
```

Keduanya **sengaja masih exit 1** karena bug yang diaudit belum diperbaiki. Browser: 110/112. Boundary: dua temuan gagal. Script disimpan agar kasus dapat direproduksi setelah fix; bukan menambahkan framework test baru.

Unit subset:

```bash
node --experimental-strip-types --test src/lib/seo.test.ts src/lib/seo-content.test.ts src/lib/fuzzy-search.test.ts src/features/analytics/api/visitor-policy.test.ts src/features/articles/components/article-bookmarks.test.ts src/features/articles/constants/dummy-articles.test.ts src/features/products/api/product-taxonomy-cache.test.ts
```

Exit 1: 6 file lolos, 1 gagal pada expected stale-cache rejection.

## 7. Praktik baik yang dipertahankan

- Build production benar-benar minified; development tooling tidak tampil pada production UI.
- HTML sudah gzip; hashed asset sudah long-lived immutable.
- CLS stabil pada run yang diukur; banyak gambar utama mempunyai dimensi eksplisit.
- Rich text produk dimapping dan disanitasi dengan allowlist; bukan render legacy Divi mentah sebagai kontrak UI.
- Input enquiry divalidasi server-side; duplicate submit guard dan idempotency key tersedia.
- Error contact biasa tidak menghapus isi pesan; fallback email tersedia.
- Fetch CMS mempunyai timeout, pemisahan error, dan retry yang tidak membabi buta untuk JSON invalid.
- Stale cache membantu ketika backend gagal; bug cancellation tidak membatalkan manfaat caching itu sendiri.
- Search lazy-loaded, mendukung keyboard/focus recovery; tinggal menutup gap readiness dan feedback.
- Tab produk mempunyai keyboard navigation dan selected state; responsive dasar konsisten.

## 8. Batas audit: yang belum boleh dianggap terbukti

- Bukan audit seluruh kemungkinan bug. Tidak ada jaminan “semua kondisi aman”.
- Deployment publik belum diuji: TLS, HTTP/2/3, compression CDN/cPanel, origin media sebenarnya, restart Passenger, cache multi-instance.
- Tidak melakukan stress/load test production; empat worker lokal tidak membuktikan kapasitas pengguna bersamaan.
- Belum mengukur INP/CrUX pengguna nyata. TBT adalah lab proxy, bukan pengganti INP. LCP field yang baik adalah ≤2,5 s pada persentil ke-75; CLS baik ≤0,1 dan INP baik ≤200 ms menjadi acceptance target lanjutan, bukan hasil yang sudah dicapai.
- Belum mengetes Safari/iOS/Firefox, perangkat Android fisik kelas rendah, zoom teks 200%, pembaca layar menyeluruh, atau semua bahasa/copy panjang.
- Belum menguji pengiriman email, WP-Cron, penerimaan inquiry sungguhan, idempotency lintas restart hosting, dan antrean SMTP end-to-end.
- Belum menguji semua gambar rusak, network offline total, sesi tab background lama, bfcache, atau service-worker path. Tes 503/timeout bukan simulasi semua jenis offline.
- Skor SEO 100 hanya hasil audit otomatis halaman tersebut; bukan bukti indexing, canonical seluruh situs, sitemap, dan ranking sudah benar.
- Accessibility 93–97 bukan sertifikasi WCAG. Scoring theming tidak mencakup pengujian dark mode.

## 9. Urutan tindakan dan acceptance

1. **P1 setup/transport:** isi `WORDPRESS_URL` yang benar, HTTPS CMS/media, pastikan Node production, aktifkan Brotli/gzip aset. Syarat: konten CMS tampil, header aset teks terkompresi, tidak ada media HTTP dari origin publik.
2. **P1 performance:** tunda map below-fold; ukur dan kurangi dependency cold SSR; kurangi initial work yang menghalangi hydration. Syarat: bandingkan ≥3 run mobile pada home/contact/product/news dengan kondisi sama, bukan memilih skor terbaik.
3. **P1 correctness:** isolasi cancellation cache; validasi acknowledgment contact; tutup gap klik sebelum hydration. Syarat: dua script audit yang sekarang merah menjadi hijau tanpa melemahkan assertion.
4. **P1/P2 accessibility/correctness:** pasangan warna lolos 4,5:1, nama popup/label sesuai, WhatsApp berisi URL produk, ukuran logo dan cache image konsisten.
5. **P2 verification:** perbaiki tes stale/selector/contrast usang; jalankan ulang build, typecheck, lint, browser, unit, dan fault injection.
6. **Persetujuan rilis pada domain asli:** run Lighthouse mobile/desktop dengan CMS HTTPS; cek contact delivery terkontrol, restart Node, cold cache, dan monitoring error. Tetapkan budget awal Performance ≥90 sebagai sasaran lab, bukan janji otomatis; field CWV diverifikasi sesudah cukup trafik.

Perintah UI opsional sesuai temuan: `$impeccable optimize` untuk aset/map, `$impeccable harden` untuk interaksi/error, `$impeccable audit` untuk pengukuran ulang, `$impeccable polish` paling akhir. Infrastruktur dan contract bug tetap memerlukan perubahan spesifik di luar polish visual.

## 10. Menjalankan ulang

Contoh Git Bash untuk production lokal dengan CMS lokal. Gunakan origin HTTPS dan environment manager hosting untuk deployment sebenarnya.

```bash
pnpm build
NODE_ENV=production PORT=3103 HOST=127.0.0.1 WORDPRESS_URL=http://ascentia-local.local node --env-file=.env .output/server/index.mjs
```

Terminal lain:

```bash
python scripts/verify/verify-production-audit.py --url http://127.0.0.1:3103 --output audit-artifacts
node scripts/verify/verify-audit-boundaries.mjs
python scripts/verify/verify-product-upstream-errors.py
```

Lighthouse, Chrome terpasang di mesin audit:

```bash
CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe' pnpm dlx lighthouse@13.5.0 http://127.0.0.1:3103/ --chrome-flags='--headless --no-sandbox' --output=json --output=html --output-path=./audit-artifacts/home-mobile --only-categories=performance,accessibility,best-practices,seo
```

Tambahkan `--preset=desktop` untuk desktop. Jalankan mobile tiga kali ke nama output berbeda; gunakan median. Tutup tab/pekerjaan berat lain; samakan versi Chrome/Lighthouse, konfigurasi CPU/network, kondisi cache, dan CMS. `--no-sandbox` di contoh adalah flag runner lokal; jangan menonaktifkan sandbox browser harian atau menjadikan runner ini endpoint publik.

## Referensi

- [LCP: definisi, threshold, lab versus field](https://web.dev/articles/lcp).
- [Total Blocking Time](https://web.dev/articles/tbt).
- [Core Web Vitals](https://web.dev/articles/vitals).
- [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- [WCAG Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).
- [Dokumentasi deployment project](../../README.md#production-build).
