<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\NewsScraperService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

final class ProgulController extends Controller
{
    public function index(NewsScraperService $newsScraper)
    {
        // 1. Fetch Progul Categories from existing API
        $progulData = Cache::remember('progul_api_data', 3600, function () {
            $response = Http::get('http://103.141.74.143/api/progul');

            return $response->successful() ? $response->json()['data'] : [];
        });

        return Inertia::render('Progul/ProgulPage', [
            'initialCategories' => $this->formatCategories($progulData),
        ]);
    }

    public function show($id, NewsScraperService $newsScraper)
    {
        // 1. Fetch Progul data to get the name
        $progulData = Cache::remember('progul_api_data', 3600, function () {
            $response = Http::get('http://103.141.74.143/api/progul');

            return $response->successful() ? $response->json()['data'] : [];
        });

        $progul = collect($progulData)->firstWhere('id', (int) $id);
        $name = $progul['nama'] ?? 'Program Unggulan Padang';

        // 2. Scrape news specifically for this Progul name
        // Use the name directly as hashtag search is often too restrictive for RSS
        $query = 'Program '.$name.' Kota Padang';
        $hashtagNews = $newsScraper->scrapeByQuery($query, 8);

        return Inertia::render('Progul/ActivasiPage', [
            'id' => (int) $id,
            'progulName' => $name,
            'hashtagNews' => $hashtagNews,
        ]);
    }

    private function formatCategories(array $data): array
    {
        return array_map(function ($item) {
            return [
                'id' => $item['id'],
                'name' => $item['nama'],
                'count' => array_reduce($item['activasi'] ?? [], function ($carry, $act) {
                    return $carry + count($act['kinerja'] ?? []);
                }, 0),
            ];
        }, $data);
    }
}
