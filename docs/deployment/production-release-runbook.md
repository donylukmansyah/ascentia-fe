# Runbook deploy production dan rollback

## Status saat ini

**Jangan push/deploy publik dulu.** [Release gate terbaru](../research/2026-10-21-release-gate-e2e.md) masih menemukan failure path plugin dan kontras; scroll picker juga gagal. Deployment publik, email nyata, dan kompatibilitas Passenger belum diuji.

Runbook ini prosedur setelah blocker diperbaiki, bukan perintah yang telah dijalankan ke hosting.

## 1. Pastikan hosting sesuai

1. Konfirmasi ada **persistent Node.js application**, bukan hosting PHP/static saja. Dapat berupa CloudLinux “Setup Node.js App”, cPanel “Application Manager”, atau service Node biasa. Minta screenshot/nama interface bila belum jelas.
2. Gunakan Node **22.12+ atau 24 LTS**. `@tanstack/react-start` terpasang memerlukan `>=22.12.0`; “Node 20+” pada catatan lama tidak cukup untuk dependency saat ini.
3. Pastikan frontend dan WordPress punya origin terpisah yang stabil, misalnya frontend `https://ascentia.co.id`, CMS `https://cms.ascentia.co.id`. Jangan memasang frontend di domain CMS yang sama lalu membuat server fetch dirinya sendiri.
4. Pastikan CMS REST, uploads, media, WP-Admin, SMTP, dan cron tetap dapat diakses melalui origin CMS. Canonical frontend saat ini mengarah ke `https://ascentia.co.id`; jika domain rilis berbeda, konfigurasi/SEO perlu disesuaikan dan dibangun ulang.
5. Konfirmasi reverse proxy mengatur forwarded headers secara tepercaya dan Node tidak dibuka langsung ke internet. Jangan membiarkan pengguna menyuplai trusted proxy/IP headers tanpa sanitasi proxy.

## 2. Backup dan kandidat rilis

1. Backup database WordPress, uploads, plugin lama, environment/settings, dan build frontend yang sedang aktif. Simpan backup di lokasi privat.
2. Tentukan commit kandidat. `git status` masih banyak perubahan/untracked; review file yang akan dimasukkan. Jangan `git add .` tanpa pemeriksaan, jangan commit `.env`/secret/build output.
3. Pastikan semua file plugin baru di `ascentia-inquiries/includes/`, entry, uninstall dan dokumentasinya tercakup; entry sekarang memerlukan bootstrap, bukan file PHP tunggal.
4. Jalankan gate di bawah pada kandidat tersebut. Catat commit, versi Node/pnpm, hash artifact, waktu build, hasil tes.
5. Push branch kandidat hanya setelah review dan persetujuan. Push Git sendiri tidak selalu memicu deploy; periksa CI/webhook/cPanel integration sebelum push agar tidak merilis tanpa sengaja.

## 3. Gate lokal / CI

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit -p tsconfig.json
pnpm lint
pnpm check
node scripts/verify/verify-audit-boundaries.mjs
pnpm build
```

Build pada Linux/CI yang sesuai hosting bila memungkinkan. Jangan menyalin `node_modules` Windows ke Linux. Source sekarang dapat menghasilkan `.output` standalone; audit sudah menguji salinan `.output` tanpa parent `node_modules` untuk home/katalog/robots, tetapi tetap lakukan smoke test kandidat final.

Jalankan produk build dengan environment **staging**. Jangan rebuild/overwrite output yang sedang dilayani proses aktif.

```bash
NODE_ENV=production SITE_INDEXABLE=false PORT=3110 HOST=127.0.0.1 WORDPRESS_URL=https://cms-staging.example.com pnpm start
```

Contoh memakai sintaks Bash. PowerShell/cPanel memakai setting environment masing-masing. `pnpm start` membaca `.env` jika tersedia; untuk hosting gunakan environment manager, bukan secret di folder web publik.

Terminal lain:

```bash
python scripts/verify/verify-production-audit.py --url http://127.0.0.1:3110 --output release-artifacts/browser
python scripts/verify/verify-release-journeys.py --url http://127.0.0.1:3110 --output release-artifacts/journeys
python scripts/verify/verify-site-quality.py --url http://127.0.0.1:3110 --output release-artifacts/quality
python scripts/verify/verify-product-upstream-errors.py
python scripts/verify/verify-contact-roundtrip.py
node scripts/verify/verify-seo.mjs
```

Test product/journeys menggunakan fixture produk lokal tertentu; jangan menganggap slug/jumlah data sama pada deployment lain. Pisahkan failure karena fixture dari bug aplikasi, jangan memperlunak requirement bisnis. PHP insertion test dijalankan menggunakan PHP CLI 7.4+/8.x yang tersedia:

```bash
php scripts/verify/verify-inquiry-save.php
```

Semua gate wajib yang dipakai harus exit 0 sesudah perbaikan; saat dokumen ini ditulis beberapa sengaja exit 1 agar defect tidak tertutup.

## 4. Paket plugin WordPress

1. Perbaiki dan tes plugin di staging terlebih dahulu, termasuk database insertion failure, validasi panjang input, rate limit/body limit pada endpoint contact, GET_LOCK, capability akses inquiry.
2. ZIP harus mempunyai folder teratas `ascentia-inquiries/` dengan **seluruh** modulnya. Jangan hanya mengganti `ascentia-inquiries.php`.
3. Upload melalui WP-Admin, pilih replace plugin yang sama; tidak perlu uninstall untuk update. Default uninstall mempertahankan data, tetapi jangan mengandalkannya sebagai backup.
4. Konfigurasi penerima email dan FluentSMTP. Jalankan satu test enquiry yang jelas bertanda TEST, ke mailbox terkontrol, setelah mendapat persetujuan pemilik.
5. Verifikasi inquiry tersimpan, field RFQ benar, pengajuan ID sama tidak menduplikasi record. Periksa email status pending lalu sent dan penerimaan mailbox, bukan hanya toast frontend.
6. Konfigurasi server cron yang benar untuk akun hosting. Contoh setelah path dikonfirmasi:

```cron
* * * * * cd /path/to/wordpress && wp cron event run --due-now >/dev/null 2>&1
```

Jika WP-CLI tidak tersedia, pakai PHP `wp-cron.php` sesuai hosting. Jangan mengaktifkan `DISABLE_WP_CRON` sebelum cron eksternal terbukti berjalan. Periksa pending/failed notifications dan fitur resend.

## 5. Environment server

| Nama                     | Staging                | Production                                              |
| ------------------------ | ---------------------- | ------------------------------------------------------- |
| `NODE_ENV`               | `production`           | `production`                                            |
| `WORDPRESS_URL`          | CMS staging HTTPS      | CMS production HTTPS                                    |
| `SITE_INDEXABLE`         | `false`                | `true` setelah siap publik                              |
| `ASCENTIA_ANALYTICS_KEY` | Secret staging         | Secret acak kuat; sama dengan setting plugin WP         |
| `CONTACT_TIMEOUT_MS`     | `30000`                | `30000`, ubah hanya berdasarkan timeout host            |
| `HOST` / `PORT`          | Sesuai service manager | Ikuti Passenger/reverse proxy; jangan paksa port publik |

Jangan memakai `VITE_WP_API_BASE_URL`/`VITE_WC_API_BASE_URL` sebagai pengganti `WORDPRESS_URL`. Jangan memasukkan WordPress password, WooCommerce secret, analytics secret ke `VITE_*`.

Aset dan rich text WordPress harus memakai HTTPS origin CMS yang benar. Migrasi URL database hanya dengan backup dan prosedur search-replace WordPress yang memahami serialized data; bukan replace SQL mentah.

## 6. Upload release baru, jangan menimpa release aktif

1. Build/upload ke folder privat baru, misalnya `releases/<release-id>/`. Salin seluruh `.output/server` dan `.output/public`, termasuk `.br` dan `.gz`.
2. Jika memakai `pnpm start`, sertakan `package.json` agar script tersedia. Jangan meng-upload source/secret ke document root yang dapat diunduh publik.
3. Verifikasi artifact hash/kelengkapan. Request HTML dari proses lama harus tetap mendapat CSS/JS hash release lama sampai switch selesai; jangan menghapus public assets yang masih dipakai proses lama.
4. Uji pada staging domain/temporary internal port. Periksa `.css` bukan HTML/error dan JS tidak 404. Bandingkan `Content-Encoding` gzip/Brotli dan hasil decoding.
5. Switch application root/symlink sesuai kemampuan hosting, lalu restart aplikasi secara terkontrol. Jika panel tidak mendukung atomic switch, jadwalkan maintenance/restart; jangan mengganti file satu per satu pada proses hidup.
6. Simpan release sebelumnya dan aset yang diperlukan klien lama selama masa transisi. Kebijakan retensi asset lama harus cocok dengan CDN/cache dan cara hosting mengarahkan asset; browser tab lama mungkin masih meminta lazy chunk lama.

### Startup menurut hosting

- **Node service biasa:** `pnpm start` atau `node .output/server/index.mjs`, dikelola process manager/systemd/platform. Jangan bergantung pada terminal SSH tetap terbuka.
- **cPanel/Passenger:** entry `app.js` lokal hanya dynamic-import Nitro ESM. Startup wrapper tersebut belum terbukti kompatibel pada akun hosting pengguna. Beberapa versi Passenger membutuhkan CommonJS `app.cjs`; gunakan hanya bila panel mendukung dan smoke test berhasil.

Contoh wrapper CommonJS bila diminta hosting:

```js
process.env.NODE_ENV ||= 'production'
import('./.output/server/index.mjs').catch((error) => {
  console.error(error)
  process.exit(1)
})
```

Jangan menulis wrapper/startup baru pada hosting tanpa memastikan panel, Node version, routing, dan mekanisme restart. `pnpm preview` bukan pengganti production process manager.

## 7. Staging acceptance pada origin sebenarnya

1. Home, About, katalog/filter/page 2, product detail, news/blog detail, contact, `/id` dan reload direct URL.
2. Search keyboard/mobile, galeri/lightbox, quote dialog, language switch; periksa console, network 4xx/5xx dan gambar rusak.
3. Satu enquiry dan RFQ terkontrol: cek WordPress record, notification queue, mailbox; simulasi retry hanya di fixture/staging aman.
4. Network lambat, API unavailable, page refresh, Back/Forward, map blocked, malformed input; jangan flood production untuk menguji rate limit.
5. `SITE_INDEXABLE=false` harus menghasilkan noindex pada staging. Jangan mengirim sitemap staging ke Search Console. Lindungi staging dengan autentikasi bila ada konten/data privat; noindex bukan kontrol akses.
6. Domain production: canonical/OG/sitemap benar, status 404 asli, legacy 301 benar, media HTTPS, robots policy sesuai. Setelah go-live `SITE_INDEXABLE=true`, pastikan `X-Robots-Tag`/meta noindex hilang dari halaman indexable.
7. Lighthouse mobile minimal tiga run dan desktop dengan kondisi sama. Catat median; jangan klaim “semua aman” dari skor 100. Accessibility contrast/keyboard tetap diperiksa.

## 8. Go-live

1. Pastikan blocker beres, backup dan rollback siap, pemilik menyetujui maintenance/switch.
2. Deploy artifact yang sama dengan staging acceptance; jangan build ulang tanpa alasan sehingga yang dirilis beda dari yang diuji.
3. Switch Node/frontend origin, set environment production, restart, verifikasi langsung pada HTTPS domain publik.
4. Cek media CMS dan server-side WordPress fetch tidak mengarah localhost/frontend sendiri.
5. Buka cache/CDN purge secara terarah bila perlu; jangan menghapus asset hash lama sebelum kompatibilitas klien lama ditangani.
6. Periksa HTTP status, error log, enquiry/mail, noindex/canonical/sitemap setelah deploy dan setelah restart cold. Monitor 5xx, timeout CMS, antrean email, lonjakan request.

## 9. Rollback

1. Bila 5xx, aset hilang, inquiry gagal tersimpan, atau regresi berat, hentikan rollout dan alihkan kembali ke folder release sebelumnya; restart proses sesuai manager hosting.
2. Pulihkan konfigurasi environment yang cocok dengan release sebelumnya. Jangan mencatat secret dalam log/chat.
3. Jika plugin baru penyebabnya, kembalikan file plugin sebelumnya tanpa menghapus inquiry database. Jangan restore database menyeluruh yang akan menimpa inquiry baru tanpa rencana rekonsiliasi dan persetujuan.
4. Verifikasi home, satu detail produk, search, dan contact storage/mail secara terkontrol sesudah rollback. Simpan log/artifact gagal untuk diagnosis.

## Informasi yang masih perlu dari pemilik

- Domain frontend production dan origin CMS.
- Nama hosting/interface cPanel Node yang tersedia; Node version dan startup controls.
- Mekanisme deploy: upload manual atau Git/CI, akses staging, cron/SMTP.
- Penerima test email, waktu go-live, siapa menyetujui rollback.

Tidak ada secret yang perlu dikirim lewat chat; masukkan melalui environment manager hosting.
