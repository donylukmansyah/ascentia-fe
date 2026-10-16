# Riset pencarian global Ascentia

Status: riset saja; bukan persetujuan implementasi. Tidak mengubah frontend.
Sumber: dokumentasi primer; fakta repo/screenshot berasal dari audit parent, bukan audit ulang.
Pencarian 9router dicoba; route belum dikonfigurasi. Dokumentasi resmi diambil langsung.

## Kebutuhan dan batas lingkup

- Magnifier header desktop/mobile serta Ctrl+K / Cmd+K membuka modal pencarian global.
- Kelompok hasil: Products, News, Blogs; setiap hasil menuju halaman kontennya.
- Search katalog tetap lokal: URL `q/category/page` tidak otomatis memengaruhi pencarian global.
- Referensi screenshot: magnifier dekat pilihan bahasa; modal terpusat berisi field pencarian.
- Referensi kedua berupa daftar media bernomor, bukan desain kelompok hasil.
- Ambil pola interaksi, bukan ranking film, placeholder drama Korea, atau tema hitamnya.

## Fakta integrasi repo — audit parent

- `src/components/layout/site-header/index.tsx`: tombol Search desktop/mobile belum memiliki `onClick`.
- Header bisa tersembunyi saat scroll; rekomendasi: portal modal di luar header yang ditranslasikan.
- Cegah navigasi mobile dan dialog pencarian terbuka bersamaan.
- `ProductListingPage`: debounce 300 ms, perubahan pencarian reset `page=1`.
- TanStack Query memakai query key per pencarian; `signal` diteruskan ke server function.
- `product-source.server.ts`: Woo `/wc/store/v1/products`, parameter `search` dan `per_page`.
- Urutan produk saat ini `orderby=date`; jangan menjanjikan ranking relevansi. Cache per kueri 60 detik.
- Artikel sudah memakai server functions WordPress `/wp/v2/posts`; belum menerima parameter pencarian.
- Kategori terverifikasi: News `19`, Featured Events `117`, Blogs `20`.
- Jangan diam-diam memasukkan Featured Events ke News; pertahankan cakupan kategori yang disepakati.
- Dependensi terverifikasi: `@base-ui/react ^1.8.0`, `@tanstack/react-query ^5.104.1`.
- Juga tersedia `fuse.js ^7.5.0`, `motion ^14.0.0`; keberadaan bukan alasan wajib memakainya.
- Audit terarah tidak menemukan wrapper Dialog/Command pada `components/ui`.
- `SearchInput` menerima input props, ref, label, loading, clear; gunakan ID unik untuk global/katalog.
- Pemakaian `getFuzzySuggestion` pada katalog hanya mencakup nama produk yang sudah diambil, bukan seluruh katalog.
- Aturan `docs/architecture/folder-conventions.md`: routes → features → components/hooks/lib.
- Layout tidak boleh mengimpor feature/API; wiring trigger/control melalui komposisi root/feature atau callback.
- Detail wiring menunggu persetujuan; tidak perlu scaffolding file untuk riset ini.

## Panduan aksesibilitas: dialog dan keyboard

Sumber primer: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
APG merupakan panduan pola implementasi WAI-ARIA, bukan spesifikasi debounce atau desain visual.

- Dialog punya nama aksesibel, role `dialog`, `aria-modal=true` hanya bila benar-benar modal.
- Fokus masuk ke dalam dialog saat dibuka; Tab / Shift+Tab tetap di dalamnya.
- Escape menutup dialog; sediakan juga tombol tutup terlihat dengan nama aksesibel.
- Saat tutup tanpa navigasi, kembalikan fokus ke pemicu; bila pemicu hilang, pilih target logis.
- Rekomendasi UX: fokus input saat pembukaan keyboard; pada sentuhan, evaluasi efek keyboard virtual.
- Bukan cukup menambah ARIA: konten belakang harus benar-benar tidak dapat diinteraksikan.

Sumber primer: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

- Arrow/Enter bukan kewajiban semua dialog: tentukan dulu input biasa + tautan atau combobox.
- Input biasa + daftar tautan: Tab memindah fokus, Enter mengaktifkan tautan; jangan mengklaim combobox.
- Jika combobox/listbox: Down/Up menavigasi opsi sesuai pola, Enter menerima opsi aktif.
- Pertahankan editing teks bawaan; kelola `aria-expanded`, relasi popup, opsi aktif sesuai pola.
- Escape combobox dapat menutup popup lebih dahulu; tetapkan urutan jelas sebelum dialog ditutup.
- Label kelompok bukan opsi yang bisa dipilih; hanya hasil nyata menjadi target aktivasi.

## Base UI: kemampuan relevan, bukan pilihan final

Sumber primer: https://base-ui.com/react/components/dialog
Sumber primer: https://base-ui.com/react/components/autocomplete

- Dialog menyediakan portal ke `body` secara default, modal focus trap, `initialFocus` / `finalFocus`.
- Default fokus sentuhan dapat menuju popup agar tidak langsung membuka keyboard virtual.
- Autocomplete mendukung teks bebas, async search, command picker, Group/GroupLabel, status aksesibel.
- Komponen status mengumumkan pembaruan secara sopan; pertahankan wadahnya terpasang.
- Rekomendasi: evaluasi primitive yang sudah tersedia sebelum menulis keyboard/focus management manual.
- Dokumentasi daring perlu dicocokkan dengan API versi terpasang ketika implementasi disetujui.

## WordPress REST: cakupan search tidak universal

Sumber primer: https://developer.wordpress.org/rest-api/reference/search-results/
Sumber primer: https://developer.wordpress.org/reference/classes/wp_rest_search_controller/__construct/
Sumber primer: https://developer.wordpress.org/reference/classes/wp_rest_post_search_handler/__construct/
Sumber primer: https://developer.wordpress.org/rest-api/reference/posts/

- `GET /wp/v2/search` menerima `search`, `type`, `subtype`, `page`, `per_page`; default `type=post`.
- Respons search ringkas: ID, title, URL, type/subtype; bukan kontrak kartu produk WooCommerce.
- Cakupan aktual bergantung instalasi dan search handlers yang didaftarkan.
- Handler post bawaan memakai post type `public=true`, `show_in_rest=true`, selain attachment.
- Karena itu jangan menganggap semua produk Woo otomatis tercari melalui endpoint ini.
- `/wp/v2/posts` sendiri mendukung `search` dan `categories`; cocok memperluas sumber editorial saat ini.
- News/Blogs adalah pengelompokan konten editorial, bukan otomatis post type terpisah.

## WooCommerce Store API: produk publik

Sumber primer: https://developer.woocommerce.com/docs/apis/store-api/
Sumber primer: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/

- `GET /wp-json/wc/store/v1/products?search=...` mendukung pencarian string produk.
- Pagination memakai `page` / `per_page`; default 10 per halaman, maksimum 100 menurut panduan Store API.
- Pembacaan produk publik tidak membutuhkan consumer key/token; jangan taruh kredensial privat di frontend.
- Tidak menjanjikan typo tolerance atau ranking relevansi lintas produk/artikel dari parameter `search` saja.
- Hasil Woo dan WP tidak memiliki skor bersama; tampilkan kelompok, jangan mengarang ranking global.

## Alternatif dan rekomendasi minimum — keputusan produk, bukan standar

1. **Mock lokal:** cepat memvalidasi modal/keyboard; tandai data contoh, bukan pencarian situs sebenarnya.
   Fuse atas halaman yang sudah dimuat tidak boleh dipresentasikan sebagai hasil lengkap seluruh situs.
2. **Agregasi server WP + Woo:** rekomendasi awal; gunakan sumber produk dan kategori artikel yang ada.
   Jalankan pencarian per kelompok, batasi hasil awal, petakan tujuan ke URL frontend yang benar.
3. **Indeks khusus:** evaluasi nanti untuk typo tolerance, ranking terpadu, sinonim, atau skala terukur.
   Membutuhkan sinkronisasi/reindex dan operasi tambahan; belum ada alasan terukur untuk menambah engine.

Rekomendasi bersyarat: volume konten, latensi, batas API, cakupan match belum diketahui.
Validasi API nyata sebelum menjanjikan kelengkapan, relevansi, atau target waktu respons.
Audit parent menunjuk `docs/research/2026-10-15-wordpress-api-response-time.md`:
sampel lokal lama respons WP sekitar 1,1–2,25 detik; bukan benchmark baru atau klaim produksi.
Pembukaan modal halus tidak berarti hasil instan; ukur pencarian gabungan nyata, tampilkan loading.
Debounce mengurangi frekuensi request, bukan memperbaiki latensi jaringan/API.

## UX yang disarankan — bukan ketentuan APG

- Hasil langsung saat mengetik, debounce sekitar 200–300 ms; 300 ms konsisten dengan katalog saat ini.
- Minimum kueri adalah pilihan produk: misalnya 2 karakter; tampilkan petunjuk, bukan error untuk kueri pendek.
- Batalkan request lama bila memungkinkan; tetap abaikan respons usang berdasarkan kueri/request aktif.
- Pisahkan keadaan awal, loading, hasil kosong, error; satu kelompok gagal tidak menghapus hasil kelompok lain.
- Tampilkan kegagalan parsial dan retry kelompok; jangan menyamakan API gagal dengan “tidak ada hasil”.
- Input kosong: petunjuk mengetik; jangan mengarang “trending” tanpa data analytics yang sah.
- Tombol magnifier tetap bisa diketuk di mobile; shortcut hanya pelengkap, bukan satu-satunya akses.
- Abaikan shortcut di input, textarea, select, contenteditable, serta saat komposisi IME berlangsung.
- Cegah perilaku browser hanya saat shortcut benar-benar ditangani; jangan mengambil semua tombol K.
- Animasi buka/tutup singkat, halus; hormati reduced motion, jangan menunda akses fokus karena animasi.
- Batas hasil per kelompok harus terlihat sebagai preview, bukan klaim seluruh hasil sudah ditampilkan.

## Satu klarifikasi sebelum implementasi

Hasil muncul langsung saat mengetik atau baru setelah Enter? Rekomendasi: langsung saat mengetik, sesuai pola referensi.

## Referensi diperjelas — trigger, dialog, thumbnail, loading

- Desktop: magnifier + teks `Search` + badge `Ctrl K` / `Cmd K` sesuai platform; mobile ikon saja dengan nama aksesibel.
- Audit parent: header dekat breakpoint `lg` padat; trigger sekitar 150–180 px hanya jika muat, ikon juga pada lebar menengah bila perlu.
- Tombol mobile saat ini 40 px; target praktis 44 px, bukan klaim ambang wajib WCAG untuk semua konteks.
- Klik/shortcut membuka dialog terang bergaya Ascentia: putih, Plus Jakarta Sans Variable, biru `#288AC6`.
- Orange `#F28B3B` untuk CTA; hover/seleksi hasil memakai muted, bukan `bg-accent`; jangan menyalin badge ungu referensi.
- Referensi parent: pill Search + Cmd K; daftar Pages; baris thumbnail dengan footer keyboard. Tidak ada referensi skeleton.
- Kelompok `Products`, `News`, `Blogs`: heading jelas, thumbnail + judul, brand produk bila tersedia; bukan daftar Pages generik.
- Footer `↑↓ Navigate · Enter Select · Esc Close` hanya bila perilakunya benar-benar diterapkan; urutan Escape popup/dialog tetap eksplisit.
- Awal buka tanpa fetch: petunjuk mengetik, bukan skeleton, hasil palsu, atau “trending” tanpa data.

### Primitive dan dependensi — verifikasi dokumentasi Base UI

- Halaman shadcn **Base UI** Dialog dan Combobox terverifikasi [R1–R2]; bukan dokumentasi varian Radix.
- Registry `base-nova/dialog` mengimpor `@base-ui/react/dialog`; Combobox mengimpor `Combobox` dari `@base-ui/react` [R5].
- Halaman Combobox bukan wrapper Autocomplete terpisah: `/docs/components/base/autocomplete` mengembalikan 404 saat riset.
- Base UI Autocomplete mendokumentasikan async search, `Group`/`GroupLabel`, serta `Status` untuk pembaruan sopan [R6].
- Parent memverifikasi tipe **terpasang**: items flat/grouped, `filteredItems`, `filter`, `mode="none"`, `autoHighlight`, `onOpenChange`.
- Parent juga memverifikasi ekspor Group/GroupLabel/List/Item dan DialogPopup `initialFocus`/`finalFocus`; contoh daring tetap perlu dicocokkan versinya.
- Rekomendasi: dialog bergaya shadcn + Autocomplete inline terpasang; evaluasi `mode="none"` untuk perilaku autocomplete, bukan sebagai pemati filter.
- Cegah filter klien kedua atas hasil server melalui `filteredItems`/konfigurasi filter yang cocok versi terpasang; verifikasi komposisi inline saat implementasi.
- Koreksi batas klaim: registry **Base UI Command** tetap mencantumkan dependensi `cmdk` dan mengimpornya; bukan alternatif bebas `cmdk` [R5].
- Jangan menjanjikan “tanpa dependensi baru”: registry Dialog mencantumkan `cn` + registry Button; Combobox `cn`, `@base-ui/react` + Button/InputGroup.
- Skeleton/Spinner mencantumkan `cn`; sumber registry memuat placeholder ikon yang ditransformasikan generator. Registry bukan lockfile proyek.
- Audit parent: `components.json` memakai base-nova, neutral, CSS variables, Lucide; alias `@/` berbeda dari impor repo `#/`.
- Verifikasi alias, hasil generator, dependensi transitif, kompatibilitas versi sebelum pemasangan; riset ini tidak memasang/mengubah paket.

### Loading dan media — rekomendasi produk, bukan aturan aksesibilitas

- Kueri baru berbeda tanpa cache: debounce singkat, lalu skeleton baris bila penantian terasa; bukan spinner besar yang mengganti seluruh dialog.
- Skeleton hanya untuk hasil yang belum tersedia: bentuk thumbnail/judul konsisten, bukan setiap ketikan atau pembukaan dialog.
- Refresh latar kueri **yang sama**: pertahankan hasil cache valid tetap bisa dibuka; indikator kecil “Updating” cukup.
- Hasil usang dari **kueri berbeda** jangan disajikan atau bisa diaktifkan sebagai hasil kueri baru; ganti area hasil dengan keadaan loading yang jelas.
- Penundaan indikator sekitar 150–200 ms opsional untuk menghindari kedipan; keputusan produk, bukan ketentuan WAI/WCAG.
- Jangan menunda request/hasil demi skeleton, jangan menetapkan durasi tampil minimum; hasil siap langsung mengganti placeholder.
- shadcn Skeleton adalah placeholder beranimasi pulse; Spinner contoh ikon berputar dengan status/label loading [R3–R5].
- Skeleton dekoratif jangan masuk urutan opsi/fokus; sediakan status teks, bukan mengandalkan animasi sebagai satu-satunya informasi.
- `Autocomplete.Status` tetap mounted; ubah isinya untuk loading/jumlah hasil/gagal, jangan sembunyikan root dengan `hidden`/`aria-hidden` [R6].
- Status harus dapat diumumkan tanpa memindahkan fokus; hindari live announcement berlebihan dan duplikasi status spinner [R7].
- Hormati reduced motion untuk pulse/spin/transisi; teks status tetap tersedia meski animasi dimatikan [R8].
- Thumbnail ukuran/aspect ratio tetap, termasuk placeholder/error fallback; produk `object-contain`, editorial `object-cover` adalah pilihan presentasi.
- Parent: gambar produk optional/null, punya `imageSrcSet`/`imageAlt` dan brand; tangani absen/gagal tanpa loop fallback gambar.
- Parent: mapper artikel membaca `_embedded.wp:featuredmedia`, kini memilih large/source_url dengan fallback `/news/news-hero-1.webp`.
- Untuk thumbnail pilih derivative media lebih kecil bila tersedia, gunakan srcset/sizes yang sesuai; jangan otomatis mengunduh hero penuh.
- Batas: belum menguji runtime kombinasi dialog/Autocomplete, pembaca layar, API pencarian, atau ukuran unduhan; tidak ada audit repo/gambar ulang.

Sumber primer (diambil langsung setelah route pencarian 9router tidak tersedia; registry daring dapat berubah):

- [R1] https://ui.shadcn.com/docs/components/base/dialog
- [R2] https://ui.shadcn.com/docs/components/base/combobox
- [R3] https://ui.shadcn.com/docs/components/base/skeleton
- [R4] https://ui.shadcn.com/docs/components/base/spinner
- [R5] Registry: https://ui.shadcn.com/r/styles/base-nova/command.json ; https://ui.shadcn.com/r/styles/base-nova/dialog.json ; https://ui.shadcn.com/r/styles/base-nova/combobox.json ; https://ui.shadcn.com/r/styles/base-nova/skeleton.json ; https://ui.shadcn.com/r/styles/base-nova/spinner.json
- [R6] https://base-ui.com/react/components/autocomplete
- [R7] https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- [R8] https://www.w3.org/WAI/WCAG22/Techniques/css/C39
