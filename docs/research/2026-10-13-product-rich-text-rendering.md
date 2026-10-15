# Rich text produk: struktur CMS, tipografi frontend

**Bisa.** HTML semantik mempertahankan struktur; stylesheet tema WordPress/Divi tidak otomatis ikut melalui JSON API. Frontend menentukan tampilannya. Store API mengembalikan `description` berupa HTML [1]; `wpautop` mengubah baris kosong menjadi `<p>` [2]. Jangan parse Divi.

## Bukti lokal (HTTP sesi utama)

GET `http://ascentia-local.local/wp-json/wc/store/v1/products/1692?_fields=id,name,description`: HTTP 200, TGA; `p=11`, `a=2`, `ul=3`, `li=17`, tanpa heading. “Fitur Utama”, “Jenis Aplikasi”, “Sesuai dengan standar” masih paragraf; pilih Heading 2/3 melalui dropdown Paragraph editor agar semantik benar.

`src/features/products/components/product-detail-content.tsx` sekarang merender `description: string[]` sebagai `<p>{paragraph}</p>`; HTML akan ter-escape. Benefits/specifications masih struktur khusus. Adaptasi renderer diperlukan; gunakan HTML Description dahulu. Jangan otomatis memecah paragraf menjadi tab. Jika workflow membutuhkan tab terpisah, gunakan ACF WYSIWYG benefits/specifications; repeater ACF Pro tidak diperlukan.

## Rekomendasi

- `sanitize-html` sudah tersedia. Tetapkan allowlist tag (`p`, `br`, `h2`, `h3`, `strong`, `em`, `ul`, `ol`, `li`, `a`, elemen tabel), atribut minimum, skema URL eksplisit. Buang class/style arbitrer, script, event handler [3]. Render hasil sanitasi saja dengan `dangerouslySetInnerHTML` [4].
- CSS ter-scope pada konten, bukan global `li/a`: font Plus Jakarta/token frontend, jarak paragraf/heading, bullet/nomor, link bergaris bawah dan focus-visible. Preflight mereset heading, margin, marker daftar [5]. Gunakan CSS biasa/utility; plugin typography tidak diperlukan. `overflow-wrap: anywhere` untuk URL panjang; wrapper `overflow-x: auto` untuk tabel.
- Petakan hanya URL legacy yang dikenali: `https://ascentia.co.id/product-category/by-manufacturer/xrf-scientific/` ke **usulan** `/products/brands?brand=xrf-scientific` setelah kontrak query tersedia. Pertahankan eksternal `https://www.xrfscientific.com/products/xrtga-1100/`. Jangan rewrite host/path menyeluruh. Jika `target="_blank"`, tetapkan `rel="noopener noreferrer"` serta izinkan atributnya; validasi URL tetap wajib [3].

## Sumber primer

1. [WooCommerce Store API Products](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/)
2. [WordPress wpautop](https://developer.wordpress.org/reference/functions/wpautop/)
3. [sanitize-html README resmi](https://github.com/apostrophecms/sanitize-html)
4. [React: dangerouslySetInnerHTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)
5. [Tailwind Preflight](https://tailwindcss.com/docs/preflight)
