# Audit arsitektur dan optimasi Ascentia

Baseline: `0105ac0167600baa89665479f9f96f6b4f8110ba`, branch `feat/products`.
Status: audit dan rekomendasi; **belum ada perubahan kode aplikasi, penghapusan, upgrade dependency, atau pengaturan WordPress**.

## Cakupan dan batas bukti

- Seluruh **136 file `src/`, 13.788 baris**, dibaca sampai akhir melalui pembagian area audit; termasuk tes, CSS, dan route tree generated. Generated file hanya diperiksa, tidak diedit.
- Seluruh **26 skrip verifikasi (2.160 baris)** dan **35 dokumen (3.343 baris)** dibaca. Konfigurasi root, manifest, versi dependency terpasang diperiksa; lockfile diperiksa untuk resolusi/relasi dependency, bukan dibaca sebagai logika aplikasi.
- Source plugin lokal `ascentia-inquiries/ascentia-inquiries.php` diperiksa; belum tracked. ZIP bukan source tambahan dan tidak dieksekusi.
- Aset gambar/video/font, seluruh source dependency, admin WordPress, hosting produksi tidak diaudit menyeluruh. Tidak ada bukti profiling React untuk mengklaim semua render optimal.
- **Browser** berarti direproduksi pada Chromium lokal. **Harness** berarti source aktual diuji dengan dependency/network terisolasi. **Statis** berarti alur source terbukti, belum diuji end-to-end.

## Kesimpulan

Struktur feature-first layak dipertahankan. **Tidak perlu rewrite atau memindahkan semua helper ke satu folder.** Masalah utama ada pada ownership cancellation, penanganan error, beberapa interaksi aksesibilitas, dan kontrak CMS/deployment; bukan kekurangan jumlah abstraction.

Pemindaian import berbasis TypeScript AST: 135 file TS/TSX, 255 edge runtime lokal, 40 edge type-only; tidak menemukan siklus runtime maupun import `components/hooks/lib` ke `features/routes`. Ini bukti pemindaian import statis/dynamic-literal, bukan jaminan semua relasi runtime.

## Peta codebase dan aliran data

| Pemilik                              | Alur dan tanggung jawab                                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/router.tsx`                     | Membuat QueryClient di dalam `getRouter`, router context, SSR Query integration, preload intent. Bukan QueryClient global lintas pengunjung.                                  |
| `src/routes/`                        | Identitas URL, params/search tervalidasi, loader, head, error/not-found; memilih feature page. `__root.tsx` mengomposisi shell dan fitur pencarian.                           |
| `features/products/api`              | Query options membentuk key/request; GET server function memvalidasi input; source server memakai origin WordPress, timeout/cache; mapper memvalidasi data dan sanitasi HTML. |
| `features/products/pages/components` | Page mengomposisi filter, query, pagination, detail; komponen merender model frontend. ProductCard, carousel, gallery bukan primitive bebas konteks.                          |
| `features/articles`                  | Satu domain editorial untuk News/Blogs. Query/serverFn/source/mapper; kategori memilih tampilan. Detail menerima model tersanitasi, bookmark lokal, sharing.                  |
| `features/search`                    | Root memegang buka/tutup dan shortcut; dialog debounce 300 ms; tiga query ber-key grup+teks; source memanggil reader products/articles. Tidak perlu fetch stack baru.         |
| `features/contact`                   | Form dipakai Home/Contact; POST serverFn memvalidasi; source memanggil endpoint inquiry WP. Plugin menyimpan inquiry lalu mengirim notifikasi.                                |
| `features/home`                      | Hero/ticker/introduction masih constants/default; marquee brand dan featured products sudah memakai query produk. ACF Home yang dibuat di admin belum dikonsumsi hero.        |
| `features/about`                     | Company, offices, partners, customers, gallery, statistics masih constants; count-up hook lokal. Contact memakai section lokasi About.                                        |
| `components/layout`                  | Header, footer, social dock, loading, 404. Tidak memiliki mapper CMS.                                                                                                         |
| `components/ui`                      | Base UI wrappers, CTA, Reveal, PageHero, marquee, lightbox, pagination, map. Reuse sudah nyata; pertahankan.                                                                  |
| `lib` / `hooks`                      | Cache, fuzzy matching, SEO, utilitas; sticky-header hook. Jangan tempatkan aturan produk/editorial di sini.                                                                   |

```text
URL/search/slug
  Route loader + queryOptions
  QueryClient (SSR hydration / client cache)
  createServerFn + validasi
  source.server + public process cache + timeout
  WordPress REST / WooCommerce Store API
  mapper + validasi bentuk + sanitasi HTML
  model frontend
  feature page / komponen
```

- Listing produk: route search dipakai bersama oleh loader dan page; taxonomy menentukan filter. Detail menambah lookup `wp/v2/product` untuk ACF lalu membaca Store API.
- News: Featured Events, Popular, Latest memakai query terpisah. Blogs memakai pagination URL. Detail memulai query related setelah identitas artikel tersedia.
- Cache client dan server punya tugas berbeda: hydration/interaksi versus mengurangi hit WP antarpengunjung. Tidak otomatis duplikasi buruk. TTL server umum 60 detik, taxonomy 5 menit; belum ada invalidasi dari admin.
- CMS update **tidak dijamin langsung terlihat**: cache WP, cache proses, Query cache, serta trigger refetch ikut menentukan. Tidak ada cache bersama antar-node.

## Temuan prioritas

| Prioritas | Bukti                                                                                  | Masalah dan tindakan minimal                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tinggi    | **Harness**, `src/lib/cache.ts:17`                                                     | Shared promise memakai signal pemanggil pertama. Abort pemanggil itu menolak dua subscriber meski signal kedua aktif. Pisahkan lifetime pekerjaan bersama dari pembatalan subscriber; timeout source tetap diperlukan.             |
| Tinggi    | **Harness**, `src/routes/news/$slug.tsx:57`, `src/routes/blogs/$slug.tsx:57`           | Related memakai Suspense sebelum artikel dirender; error/kelambatan related menghalangi artikel. Retry hanya reset detail. Jadikan related nonkritis; retry target query yang gagal.                                               |
| Tinggi    | **Browser**, `src/components/layout/site-header/index.tsx:71–90`                       | Buka menu di 390px, resize ke 1280px: `body.style.overflow` tetap `hidden`. Tutup menu saat masuk breakpoint desktop; pertahankan restore overflow.                                                                                |
| Tinggi    | **Browser**, header `:260–284`                                                         | Setelah menu mobile terbuka, Tab mencapai konten About/map di belakang overlay. Gunakan mekanisme modal/focus dari dependency existing, bukan focus trap manual baru.                                                              |
| Sedang    | **Browser**, `features/articles/pages/article-detail-page.tsx:28–32`                   | Clipboard ditolak: tombol tetap `Copied!`, muncul pageerror. Await/catch, cek API tersedia, status sukses hanya setelah sukses; timer dibersihkan.                                                                                 |
| Sedang    | **Harness**, `features/products/pages/product-listing-page.tsx:156–175,263`            | Fuzzy fallback gagal, tetapi `hasFallback=false`; UI memakai status direct-query kosong dan menyembunyikan error/retry fallback. Pisahkan pemilihan sumber aktif dari hasil suksesnya.                                             |
| Sedang    | **Harness state**, `features/products/pages/product-detail-page.tsx:49–51,95`          | Related disabled saat brand kosong, tetapi `isPending=true`; skeleton tidak selesai. Bedakan disabled, loading aktual, kosong, error.                                                                                              |
| Sedang    | **Harness**, `features/articles/api/article-source.server.ts:120–144` dan validator/UI | Show More meminta prefix makin panjang, server membatasi 100. Total 101: request 100/104/108 tetap 100 item dan `hasMore=true`. Gunakan pagination sebenarnya, jangan download ulang seluruh prefix.                               |
| Sedang    | **Browser**, `features/about/components/partners/partners-section.tsx:88–90`           | Reduced motion memilih scroll `auto`, return sebelum commit selection. Next mengubah scroll 1652 menjadi 1926, foto aktif tetap sama. Commit state pada jalur nonanimasi juga.                                                     |
| Sedang    | **Browser**, `features/about/components/gallery/gallery.tsx:98–105`                    | Motion memberi figure `tabindex=0`, tetapi Enter tidak membuka dialog; klik membuka. Gunakan native button opener. Koreksi audit statis: bukan sepenuhnya tak bisa difokuskan, melainkan aktivasi/semantik keyboard tidak lengkap. |
| Sedang    | **Browser**, `features/products/components/product-card.tsx:16,55`                     | Link fokus-visible memiliki outline none, tanpa shadow link/article. Ring `group-focus-visible` terpasang di pemilik group sendiri. Perbaiki indikator fokus.                                                                      |
| Sedang    | **Harness**, `features/articles/components/article-bookmarks.ts:30–41`                 | N subscriber membuat N storage listener; tiap listener menotifikasi N subscriber. 10 subscriber menghasilkan 100 callback, 100 menghasilkan 10.000. Cleanup nol listener: bukan kebocoran permanen. Satu listener bersama cukup.   |

### Kontrak, keamanan, dan isu lain

- **Identitas editorial (statis):** news detail tidak membatasi kategori; blog detail fallback ke slug tanpa kategori (`article-source.server.ts:175–180,281–303`). Post bisa hadir di dua keluarga URL, masing-masing canonical sendiri. Sepakati policy News/Blogs sebelum mengubah alias atau redirect.
- **CMS HTML (harness):** artikel membuang script/event handler dan membatasi iframe/scheme, tetapi class arbitrer seperti `fixed inset-0 z-50` masih lolos. Perketat allowlist class sesuai janji CMS tidak mengendalikan layout; tidak ada klaim XSS terbukti.
- **Fuzzy purity (harness):** `product-listing-page.tsx:122,127` memutasi Set dalam `useMemo`. Render yang dibatalkan dapat memengaruhi saran berikutnya. Hindari mutasi history pada fase render; tidak perlu memo tambahan tanpa pengukuran.
- **Sticky state (statis):** listing dan header masing-masing menjalankan `useStickyHeader`; header punya pause dropdown/search, listing tidak. Offset dapat berbeda. Dua listener bukan otomatis leak; gunakan state header/CSS existing bila menyatukan posisi.
- **Motion/map (statis):** beberapa transition menyebut `transform` saat Tailwind v4 mengubah `translate`; popup close saat pindah marker bisa memfokuskan marker lama; ticker loop/pause keyboard dan preferensi reduced-motion dinamis belum konsisten. Perbaiki terpisah setelah tes terarah.
- **Popular News (kontrak):** query sebenarnya tanggal terbaru, bukan metrik popularitas. Rename atau tentukan sumber metrik; jangan menambah visitor counter tanpa kebutuhan dan kebijakan privasi.
- **SEO (statis):** `lib/seo.ts` memilih origin berbeda di browser/SSR; origin staging dapat menghasilkan canonical berbeda setelah hydration. Semua gambar diberi metadata PNG 1200×630 meski gambar CMS dapat berbeda. Konfigurasi origin canonical konsisten; metadata ukuran/MIME hanya bila diketahui.
- **ACF produk (kontrak):** dokumen menyebut summary/description/benefits/video/brochure/hero ACF; mapper sekarang memakai deskripsi WooCommerce, specs/applications ACF. Sinkronkan model yang disetujui, bukan menambah field tak dipakai.

### Plugin inquiry: tahan sebelum produksi

Source PHP masih lokal, bukan bagian commit frontend. Tidak ada test yang mengirim email sungguhan pada audit ini.

- `:152–161`: `wp_insert_post` tanpa `$wp_error=true` bisa menghasilkan `0`; pemeriksaan hanya `is_wp_error` melewatkan gagal simpan. **Statis/API contract**, PHP belum dieksekusi.
- `:170–171`: penerima email testing tetap dikonfigurasi. Konfirmasi penerima produksi; tidak menyatakan data sudah bocor di deployment.
- `:122,133–139`: endpoint publik tanpa pembatasan laju/besar input lokal; honeypot tidak dikirim form. `trim` array dapat TypeError. Proteksi infrastruktur belum diperiksa.
- Frontend (`contact-api.ts`, `contact-form.tsx`): input dipotong diam-diam; response HTTP 200 `{success:false}` tetap dianggap sukses dan form dibersihkan. Tolak panjang berlebih secara jelas; validasi response sebelum menghapus input.
- Penyimpanan inquiry dan pengiriman email berbeda. `wp_mail` gagal tidak selalu berarti pesan hilang bila tersimpan; admin perlu status notifikasi yang jujur.

## Dependency dan deployment

Versi terpasang: React/DOM 19.3.0, Query 5.104.1, Router 1.170.41, Start 1.168.60, Vite 8.3.2, Tailwind 4.3.3, Base UI 1.8.0, Motion 14.0.0, MapLibre 6.13.0; Node lokal 24.14.0.

- README mengarahkan Node 20+, tetapi **Start terpasang mensyaratkan Node >=22.12.0** menurut package manifest. Standarkan runtime sesuai syarat dependency tertinggi; jangan menganggap semua Node 20 cocok.
- README mengarahkan `VITE_WP_API_BASE_URL`/`VITE_WC_API_BASE_URL`; source dan `.env.example` memakai **server-only `WORDPRESS_URL`**. Ini masalah panduan deployment nyata.
- Patch version keluarga TanStack berbeda tidak otomatis tidak kompatibel; peer requirements adapter SSR terpasang cocok. Jangan melakukan upgrade massal hanya untuk menyamakan angka.
- `pnpm audit --prod --json` melaporkan **1 critical + 2 high advisory**. Jalur seroval **1.5.6** melalui devtools/Solid; jalur braces **3.0.3** melalui shadcn CLI. Jalur Router/Start menggunakan seroval **1.6.8**. Kehadiran advisory bukan bukti endpoint aplikasi dapat dieksploitasi; jangkauan runtime perlu diperiksa sebelum memilih upgrade/override.
- shadcn CLI tidak diimport runtime dan layak dievaluasi sebagai devDependency; memindahkan kategori dependency tidak sama dengan memperbaiki kerentanan. Devtools dirender bersyarat DEV; jangan menghapus tooling tanpa memeriksa hasil build.
- Build lulus dengan peringatan chunk besar dan directive dependency. Map chunk sekitar 1,06 MB mentah; sudah terpisah, bukan bukti map diunduh semua halaman. Ukur network/navigation sebelum lazy-load tambahan. SearchDialog masih static import di root; calon lazy-load hanya bila pengukuran mendukung.

## Reuse dan penghapusan aman

**Pertahankan:** feature ownership, query-option factories, route search, model/mapper, sanitize-html, lightbox, marquee, PageHero, data navigasi bersama. Render ulang akibat mengetik, ganti slide, query selesai, count-up memang diperlukan. Targetnya bukan nol render.

**Reuse yang masuk akal:** request GET WordPress products/articles hampir sama (origin, timeout, classified errors, headers). Setelah regresi error/cancellation tersedia, satu helper server-only kecil di `lib` boleh menghilangkan duplikasi transport; mapper/query/domain tetap terpisah. Jangan sekaligus menyatukan form POST atau memindahkan semua kode ke generic service.

**Kandidat pembersihan, belum dihapus:** `FuzzyMatchResult` tidak memiliki pembaca; `brandsHeroContent.exploreLabel`, partner `sideImage`/dimensi, opsi preview yang tak punya caller. `publishedAt`/`modifiedAt` belum dipakai UI tetapi bagian model; putuskan kontraknya dahulu.

**Bukan sampah:** dummy article masih dipakai tes; file `types` memang type-only; route wrappers/route tree dimiliki framework. Pemindaian tidak membuktikan modul runtime lain aman dihapus. Jangan membuang aset hanya karena tidak muncul sebagai import TypeScript.

## Rekomendasi WordPress: gratis dan ramah mentor

**Koreksi rekomendasi sebelumnya:** Repeater ACF memang Pro, tetapi **tambah item dinamis gratis tetap bisa lewat Custom Post Type (CPT)**, termasuk lewat UI ACF. Empat set field bernomor bukan satu-satunya opsi gratis. [4][5]

| Konten                      | Sumber yang disarankan                                                                                                     | Alur admin                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hero berulang               | CPT **Hero Slides**, satu post per slide                                                                                   | Hero Slides → Add New → isi → Publish                                     |
| Label navigasi slide        | Judul native post, misalnya `Sample Preparation`                                                                           | Nomor 01/02 dihitung frontend; jangan diketik dalam label                 |
| Background slide            | Featured Image / Media Library                                                                                             | Upload atau pilih gambar                                                  |
| Copy/CTA slide              | Satu field group ACF: eyebrow, heading, deskripsi, teks tombol, tujuan; highlight opsional setelah model visual disepakati | Field sama untuk setiap post; tidak ada `slide_1_...`, `slide_2_...` baru |
| Urutan slide                | Satu nilai urutan angka                                                                                                    | Tanpa janji drag-and-drop/plugin tambahan                                 |
| Who We Are + tiga statistik | ACF pada Home existing                                                                                                     | Pages → Home → Update                                                     |
| Customer/Client             | Satu CPT jika satu konsep bisnis                                                                                           | Customers → Add New → nama/logo                                           |
| Partner                     | Sumber terpisah bila copy/foto berbeda; reuse Brand hanya bila semantik benar-benar sama                                   | Hindari dua identitas untuk organisasi yang sama                          |
| Produk                      | WooCommerce existing                                                                                                       | Produk/gambar/gallery/taxonomy existing                                   |
| News/Blogs                  | Posts existing + kategori                                                                                                  | Tidak membuat salinan artikel pada Page Home                              |

- Untuk CPT aktifkan admin UI dan REST; sesuaikan akses/editor role. Public GET hanya item publish; draft tetap untuk editor. Field group publik perlu Show in REST API. [4–6]
- Tujuan CTA boleh path internal atau HTTPS eksternal sesuai kebutuhan; validasi scheme pada trust boundary. Jangan izinkan `javascript:` atau membiarkan CMS mengirim HTML layout.
- Response ACF gambar **tidak otomatis URL karena memilih Image URL**: lokal `/pages/86` mengembalikan attachment ID integer. Mapper perlu resolve media atau menggunakan format REST yang disepakati. [6]
- Migrasi hero: backup/export ACF, salin data existing ke empat post, cek parity isi/urutan/desain; baru hubungkan frontend. **Jangan hapus field lama sebelum data terverifikasi.** Hero frontend saat ini belum membaca sumber ini; jumlah slide lebih dari empat perlu tes layout navigasi.
- Ekspor konfigurasi field/CPT; Local JSON mendukung versioning konfigurasi ACF, bukan backup konten/media. Backup database/uploads tetap terpisah. [7]
- Tidak perlu lisensi plugin baru; biaya hosting, domain, implementasi, backup tetap ada. Jangan menonaktifkan Divi sebelum situs lama dan rollout dipastikan aman.

## Verifikasi yang benar-benar dijalankan

| Pemeriksaan                                        | Hasil / batas                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit -p tsconfig.json`          | Lulus                                                                                                                                                 |
| `pnpm lint`                                        | Lulus                                                                                                                                                 |
| `pnpm check`                                       | Lulus                                                                                                                                                 |
| `pnpm build`                                       | Lulus; peringatan dependency/directive dan chunk besar tetap dicatat                                                                                  |
| Tujuh file tes TS existing melalui Vite SSR loader | Lulus; runner Node langsung gagal resolve alias `#/` pada cache test, bukan hasil tes aplikasi gagal                                                  |
| Parse Python 26 skrip dengan `ast.parse`           | Lulus syntax; tidak mengeksekusi skrip                                                                                                                |
| Cache dua AbortController                          | Reproduksi kegagalan lintas subscriber                                                                                                                |
| Browser mobile menu → resize desktop; Tab          | Scroll tetap terkunci; fokus mencapai konten belakang                                                                                                 |
| Browser clipboard ditolak                          | `Copied!` palsu + pageerror                                                                                                                           |
| Browser reduced-motion partner Next                | Scroll berpindah; foto aktif tetap                                                                                                                    |
| Browser gallery Enter versus klik                  | Enter tidak membuka, klik membuka                                                                                                                     |
| Browser product-card focus                         | focus-visible aktif, outline none, shadow none                                                                                                        |
| Browser artikel A → related B                      | Share URL **berubah benar pada jalur yang diuji**. Effect mount-only masih rapuh, tetapi stale URL tidak boleh disebut bug navigasi terkonfirmasi.    |
| Public GET WordPress lokal                         | Home ID 86/front page; tujuh field ACF berisi; gambar integer ID; News/Blogs kategori tersedia; Store API sembilan produk. Bukan verifikasi produksi. |
| `pnpm audit --prod --json`                         | Tiga advisory; investigasi reachability diperlukan, bukan otomatis exploit runtime                                                                    |

Jangan jalankan semua skrip begitu saja: `verify-contact-form-submit.py` dan `verify-contact-us.py` dapat mengirim inquiry/email sungguhan. Beberapa tes lama masih mengasumsikan fixture, URL `/articles`, atau placeholder form. Pakai backend fixture/sandbox; intersepsi browser saja tidak menahan fetch SSR. Tidak ada email sungguhan dikirim pada audit ini.

## Pilihan tindak lanjut

1. **Direkomendasikan:** perbaikan bertahap berbasis bug, tanpa perubahan desain. Batch pertama: cancellation cache, related-query isolation, clipboard, menu mobile, gallery keyboard, reduced-motion partner; masing-masing tes reproduksi gagal dahulu lalu lulus. Lengkapi peta/kontrak dan tes sebelum transport extraction.
2. **Lebih luas:** setelah batch bug stabil, satukan transport WP, perbaiki pagination/category policy, migrasi Hero Slides CPT. Butuh persetujuan model CMS dan regresi lebih luas.
3. **Tidak direkomendasikan:** rewrite total, generic abstraction untuk seluruh section, memo semua komponen, hapus semua export/asset yang tampak jarang dipakai. Risiko lebih besar dari manfaat.

Tidak ada implementasi/penghapusan dalam laporan ini. Keputusan kategori, penerima email, migrasi CMS, dan perubahan dependency perlu ditinjau sebelum dilaksanakan.

## Sumber primer

Dokumentasi online dibandingkan dengan manifest/source dependency terpasang; halaman `latest` bukan bukti semua versi historis identik. 9router search tidak terkonfigurasi; fallback fetch URL resmi. Sebagian URL QueryClient mengembalikan 404; perilaku terkait diverifikasi melalui package/harness, bukan diklaim dari halaman yang gagal diambil.

1. TanStack Router, Query integration: https://tanstack.com/router/latest/docs/integrations/query
2. TanStack Query v5, cancellation: https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation ; render optimizations: https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations
3. React, memo dan Profiler: https://react.dev/reference/react/memo ; https://react.dev/reference/react/Profiler
4. ACF, CPT registration/UI/REST: https://www.advancedcustomfields.com/resources/registering-a-custom-post-type/
5. ACF, daftar plugin dan pemisahan fitur Pro: https://wordpress.org/plugins/advanced-custom-fields/
6. ACF, REST opt-in/format: https://www.advancedcustomfields.com/resources/wp-rest-api-integration/
7. ACF, Local JSON: https://www.advancedcustomfields.com/resources/local-json/
8. WordPress, pagination: https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
9. WooCommerce, Products API: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/
10. Seroval maintainer advisory: https://github.com/lxsmnsyc/seroval/security/advisories/GHSA-p6vx-979v-rg4c ; https://github.com/lxsmnsyc/seroval/security/advisories/GHSA-jp82-f5mq-hwhp
11. `wp_insert_post` contract: https://developer.wordpress.org/reference/functions/wp_insert_post/
