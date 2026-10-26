# Routing Node di domain utama cPanel

## Kesimpulan

**Tidak perlu menganggap `index.php` harus diganti nama.** Klaim “index.php selalu mengalahkan Node” dan “rename otomatis meneruskan ke Node” tidak memiliki dasar universal. Pemilihan handler bergantung konfigurasi domain, mapping Selector, rewrite, index directory, serta implementasi webserver. Rename tidak membuat mapping Node; tanpa mapping yang benar, hasilnya bisa 404, 403, atau directory listing jika diizinkan.

Konteks berikut berasal dari laporan pengguna, bukan inspeksi server: domain `ascentia.co.id`, document root `/home/u1725665/public_html`, aplikasi `/home/u1725665/ascentia-frontend`, URL aplikasi `/`, startup `app.js`, Node 20.20.2; WordPress lama dan folder CMS masih berada di document root.

## Tiga hal berbeda

- **Document root**: direktori file publik domain; saat ini `public_html`.
- **Application root**: direktori kode/runtime aplikasi; boleh berbeda dari document root. Node Selector mendokumentasikan: “App Root Directory — application root directory relative to user's home.” Application URL adalah “HTTP/HTTPS link to the application.” [CloudLinux UI](https://docs.cloudlinux.com/cloudlinuxos/lve_manager/#node-js-selector-client-plugin)
- **URL/mount aplikasi**: domain dan prefix URL yang dihubungkan webserver ke aplikasi. Route seperti `/products` kemudian diproses router aplikasi jika request benar-benar masuk Node. URL aplikasi `/` bukan perintah memindahkan document root.

## Batas cPanel dan keamanan

Dokumentasi Domains → Manage menyatakan: “You cannot change the document root directory for the Main Domain.” Juga: “The server does not rearrange your files in any way.” Batas ini berlaku pada antarmuka tersebut; perubahan konfigurasi tingkat provider perlu dikonfirmasi ke hosting. [cPanel](https://docs.cpanel.net/cpanel/domains/domains/manage-the-domain/)

**Jangan mengarahkan DocumentRoot ke seluruh application root.** Folder server/source, konfigurasi, atau berkas sensitif berpotensi menjadi file publik bila tidak dilindungi. Contoh Passenger memisahkan `DocumentRoot .../public` dari application root. Memasang SSR bukan berarti mempublikasikan seluruh proyek. Mempertahankan application root di luar `public_html` masuk akal; mapping webserver tetap harus benar. Mengubah document root juga berisiko mengubah akses path lama; pemetaan subdomain CMS harus diperiksa terpisah.

## Peran Passenger; batas LiteSpeed

[Referensi Passenger Apache](https://www.phusionpassenger.com/docs/references/config_reference/apache/):

- `PassengerEnabled`: “This option enables or disables Passenger for that particular context.” Bukan pemilih prioritas `index.php`.
- `PassengerAppRoot`: menentukan lokasi aplikasi; default parent dari DocumentRoot, dapat dioverride.
- `PassengerBaseURI`: “Used to specify that the given URI is an distinct application that should be served by Passenger.” Menandai mount URL, bukan lokasi file atau redirect browser.
- Startup khusus membutuhkan konteks tipe/root aplikasi yang sesuai.

[LiteSpeed resmi](https://docs.litespeedtech.com/lsws/cp/cpanel/cloudlinux/#rubypythonnodejs-selector): “LiteSpeed supports the Apache mod_passenger configuration generated through CloudLinux selectors.” Namun: “behind the scenes, LiteSpeed's is a completely different implementation.” Daftar directive yang didukung mencantumkan `PassengerBaseURI`, `PassengerAppRoot`, `PassengerAppType`, `PassengerStartupFile`, `PassengerNodejs`; **tidak mencantumkan `PassengerEnabled`**. Jangan mengasumsikan seluruh perilaku Apache berlaku identik atau menambahkan directive secara buta.

[Apache DirectoryIndex](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#directoryindex) mengatur daftar resource indeks direktori, bukan aturan universal bahwa PHP mengalahkan Node. [LSCache](https://docs.litespeedtech.com/lscache/devguide/usage/) menunjukkan `X-LiteSpeed-Cache: hit` untuk respons cache; tampilan lama saja belum membuktikan handler asalnya.

## Pemeriksaan berikutnya: hanya baca

1. Domains → Manage: pastikan label Main Domain, document root, redirect; periksa document root subdomain CMS.
2. Setup Node.js App → Edit: catat domain, URL/prefix, root, startup, versi Node, status, lokasi log; jangan Save/Restart dahulu.
3. Baca seluruh `.htaccess` `public_html`, terutama blok CloudLinux/Passenger, WordPress, cache, DirectoryIndex; baca `.htaccess` aplikasi jika ada. Rahasiakan kredensial.
4. Baca `app.js` dan target build Nitro; periksa log Selector/Passenger. LiteSpeed mendokumentasikan STDERR Node di `<application-root>/stderr.log`.

Belum terbukti: mapping aktif, urutan rewrite efektif, versi LiteSpeed, cache aktif, kompatibilitas startup Nitro, kebijakan paket Hostinger/Niagahoster. Tidak dilakukan probe situs atau perubahan server. Tidak ada catch-all `.htaccess` yang aman diberikan sebelum bukti tersebut tersedia.
