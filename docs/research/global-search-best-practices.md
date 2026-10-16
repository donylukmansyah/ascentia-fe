# Best Practices Global Search & Command Palette (UX & Arsitektur)

Status: Riset komprehensif berbasis standar industri (Algolia DocSearch, Nielsen Norman Group, W3C WAI-ARIA APG, Linear/Raycast/cmdk).

---

## 1. Problem Statement: Masalah Retensi Input pada Modal

### Gejala yang Terjadi di Ascentia

Ketika user mengetik kata kunci (misal `DDD`), menutup modal (via tombol `Esc` atau klik luar), lalu membukanya kembali:

- Input search masih terisi `DDD`.
- Halaman langsung menampilkan state _“No results found for DDD”_.
- User terpaksa harus menghapus teks manual (backspace atau tombol X) sebelum bisa mengetik hal baru.

### Mengapa Ini Terjadi Secara Teknis?

Komponen `SearchDialog` tetap ter-mount di DOM (menggunakan `Dialog open={open}`). State lokal React (`const [draft, setDraft] = useState('')`) tidak unmount saat `open` bernilai `false`, sehingga state lama tetap tersimpan di memori browser tanpa ada mekanisme reset siklus hidup (_lifecycle reset_).

---

## 2. Standar Industri: Siklus Hidup Search Modal (Lifecycle)

Rujukan: **Algolia DocSearch**, **Linear**, **macOS Spotlight**, **GitHub Command Palette**, **Raycast**.

| Pendekatan                                                             | Cara Kerja                                                                                                                            | Kapan Digunakan                                                           | Evaluasi untuk Ascentia                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **A. Fresh Start (Reset on Open / Dismiss)** _(Industry Default 90%+)_ | Setiap kali modal dibuka atau ditutup, query di-reset ke `""` (kosong), scroll di-reset ke 0, dan fokus siap di input.                | Command palette, overlay pencarian situs, e-commerce, portal dokumentasi. | **Sangat Direkomendasikan.** Pengguna membuka search untuk mencari hal baru, bukan melihat hasil pencarian lama yang gagal. |
| **B. Retain with Auto-Select (`input.select()`)**                      | Teks lama dipertahankan, tetapi saat modal dibuka kembali, seluruh teks langsung terseleksi otomatis.                                 | Alat pencarian dokumen panjang atau editor kode.                          | Kurang cocok untuk website korporat/katalog; jika user langsung tekan Enter tidak sengaja mencari hal lama.                 |
| **C. Recent Searches (Riwayat Lokal)**                                 | Input selalu bersih `""` saat dibuka, namun area kosong menampilkan 3–5 riwayat pencarian terakhir user (disimpan di `localStorage`). | Tokopedia, Shopee, Google Search, Algolia DocSearch.                      | Sangat baik sebagai peningkatan tahap berikutnya (opsional).                                                                |

> **Konsensus UX (NN/g & Algolia):** Overlay pencarian yang dipicu shortcut/ikon header bersifat _ephemeral_ (sementara). Membuka modal adalah sinyal niat pencarian baru. Field harus bersih dan siap menerima ketikan pertama tanpa _interaction cost_ tambahan.

---

## 3. Anatomi Search Dialog Berstandar Tinggi

### A. State Awal (Saat Input Masih Kosong / Baru Buka)

Jangan biarkan layar hampa atau canggung. Standar terbaik:

1. **Quick Shortcuts / Kategori Cepat:** Tombol chip klik cepat ke kategori utama, misalnya:
   - `Products`
   - `News & Events`
   - `Blogs`
   - Topik populer: `XRF`, `Fusion Machines`
2. **Recent Searches (Jika ada riwayat):** Daftar item yang baru saja dikunjungi dari search, dengan tombol "Clear history".
3. **Instruksi Ringkas:** Keterangan navigasi keyboard (`↑ ↓ to navigate`, `esc to close`).

### B. Hierarki Penekanan Tombol `Esc` (Progressive Dismiss)

Standar ergonomi keyboard:

- **Tekan `Esc` ke-1 (saat ada teks di input):** Bersihkan input menjadi kosong `""`, kembali ke initial state.
- **Tekan `Esc` ke-2 (saat input sudah kosong):** Tutup modal pencarian.
  _(Atau sediakan tombol `X` yang jelas di dalam input)._

### C. State Hasil Pencarian (Active Search)

1. **Group Headers Sticky:** Label grup (`Products`, `News`, `Blogs`) harus `sticky` agar ketika di-scroll ke bawah, konteks kategori tidak hilang.
2. **Kategori Kosong Disembunyikan:** Jangan tampilkan kategori dengan isi 0 jika kategori lain memiliki hasil.
3. **Global Zero State:** Jika semua kategori 0 hasil:
   - Tampilkan pesan empatik: `No results found for “{query}”`.
   - Berikan aksi nyata: tombol _“Clear search”_ atau tautan _“Explore all products”_.

### D. Performa & Jaringan

1. **Debounce Ideal:** 250–300 ms (cukup cepat untuk terasa responsif, cukup lambat untuk menghindari spam ke WordPress REST API).
2. **Abort Stale Requests:** Gunakan `AbortSignal` agar ketikan lama dibatalkan di jaringan dan tidak menimpa kueri baru.
3. **TanStack Query Caching:** Simpan cache kueri yang sama selama 60 detik (`staleTime: 60_000`) agar navigasi bolak-balik terasa instan.

---

## 4. Rekomendasi Solusi untuk Ascentia

1. **Langkah 1: Reset Lifecycle Modal (Prioritas Segera)**
   Tambahkan sinkronisasi saat `open` berubah:

   ```tsx
   useEffect(() => {
     if (open) {
       setDraft('')
       setQuery('')
     }
   }, [open])
   ```

   Setiap kali modal dibuka, user selalu mendapat input bersih dan siap ketik.

2. **Langkah 2: Initial Quick Suggestions (UX Menyenangkan)**
   Gantikan teks statis _"Search across Products, News and Blogs"_ dengan tombol chip cepat untuk filter instan atau pencarian cepat, sehingga saat baru membuka, modal sudah berguna bahkan sebelum mengetik.

3. **Langkah 3: Dual-Stage Escape (Ergonomi Keyboard)**
   Jika input terisi, tombol keyboard `Esc` pertama menghapus draft input. Jika sudah kosong, `Esc` menutup modal.

---

## Referensi Sumber Primer

- **Nielsen Norman Group (NN/g):** _Site Search Suggestions & Search Interface Usability_ (https://www.nngroup.com/articles/site-search-suggestions/)
- **Algolia Autocomplete & DocSearch Documentation:** _Controlling Behavior with State, Detached Mode & Reset Actions_ (https://www.algolia.com/doc/ui-libraries/autocomplete/)
- **W3C WAI-ARIA APG:** _Combobox Pattern with Dialog and Listbox_ (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- **Paco Coursey (`cmdk`):** _Fast, unstyled command menu React component_
