<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Log;

final class DashboardApiController extends Controller
{
    protected $keuanganService;

    protected $pbjService;

    protected $progulService;

    protected $newsScraperService;

    public function __construct(
        \App\Services\KeuanganService $keuanganService,
        \App\Services\PbjService $pbjService,
        \App\Services\ProgulService $progulService,
        \App\Services\NewsScraperService $newsScraperService
    ) {
        $this->keuanganService = $keuanganService;
        $this->pbjService = $pbjService;
        $this->progulService = $progulService;
        $this->newsScraperService = $newsScraperService;
    }

    /**
     * GET /api/apbd?tahun=YYYY
     *
     * Frontend: apbd-service.ts → expects { code, message, result: { tahun, item: [...] } }
     */
    public function getApbd(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        try {
            $start = microtime(true);
            $dataApbd = $this->keuanganService->getRawApbd($tahun);
            $dataPad = $this->keuanganService->getRawPad($tahun);

            // Belanja Daerah (from APBD/SIKD data)
            $belanjaAnggaran = collect($dataApbd)->sum('ANGGARAN');
            $belanjaRealisasi = collect($dataApbd)->sum('REALISASI');
            $belanjaSisa = $belanjaAnggaran - $belanjaRealisasi;
            $belanjaPersen = ($belanjaAnggaran > 0) ? round($belanjaRealisasi / $belanjaAnggaran * 100, 2) : 0;
            $belanjaSisaPersen = 100 - $belanjaPersen;

            // Pendapatan Daerah (from PAD data)
            $pendapatanAnggaran = collect($dataPad)->sum('ANGGARAN');
            $pendapatanRealisasi = collect($dataPad)->sum('REALISASI');
            $pendapatanSisa = $pendapatanAnggaran - $pendapatanRealisasi;
            $pendapatanPersen = ($pendapatanAnggaran > 0) ? round($pendapatanRealisasi / $pendapatanAnggaran * 100, 2) : 0;
            $pendapatanSisaPersen = 100 - $pendapatanPersen;

            $end = microtime(true);
            $duration = round(($end - $start) * 1000, 2).' ms';

            $res = [
                'tahun' => $tahun,
                'item' => [
                    [
                        'name' => 'Belanja Daerah',
                        'slug' => 'belanja-daerah',
                        'anggaran' => $belanjaAnggaran,
                        'realisasi' => $belanjaRealisasi,
                        'sisa' => $belanjaSisa,
                        'persen' => $belanjaPersen,
                        'persentase_realisasi' => number_format($belanjaPersen, 2).' %',
                        'persentase_sisa' => number_format($belanjaSisaPersen, 2).' %',
                    ],
                    [
                        'name' => 'Pendapatan Daerah',
                        'slug' => 'pendapatan-daerah',
                        'anggaran' => $pendapatanAnggaran,
                        'realisasi' => $pendapatanRealisasi,
                        'sisa' => $pendapatanSisa,
                        'persen' => $pendapatanPersen,
                        'persentase_realisasi' => number_format($pendapatanPersen, 2).' %',
                        'persentase_sisa' => number_format($pendapatanSisaPersen, 2).' %',
                    ],
                ],
            ];

            return $this->success($res, $duration);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function getListPendapatanSkpd($tahun)
    {
        try {
            $rawPad = $this->keuanganService->getRawPad($tahun);
            $collectData = collect($rawPad);

            $grouped = $collectData
                ->groupBy('SKPD')
                ->map(function ($items, $skpd) use ($tahun) {
                    $totalAnggaran = $items->sum('ANGGARAN');
                    $totalRealisasi = $items->sum('REALISASI');
                    $persen = ($totalAnggaran > 0) ? round($totalRealisasi / $totalAnggaran * 100, 2) : 0;

                    return [
                        'skpd' => $skpd,
                        'total_realisasi' => $totalRealisasi,
                        'total_anggaran' => $totalAnggaran,
                        'persen' => $persen,
                        'tahun' => $tahun,
                        'item' => $items->map(function ($row) use ($tahun) {
                            return [
                                'kode_rekening' => $row['KODEREKENING'] ?? '',
                                'nama_rekening' => $row['NAMAREKENING'] ?? '',
                                'kd_opd' => $row['KDUNIT'] ?? '',
                                'realisasi' => (float) ($row['REALISASI'] ?? 0),
                                'anggaran' => (float) ($row['ANGGARAN'] ?? 0),
                                'tahun' => $tahun,
                            ];
                        })->values()->toArray(),
                    ];
                })
                ->values()
                ->sortByDesc('total_realisasi')
                ->values();

            return $this->success($grouped, '200 ms');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * GET /api/pbj?tahun=YYYY
     *
     * Frontend: pbj-service.ts → expects PbjApiResponse format:
     * { code, message, response_time, result: { tahun, item: [hibah, e-purchasing, tender, non-tender] } }
     */
    public function getPbj(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        try {
            $start = microtime(true);

            $ePurchasing = $this->pbjService->getPurchasing((int) $tahun);
            $tender = $this->pbjService->getTender((int) $tahun);
            $nonTender = $this->pbjService->getNonTender((int) $tahun);

            $end = microtime(true);
            $duration = round(($end - $start) * 1000, 2).' ms';

            $res = [
                'tahun' => $tahun,
                'item' => [
                    $ePurchasing,
                    $tender,
                    $nonTender,
                ],
            ];

            return $this->success($res, $duration);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * GET /api/summary-report?tahun=YYYY
     *
     * Frontend: belanja-daerah-service.ts & pendapatan-daerah-service.ts
     * → proxies to external API, returns raw JSON as-is
     */
    public function getSummaryReport(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        try {
            $response = Http::withoutVerifying()->get("http://103.141.74.143/api/public/summary-report?tahun={$tahun}");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            throw new Exception('Gagal mengambil data dari server eksternal');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * GET /api/progul
     *
     * Frontend: progul-service.ts → expects { data: [...] }
     */
    public function getProgul()
    {
        try {
            $data = $this->progulService->getList();

            return response()->json(['data' => $data]);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * GET /api/news/search?q=X&max=N&lang=id&country=id&page=1&token=...
     *
     * Frontend: news-service.ts → expects GNewsResponse format:
     * { totalArticles: number, articles: [{ title, description, content, url, image, publishedAt, source: { name, url } }] }
     */
    public function getNews(Request $request)
    {
        try {
            $query = $request->query('q', 'Padang');
            $limit = (int) $request->query('max', 6);
            $data = $this->newsScraperService->scrapeByQuery($query, $limit);

            $mapped = collect($data)->map(function ($item) {
                return [
                    'title' => $item['title'] ?? '',
                    'description' => $item['description'] ?? '',
                    'content' => $item['description'] ?? '',
                    'url' => $item['link'] ?? '#',
                    'image' => $item['image'] ?? '',
                    'publishedAt' => $item['pubDate'] ?? now()->toIso8601String(),
                    'source' => [
                        'name' => $item['source'] ?? 'Google News',
                        'url' => '#',
                    ],
                ];
            })->values();

            return response()->json([
                'totalArticles' => $mapped->count(),
                'articles' => $mapped,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * GET /api/raw-data-apbd-pad/{tahun}
     */
    public function getRawDataApbdPad($tahun)
    {
        try {
            $data = $this->keuanganService->remapData($tahun);

            return $this->success($data, '200 ms');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * GET /api/raw-data-pad/{tahun}
     */
    public function getRawDataPad($tahun)
    {
        try {
            // 1. Standarisasi Parameter Tahun
            $tahunSelected = $tahun ?? session('tahun', date('Y'));

            $padType = [
                '4.1.01' => 'Pajak Daerah',
                '4.1.02' => 'Retribusi Daerah',
                '4.1.03' => 'Hasil Pengelolaan Kekayaan Daerah yang Dipisahkan',
                '4.1.04' => 'Lain-lain PAD yang Sah',
            ];

            // 2. Fetch Data
            $sikdPendapatan = $this->keuanganService->getRawPad($tahunSelected);

            if (empty($sikdPendapatan)) {
                return $this->success([], '0 ms', 'Data '.$tahunSelected.' tidak ditemukan');
            }

            $data = collect($sikdPendapatan)
                ->groupBy(function ($item) {
                    // Ekstrak prefix 3 bagian (4.1.01) langsung saat grouping
                    $parts = explode('.', $item['KODEREKENING']);

                    return implode('.', array_slice($parts, 0, 3));
                })
                ->map(function ($items, $prefix) use ($padType, $tahunSelected) {
                    $totalAnggaran = $items->sum(fn ($i) => (float) $i['ANGGARAN']);
                    $totalRealisasi = $items->sum(fn ($i) => (float) $i['REALISASI']);

                    // 3. Cegah Division by Zero
                    $persen = $totalAnggaran > 0 ? ($totalRealisasi / $totalAnggaran) * 100 : 0;

                    return [
                        'code_rekening' => $prefix,
                        'name' => $padType[$prefix] ?? 'Lainnya',
                        'total_realisasi' => $totalRealisasi,
                        'total_anggaran' => $totalAnggaran,
                        'persen' => round($persen, 2),
                        'tahun' => $tahunSelected,
                        'item' => $items->map(function ($it) use ($tahunSelected) {
                            return [
                                'kode_rekening' => $it['KODEREKENING'],
                                'nama_rekening' => $it['NAMAREKENING'],
                                'skpd' => $it['SKPD'],
                                'kd_opd' => $it['KDUNIT'],
                                'realisasi' => (float) $it['REALISASI'],
                                'anggaran' => (float) $it['ANGGARAN'],
                                'tahun' => $tahunSelected,
                            ];
                        })->values()->toArray(),
                    ];
                })
                ->sortBy('code_rekening')
                ->values();

            $time = round((microtime(true) - LARAVEL_START) * 1000, 2).' ms';

            return $this->success($data, $time, 'Data '.$tahunSelected.' berhasil diproses');

        } catch (Exception $e) {
            // Log error untuk mempermudah debugging di VPS
            Log::error('Error RawDataPads: '.$e->getMessage());

            return $this->errorResponse('Gagal memproses data PAD: '.$e->getMessage());
        }
    }

    private function success($data, $duration): JsonResponse
    {
        return response()->json([
            'code' => 200,
            'message' => 'Success',
            'response_time' => $duration,
            'result' => $data,
        ]);
    }

    private function errorResponse($message): JsonResponse
    {
        $data = [
            'item' => [],
        ];

        return response()->json([
            'code' => 404,
            'message' => $message,
            'result' => $data,
        ]);

    }
}
