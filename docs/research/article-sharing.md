# Riset berbagi artikel

Status: rekomendasi saja; implementasi menunggu persetujuan. Tidak memerlukan dependency baru.

## Temuan kode

Dikonfirmasi audit agen utama, bukan audit ulang riset ini:

- `news/$slug` dan `blogs/$slug`: head hanya title + description; belum Open Graph atau canonical.
- `ArticleDetailPage`: Share2 hanya menyalin tautan. `handleCopyLink` memanggil `void navigator.clipboard.writeText(...)`, langsung `setCopied(true)`; bisa mengumumkan sukses meski ditolak.
- `shareUrl` mengambil `window.location.href` melalui effect `[]`, ikut membawa query/hash. Uji navigasi related blog setelah hidrasi menghasilkan URL share yang benar (halaman remount); stale URL belum direproduksi. Identitas artikel aktif tetap lebih eksplisit daripada snapshot URL saat mount.
- Bookmark hanya `localStorage`; bukan fungsi berbagi atau sinkronisasi akun.
- Uji browser agen utama: pada `/blogs/how-to-choose-the-right-xrf-analyzer-for-your-industry`, penolakan `navigator.clipboard.writeText` dengan `NotAllowedError` tetap membuat tombol “Copy article link” berjudul `Copied!`, disertai `pageerror`. Metadata terukur: 0 tag `og:`, 0 canonical.
- Tautan WhatsApp global `wa.me/6285186061000` adalah kontak social dock, bukan berbagi artikel.

## API browser

- `navigator.share({ title, text, url })` membuka pemilih target milik browser/OS. Target dapat berupa aplikasi, kontak, situs, atau layanan bawaan. **Tidak menjamin semua aplikasi terpasang tersedia**, tidak bisa meminta daftar aplikasi atau mengetahui target yang dipilih. Target boleh mengabaikan title. [1][2]
- Membutuhkan secure context, umumnya HTTPS; localhost bisa dipercaya untuk pengembangan. Harus dipanggil dari aktivasi pengguna langsung, bukan setelah pekerjaan async yang menghabiskan aktivasi. `Permissions-Policy: web-share` bisa memblokir; default `self`, iframe lintas origin perlu izin yang sesuai. Bukan berarti harus meminta izin pengguna lewat Permissions API dahulu. [1][2][4]
- Dukungan tidak universal: gunakan feature detection `navigator.share`, bukan deteksi perangkat. `navigator.canShare(data)` opsional untuk memvalidasi payload; bukan detektor aplikasi atau jaminan kiriman berhasil. Tidak memerlukan aktivasi pengguna. [2][3]
- `AbortError`: pengguna membatalkan **atau** tidak ada target. Jangan tampilkan pesan gagal keras, jangan otomatis menyalin setelah pembatalan. `NotAllowedError`, `TypeError`, `InvalidStateError`, `DataError` memiliki penyebab berbeda; tawarkan fallback eksplisit. Promise selesai berarti penyerahan ke target/OS, bukan bukti artikel dipublikasikan. [1][2]
- Clipboard: `await navigator.clipboard.writeText(url)` sebelum status “Tautan disalin”; tangani penolakan (`NotAllowedError`) dan ketidaktersediaan API. Membutuhkan secure context; pembatasan izin/aktivasi berbeda antarbrowser. Fallback paling sederhana: tampilkan URL yang bisa dipilih/disalin manual, bukan klaim sukses. [5]

## Target khusus

Semua parameter URL perlu di-encode (`URLSearchParams`/`encodeURIComponent`); composer tetap dikendalikan platform dan pengguna, bukan posting otomatis.

| Target   | Mekanisme, batas bukti                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WhatsApp | Click-to-chat tanpa nomor: `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`; pengguna memilih penerima. FAQ resmi [6] terverifikasi melalui payload HTML mentah: “To create a link with just a pre-filled message, use https://wa.me/?text=urlencodedtext” dan “After clicking on the link, you’ll be shown a list of contacts you can send your message to.” Membuka composer, bukan mengirim otomatis. |
| X        | Web Intent resmi `https://x.com/intent/tweet`, dengan `text` dan `url`; membuka composer, tidak membutuhkan aplikasi kita diotorisasi. Dokumentasi parameter resmi tersedia [7][8]. Gunakan judul ringkas + URL, bukan seluruh isi artikel; jangan menjanjikan semua teks muat atau pasti diposting.                                                                                                                    |
| LinkedIn | Dokumentasi resmi yang berhasil dibaca mendukung Share Plugin dengan `data-url`; tidak mendokumentasikan parameter judul/deskripsi bebas. [9] Endpoint umum `https://www.linkedin.com/sharing/share-offsite/?url=...` **belum terverifikasi lewat dokumentasi primer yang dibaca**; jangan menyebutnya kontrak resmi terjamin. Pilih native share/copy dahulu bila tidak ingin memuat script plugin.                    |
| Facebook | Share Dialog resmi mendukung `href`; URL redirection menggunakan `https://www.facebook.com/dialog/share` dan `app_id`. Preview dikendalikan metadata halaman, bukan judul/deskripsi query arbitrer. [10][11] `sharer.php` bukan mekanisme yang terkonfirmasi oleh dokumen yang dibaca; jangan menjanjikan prefill pesan atau keberhasilan publikasi.                                                                    |
| Lainnya  | Native share paling hemat untuk Telegram, email, dan target lain **jika tersedia di OS/browser**. Tambahkan tombol khusus hanya bila ada kebutuhan pengguna dan kontrak primer terverifikasi; tidak perlu daftar semua platform. [2]                                                                                                                                                                                    |

## URL, TanStack, preview

- TanStack Router memiliki `router.buildLocation(...)` untuk membangun lokasi dari route/params; `linkOptions(...)` membantu tipe opsi navigasi, bukan menetapkan origin publik/canonical. Bentuk URL absolut menggunakan origin situs publik yang dikonfigurasi + pathname route artikel, bukan cache `window.location.href` sekali saat mount. Ini rekomendasi desain, bukan perilaku canonical otomatis TanStack. [12][13]
- `head` route dapat mengembalikan `meta` dan `links`; `<HeadContent />` merendernya, dengan deduplikasi title/meta rute bersarang. Isi harus mengikuti artikel/loader saat slug berubah. [14]
- Rekomendasi head: canonical absolut (`links`, `rel: 'canonical'`), `og:url`, `og:type: article`, `og:title`, `og:description`, `og:image` absolut bila ada. `title`/description saja tidak menjamin preview lengkap. Pastikan tag ada di **HTML respons SSR**, bukan hanya DOM setelah effect/hidrasi; periksa respons URL publik setiap jenis artikel. [11][14]
- Crawler platform harus dapat mengakses halaman dan gambar publik; localhost, alamat privat, halaman login tidak menyediakan preview publik yang andal. HTTPS localhost dapat membuat API browser bekerja tetapi tidak membuat URL tersebut terjangkau penerima/crawler. Metadata benar juga tidak menjamin preview langsung berubah karena cache platform. [4][11]

## Rekomendasi persetujuan

1. Ubah tombol Bagikan menjadi native share dengan payload judul + canonical artikel aktif; fallback menu kecil: Salin tautan, WhatsApp, target sosial yang benar-benar dibutuhkan. Batalkan berarti diam, bukan sukses/gagal publikasi.
2. Perbaiki status Clipboard; hitung URL dari identitas artikel aktif. Pertahankan bookmark terpisah.
3. Tambahkan canonical + Open Graph lewat head route/SSR. Jangan menambah SDK/dependency atau integrasi posting akun.
4. Verifikasi: ganti slug tanpa remount, karakter `&`/Unicode, HTTPS desktop/mobile, native share tak tersedia, cancel/rejection, clipboard ditolak, HTML SSR dan preview URL publik. Belum ada pengujian perangkat/live sharing pada riset ini.

## Sumber primer

9router search dicoba lebih dahulu; tidak tersedia karena route belum dikonfigurasi. Fallback fetch langsung dipakai. Dokumen platform dapat berubah; kegagalan ekstraksi bukan bukti fitur tidak tersedia.

1. MDN, Navigator.share: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
2. W3C, Web Share API: https://www.w3.org/TR/web-share/
3. MDN, Navigator.canShare: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
4. MDN, Secure contexts: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
5. MDN, Clipboard.writeText: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
6. WhatsApp, How to use click to chat: https://faq.whatsapp.com/5913398998672934 (reader gagal; isi terverifikasi dalam payload HTML mentah pada sesi utama).
7. X, Web Intents: https://docs.x.com/x-for-websites/web-intents/overview
8. X, Web intent: https://docs.x.com/x-for-websites/post-button/guides/web-intent
9. LinkedIn/Microsoft Learn, Share Plugin: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/plugins/share-plugin
10. Meta, Share Dialog: https://developers.facebook.com/docs/sharing/reference/share-dialog
11. Meta, A Guide to Sharing for Webmasters: https://developers.facebook.com/docs/sharing/webmasters/
12. TanStack Router, Router type (`buildLocation`): https://tanstack.com/router/latest/docs/framework/react/api/router/RouterType
13. TanStack Router, Link Options: https://tanstack.com/router/latest/docs/framework/react/guide/link-options
14. TanStack Router, Document Head Management: https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management
