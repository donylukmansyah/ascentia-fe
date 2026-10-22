# Security review: PHP2Shell, Node frontend, WordPress backend

Tanggal pemeriksaan: 21 Oktober 2026. **Status: belum layak disebut aman untuk rilis.** Tidak ada bukti eksploitasi/kompromi yang dikumpulkan; ditemukannya versi rentan bukan bukti server telah diretas.

Snapshot HEAD `e2f1ca48c931660f1b063c7074e30bee67fca151`; SHA-256 `pnpm-lock.yaml` `c59a416547b6a402ba1e73c051cd2da86b6ae3de58041ac3eb665eb49b52b365`.

Bukti terstruktur: [security-evidence.json](2026-10-21-security-evidence.json). Verifikasi sumber PHP: [php2shell-source-verification.md](2026-10-21-php2shell-source-verification.md).

## 1. Apakah berita PHP2Shell benar?

Cerita inti **terkonfirmasi** di PHP.net dan rekaman CVE, bukan hanya salinan teks pengguna:

- `CVE-2026-109618`: RCE via OOM corruption.
- `CVE-2026-109619`: RCE via stale global state.
- Rilis perbaikan 21 Oktober 2026: **PHP 8.2.35 / 8.3.36 / 8.4.27 / 8.5.12**. Gunakan versi supported yang sudah memuat fix tersebut atau lebih baru, atau paket vendor dengan backport terdokumentasi. [1][2][3]
- Advisory PHP mencakup instalasi web PHP-FPM, Apache mod_php, php-cgi, FrankenPHP, dan LiteSpeed; tingkat risiko bergantung jalur/configuration. Bukan hanya aplikasi yang secara eksplisit memanggil `session_start()`. [1]
- PHP menyatakan tidak ada mitigasi lengkap pengganti patch. Hanya update WordPress/plugin atau WAF tidak memperbaiki engine PHP. Pembaruan harus diikuti restart seluruh worker terkait. [1]
- Angka “70% Internet” adalah klaim prevalensi ekosistem, **bukan** pengukuran bahwa 70% semua layanan bisa langsung dieksploitasi, dan bukan probabilitas situs ini diretas.

Tidak ada payload PHP2Shell dijalankan, baik di production maupun lokal. Tidak ada nomor fixed version yang ditentukan dari tebakan.

## 2. Mengapa Node.js frontend tidak cukup?

Dua runtime tetap ada:

```text
ascentia.co.id        Frontend Node.js
cms.ascentia.co.id    WordPress / PHP / database / uploads
```

Menaruh PHP pada subdomain tidak membuat endpointnya privat. Request langsung ke CMS, login, REST, upload, plugin PHP, atau salinan PHP di document root lama tetap dapat mencapai PHP bila routing mengizinkan.

**Jika kedua aplikasi berjalan sebagai user cPanel yang sama**, pengambilalihan proses PHP dapat memungkinkan akses file frontend, source, environment/file secret, atau database sejauh izin OS/user itu mengizinkan. Folder berbeda dan subdomain berbeda **bukan isolasi keamanan**. Blast radius tepat bergantung permission/provider, belum diuji.

`noindex`, canonical, CORS, dan mengganti tema menjadi headless bukan firewall:

- `noindex` hanya arahan indexing; tidak menolak request penyerang.
- CORS adalah pembatas browser, bukan kontrol akses HTTP untuk bot/server lain.
- Node yang mengambil data dari WP tidak otomatis menyembunyikan origin WP.
- Instalasi WordPress/PHP lama di `public_html` tidak otomatis berhenti menjalankan `.php` hanya karena Node dipasang; routing sebenarnya perlu diverifikasi.

## 3. Bukti hosting yang diperoleh secara pasif

Hanya tiga request HEAD HTTPS biasa; tidak memindai direktori, mencoba login, mengirim multipart, atau memicu error:

| URL diminta                           | Hasil                              | Keterangan                                                  |
| ------------------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| `https://ascentia.co.id/`             | HTTP 200                           | `Server: LiteSpeed`, `X-Powered-By: PHP/7.4.33`             |
| `https://cms.ascentia.co.id/`         | berakhir di domain utama, HTTP 200 | Pada saat audit CMS root masih redirect ke `ascentia.co.id` |
| `https://cms.ascentia.co.id/wp-json/` | HTTP 200 pada CMS                  | `X-Powered-By: PHP/7.4.33`, `X-Robots-Tag: noindex`         |

TLS certificate validation berhasil. HSTS dan `X-Content-Type-Options: nosniff` ada. CSP, X-Frame-Options, Referrer-Policy tidak terlihat pada respons final yang diperiksa. Absennya header bukan bukti exploit; CSP perlu disusun/test terhadap SSR, map, font, media, bukan ditempel ketat sembarangan.

**Interpretasi:** header menunjukkan deployment mengiklankan PHP **7.4.33**, cabang tanpa dukungan upstream. Header bisa disembunyikan/stale dan paket vendor dapat membawa backport, sehingga exact executable/build/backport tetap perlu dikonfirmasi hosting. Sampai ada bukti vendor, jangan menganggap patched. Jangan menyimpulkan “tidak terdampak” hanya karena advisory cabang maintained mencantumkan 8.2–8.5.

PHP lokal CLI terverifikasi **8.2.29**, di bawah fixed release 8.2.35; itu bukan bukti versi web handler hosting. Periksa runtime web LSAPI/FPM setiap domain, bukan hanya `php -v` SSH. Tidak membuat `phpinfo.php` publik karena dapat membocorkan environment/configuration.

## 4. Audit dependency Node

Perintah:

```bash
pnpm audit --json
pnpm audit --prod --json
pnpm why seroval
```

Registry mengembalikan:

| Scope                            | Critical | High | Moderate | Low |
| -------------------------------- | -------- | ---- | -------- | --- |
| Semua dependency                 | 1        | 4    | 7        | 1   |
| Dependency diklasifikasikan prod | 1        | 3    | 5        | 1   |

Angka adalah advisory/package-tree findings, bukan jumlah exploit aktif. `--prod` mengikuti penempatan package.json; project menempatkan sebagian build/dev tools di dependencies. Beberapa advisory satu package dihitung terpisah, dan Vite/launch-editor dapat merepresentasikan isu upstream yang sama.

### High priority: `sanitize-html@2.18.0`, runtime nyata

- Advisory `CVE-2026-113650`, `GHSA-c9rx-x947-fp3h`; perbaikan **>=2.18.1** menurut advisory saat audit. [6]
- Dipakai `src/features/products/api/product-mapper.ts:163`, `src/features/articles/api/article-mapper.ts:230`, dan `src/lib/seo-content.ts`.
- Ada dalam `.output/server/_libs/sanitize-html.mjs`.
- Regresi terhadap **fungsi product sanitizer asli** dengan input terbatas dalam proses Node lokal menghasilkan `RangeError: Maximum call stack size exceeded`.
- Dampak: HTML malformed dari CMS dapat menggagalkan rendering/query dan memakan CPU. Public visitor tidak otomatis bisa memasok HTML ke CMS; perlu jalur konten tidak tepercaya/editor/API kompromi. Ini **DoS, bukan bukti RCE Node**.
- Remediasi: update terarah minimal versi fixed, lockfile, sanitizer regression, build + E2E ulang. Jangan sekadar `try/catch` lalu mengklaim dependensi sudah aman.

Pemeriksaan sengaja merah:

```bash
node scripts/verify/verify-security-sanitizer.mjs
```

Tidak mengirim input tersebut ke endpoint web.

### Critical registry: `seroval@1.5.6`, jalur devtools

- `GHSA-p6vx-979v-rg4c`/`CVE-2026-104846` critical, fixed >=1.6.2. `GHSA-jp82-f5mq-hwhp`/`CVE-2026-104845` high, fixed >=1.6.3. [4][5]
- Versi 1.5.6 berasal dari `@tanstack/react-devtools → @tanstack/devtools → solid-js → seroval`.
- Jalur framework TanStack Start/router memakai **seroval 1.6.8**. Existing SSR artifact memiliki ArrayBuffer type guard pada `deserializeTypedArray`, tidak menunjukkan fungsi rentan versi lama itu.
- Root UI devtools hanya dirender saat `import.meta.env.DEV`. Pemeriksaan 62 file JS browser menemukan string seroval pada chunk `createServerFn-*.js`, sebagaimana wajar untuk serializer framework; string itu tidak membuktikan versi 1.5.6 ikut terkirim. Jangan menyamakan deteksi nama library dengan bukti fungsi rentan reachable.
- **Tidak ada bukti RCE production Ascentia lewat seroval**. Perlu update/remove devtools dari production dependency graph dan fresh build tracing; jangan mengalikan registry severity menjadi klaim “website bisa diretas sekarang”.

### High/moderate tooling: Vite, launch-editor, braces

- Installed Vite **8.3.2**; beberapa advisory merekomendasikan **>=8.3.3**; launch-editor **>=2.14.2**.
- Jalur braces **3.0.3** melalui `shadcn → fast-glob → micromatch`; advisory tidak mencantumkan versi patched yang tersedia (`<0.0.0`). Jangan mengarang `pnpm update braces` pasti selesai; cek update upstream/isolasi CLI.
- Risikonya terutama development tooling/middleware/CLI dengan prasyarat tertentu, bukan bukti Nitro production mengekspose Vite editor endpoint.
- Jangan expose `pnpm dev`, `vite --host` tanpa kontrol, atau `pnpm preview` sebagai service production.

Tidak dilakukan `pnpm audit --fix`, perubahan lockfile, upgrade massal, atau reinstall package dalam audit ini.

## 5. Custom PHP plugin: hasil source review

Semua 14 file PHP repo plugin dibaca dan syntax-lint PHP 8.2.29 lolos. Syntax lolos tidak menguji PHP2Shell. Mu-plugin lokal juga diperiksa; versi inquiry lokal berbeda dari package deploy.

### Medium: anonymous write workload tanpa batas yang memadai

`ascentia-inquiries/includes/rest-contact.php:7–25` menerima public contact dengan honeypot. Handler tidak membatasi panjang field/body/rate request; `email.php:37–45` menambah payload metadata dan cron/email setiap submission.

Form contact publik wajar tidak login. Masalahnya bot dapat melewati frontend, meninggalkan honeypot kosong, mengubah ID, dan menulis berkali-kali. Zod Node punya limit, tetapi tidak melindungi **direct WP endpoint**.

Remediasi: server-side length/body limit dan rate/burst limit di ingress Node **dan** WP. WAF/captcha sebagai defense in depth. Jangan menganggap idempotency key pengganti anti-spam. Pengujian flood tidak dilakukan.

### Medium: inquiry PII memakai capability artikel biasa

`ascentia-inquiries/includes/post-type.php:34–35` memakai `capability_type: post` dan normal mapping. Editor yang berhak mengelola post dapat juga memperoleh akses inquiry berisi email/telepon/pesan. Bukan anonymous data leak; perlu pastikan role sesuai kebutuhan. Gunakan capability inquiry khusus jika data hanya untuk sales/admin.

### Low: analytics auth fail-open jika key kosong

`includes/rest-analytics.php:23–32`: key kosong berarti check dilewati. Direct POST dapat memalsukan counter dan menambah kerja database. Kunci nonempty memakai `hash_equals`, baik. Isi key secret di Node dan WP; arahkan implementasi menolak write ketika key tidak dikonfigurasi.

### Medium integrity: insert gagal tetap dibalas sukses

`includes/rest-contact.php:69–87` memanggil `wp_insert_post` default kemudian hanya `is_wp_error`. ID 0 dapat lolos. Safe PHP stub yang sudah ada mereproduksi `success: true, id: 0` tanpa database/email. Frontend sekarang menolak ID 0, tetapi endpoint WP tetap salah.

Remediasi: error mode `WP_Error` dan validasi positive ID, uji jalur persist/queue gagal.

### Low reliability: idempotency lock fallback

`includes/helpers.php:51`, `rest-contact.php:49`: error/unavailable `GET_LOCK` menjadi null; processing dilanjutkan. Post-meta lookup tidak memiliki unique constraint. Risiko duplicate pada concurrency; bukan RCE. Pastikan lock support hosting/fail closed untuk jaminan dedup.

### Praktik baik

- Named-lock SQL memakai placeholder.
- Output inquiry admin di-escape.
- Resend memeriksa capability dan nonce.
- Inquiry tidak diekspos lewat REST post type publik.
- Rich text frontend disanitasi allowlist; JSON-LD meng-escape `<`.
- Input Node contact divalidasi server-side; response acknowledgment juga divalidasi.
- Tidak ditemukan confirmed SQL injection/stored XSS/admin CSRF dalam source yang diperiksa. Ini bukan pembuktian seluruh kemungkinan bug tidak ada.

### Versi plugin lokal tidak sama dengan package deploy

Lokal ada `wp-content/mu-plugins/ascentia-inquiries.php` versi **2.4.0**, sedangkan repo `ascentia-inquiries/` versi **2.5.0**. Versi lokal lama bahkan tidak menggunakan named-lock dedup yang ada pada 2.5.0. Jangan mengaktifkan kedua entry sekaligus karena nama fungsi sama dapat menyebabkan fatal redeclaration; tentukan satu jalur deployment, backup lalu migrasi terkontrol.

`ascentia-bilingual-fields.php` mendaftarkan ACF/REST tambahan dari **kode**, bukan hanya database. Inilah alasan perbandingan SQL saja tidak membuktikan semua field/plugin sama di hosting. Tidak ditemukan operasi write publik tambahan pada file bilingual tersebut.

## 6. Risiko operasi yang relevan untuk struktur cPanel saat ini

1. **Public backup ZIP/SQL:** screenshot sebelumnya menunjukkan `backup-ascentia.zip` dan arsip lain di `public_html`. Tidak mencoba mendownloadnya. Jika tidak diblokir server, file itu dapat membocorkan database/configuration/secret. Pindahkan backup ke storage privat di luar document root, verifikasi akses ditolak. Jangan hanya mengganti nama menjadi sulit ditebak.
2. **Credential screenshot:** password DB pernah terlihat dalam screenshot. Tidak disalin ke report. Rotasi terkontrol melalui cPanel dan update semua `wp-config.php` konsumen credential bersangkutan, restart/tes; jangan mengganti DB password tanpa memperbarui konfigurasi.
3. **Shared account:** CMS di `/public_html/cms.ascentia.co.id` tetap berada di account/permission yang sama. Jika perlu containment, gunakan user/container/account berbeda, akses DB minimum, dan reverse proxy terkontrol. Memindah folder tanpa boundary izin tidak cukup.
4. **Noindex CMS:** sebelum mencentang global noindex WP, periksa `yoast_head_json.robots`: frontend memakai nilai robots dari Yoast. CMS noindex yang dipropagasikan ke API dapat membuat frontend ikut noindex walau `SITE_INDEXABLE=true`. Ini SEO correctness, bukan patch keamanan; jangan mengandalkan noindex untuk menyembunyikan CMS.
5. **PHP lama:** cek kedua domain dan seluruh salinan WordPress yang masih reachable; patch hanya runtime CMS tidak cukup bila PHP lama masih hidup pada domain utama/salinan.
6. **Plugin/theme pihak ketiga:** lokal terdeteksi WooCommerce 6.9.5, Smush 3.13.1, LiteSpeed Cache 6.5.0.1, ACF 6.8.10, Yoast 28.6, Wordfence 9.0.2. Inventory lokal, bukan daftar active plugins hosting. Belum dilakukan advisory mapping lengkap semua plugin/theme. Jangan menganggap update PHP menggantikan update plugin atau sebaliknya.

## 7. Prioritas tindakan

1. **Sebelum go-live:** minta hosting mengonfirmasi exact web PHP package/build, patch kedua CVE/backport, restart semua LSAPI/FPM workers dan OPcache sesuai prosedur vendor. Target supported patched branch, tes kompatibilitas salinan WP. PHP 7.4.33 upstream EOL tidak boleh diterima tanpa bukti layanan extended-security vendor yang relevan.
2. Bila patch belum tersedia, minta isolasi/restriksi akses PHP/CMS di edge/proxy, pertahankan jalur API Node dan admin sesuai kebutuhan. WordPress plugin auth berjalan setelah engine mulai memproses request; bukan mitigasi penuh engine bug. Jangan memblokir semua wp-json lalu merusak katalog.
3. Upgrade terarah dependency Node yang terkena; paling nyata runtime `sanitize-html >=2.18.1`. Perbarui devtools/seroval dan Vite/editor sesuai advisory; retest build, input validation, SSR, E2E dan audit ulang.
4. Perbaiki batas/abuse contact, analytics fail-open, error penyimpanan plugin, dan permission inquiry sesuai role. Sinkronkan package plugin deploy dan mu-plugin; jangan menduplikasi entry.
5. Pindahkan backup publik, rotasi credential yang terekspos, terapkan least privilege dan review log akses/worker/memory errors dengan hosting.
6. Jika ada indikasi kompromi, isolasi dahulu, simpan log/snapshot, libatkan hosting/incident response, rotasi credential setelah containment. Tidak ada dasar dalam audit ini menyatakan insiden sudah terjadi atau tidak terjadi.

Pesan ke support hosting:

> Mohon konfirmasi versi lengkap dan build vendor PHP web handler (LiteSpeed LSAPI/FPM) untuk ascentia.co.id dan cms.ascentia.co.id. Respons publik saat ini mengiklankan PHP/7.4.33. Apakah CVE-2026-109618 dan CVE-2026-109619 sudah dipatch/backport? Mohon referensi advisory paket vendor, update ke cabang supported patched, restart seluruh worker terkait, dan konfirmasi tidak ada pool/runtime PHP lama yang masih melayani domain ini. Jika belum tersedia, mohon mitigasi dan pembatasan akses sementara sesuai advisory PHP.

## 8. Pemeriksaan dan batas

Dijalankan: audit npm semua/prod, dependency path, pembacaan source Node/custom PHP, 14 PHP syntax checks, actual product sanitizer repro lokal, insertion-failure stub, 10 unit files (lolos), boundary cache/contact (lolos), TypeScript dan ESLint (lolos), tiga HEAD HTTPS.

Tidak dilakukan: exploit RCE, upload/multipart ke production, request flood, login admin, pembacaan file hosting/secret, pemindaian malware, PHP-FPM pool interrogation, paket vendor/backport validation, semua WordPress plugin/theme third-party review, perubahan aplikasi/dependency/hosting.

**Kesimpulan:** stack Node + PHP tetap valid, tetapi security harus diterapkan pada keduanya. “Headless” bukan “PHP tidak terjangkau”. Tes fungsi/lighthouse hijau tidak membuktikan keamanan engine atau dependensi.

## Referensi primer

1. PHP advisori: https://www.php.net/archive/2026.php#2026-10-21-5
2. CVE-2026-109618: https://cveawg.mitre.org/api/cve/CVE-2026-109618
3. CVE-2026-109619: https://cveawg.mitre.org/api/cve/CVE-2026-109619
4. Seroval critical: https://github.com/advisories/GHSA-p6vx-979v-rg4c
5. Seroval memory exhaustion: https://github.com/advisories/GHSA-jp82-f5mq-hwhp
6. sanitize-html: https://github.com/advisories/GHSA-c9rx-x947-fp3h
7. PHP supported versions: https://www.php.net/supported-versions.php
8. Artikel Wiz: https://www.wiz.io/blog/php2shell-php-rce
