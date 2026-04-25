/**
 * @file Components/News/helpers.ts
 *
 * Fungsi-fungsi utilitas murni (pure functions) yang digunakan bersama
 * oleh semua komponen News. Tidak ada dependensi React sehingga
 * sepenuhnya dapat diuji tanpa DOM.
 */

/**
 * Mengubah string tanggal ISO menjadi teks relatif dalam Bahasa Indonesia.
 *
 * Menghitung selisih waktu antara sekarang dan tanggal yang diberikan,
 * lalu mengembalikan representasi yang mudah dibaca manusia.
 *
 * @param dateStr - String tanggal dalam format ISO 8601
 * @returns Teks waktu relatif dalam Bahasa Indonesia
 *
 * @example
 * timeAgo("2025-04-15T10:00:00Z") // "2 jam lalu"
 * timeAgo("2025-04-14T10:00:00Z") // "1 hari lalu"
 */
export function timeAgo(dateStr: string): string {
    const diffSeconds = (Date.now() - new Date(dateStr).getTime()) / 1000;

    if (diffSeconds < 60) return `${Math.floor(diffSeconds)} detik lalu`;
    if (diffSeconds < 3_600) return `${Math.floor(diffSeconds / 60)} menit lalu`;
    if (diffSeconds < 86_400) return `${Math.floor(diffSeconds / 3_600)} jam lalu`;
    return `${Math.floor(diffSeconds / 86_400)} hari lalu`;
}

/**
 * Mengubah string tanggal ISO menjadi format tanggal lengkap lokal Indonesia.
 *
 * Menggunakan `Intl.DateTimeFormat` dengan locale `id-ID` untuk menampilkan
 * nama hari, tanggal, bulan, dan tahun secara penuh.
 *
 * @param dateStr - String tanggal dalam format ISO 8601
 * @returns Tanggal lengkap dalam format Indonesia
 *
 * @example
 * formatDate("2025-04-15T10:00:00Z") // "Selasa, 15 April 2025"
 */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Memperkirakan waktu baca artikel dalam satuan menit.
 *
 * Menggunakan rata-rata kecepatan baca 200 kata per menit.
 * Selalu mengembalikan minimal 1 menit meskipun kontennya sangat pendek.
 *
 * @param text - Teks konten artikel yang akan diperkirakan waktu bacanya
 * @returns Estimasi waktu baca dalam menit (minimum 1)
 *
 * @example
 * estimateReadingTime("kata ".repeat(200)) // 1
 * estimateReadingTime("kata ".repeat(600)) // 3
 */
export function estimateReadingTime(text: string): number {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

/**
 * Membersihkan dan memecah konten mentah GNews menjadi array paragraf.
 *
 * GNews API sering menambahkan suffix "[+N chars]" pada konten yang dipotong.
 * Fungsi ini menghapus suffix tersebut, memecah teks berdasarkan baris kosong,
 * lalu memfilter baris yang kosong.
 *
 * @param raw - Konten mentah dari GNews API
 * @returns Array paragraf yang sudah dibersihkan dan siap dirender
 *
 * @example
 * parseArticleContent("Para 1\n\nPara 2\n[+120 chars]")
 * // ["Para 1", "Para 2"]
 */
export function parseArticleContent(raw: string): string[] {
    const cleaned = raw.replace(/\s*\[\+\d+ chars?\]\s*$/, "").trim();
    return cleaned
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
}

/**
 * Memotong string agar tidak melebihi panjang maksimum yang ditentukan.
 *
 * Jika string lebih panjang dari `maxLen`, teks akan dipotong dan
 * diakhiri dengan karakter ellipsis (…). Menangani string kosong/null
 * dengan aman.
 *
 * @param text   - Teks yang ingin dipotong
 * @param maxLen - Jumlah karakter maksimum (tidak termasuk ellipsis)
 * @returns Teks yang sudah dipotong, atau string kosong jika input kosong
 *
 * @example
 * truncate("Halo dunia yang indah", 10) // "Halo dunia…"
 * truncate("Pendek", 20)                // "Pendek"
 */
export function truncate(text: string, maxLen: number): string {
    if (!text) return "";
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

