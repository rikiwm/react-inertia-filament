<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Merender halaman detail artikel berita.
 * Bertindak sebagai single-action controller untuk route GET /berita/detail.
 *
 * Data artikel tidak di-pass dari server. Komponen React membaca data
 * dari sessionStorage yang diisi oleh halaman daftar berita saat user
 * mengklik sebuah artikel (via newsService.saveArticleForDetail).
 */
final class NewsDetailRenderer extends Controller
{
    /**
     * Menampilkan halaman detail berita.
     *
     * Cukup merender shell Inertia — data artikel diambil secara
     * client-side dari sessionStorage tanpa memerlukan query server tambahan.
     */
    public function __invoke(): Response
    {
        return Inertia::render('NewsDetailPage');
    }
}
