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
        $news = Cache::remember('initial_news_v2', 1800, function () {
            try {
                // Token dari konstanta frontend
                $token = "a3fcb25cb5b5e258d98d09e4f8b47efc";
                $response = \Illuminate\Support\Facades\Http::get("https://gnews.io/api/v4/search", [
                    'q' => 'Indonesia',
                    'lang' => 'id',
                    'country' => 'id',
                    'max' => 9,
                    'token' => $token
                ]);

                return $response->successful() ? $response->json()['articles'] : [];
            } catch (\Exception $e) {
                return [];
            }
        });

        return Inertia::render('NewsPage', [
            'initialArticles' => $news
        ]);
    }
}
