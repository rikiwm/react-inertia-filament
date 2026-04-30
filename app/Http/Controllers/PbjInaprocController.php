<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Inaproc\SummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

final class PbjInaprocController extends Controller
{
    private string $kodeKlpd = 'D471';

    /**
     * Menampilkan halaman daftar PBJ (SSR Pattern)
     */
    public function index(Request $request, SummaryService $summaryService): Response
    {
        $tahun = (int) $request->query('tahun', 2026);
        // $refresh = $request->has('refresh');

        // 1. Fetch Summary
        $summaryCacheKey = "inaproc_summary_{$tahun}_{$this->kodeKlpd}";

        $summary = Cache::remember($summaryCacheKey, 1800, function () use ($tahun, $summaryService) {
            return $summaryService->getSummary($tahun);
        });

        // 2. Fetch Satkers
        $satkers = Cache::remember('satkers', 3600, function () {
            $response = Http::withToken(env('INAPROC_API_TOKEN'))->get(env('INAPROC_BASE_URL').'rup/master-satker', [
                'kode_klpd' => 'D471',
                'tahun' => 2026,
                'limit' => 200,
            ]);

            return $response->successful() ? $response->json()['data'] : [];
        });

        return Inertia::render('Pbj/PbjListPage', [
            'initialTahun' => $tahun,
            'initialSummary' => $summary,
            'initialSatkers' => $satkers,
        ]);
    }

    /**
     * GET /api/pbj-inaproc?tahun=YYYY
     *
     * Menggabungkan data CATALOG, TENDER, NON-TENDER dari cache
     * menjadi satu array dengan flag `jenis_transaksi`.
     * Frontend: pbj-detail-service.ts → fetchPbjList
     */
    public function all(Request $request): JsonResponse
    {
        $tahun = $request->query('tahun', date('Y'));
        $result = [];

        $categories = ['CATALOG', 'TENDER', 'NON-TENDER'];
        foreach ($categories as $kategori) {
            $cacheKey = "inaproc_{$kategori}_{$tahun}_{$this->kodeKlpd}";
            $items = Cache::get($cacheKey, []);

            foreach ($items as $item) {
                $item['jenis_transaksi'] = $kategori;
                $result[] = $item;
            }
        }

        return response()->json($result);
    }

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
        $tahun = $request->query('tahun', date('Y'));
        
        $tenderSelesai = Cache::get("inaproc_TENDER_{$tahun}_{$this->kodeKlpd}", []);
        $tenderPengumuman = Cache::get("inaproc_TENDER-PENGUMUMAN_{$tahun}_{$this->kodeKlpd}", []);
        
        $tender = collect($tenderSelesai)->map(function ($item) use ($tenderPengumuman) {
            $tenderPengumumanItem = collect($tenderPengumuman)->firstWhere('kd_tender', $item['kd_tender']);
            $payload = [
                'nama_paket' => $tenderPengumumanItem['nama_paket'] ?? ($item['nama_paket'] ?? '-'),
                'lokasi_pekerjaan' => $tenderPengumumanItem['lokasi_pekerjaan'] ?? '-',
                'mtd_evaluasi' => $tenderPengumumanItem['mtd_evaluasi'] ?? '-',
                'mtd_kualifikasi' => $tenderPengumumanItem['mtd_kualifikasi'] ?? '-',
                'mtd_pemilihan' => $tenderPengumumanItem['mtd_pemilihan'] ?? '-',
            ];

            return $item + $payload;
        })->toArray();

        return response()->json($tender);
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
        $tahun = (int) $request->query('tahun', date('Y'));
        $refresh = $request->has('refresh');

        $cacheKey = "inaproc_summary_{$tahun}_{$this->kodeKlpd}";

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 1800, function () use ($tahun, $summaryService) {
            return $summaryService->getSummary($tahun);
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

        return response()->json($data);
    }
}
