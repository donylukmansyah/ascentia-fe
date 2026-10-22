# Hasil implementasi perbaikan audit production

Tanggal: 21 Oktober 2026. Scope: build production **lokal**, CMS lokal yang sama. Belum deploy/tes domain publik. Audit awal tetap disimpan sebagai baseline, bukan ditulis ulang seolah hasil lama tidak pernah terjadi.

Snapshot historis sebelum teks CTA dikembalikan putih dan plugin diubah. Status terbaru ada di [release gate E2E](2026-10-21-release-gate-e2e.md); hasil Accessibility 100 di bawah tidak berlaku otomatis untuk kondisi sekarang.

Bukti: [after-fixes.json](2026-10-21-production-audit/after-fixes.json). Baseline: [audit awal](2026-10-21-production-readiness-audit.md).

## Perubahan

- Nitro native `compressPublicAssets` mengeluarkan `.br` dan `.gz`; tidak menambah dependency. Gzip/Brotli CSS dan JS benar-benar dinegosiasikan dan isi gzip sama dengan respons identity.
- Aset `/brand/`, `/images/`, `/icons/` memakai cache satu hari. Hashed `/assets/` tetap immutable.
- MapLibre, CSS map, worker, dan tile ditunda sampai kontainer mendekati viewport. API compound map dipertahankan. Request map tidak muncul pada initial contact viewport; canvas muncul setelah scroll. Kegagalan map menampilkan directions eksternal dan retry; recovery diuji. Popup memakai accessible label marker.
- Shared cache tidak lagi meneruskan signal caller pertama ke shared fetch; tiap caller tetap bisa menghentikan penantiannya. Timeout upstream tetap tersedia.
- Contact memvalidasi acknowledgment: `success === true`, message tidak kosong, optional ID positif dan safe integer. Respons palsu/invalid ditolak; input tidak dibersihkan oleh jalur sukses palsu.
- WhatsApp memakai URL canonical detail produk yang sama pada SSR/client.
- Search disabled/busy sebelum hydration, tampak belum siap; lazy dialog memberikan status loading. Klik pertama setelah kontrol enabled diuji pada koneksi 1,6 Mbps/CPU ×4. Ini **bukan** membuat search bekerja tanpa JavaScript.
- Warna brand orange dipertahankan; foreground CTA/ticker gelap, hover tetap putih pada biru gelap. Teks biru kecil/metadata memakai warna yang lebih terbaca. Label desktop dan nomor slide dekoratif disesuaikan.
- Product hero memakai `srcset` yang sudah disediakan CMS, bukan selalu original PNG. Dimensi eksplisit ditambahkan; tidak mengubah aset CMS/database.
- Pemeriksaan contrast kini memakai 4,5:1; selector tab mengikuti label “Overview”; tes cache mengikuti kebijakan stale data yang memang disengaja.
- Pesan map/loading baru tersedia dalam English dan Bahasa Indonesia.

File utama: `vite.config.ts`, `src/components/ui/map.tsx`, `src/lib/cache.ts`, `src/features/contact/api/contact-source.server.ts`, header/search, CTA/ticker, product detail/hero, `src/styles.css`, locale, dan script verifikasi. Tidak ada dependency baru, commit, push, perubahan hosting, atau migrasi database.

## Lighthouse sebelum / sesudah

Konfigurasi: Lighthouse 13.5.0, Chrome 155, simulated mobile 412 × 823, CPU ×4, network 1638,4 Kbps. Home/contact setelah fix masing-masing tiga run. Gunakan median, bukan skor terbaik.

| Target                | Performance sebelum     | Performance sesudah     | LCP sebelum   | LCP sesudah       |
| --------------------- | ----------------------- | ----------------------- | ------------- | ----------------- |
| Home mobile           | 57/58/58; median **58** | 72/74/74; median **74** | median 9,03 s | median **5,18 s** |
| Home desktop          | 88                      | **95**                  | 1,78 s        | **1,08 s**        |
| Contact mobile        | 32/42                   | 79/80/79; median **79** | 14,08–16,72 s | median **4,33 s** |
| Product detail mobile | 56                      | **63**                  | 13,38 s       | **6,75 s**        |
| News mobile           | 57                      | **68**                  | 9,77 s        | **5,16 s**        |

Product/news/desktop masing-masing satu run setelah fix; bukan distribusi statistik. TBT contact turun dari **549–1135 ms** menjadi **0/6/0 ms**. CLS tetap sekitar nol pada halaman terukur.

Payload:

- Home: 1464356 menjadi sekitar **713024 byte**, turun sekitar **51%**.
- Contact: 2696886–3287626 menjadi sekitar **498998 byte**, turun sekitar **81–85%**.
- Product: 2317169 menjadi **1116604 byte**, turun sekitar **52%**. Srcset hero menghilangkan download original PNG besar tambahan pada viewport mobile teruji.

Accessibility Lighthouse semua target teruji: **100**. Ini bukan sertifikasi WCAG menyeluruh; map baru juga diuji setelah scroll, bukan hanya disembunyikan dari initial audit.

Best Practices: contact **100**; home/product/news masih **81** karena URL media CMS lokal masih HTTP. Tidak dilakukan rewrite paksa HTTP ke HTTPS tanpa memastikan origin CMS mendukungnya.

## Verifikasi

| Pemeriksaan                                       | Hasil                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm build`                                      | Lolos; warning bundler dependency `use client` tetap ada                                        |
| `pnpm exec tsc --noEmit -p tsconfig.json`         | Lolos                                                                                           |
| `pnpm lint`                                       | Lolos tanpa warning saat pemeriksaan akhir                                                      |
| `pnpm check`                                      | Lolos                                                                                           |
| 10 file unit assert/Node                          | **10/10 lolos**                                                                                 |
| `node scripts/verify/verify-audit-boundaries.mjs` | Lolos: cancellation isolation, false/malformed response rejected, accepted response, HTTP error |
| `verify-production-audit.py`                      | **125/125 lolos**                                                                               |
| `verify-site-quality.py`                          | **64/64 lolos**                                                                                 |
| `verify-product-upstream-errors.py`               | Lolos: 503 dua attempt, JSON invalid satu, timeout dua, retry recovery                          |

125 pemeriksaan mencakup 4 viewport, 8 halaman utama, detail artikel/produk, keyboard/focus, form error/input preservation, search lambat, HTTP 503/retry, 404, gzip/Brotli, cache header, lazy map, map offline/retry, dan nama popup.

Semua submission contact pada browser dicegat. Tidak mengirim enquiry/email sungguhan untuk sekadar menguji UI. Native `fetch` pada boundary check dimock.

Perintah:

```bash
node scripts/verify/verify-audit-boundaries.mjs
python scripts/verify/verify-production-audit.py --url http://127.0.0.1:3103 --output audit-artifacts
python scripts/verify/verify-site-quality.py --url http://127.0.0.1:3103 --output audit-artifacts/quality
python scripts/verify/verify-product-upstream-errors.py
node --experimental-strip-types --test src/lib/seo.test.ts src/lib/seo-content.test.ts src/lib/fuzzy-search.test.ts src/features/analytics/api/visitor-policy.test.ts src/features/articles/components/article-bookmarks.test.ts src/features/articles/constants/dummy-articles.test.ts src/features/products/api/product-taxonomy-cache.test.ts src/features/products/api/product-mapper.test.ts src/features/search/search.test.ts src/features/seo/api/seo.test.ts
```

Laporan HTML/JSON mentah:

```text
C:\Users\Minguri\AppData\Local\Temp\ascentia-production-audit\ascentia-fixed-final-*.report.*
```

## Yang belum selesai / batas rilis

1. **Mobile belum mencapai Performance 90 atau LCP ≤2,5 s.** Perbaikan ini signifikan, bukan klaim optimasi tuntas.
2. **CMS/hosting:** isi `WORDPRESS_URL` HTTPS di proses Node production, migrasikan URL media dengan prosedur WordPress aman, optimalkan PNG CMS menjadi ukuran/format sesuai kebutuhan. Jangan mengubah database production tanpa backup dan persetujuan.
3. **Deployment:** upload seluruh `.output/`, termasuk `.br`/`.gz`. Jika Apache/CDN menyajikan aset sebelum Node, aktifkan kompresi pada lapisan itu; verifikasi `Content-Encoding` di URL CSS/JS asli. Nitro versi terpasang mengenali header browser normal `br, gzip`; header berbobot seperti `br;q=1, gzip;q=0.8` tetap fallback identity, bukan konten salah. Jangan menganggap semua client mendapat kompresi tanpa pemeriksaan deployment.
4. **Cache/SSR:** homepage masih menunggu data CMS; cold cache/server restart dapat lambat. Tidak mengubah strategi SSR atau menaikkan TTL sembarangan karena dapat memengaruhi freshness/SEO. Lanjutkan hanya berdasarkan trace endpoint WordPress aktual.
5. **Initial JS:** kompresi mengurangi transfer, bukan menghapus semua initial parsing/hydration. Profil lanjutan untuk fitur shell/below-fold bila budget mobile masih tidak tercapai.
6. **Logo marquee:** dimensi intrinsik CMS belum ditambahkan; perlu rasio asli dari mapper, bukan angka tebak. CLS terukur tetap baik.
7. **Belum diuji pada domain publik**, Safari/iOS fisik, traffic production, email/WP-Cron end-to-end, atau field INP/CrUX. Skor lokal tidak menjamin hasil hosting sama.

Tidak menambah image proxy, library optimasi, Redis, atau cache HTML global. Tambahkan hanya bila pengukuran deployment membuktikan perlu.
