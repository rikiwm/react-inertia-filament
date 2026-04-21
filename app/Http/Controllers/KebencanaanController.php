<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

final class KebencanaanController extends Controller
{
    /**
     * Display the disaster information page.
     */
    public function index()
    {
        // Cache weather data for 15 minutes
        $weather = Cache::remember('weather_padang_v2', 900, function () {
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->get('https://api.open-meteo.com/v1/forecast', [
                    'latitude' => -0.947,
                    'longitude' => 100.417,
                    'current' => 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
                    'timezone' => 'Asia/Bangkok',
                ]);

            return $response->successful() ? $response->json() : null;
        });

        // Cache ISPU data for 30 minutes
        $ispu = Cache::remember('ispu_padang_v3', 1800, function () {
            // Using withoutVerifying and timeout because government APIs can be slow or have SSL issues
            // Using a modern User-Agent helps avoid blocks
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get('https://ispu.kemenlh.go.id/apimobile/v1/getDetail/stasiun/PADANG');

            return $response->successful() ? $response->json() : null;
        });

        // Cache Disaster Map data for 30 minutes
        $disasterMap = Cache::remember('disaster_map_sumbar_v2', 1800, function () {
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->get('https://api-bencana.sumbarprov.go.id/api/peta-kejadian');

            if ($response->successful()) {
                $data = $response->json()['data'] ?? [];

                // Filter only for Kota Padang as requested
                return array_values(array_filter($data, function ($item) {
                    return isset($item['nm_daerah']) && mb_strtolower($item['nm_daerah']) === 'kota padang';
                }));
            }

            return [];
        });

        // dd($ispu);

        return Inertia::render('KebencanaanPage', [
            'weather' => $weather,
            'ispu' => $ispu,
            'disasterMap' => $disasterMap,
        ]);
    }
}
