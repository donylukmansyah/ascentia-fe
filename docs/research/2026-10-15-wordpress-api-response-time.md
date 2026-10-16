# WordPress/WooCommerce API Response Time — Riset

**Tanggal:** 2026-10-15  
**Konteks:** WordPress Local (Windows), origin `http://ascentia-local.local`  
**Stack server:** nginx 1.26.1, PHP 8.2.29  
**Batas timeout frontend:** `AbortSignal.timeout(12000)` (12 detik)

---

## 1. Snapshot Pengukuran (curl, bukan load test)

Baseline environment lokal — bukan benchmark definitif, bukan load test.

| Endpoint                                         | Sample 1                          | Sample 2 | Payload |
| ------------------------------------------------ | --------------------------------- | -------- | ------- |
| Static image (HTTP 200)                          | total 0.009s                      | —        | —       |
| `wp/v2/product` slug + ACF `_fields`             | 1.621s                            | 1.827s   | 186 B   |
| `wc/store/v1/products/1318` detail               | 1.315s                            | 1.132s   | 4 903 B |
| `wc/store/v1/products` related + `_fields`       | 1.504s                            | 1.121s   | 6 120 B |
| ↳ curl.exe explicit (DNS 0.005s, connect 0.005s) | TTFB **1.445s**, total **1.445s** | —        | —       |
| 1 produk, ID-only (13 B JSON, unfiltered)        | 1.1s                              | 2.25s    | 13 B    |

**TTFB ≈ Total** di semua kasus — payload <7 KB, transfer bukan bottleneck.

**Concurrency (3 request bersamaan, 2 batch):** satu request per batch ~2.45–2.53s, dua lainnya ~1.16–1.24s.

**Frontend SSR (`/products/xrfuse-2-...`):** HTTP 200, TTFB 2.283s, total 3.384s — selisih ~1.1s mencerminkan streaming SSR setelah byte pertama.

---

## 2. Kesimpulan dari Data

**Yang terbukti dari pengukuran:**

- DNS/connect dengan `--resolve` IPv4 dan IPv6 explicit ~0.0005s — resolusi hostname bukan penyebab.
- Request 1-produk 13-byte JSON tetap 1.1–2.25s, sama rentangnya dengan request 6 KB. Filter `_fields` maupun ukuran kategori tidak mengubah rentang secara konsisten.
- **Ini membuktikan bottleneck ada di bootstrap PHP/WP per-request, bukan di payload, query kategori, atau jumlah field yang direturn.**
- Pola 2.4s vs 1.2s di concurrent batch konsisten dengan antrean worker PHP-FPM (bukan query lebih berat).
- True timeout 12s diketahui pernah terjadi dari log pengguna, tapi tidak berhasil direproduksi hari ini — kondisi sesaat atau akumulasi concurrent load, bukan masalah struktural yang menetap saat ini.

**Yang belum terbukti:**

- Status persistent object cache di sisi server — response tidak memuat `Cache-Control`, `Age`, `X-Cache`, atau `Server-Timing`. Absensi header ini tidak membuktikan ada atau tidaknya object cache.
- Apakah MariaDB vs MySQL berkontribusi di setup ini secara spesifik.

---

## 3. Apa itu TTFB vs Total

| Istilah   | Definisi                                                                        |
| --------- | ------------------------------------------------------------------------------- |
| **TTFB**  | Waktu dari request dikirim sampai byte pertama diterima — mencerminkan PHP + DB |
| **Total** | TTFB + waktu download body                                                      |

Gap TTFB→Total diabaikan karena payload <7 KB. Variasi waktu seluruhnya di sisi server.

---

## 4. Tiga Lapisan Cache — Perbedaannya

| Lapisan                                   | Cara Kerja                                                         | Status di Proyek Ini                                                             |
| ----------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **HTTP Cache** (`Cache-Control`, ETag)    | Browser/CDN simpan response; request berikutnya bypass PHP         | Store API tidak mengirim header caching — tidak aktif                            |
| **WP Persistent Object Cache**            | Hasil query DB bertahan lintas request PHP; skip MySQL per request | Tidak dikonfirmasi — absensi header tidak membuktikan ketiadaan                  |
| **Frontend `staleTime`** (TanStack Query) | Data di memori browser; skip request dalam window stale            | **Aktif:** taxonomy 5 menit, `staleTime` 60s — lindungi setelah response pertama |

Frontend sudah memiliki perlindungan memadai di lapisan client. Penambahan dependency server-side tidak direkomendasikan sebelum profiling via Query Monitor.

---

## 5. Konteks Alur Frontend

`readProductDetail` berjalan sekuensial: `wp/v2/product` slug lookup (~1.6s) → `wc/store/v1/products/{id}` (~1.2s) = ~2.8s sebelum render. Related products difetch di background. Wajar untuk environment lokal tanpa persistent cache; angka production kemungkinan lebih rendah.

---

## 6. Cara Mengukur Waktu Response

### curl.exe (Windows)

```
curl.exe -w "DNS: %{time_namelookup}s\nConnect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" -o NUL -s "http://ascentia-local.local/wp-json/wc/store/v1/products?..."
```

Untuk bypass DNS sepenuhnya:

```
curl.exe --resolve ascentia-local.local:80:127.0.0.1 -w "..." -o NUL -s "http://..."
```

Semua nilai kumulatif dari awal request. Gap `time_pretransfer` → `time_starttransfer` = waktu server murni (PHP + DB).  
Sumber: [Stack Overflow – curl timing](https://stackoverflow.com/questions/18215389/how-do-i-measure-request-and-response-times-at-once-using-curl)

### Postman

Hover angka di kolom "Time" pada tab response → tooltip breakdown: Socket Init / DNS Lookup / TCP Handshake / Transfer Start (≈ TTFB) / Download. Tersedia sejak v7.27. Hanya via UI — `pm.response.responseTime` di script hanya total.  
Sumber: [Postman Blog – Network Info](https://blog.postman.com/see-network-info-for-postman-api-requests/)

### Thunder Client (VS Code)

Menampilkan total ms saja di panel response. Tidak ada breakdown per fase — gunakan curl atau Postman untuk isolasi layer.  
Sumber: [Thunder Client Docs](https://docs.thunderclient.com/scripting/api)

---

## 7. Debugging dengan Query Monitor

Install [Query Monitor](https://wordpress.org/plugins/query-monitor/) di WordPress Local. Tambahkan `?_envelope&_wpnonce=<nonce>` ke request REST API:

```
# Dapatkan nonce (harus login sebagai Administrator):
http://ascentia-local.local/wp-admin/admin-ajax.php?action=rest-nonce

# Gunakan di request:
http://ascentia-local.local/wp-json/wc/store/v1/products/1318?_envelope&_wpnonce=abc123
```

Response JSON berisi objek `qm`:

| Field           | Isi                                                               |
| --------------- | ----------------------------------------------------------------- |
| `qm.db_queries` | Semua SQL + timing individual — identifikasi N+1 atau query mahal |
| `qm.cache`      | Hit/miss object cache per request                                 |
| `qm.http`       | Outbound HTTP dari plugin — sumber latensi tak terduga            |

Header `x-qm-overview-time-taken` = total waktu PHP dalam detik. Bandingkan dengan `time_starttransfer` dari curl — selisihnya adalah overhead jaringan lokal (seharusnya <5ms).  
Sumber: [Query Monitor – REST API requests](https://querymonitor.com/wordpress-debugging/rest-api-requests/)

---

## 8. WooCommerce: Issue N+1 Query (konteks)

`StoreApi\Utilities\ProductQuery::get_objects()` sebelumnya memanggil `wc_get_product()` per ID satu per satu. Fix via `_prime_post_caches()` di-merge September 2025 — hemat ~300ms untuk 100 produk tanpa object cache. Untuk `per_page=4` dampak lebih kecil.  
Sumber: [WooCommerce Issue #60647](https://github.com/woocommerce/woocommerce/issues/60647) — closed 2025-09-23.

---

## Referensi (hanya sumber yang diakses langsung dalam sesi ini)

- [Query Monitor REST API requests](https://querymonitor.com/wordpress-debugging/rest-api-requests/) — diakses, berisi contoh JSON `qm` lengkap
- [WooCommerce Issue #60647](https://github.com/woocommerce/woocommerce/issues/60647) — diakses, berisi detail N+1 fix
- [WooCommerce Store API Products](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/) — dari search result resmi
- [Postman Blog – Network Info per Request](https://blog.postman.com/see-network-info-for-postman-api-requests/) — dari search result resmi
- [Stack Overflow – curl timing breakdown](https://stackoverflow.com/questions/18215389/how-do-i-measure-request-and-response-times-at-once-using-curl) — dari search result
- [Thunder Client Scripting API](https://docs.thunderclient.com/scripting/api) — dari search result resmi
- [WordPress Local Windows performance](https://community.localwp.com/t/slow-performance-using-mariadb-on-windows/42141) — dari search result
