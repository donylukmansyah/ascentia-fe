# Konten statis yang dapat diedit di WordPress

## Rekomendasi singkat

Gunakan **WordPress + ACF Free**, tanpa page builder baru. Simpan konten tunggal homepage pada Page **Home**; tampilan, animasi, dan susunan bagian tetap dimiliki frontend. Untuk daftar customer/partner yang perlu tambah/hapus mandiri, gunakan custom post type (CPT) hanya setelah kebutuhan tersebut dikonfirmasi. Tidak perlu membeli ACF Pro untuk rancangan ini.

Ini usulan model, bukan implementasi. Tidak ada perubahan kode aplikasi, dependensi, atau konfigurasi WordPress. Screenshot tidak berhasil dianalisis; temuan berikut berdasarkan kode repo dan dokumentasi resmi, bukan pemeriksaan gambar maupun admin WordPress langsung.

## Kondisi repo

- `src/features/home/pages/home-page.tsx`: homepage berisi hero, brand marquee, Who We Are, featured products, dan contact panel. Belum ada bagian customer/partner atau artikel pada komposisi homepage ini.
- `src/features/home/constants/hero.ts`: empat slide hardcoded, masing-masing punya teks, gambar, dan CTA.
- `src/features/home/components/who-we-are-section.tsx`: teks, gambar, dan CTA masih punya default hardcoded.
- `src/features/home/components/brand-marquee.tsx`: logo berasal dari taxonomy brand produk. Jangan buat daftar brand homepage kedua.
- `src/features/about/constants/customers.ts`: 15 logo customer hardcoded; judul “Our Customer”.
- `src/features/about/constants/partners.ts`: enam partner hardcoded, bukan hanya logo: nama, deskripsi, logo normal/putih, dan foto pendukung.
- `docs/architecture/wordpress-content-model.md`: WordPress menjadi sumber konten, frontend mengendalikan presentasi; jangan parsing output Divi. Homepage/About editable memang dicatat sebagai pekerjaan berikutnya.

**Customer dan Client:** anggap satu konsep sampai bisnis menjelaskan perbedaannya. Pilih satu label publik; jangan membuat dua daftar identik.

**Partner dan Brand:** partner saat ini merupakan brand yang diwakili. Periksa dahulu apakah seluruh partner sebenarnya sama dengan taxonomy Brand produk. Bila sama, perluas sumber Brand yang sudah ada; jangan menggandakan identitasnya melalui CPT Partner.

## Tabel field usulan

Nama field berikut usulan, belum merupakan kontrak API yang terpasang.

| Area                                    | Sumber yang disarankan                                                | Field minimum                                                                                                    | Status                               |
| --------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Identitas Home                          | Page Home yang sudah ada, bila tersedia                               | ID Page; judul native                                                                                            | Page aktual perlu dicek              |
| Hero utama                              | ACF pada Home                                                         | `hero_title` Text, `hero_description` Textarea, `hero_image` Image, `hero_cta_label` Text, `hero_cta_url` URL    | Baru; sekarang empat slide hardcoded |
| Who We Are                              | ACF pada Home                                                         | `about_heading` Text, `about_summary` Textarea, `about_image` Image, `about_cta_label` Text, `about_cta_url` URL | Baru; menggantikan default statis    |
| Judul bagian                            | ACF pada Page pemilik bagian                                          | Text untuk judul/deskripsi yang benar-benar perlu diedit                                                         | Opsional, bukan seluruh label UI     |
| Customer/Client                         | CPT Customer jika admin perlu tambah/hapus item                       | Judul native = nama; ACF `logo` Image; `website_url` URL opsional; `display_order` Number                        | Baru; migrasi 15 item About          |
| Partner                                 | Utamakan Brand existing jika semantik sama; jika berbeda, CPT Partner | Nama, ringkasan, logo, foto; logo putih hanya bila desain memerlukannya; urutan                                  | Baru hanya bila Brand tidak cukup    |
| Produk homepage                         | WooCommerce/query produk existing                                     | Tidak ada salinan judul/gambar produk di Home                                                                    | Sudah memakai query featured         |
| Artikel homepage, bila nanti diperlukan | Post existing, filter kategori                                        | Ambil artikel terbaru terbit; tidak menyalin isi ke Home                                                         | Bagian belum ada di homepage         |

**Batas hero:** satu hero adalah opsi paling sederhana, tetapi mengurangi empat slide yang sekarang ada; perlu persetujuan. Jika empat slide harus tetap dapat diedit, field tetap per slide bisa digunakan dengan batas empat yang jelas. Jika jumlah slide harus bebas tambah/hapus, pertimbangkan CPT Slide setelah kebutuhan nyata; jangan mengasumsikan Repeater tersedia di Free.

Untuk urutan daftar, Number sederhana cukup pada tahap awal. Tidak perlu menjanjikan drag-and-drop tanpa pekerjaan tambahan. Field Image memakai Media Library; nama organisasi dan alt media wajib jelas untuk aksesibilitas. Hindari meminta admin mengisi JSON, dimensi gambar, atau pengaturan animasi.

## Mengapa gratis dan tetap terstruktur

WordPress menyediakan REST endpoint untuk Pages, Posts, dan Media [1–3]. CPT bukan post type bawaan khusus logo: pengembang harus mendaftarkannya melalui API WordPress atau fasilitas registrasi yang tersedia; aktifkan `show_in_rest` agar endpoint tersedia [4]. Kebutuhan ini tidak memerlukan plugin berbayar.

ACF menyediakan versi gratis dengan field dasar seperti Text, Textarea, Number, Image, URL, dan WYSIWYG. Repeater, Flexible Content, Gallery, serta Options Pages merupakan fitur Pro [6–7]. Karena itu jangan merancang daftar logo dengan Repeater atau pengaturan homepage melalui ACF Options Page berbayar. Pakai Page biasa untuk konten tunggal.

ACF mendukung integrasi REST sejak 5.11. Field group tidak otomatis terbuka: aktifkan **Show in REST API**. Nilai muncul pada properti `acf`; dokumentasi memberi contoh Image sebagai attachment ID, sehingga frontend perlu menyelesaikan media atau memilih format respons yang disepakati [5]. Tidak perlu plugin ACF-to-REST tambahan untuk kemampuan dasar ini.

“Gratis” berarti **tidak perlu lisensi plugin berbayar untuk rancangan ini**, bukan tanpa biaya hosting, domain, backup, pengembangan, migrasi, keamanan, atau pemeliharaan. Menghubungkan field ke frontend tetap pekerjaan implementasi.

## Alur admin

1. Pengembang menyiapkan field group Home, aturan lokasi ke Page tersebut, dan REST visibility; memastikan Page Home aktual sebelum memilih ID.
2. Admin membuka **Pages → Home**, mengganti teks/gambar/CTA, lalu **Update**. Ini pengeditan konten terstruktur, bukan penyuntingan bebas layout frontend.
3. Jika CPT diperlukan, admin membuka **Customers** atau **Partners**, memilih **Add New**, mengisi nama/logo dan data minimum, mengatur urutan, lalu menerbitkan. Penghapusan atau perubahan status harus tercermin dalam query publik.
4. Admin tetap mengelola produk melalui WooCommerce, artikel melalui Posts. Homepage membaca sumber tersebut, bukan isian duplikat.
5. Periksa situs publik setelah penyegaran cache yang disepakati. Preview headless dan waktu pembaruan cache belum diverifikasi; jangan menjanjikan preview otomatis langsung.

## Batas integrasi dan hal yang belum pasti

- Belum memeriksa instalasi WordPress aktual: versi ACF, Page Home, field existing, taxonomy Brand, hak editor, endpoint publik, CORS, serta cache harus diverifikasi sebelum implementasi.
- Data publik hanya memuat konten yang memang boleh dipublikasikan. Jangan REST-enable field rahasia; jangan menaruh credential WordPress/WooCommerce di frontend.
- Utamakan plain text untuk ringkasan. Jika memakai WYSIWYG, sanitasi HTML dengan allowlist sesuai arsitektur repo; CMS tidak mengendalikan layout atau menjalankan skrip.
- Menu Customer/Partner dan field di tabel belum tersedia hanya karena laporan ini dibuat. Registrasi, migrasi, dan pemetaan API tetap diperlukan.

## Keputusan yang diperlukan

1. Apakah Customer dan Client berbeda secara bisnis, atau hanya beda istilah?
2. Apakah Partner tepat sama dengan Brand produk, atau ada partner non-brand?
3. Apakah admin harus mempertahankan empat slide, bebas menambah slide, atau cukup satu hero?
4. Apakah daftar customer/partner tampil di About saja atau juga homepage? Apakah perlu mengatur urutan dan menyembunyikan item?

## Sumber resmi

Dokumentasi diambil selama riset; tidak menguji endpoint situs produksi. Pencarian 9router tidak tersedia karena route belum dikonfigurasi; pengambilan URL resmi digunakan sebagai fallback.

1. WordPress Developer Resources — Pages: https://developer.wordpress.org/rest-api/reference/pages/ (berhasil diambil dengan query parameter setelah percobaan awal gagal).
2. WordPress Developer Resources — Posts: https://developer.wordpress.org/rest-api/reference/posts/
3. WordPress Developer Resources — Media: https://developer.wordpress.org/rest-api/reference/media/
4. WordPress — Adding REST API Support For Custom Content Types: https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-rest-api-support-for-custom-content-types/
5. ACF — WP REST API Integration: https://www.advancedcustomfields.com/resources/wp-rest-api-integration/
6. ACF — plugin resmi dan perbandingan fitur: https://wordpress.org/plugins/advanced-custom-fields/ ; ACF PRO: https://www.advancedcustomfields.com/pro/
7. ACF — Options Page: https://www.advancedcustomfields.com/resources/options-page/
