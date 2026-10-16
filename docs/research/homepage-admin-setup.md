# Riset setup admin homepage

## Keputusan sementara

Riset saja; belum mengubah WordPress, kode aplikasi, dependensi, atau membuat commit.
Dasar lokal: `docs/research/editable-home-content.md` dan `docs/architecture/wordpress-content-model.md`.
Gunakan **Page Home yang sudah ada + ACF Free** sebagai sumber konten terstruktur.
Jangan membuat Home kedua. Pertahankan **empat slide hero**; pengurangan perlu persetujuan.
Skema/nama field ditunda sampai identitas Home dan kebutuhan editor terkonfirmasi.
Customer/partner di luar lingkup laporan ini.

## Langkah pertama saja — identifikasi Home

**Buka WordPress → Pages → All Pages, lalu kirim screenshot daftar halaman yang memperlihatkan kandidat Home dan penanda Front Page bila ada.**
Jangan klik Add New, mengubah isi, atau menyimpan pengaturan dahulu.
Screenshot ini menentukan Page existing yang akan dipakai; judul “Home” saja belum membuktikan identitasnya.
Jika ada beberapa kandidat, konfirmasi berikutnya adalah ID melalui URL Edit (`post=…`), bukan menebak dari judul.

## Bukti resmi dan implikasinya

- **Field group:** ACF → Field Groups → Add New membuat kumpulan field; Location menentukan layar edit tempat field muncul [1]. Rule `Page` memiliki pilihan halaman berdasarkan ID dalam sumber resmi ACF [2]. Setelah Home terverifikasi, rekomendasi lokasi adalah **Page → is equal to → Home existing**, bukan semua Pages atau bergantung pada template Divi.
- **Tab tersedia di Free:** dokumentasi Tab menjelaskan pengelompokan field di layar edit [3]; implementasinya berada di direktori field inti repositori ACF gratis, bukan `pro/` [4]. Tab hanya merapikan input admin, bukan membuat tab/slide frontend; tidak wajib dipasang sekarang.
- **REST opt-in:** field group tidak terlihat di REST secara default. Aktifkan **Group Settings → Show in REST API** nanti, hanya untuk konten publik. Integrasi native tersedia sejak ACF 5.11; tidak perlu plugin ACF-to-REST tambahan [5].
- **Image:** Return Format menyediakan **Image Array, Image URL, Image ID** [6]. Namun REST default `acf_format=light` memakai format ringan; contoh Image berupa attachment ID. `acf_format=standard` memakai formatting ACF, dengan contoh objek gambar lengkap [5]. Jangan menjanjikan bahwa memilih Image Array otomatis membuat REST default mengirim array. Rekomendasi awal: Image ID; format respons/mapping media diverifikasi saat integrasi.
- **Front page WordPress:** Settings → Reading menunjukkan pilihan latest posts atau static page serta halaman Home yang dipilih [7]. Halaman ini boleh diperiksa nanti untuk identifikasi, **tanpa mengubah pilihan atau Save Changes**.
- **Headless berbeda:** menurut arsitektur repo, frontend memiliki route dan presentasinya sendiri. Pilihan Reading mengatur homepage WordPress, bukan otomatis memetakan route `/` aplikasi ini. Home dapat menjadi sumber data lewat ID yang disepakati tanpa mengubah Reading.
- **Divi tetap aman:** situs existing memakai Divi menurut konteks pengguna; instalasi aktual belum diperiksa. Jangan menghapus Divi, mengonversi kontennya, mengganti template, atau mengosongkan editor. ACF menyimpan nilai tambahan; penampilan nilainya memerlukan integrasi eksplisit [8]. Mengisi ACF **tidak otomatis mengisi Divi maupun frontend baru**. Frontend baru tidak boleh parsing output Divi, sesuai arsitektur repo.

## Setup gratis yang direkomendasikan — belum dikerjakan

Satu field group homepage pada Home existing; field dasar ACF Free, Tab opsional.
Tanpa Repeater, Flexible Content, Options Page, page builder baru, atau dependensi baru.
Jika empat slide perlu diedit, pertimbangkan empat slot tetap setelah persetujuan skema; jangan mengurangi slide atau menjanjikan jumlah dinamis.
Label admin ramah editor; layout, animasi, dan susunan bagian tetap milik frontend.

## Prasyarat belum diketahui

- Home aktual: ID, slug, status publikasi, penanda Front Page, kemungkinan judul duplikat.
- ACF terpasang/aktif atau belum, versi, field group existing, hak pengguna mengelola field.
- Relasi halaman dengan Divi, backup/staging, dampak perubahan pada situs lama.
- Akses REST publik, filter keamanan, bentuk respons aktual, CORS origin frontend, cache.
- Persetujuan konten tiap slide, media/alt, serta kapan frontend akan dihubungkan.
  Jangan meminta password/token untuk memverifikasi identitas halaman.

## Setelah screenshot — garis besar saja

1. Konfirmasi Home dan ID; bila ambigu, periksa Reading tanpa menyimpan perubahan.
2. Periksa ACF/field existing dan backup; sepakati field homepage dengan empat slide tetap.
3. Siapkan satu field group berlokasi ke Page tersebut; REST-enable konten publik setelah ditinjau.
4. Isi sampel, periksa respons REST dan format gambar; integrasi frontend menjadi pekerjaan terpisah.
   Panduan berikutnya diberikan satu tindakan per giliran, bukan seluruh formulir sekaligus.

## Sumber resmi

Pencarian `ninerouter_web_search` dicoba; route belum tersedia. Verifikasi memakai `fetch_content` pada dokumentasi/sumber resmi. Tidak mengakses admin atau menguji endpoint situs aktual.

[1] ACF — Creating a Field Group: https://www.advancedcustomfields.com/resources/creating-a-field-group/
[2] ACF — implementasi lokasi Page: https://raw.githubusercontent.com/AdvancedCustomFields/acf/master/includes/locations/class-acf-location-page.php
[3] ACF — Tab: https://www.advancedcustomfields.com/resources/tab/
[4] ACF — implementasi Tab inti: https://raw.githubusercontent.com/AdvancedCustomFields/acf/master/includes/fields/class-acf-field-tab.php
[5] ACF — WP REST API Integration: https://www.advancedcustomfields.com/resources/wp-rest-api-integration/
[6] ACF — Image: https://www.advancedcustomfields.com/resources/image/
[7] WordPress — Settings Reading screen: https://wordpress.org/documentation/article/settings-reading-screen/
[8] ACF — Displaying Values in Your Theme: https://www.advancedcustomfields.com/resources/displaying-custom-field-values-in-your-theme/
