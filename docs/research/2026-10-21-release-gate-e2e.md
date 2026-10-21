# Release gate: pengujian end-to-end sebelum production

Tanggal: 21 Oktober 2026. Keputusan: **HOLD untuk rilis publik**. Staging dapat dilanjutkan dengan kontrol akses/noindex; tidak ada push/deploy dilakukan.

Ini pemeriksaan baru setelah teks CTA dikembalikan putih dan plugin WordPress dipisah menjadi beberapa file. Angka “Accessibility 100” dan “64/64 lolos” sebelumnya tidak berlaku otomatis untuk snapshot sekarang.

## Snapshot yang benar-benar diuji

- Build production lokal, dijalankan melalui `pnpm start`, Node 24.14.0.
- CMS `http://ascentia-local.local`; tidak merepresentasikan HTTPS/CDN/Passenger hosting publik.
- Pengujian final menggunakan salinan `.output` yang tidak berubah, di luar repo, `http://127.0.0.1:3114`.
- 296 file build. SHA-256 manifest: `6987657542b885e7aa935212762305ecf2119ffab0b316c746dd1880ab643c48`.
- Sumber awal sudah dirty: 85 modified dan 27 untracked files, termasuk modul plugin baru. Hasil tidak boleh dianggap terikat ke clean HEAD saja.
- `SITE_INDEXABLE=false` sengaja dipakai pada salinan staging. SEO Lighthouse 69 karena noindex; bukan bukti metadata/canonical rusak.
- Semua enquiry browser dicegat atau diarahkan ke upstream in-memory. Tidak ada inquiry/email sungguhan dibuat oleh pengujian baru.

Bukti permanen: [release-gate.json](2026-10-21-production-audit/release-gate.json).

Bukti lengkap sementara, termasuk report Lighthouse HTML/JSON, log gagal, screenshot, artifact manifest:

```text
C:\Users\Minguri\AppData\Local\Temp\ascentia-release\
```

## Hasil

| Pemeriksaan                               | Hasil final      | Catatan                                                                                               |
| ----------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| Production build                          | Lolos            | Warning dependency `use client` tetap ada                                                             |
| TypeScript, ESLint, Prettier              | Lolos            | Bukan pengganti tes perilaku                                                                          |
| 10 file unit                              | 10/10            | Mapping, sanitasi, cache, search, SEO, policy analytics                                               |
| Boundary cache/contact                    | Lolos            | Cancellation isolation, contract response palsu/valid/error                                           |
| Browser smoke/resilience                  | **125/125**      | 4 viewport, 8 halaman, map gagal/retry, search lambat, form error, 404, gzip/Brotli                   |
| User journeys tambahan                    | **10/11**        | Satu bug scroll ketika memilih bahasa yang sedang aktif                                               |
| Site quality dengan contrast benar        | **62/64**        | Dua kegagalan CTA contrast, mobile dan desktop                                                        |
| Search mendalam                           | Lolos            | Live results; kosong, partial error, stale query race, broken image, focus, shortcut Mac/Linux/mobile |
| Gallery/lightbox                          | Lolos            | Produk 360/390/768/1440; About 390/1440; keyboard/focus/selection                                     |
| Route loader                              | Lolos            | Delayed data, logo siap, reduced motion                                                               |
| Product upstream fault injection          | Lolos            | 503: dua attempt; JSON invalid: satu; timeout: dua; retry recovery                                    |
| Production SSR SEO dengan fixture         | Lolos            | Canonical, Yoast, schema, redirect, sitemap pagination, noindex/failure                               |
| Contact HTTP roundtrip fixture            | Lolos            | Browser, server function, HTTP upstream, respons UI; acknowledgment hilang lalu retry dengan ID sama  |
| Internal anchor crawl                     | **43/43 target** | Dari 10 seed SSR; bukan semua state JS/fragment eksternal                                             |
| Standalone `.output` tanpa `node_modules` | Lolos            | Robots, home, katalog berisi produk; bukan sertifikasi Passenger                                      |
| PHP syntax                                | **14/14**        | PHP 8.2.29; belum semua versi PHP                                                                     |
| WordPress insertion-failure stub          | **Gagal**        | Plugin mengaku sukses ketika insert mengembalikan 0                                                   |

### Alur pengguna yang telah dibuktikan

- Katalog halaman 1/2, reload, Back, filter brand mereset halaman, pencarian, hasil kosong, clear/reset.
- Search global keyboard memilih hasil dan menavigasi URL detail, input focus, Escape, focus restoration.
- Quote: field wajib, HTTP 503 menjaga isi, retry, simulated success, close/focus, reopen form kosong.
- Locale desktop mempertahankan query filter/page, membuang hash, scroll ke atas saat benar-benar berganti bahasa; URL `/id` mobile bertahan setelah reload.
- Galeri, thumbnail, lightbox, navigasi foto dan keyboard, penutupan/focus restoration.
- Contact roundtrip benar-benar melalui server function production dan `fetch` HTTP ke fixture, bukan hanya mengganti respons di browser. Fixture menyimpan sekali, mengembalikan 503 setelah penyimpanan, menerima retry dengan `submission_id` yang sama. Ini membuktikan kontrak frontend, bukan MySQL/WP-Cron sungguhan.

## Temuan yang masih gagal

### P1: plugin mengirim sukses palsu saat insert database gagal

Lokasi: `ascentia-inquiries/includes/rest-contact.php:69–88`.

`wp_insert_post([...])` memakai error mode default. Kegagalan dapat mengembalikan `0`, sementara pemeriksaan hanya `is_wp_error($post_id)`. Stub yang memanggil handler asli menghasilkan:

```json
{ "success": true, "message": "Permintaan Anda berhasil diterima.", "id": 0 }
```

Frontend sekarang menolak ID 0, sehingga tidak ikut membersihkan input. Namun endpoint WordPress tetap salah kontrak; konsumen lain bisa menerima sukses palsu. Perlu mengaktifkan mode `WP_Error` atau menolak ID false/zero; test stub harus hijau sesudah fix.

Reproduksi tanpa database/email:

```bash
"C:/Users/Minguri/AppData/Roaming/Local/lightning-services/php-8.2.29+0/bin/win64/php.exe" scripts/verify/verify-inquiry-save.php
```

Expected saat ini: exit 1. Tidak diperbaiki diam-diam dalam audit pengujian ini.

### P1: CTA putih/orange gagal kontras

Lokasi: `src/components/ui/cta-link.tsx`, `src/components/ui/enquiry-submit-button.tsx`, `src/features/home/components/category-nav.tsx`, token `src/styles.css`.

Lighthouse home menandai 5 node; putih pada orange sekitar **2,81:1**, di bawah 4,5:1 untuk teks kecil. Perubahan teks putih adalah pilihan desain terakhir pengguna; audit tidak mengubahnya kembali menjadi hitam.

Solusi tanpa teks hitam: pertahankan teks putih, gunakan orange lebih gelap untuk tombol/ticker yang berisi teks. Warna dekoratif brand dapat tetap orange sekarang. Perlu persetujuan perubahan warna, lalu ukur ulang.

Threshold test dikembalikan ke **4,5**, bukan 2,8. Memudahkan assertion tidak menjadikan WCAG lolos.

### P2: memilih bahasa aktif menggeser scroll 70 px

Lokasi pemicu: `src/components/layout/site-header/language-picker.tsx`, integrasi dropdown/focus dan sticky header. Root cause persis belum dipastikan.

Pada 1440 × 900, scroll ke 1400 lalu naik 120; posisi awal 1280. Buka picker EN, pilih English yang sudah aktif. Posisi menjadi 1350; history key tidak berubah. Reproduksi empat kali, termasuk reduced motion, masing-masing delta +70 px. Pergantian bahasa yang benar-benar berbeda lolos.

Reproduksi runnable:

```bash
python scripts/verify/verify-release-journeys.py --url http://127.0.0.1:3114 --output release-artifacts/journeys
```

Expected saat ini: 10/11, `selecting current language preserves scroll` gagal. Jangan mengubah expectation menjadi “boleh lompat 70 px”.

### P1 deployment risk: overwrite output saat proses lama hidup

Selama audit, `.output/public` pada workspace berubah ketika proses server lama masih berjalan. HTML proses lama menunjuk `/assets/styles-Bp2tkjRz.css`, tetapi file output sudah menjadi `styles-DWV_J-RR.css`. Request CSS gagal; browser memiliki stylesheet tanpa rules, body Times New Roman, header static.

Ini menjelaskan sebagian hasil probing sementara yang kacau. Semua angka final di atas diulang memakai salinan build immutable; file manifest diverifikasi tetap sama setelah pengujian.

Deploy harus menggunakan folder release baru dan process restart/switch yang terkontrol. Jangan `pnpm build`/overwrite `.output` yang sedang dipakai proses aktif. Pertimbangkan klien/tab lama yang masih meminta asset hash release lama; pertahankan asset lama sesuai strategi hosting atau gunakan reload/release switch terkontrol. Risiko itu tidak diselesaikan hanya dengan HTTP 200 halaman utama.

### P1 readiness gap: proteksi abuse endpoint contact

`ascentia-inquiries/includes/rest-contact.php:7–23` mengizinkan POST publik dan hanya mempunyai honeypot, tanpa rate limit/ukuran payload maksimum pada handler. Form publik memang tidak wajib login; masalahnya request langsung ke WordPress dapat melewati frontend dan mengisi storage/antrean email.

Tidak ada flood test dilakukan. Sebelum publik, tetapkan kontrol rate/body limit pada endpoint WordPress/reverse proxy dan batas panjang field server-side. Jangan mengandalkan nonces publik sebagai satu-satunya proteksi spam.

### P2 readiness gap: analytics key dan email cron

- `rest-analytics.php:28`: ketika key kosong, increment publik tetap diizinkan. Production perlu secret key server-side yang cocok; jangan mengasumsikan filtering frontend melindungi POST langsung ke WP.
- `email.php:45`: hasil scheduling cron tidak diperiksa. Status pending membutuhkan cron nyata dan monitoring; admin menyediakan resend yang diperiksa capability/nonce. Tidak ada auto retry terjadwal pada jalur email gagal.
- `helpers.php`: bila `GET_LOCK` tidak didukung, dedup berjalan tanpa lock. GET_LOCK production perlu diperiksa; fixture in-memory bukan bukti atomicity MySQL hosting.

## Lighthouse snapshot sekarang

Lighthouse 13.5.0, Chrome 155, konfigurasi mobile default CPU ×4, simulated network. Home mobile tiga run; target lain satu run.

| Target         | Performance             | Accessibility | Best Practices | SEO | LCP            |
| -------------- | ----------------------- | ------------- | -------------- | --- | -------------- |
| Home mobile    | 70/75/75, median **75** | 96            | 81             | 69  | sekitar 5,04 s |
| Home desktop   | 95                      | 96            | 81             | 69  | 1,11 s         |
| Contact mobile | 78                      | 100           | 100            | 69  | 4,48 s         |
| Product mobile | 63                      | 100           | 81             | 69  | 6,52 s         |

SEO 69 sengaja karena `SITE_INDEXABLE=false`; uji SSR fixture dengan indexable=true terpisah lolos. Jangan mengaktifkan indexability pada staging hanya untuk mengejar skor. Pada domain publik, set true saat memang siap indexing, kemudian verifikasi header/meta/canonical.

Best Practices 81 masih karena media CMS HTTP. Kinerja mobile belum memenuhi target LCP 2,5 s/Performance 90; diperlukan optimasi media/upstream/initial JS lanjutan, bukan klaim tuntas.

## Tes lama yang belum bisa dijadikan release gate

Tes tambahan dijalankan, bukan diasumsikan lolos. Beberapa gagal karena drift kontrak test:

- `verify-language-switch.py` / `verify-site-header.py`: nama lama `Select language, current English`; sekarang `EN, English, select language`.
- `verify-product-search-fuzzy.py`: mencari `Clear search input`; UI sekarang `Clear search`.
- `verify-blogs-flow.py`: mengharapkan `Our Blogs`/`Recent blogs post`; sekarang `Blogs`/`Recent blog posts`.
- `verify-news-flow.py`: heading dan kontrol Bookmark lama, sementara UI sekarang heading lokal baru dan copy/share.
- `verify-product-pagination.py`: heading recommended lama.
- `verify-product-navigation.py`: mengandalkan `window.__TSR_ROUTER__`; bukan API yang dijamin tersedia dalam production, run berhenti pada timeout.
- `verify-product-detail-loading.py`: ekspektasi loader lama tidak ditemukan; belum dipastikan murni test drift atau regresi.
- `verify-product-gallery.py` memiliki bagian import `/src/...` dan `/node_modules/.vite/...`; bukan tes production valid. Lightbox publik diuji menggunakan DOM/UI sebenarnya sebagai pengganti cakupan tersebut.

Pemeriksaan search lama diperbaiki hanya dengan `exact=True` untuk membedakan dua node teks, lalu seluruh kasus search lolos. Pemeriksaan slow-search smoke diperbaiki agar tidak membaca ulang trigger dengan filter visible saat modal mengubah visibility; dialog tetap diuji, bukan timeout diperpanjang untuk menyamarkan masalah.

## Yang dibutuhkan sebelum dinyatakan siap

1. Perbaiki failure path insert plugin, tentukan abuse protection server-side, pastikan secret analytics.
2. Putuskan orange lebih gelap dengan teks putih; retest contrast. Perbaiki scroll picker.
3. Retest gate merah tanpa melemahkan assertion.
4. Staging di hosting nyata: WordPress HTTPS, process restart, static assets, inquiry storage, duplicate request, SMTP + WP-Cron.
5. Pilih commit/snapshot rilis yang bersih dan lengkap; modul plugin untracked tidak boleh tertinggal. ZIP plugin saat audit cocok dengan file sumber, tetapi regenerasi/rebandingkan lagi jika source berubah.
6. Gunakan [runbook deploy dan rollback](../deployment/production-release-runbook.md). Deploy publik hanya setelah seluruh blocker ditangani atau risiko yang tidak blocking secara eksplisit diterima.

Tidak mengubah kode aplikasi, warna, plugin, hosting, atau database pada sesi ini. Perubahan hanya script pengujian/bukti/dokumentasi. Tidak ada bukti pengiriman email end-to-end sungguhan sampai test terkontrol dilakukan di staging.
