<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\NewsScraperService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

final class KebencanaanController extends Controller
{
    /**
     * Display the disaster information page.
     */
    public function index(NewsScraperService $newsScraper)
    {
        // 1. Weather Data (Open-Meteo)
        $weather = Cache::remember('weather_padang_v3', 900, function () {
            $response = Http::withoutVerifying()
                ->timeout(20)
                ->get('https://api.open-meteo.com/v1/forecast', [
                    'latitude' => -0.947,
                    'longitude' => 100.417,
                    'current' => 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
                    'hourly' => 'temperature_2m,weather_code',
                    'daily' => 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
                    'timezone' => 'Asia/Bangkok',
                    'forecast_days' => 7,
                ]);

            return $response->successful() ? $response->json() : null;
        });

        // 2. ISPU Data (KemenLHK)
        $ispu = Cache::remember('ispu_padang_v4', 1800, function () {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get('https://ispu.kemenlh.go.id/apimobile/v1/getDetail/stasiun/PADANG');

            return $response->successful() ? $response->json() : null;
        });

        // 3. Disaster Map (SumbarProv)
        $disasterMap = Cache::remember('disaster_map_sumbar_v3', 1800, function () {
            $response = Http::withoutVerifying()
                ->timeout(20)
                ->get('https://api-bencana.sumbarprov.go.id/api/peta-kejadian');

            if ($response->successful()) {
                $data = $response->json()['data'] ?? [];
                
                $filtered = array_values(array_filter($data, function ($item) {
                    $daerah = $item['nm_daerah'] ?? '';
                    return mb_stripos($daerah, 'kota padang') !== false;
                }));

                return array_map(function($item) {
                    return [
                        'id' => $item['id'] ?? uniqid(),
                        'lat' => $item['latitude'] ?? 0,
                        'lng' => $item['longitude'] ?? 0,
                        'title' => $item['nm_bencana'] ?? 'Bencana',
                        'location' => $item['nm_daerah'] ?? 'Padang',
                        'time' => $item['tgl_kejadian'] ?? null,
                        'description' => $item['keterangan'] ?? '',
                        'status' => $item['nm_status'] ?? 'Aktif',
                    ];
                }, $filtered);
            }

            return [];
        });

        $hashtagNews = $newsScraper->scrapeByQuery('bencana OR banjir OR gempa OR cuaca "padang"', 6);

        return Inertia::render('KebencanaanPage', [
            'weather' => $weather,
            'ispu' => $ispu,
            'disasterMap' => $disasterMap,
            'lastUpdate' => now()->format('Y-m-d H:i:s'),
            'hashtagNews' => $hashtagNews,
        ]);
    }
}
