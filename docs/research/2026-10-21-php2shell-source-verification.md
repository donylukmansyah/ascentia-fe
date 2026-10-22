# Verifikasi sumber PHP2Shell — 21 Oktober 2026

## Kesimpulan

**Cerita inti terkonfirmasi melalui sumber primer yang berhasil diambil, bukan sekadar hasil pencarian.** Artikel tersedia di domain resmi Wiz; advisori PHP dan dua rekaman CVE menguatkan kerentanan serta rilis perbaikannya. Ini **bukan** bukti Ascentia terdampak.

| Klaim                                       | Hasil verifikasi                                                                                                                                                                                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Judul PHP2Shell, publikasi 21 Oktober 2026  | Artikel resmi Wiz ditemukan; hasil pencarian mencantumkan tanggal tersebut dan artikel memuat tanggal pengungkapan yang sama. [1]                                                                                                                           |
| CVE-2026-109618 dan CVE-2026-109619         | API CVE mengembalikan status `PUBLISHED`, CNA `php`, tanggal publikasi 21 Oktober 2026. Judul masing-masing: `RCE via OOM corruption`, `RCE via stale global state`. [3][4]                                                                                 |
| OOM, use-after-free lintas request, OPcache | PHP/CVE mengonfirmasi korupsi OOM dan state request yang tersisa setelah memorinya dibebaskan, berpotensi RCE tanpa autentikasi. Rincian OPcache/type confusion serta demonstrasi CMS dijelaskan Wiz; tidak direproduksi dalam penelitian ini. [1][2][3][4] |
| Patch pada tanggal tersebut                 | PHP mengumumkan **8.2.35, 8.3.36, 8.4.27, 8.5.12** pada 21 Oktober 2026; batas versi terdampak pada kedua rekaman CVE konsisten. PHP menyatakan tidak ada mitigasi lengkap pengganti pembaruan. [2][3][4]                                                   |
| “70% Internet”                              | Pernyataan Wiz tentang prevalensi PHP, bukan pengukuran bahwa 70% seluruh aset Internet dapat dieksploitasi. Angka serta denominator statistik belum diverifikasi independen. [1]                                                                           |
| Gemini 4 Argon, GPT-5.6 Sol                 | Nama dan keterlibatan keduanya memang dinyatakan Wiz. Identitas produk, kontribusi, dan performa belum diverifikasi melalui publikasi Google/OpenAI. [1]                                                                                                    |

PHP mencantumkan cabang 8.2–8.5 sebagai didukung; dukungan keamanan 8.2 berakhir 31 Desember 2026. PHP 8.1 atau lebih lama memerlukan jalur pembaruan/vendor, bukan asumsi aman karena tidak tercantum pada rentang CVE cabang didukung. [2][5]

## Batasan

9router gagal: `No 9router web search route is configured or discovered`. Dilanjutkan pencarian Exa dan pengambilan halaman resmi melalui alat fetch. Kedua halaman NVD gagal diekstrak: `Page appears to be JavaScript-rendered (content loads dynamically)`; isi NVD tidak dikonfirmasi. Tidak ada verifikasi tanda tangan rilis, audit kode/dependensi/runtime Ascentia, akses rahasia, pemindaian produksi, payload, atau pengujian eksploit. Ketiadaan hasil bukan bukti klaim palsu.

## Sumber

1. Wiz: https://www.wiz.io/blog/php2shell-php-rce
2. PHP advisori/rilis: https://www.php.net/archive/2026.php#2026-10-21-5
3. CVE API: https://cveawg.mitre.org/api/cve/CVE-2026-109618
4. CVE API: https://cveawg.mitre.org/api/cve/CVE-2026-109619
5. PHP dukungan: https://www.php.net/supported-versions.php
6. NVD, dicoba tetapi tidak terbaca: https://nvd.nist.gov/vuln/detail/CVE-2026-109618 dan https://nvd.nist.gov/vuln/detail/CVE-2026-109619
