<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiService
{
    /**
     * Reusable method untuk memanggil API
     *
     * @param  string  $url  URL lengkap endpoint API
     * @param  array  $params  Parameter query (contoh: ['tahun' => 2024])
     * @param  bool  $requiresAuth  Apakah endpoint ini butuh token?
     */
    protected function fetchApi(string $url, array $params = [], bool $requiresAuth = false)
    {
        try {
            // Setup timeout 15 detik agar aplikasi tidak hang jika API lambat
            $request = Http::timeout(10);

            if ($requiresAuth) {
                // Token Inaproc dari .env (contoh pengaturan di .env: INAPROC_TOKEN=xxx)
                $token = env('INAPROC_API_TOKEN');
                $request = $request->withToken($token);
            }

            // Lakukan pemanggilan GET request dengan parameter query ($params)
            $response = $request->get($url, $params);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("API Error [{$url}] Status: ".$response->status());

        } catch (\Exception $e) {
            Log::error("API Exception [{$url}]: ".$e->getMessage());
        }

        return []; // Balikkan array kosong jika gagal
    }
}
