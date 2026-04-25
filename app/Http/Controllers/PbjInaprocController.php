<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Inaproc\SummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

final class PbjInaprocController extends Controller
{
    private string $kodeKlpd = 'D471';

    /**
     * Endpoint untuk CATALOG (E-Purchasing)
     */
    public function catalog(Request $request): JsonResponse
    {
        return $this->responseFromCache('CATALOG', $request);
    }

    /**
     * Endpoint untuk TENDER
     */
    public function tender(Request $request): JsonResponse
    {
        return $this->responseFromCache('TENDER', $request);
    }

    /**
     * Endpoint untuk NON-TENDER
     */
    public function nonTender(Request $request): JsonResponse
    {
        return $this->responseFromCache('NON-TENDER', $request);
    }

    /**
     * Endpoint untuk Summary Agregasi
     */
    public function summary(Request $request, SummaryService $summaryService): JsonResponse
    {
        $tahun = $request->query('tahun', date('Y'));

        // Disarankan cache khusus jika load summary juga sering
        $cacheKey = "inaproc_summary_{$tahun}_{$this->kodeKlpd}";
        // Cache::forget($cacheKey);
        $data = Cache::remember($cacheKey, 60 * 60, function () use ($tahun, $summaryService) {
            return $summaryService->getSummary((int) $tahun);
        });

        return response()->json($data);
    }

    public function satker(): JsonResponse
    {
        if (Cache::has('satkers')) {
            return response()->json(Cache::get('satkers')['data']);
        }

        $response = Http::withToken(env('INAPROC_API_TOKEN'))->get(env('INAPROC_BASE_URL').'rup/master-satker', [
            'kode_klpd' => 'D471',
            'tahun' => 2026,
            'limit' => 200,
        ])->json();
        Cache::put('satkers', $response, 60 * 60);

        return response()->json($response['data']);

    }

    /**
     * Helper response from cached background sync
     */
    private function responseFromCache(string $kategori, Request $request): JsonResponse
    {
        $tahun = $request->query('tahun', date('Y'));
        $cacheKey = "inaproc_{$kategori}_{$tahun}_{$this->kodeKlpd}";
        // Membaca dari scheduler cache
        $data = Cache::get($cacheKey, []);

        // Pilihan: Jika belum di-sync cron, tapi ini diminta langsung, kita bisa mengembalikan array kosong.
        // User disarankan menjalankan cron minimal sekali.

        return response()->json($data);
    }
}
