<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Merender halaman daftar berita.
 * Bertindak sebagai single-action controller untuk route GET /berita.
 */
final class NewsPageRenderer extends Controller
{
    /**
     * Menampilkan halaman daftar berita.
     *
     * Merender komponen Inertia 'NewsPage'. Data berita tidak di-pass
     * dari server — komponen React mengambil data sendiri dari GNews API
     * secara client-side untuk performa optimal.
     */
    public function __invoke(): Response
    {
        return Inertia::render('NewsPage');
    }
}
