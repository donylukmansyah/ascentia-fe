# Riset SEO dan pratinjau tautan Ascentia

Status: rekomendasi saja; tanpa implementasi, dependensi baru, atau aset gambar baru.
Ruang lingkup: Google Search; pembagian URL di Discord, Facebook termasuk komentar, Instagram, WhatsApp.

## Kesimpulan

- Tambahkan metadata Open Graph per halaman melalui HTML awal/SSR; favicon dan `<title>` saja bukan pengganti metadata sosial.
- Siapkan gambar bawaan bermerek **1200×630 JPG/PNG** sebagai pilihan praktis lintas layanan, **bukan ukuran wajib universal**.
- Untuk artikel/berita/produk, utamakan gambar konten yang relevan; gunakan gambar merek bila gambar konten tidak tersedia/layak.
- Logo membantu identitas visual; Open Graph **bukan verifikasi perusahaan, keamanan URL, atau jaminan antiscam**.
- Tidak dapat menjanjikan gambar selalu tampil di semua aplikasi, komentar, perangkat, akun, atau pengaturan pengguna.

Dasar rekomendasi: [Open Graph](https://ogp.me/), [Meta: gambar](https://developers.facebook.com/docs/sharing/webmasters/images/), [Meta: crawler](https://developers.facebook.com/docs/sharing/webmasters/crawler/).

## 1. Temuan lokal terkonfirmasi

Bukti berikut berasal dari pembacaan kode dan respons HTTP server lokal; deployment publik belum diuji.

| Bukti                                                     | Temuan                                                                                                      |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/routes/__root.tsx`                                   | Charset, viewport, title, favicon; tidak ada OG, Twitter Card, canonical pada root yang diaudit.            |
| `src/routes/index.tsx`                                    | Sudah memiliki title dan description.                                                                       |
| `src/routes/blogs/$slug.tsx`, `src/routes/news/$slug.tsx` | Loader menyediakan title+excerpt; head title+description, tanpa gambar/OG/canonical.                        |
| `src/routes/products/$slug.tsx`                           | Loader menyediakan title; head hanya title.                                                                 |
| GET `http://localhost:3000/`                              | HTTP 200; SSR berisi `Home \| Ascentia Arsya Analitika`, charset, viewport, description; 0 OG, 0 canonical. |
| GET `/about-us`, `/blogs`, `/news`                        | HTTP 200; title+description nyata tersedia; 0 OG, 0 canonical.                                              |
| `public/`                                                 | Tidak ditemukan robots.txt/sitemap; **bukan bukti ketiadaan pada deployment**.                              |

Aset PNG terkonfirmasi: `logo-color.png` 957×202 / 39.775 byte; `logo-white.png` 957×202 / 18.603 byte; `logo-mark.png` 48×48 / 3.246 byte.
Logo horizontal merupakan bahan komposisi, bukan gambar sosial siap pakai; logo mark 48×48 terlalu kecil untuk minimum gambar Facebook 200×200.

Screenshot TanStack Devtools menunjukkan `No image / No Title / No Description` dan OG belum tersedia.
**`No Title` tidak membuktikan `<title>` HTML hilang**: pemeriksaan SSR justru menemukan title.
Ini simulator metadata, bukan hasil fetch crawler Discord/Meta/WhatsApp.

Dasar ukuran Facebook: [Meta: Images in Link Shares](https://developers.facebook.com/docs/sharing/webmasters/images/).

## 2. Open Graph berbeda dari SEO Google

| Kebutuhan               | Mekanisme dan batas                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Kartu tautan sosial     | Open Graph mendeskripsikan objek/halaman untuk layanan konsumen metadata; bukan protokol pemeringkatan Google.                                 |
| Judul hasil Google      | Google memilih otomatis dari beberapa sumber, termasuk `<title>`, heading, dan `og:title`; OG tidak mengunci judul hasil.                      |
| Ikon kecil hasil Google | Favicon melalui `rel="icon"`, terpisah dari `og:image`; favicon harus persegi, minimum 8×8, direkomendasikan lebih besar dari 48×48.           |
| Nama situs Google       | `WebSite` structured data pada homepage merupakan sinyal preferensi terpenting; Google juga mempertimbangkan `og:site_name` dan teks homepage. |
| Logo organisasi Google  | `Organization.logo` membantu menyatakan logo pilihan; minimum 112×112, URL crawlable/indexable; bukan jaminan fitur hasil tampil.              |

Implikasi: gambar OG 1200×630 tidak otomatis mengganti favicon atau logo organisasi. Jangan menyimpulkan logo muncul di Google hanya karena OG telah dipasang, atau menjanjikan peningkatan peringkat.
Sumber: [OGP](https://ogp.me/), [Google: title links](https://developers.google.com/search/docs/appearance/title-link), [favicon](https://developers.google.com/search/docs/appearance/favicon-in-search), [site names](https://developers.google.com/search/docs/appearance/site-names), [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization).

## 3. Metadata dan gambar yang direkomendasikan

- Standar OGP memiliki empat properti dasar wajib: `og:title`, `og:type`, `og:image`, `og:url`.
- Sertakan `og:description`, `og:site_name`, locale sesuai konten; `og:image:alt` sebaiknya ada ketika gambar ditentukan.
- Tambahkan MIME type, width, height yang benar; Meta menjelaskan dimensi eksplisit membantu pemuatan gambar saat pembagian pertama.
- `og:url` menunjuk URL kanonis halaman; rekomendasikan juga HTML `rel="canonical"` yang konsisten, bukan menganggap keduanya tag yang sama.
- Rekomendasi operasional: URL gambar **absolut HTTPS, publik, stabil**, tanpa login/cookie wajib, token sementara, atau challenge WAF untuk crawler.
- Pastikan halaman dan gambar dapat diambil melalui HTTP; metadata berada dalam `<head>` HTML awal, bukan hanya ditambahkan setelah JavaScript berjalan.

Meta merekomendasikan setidaknya **1200×630** untuk perangkat resolusi tinggi, rasio mendekati **1,91:1**; minimum gambar yang diizinkan 200×200, batas berkas 8 MB. Angka tersebut berasal dari **panduan Facebook**, bukan kontrak semua platform.
JPG/PNG dipilih karena didukung panduan Meta dan praktis; bukan berarti semua platform hanya menerima dua format itu.
Usahakan berkas ringan; jangan mengartikan batas 8 MB sebagai target ukuran.

Sumber: [OGP: metadata/structured properties](https://ogp.me/), [Meta: panduan webmaster](https://developers.facebook.com/docs/sharing/webmasters/), [Meta: gambar](https://developers.facebook.com/docs/sharing/webmasters/images/), [Meta: crawler dan batas metadata 1 MB pertama](https://developers.facebook.com/docs/sharing/webmasters/crawler/).

### Logo saja atau kanvas bermerek?

Rekomendasi desain, bukan aturan platform: kanvas 1200×630 dengan latar solid, logo Ascentia, ruang aman di tepi, pesan singkat bila diperlukan. Hindari meregangkan logo horizontal memenuhi kanvas; logo putih perlu latar berkontras.
Pertahankan unsur penting di tengah untuk mengurangi risiko terpotong; **tidak ada safe area universal yang terverifikasi**.

Urutan gambar yang diusulkan: gambar sosial khusus halaman → gambar artikel/berita/produk yang layak → kanvas merek bawaan.
Untuk produk, foto produk relevan lebih informatif daripada mengganti semua kartu dengan logo identik; untuk homepage/halaman umum, kanvas merek memadai.
`og:image` menurut OGP merepresentasikan objek halaman; urutan fallback di atas adalah keputusan editorial Ascentia, bukan kewajiban OGP.
Sumber batas faktual: [OGP](https://ogp.me/), [Meta: rasio/cropping](https://developers.facebook.com/docs/sharing/webmasters/images/).

## 4. Kepastian per platform

| Platform/konteks    | Bukti resmi dan batas rekomendasi                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Facebook Feed/share | Meta mendokumentasikan OG, gambar, crawler, debugger; dukungan paling kuat dalam sumber yang terbaca. Tetap bergantung pada fetch/cache dan keputusan tampilan Meta.                                                                                                      |
| Facebook komentar   | Tidak ditemukan kontrak resmi yang menjamin kartu besar/logo setiap URL di komentar. Jangan menyamakan panduan Feed dengan jaminan komentar; uji komentar nyata setelah deployment.                                                                                       |
| Instagram           | Meta menyebut Instagram sebagai contoh aplikasi yang tautannya dapat diambil `FacebookExternalHit`. Itu **bukan** janji semua caption, komentar, bio, DM, atau Story menampilkan kartu OG yang sama.                                                                      |
| Discord             | Dokumentasi resmi mengenal izin `EMBED_LINKS`; akses/izin merupakan variabel di luar metadata situs. Artikel pengaturan auto-embed tidak dapat dibaca (403). Tidak terverifikasi ukuran wajib, TTL cache, atau jaminan render OG lewat sumber resmi yang berhasil dibaca. |
| WhatsApp            | FAQ resmi tidak dapat diekstrak karena JavaScript. Tidak terverifikasi kontrak ukuran gambar, TTL cache, mekanisme purge, atau detail opsi menonaktifkan preview. OG tetap baseline praktis yang harus diuji pada chat nyata, bukan jaminan resmi dari riset ini.         |

Pengaturan aplikasi/pengguna, izin, jenis permukaan, serta versi klien perlu dicatat saat pengujian; jangan menganggap metadata dapat memaksa preview. Detail pengaturan tiap aplikasi yang tidak terverifikasi tidak diperlakukan sebagai fakta.
Sumber: [Meta: crawler lintas aplikasi](https://developers.facebook.com/docs/sharing/webmasters/crawler/), [Discord: permissions](https://docs.discord.com/developers/topics/permissions), [Discord: auto-embed, akses 403](https://support.discord.com/hc/en-us/articles/206342858--How-do-I-disable-auto-embed), [WhatsApp FAQ, ekstraksi terhalang](https://faq.whatsapp.com/), [Instagram Help, ekstraksi terhalang](https://help.instagram.com/).

## 5. Cache, debugger, dan peringatan simulator

Meta mengambil dan menyimpan metadata ketika URL dibagikan. Sharing Debugger dapat memicu scrape dan menunjukkan tag/error yang terbaca.
Meta menyimpan gambar berdasarkan URL; ketika gambar berubah, gunakan URL gambar baru dan pertahankan gambar lama yang masih dirujuk pembagian terdahulu.
Penyegaran Meta **bukan purge universal** untuk Discord, WhatsApp, Instagram, atau pesan lama; tidak ada TTL lintas layanan yang terverifikasi.

Daftar warning simulator bukan daftar syarat universal: OGP mewajibkan `og:type` meski tidak disebut pada screenshot, sedangkan `twitter:url` **bukan properti wajib OGP**.
Dokumentasi X Card tidak berhasil diverifikasi dalam sesi ini; jangan menjadikan warning `twitter:url` sebagai bukti kewajiban standar X. Twitter Card dapat dipertimbangkan terpisah bila X menjadi target, bukan prasyarat seluruh platform di atas.
Sumber: [Meta: pengujian markup](https://developers.facebook.com/docs/sharing/webmasters/), [cache dan pembaruan gambar](https://developers.facebook.com/docs/sharing/webmasters/images/), [Sharing Debugger](https://developers.facebook.com/tools/debug/), [OGP](https://ogp.me/).

## 6. Kesesuaian teknis dan validasi berikutnya

Kode yang diaudit memakai TanStack `head` + `HeadContent`; dokumentasi mengonfirmasi deduplikasi `name`/`property` mendukung override rute. Tidak perlu dependensi metadata baru atau `useEffect` client-only.
Rekomendasi: default di root, override per halaman menggunakan data loader, sertakan gambar/description yang belum tersedia pada loader terkait. **Origin deployment publik belum terkonfigurasi pada rute yang diaudit; konfirmasi sebelum menyusun URL absolut.**
Sumber API: [TanStack: Document Head Management](https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management).

1. Konfirmasi domain HTTPS produksi dan gambar publik yang dapat diambil tanpa autentikasi; localhost bukan target pengujian crawler eksternal.
2. Setelah implementasi disetujui, periksa raw SSR setiap tipe halaman: title/description, OG tunggal yang benar, URL kanonis, MIME/dimensi gambar.
3. Jalankan Sharing Debugger, lalu kirim URL pada Discord, Facebook post **dan komentar**, Instagram pada konteks yang dibutuhkan, WhatsApp chat. Catat klien/pengaturan/tanggal; pisahkan masalah cache dari markup.
4. Uji favicon/site name/logo Google melalui jalurnya sendiri; jangan memakai keberhasilan kartu sosial sebagai validasi Search.

## 7. Metode dan tingkat keyakinan

`functions.ninerouter_web_search` dicoba terlebih dahulu: tidak ada route pencarian 9router terkonfigurasi. Fallback `web_search` default gagal; Brave/Tavily tidak memiliki API key. Riset menggunakan `fetch_content` langsung ke sumber primer, bukan hasil pencarian lengkap.
**Tinggi:** isi OGP, panduan Meta gambar/crawler/cache, Google Search Central, API head TanStack yang berhasil terbaca. **Terbatas:** cakupan dokumentasi preview spesifik Discord/WhatsApp/Instagram dan komentar Facebook; tidak ada uji platform live.
Sharing Debugger sendiri membutuhkan rendering JavaScript; fungsi scrape dikonfirmasi dari panduan webmaster Meta, bukan sesi debugger yang dijalankan. Kegagalan akses dokumentasi tidak membuktikan fitur tidak tersedia.
Tidak ada klaim verifikasi antiscam: OGP mendeskripsikan konten, sementara Meta menjelaskan pemeriksaan keamanan/integritas sebagai tujuan crawler terpisah. Kartu bermerek bukan bukti legitimasi.
