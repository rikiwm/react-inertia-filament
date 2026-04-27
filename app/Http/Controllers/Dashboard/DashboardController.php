<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

/**
 * Controller untuk menampilkan detail OPD (Organisasi Perangkat Daerah).
 * Menangani data breakdown belanja atau pendapatan per SKPD.
 */
final class DashboardController extends Controller
{
    /**
     * Menampilkan halaman detail OPD berdasarkan type dan slug.
     *
     * @return \Inertia\Response
     */
    public function show(Request $request)
    {
        $tahun = (int) $request->input('tahun', 2026);

        // Fetch Data from External APIs with Caching
        $pbjData = Cache::remember("pbj_data_{$tahun}", 3600, function () use ($tahun) {
            try {
                $response = Http::get("https://dashboard.padang.go.id/api/v1/pbj?tahun={$tahun}");

                return $response->successful() ? $response->json() : null;
            } catch (Exception $e) {
                return null;
            }
        });

        $apbdData = Cache::remember("apbd_data_{$tahun}", 3600, function () use ($tahun) {
            try {
                $response = Http::get("https://dashboard.padang.go.id/api/v1/apbd?tahun={$tahun}");

                return $response->successful() ? $response->json() : null;
            } catch (Exception $e) {
                return null;
            }
        });

        $skpdData = Cache::remember("skpd_data_{$tahun}", 3600, function () use ($tahun) {
            try {
                $response = Http::get("https://dashboard.padang.go.id/api/v1/list-pendapatan-skpd/{$tahun}");

                return $response->successful() ? $response->json() : null;
            } catch (Exception $e) {
                return null;
            }
        });

        return Inertia::render('DashboardPage', [
            'initialTahun' => $tahun,
            'initialPbjData' => $pbjData['result'] ?? null,
            'initialApbdData' => $apbdData['result'] ?? null,
            'initialSkpdData' => $skpdData['result'] ?? null,
        ]);
    }

    /**
     * Menampilkan halaman analitik & komparasi APBD multi-tahun.
     */
    public function analytics()
    {
        $currentYear = (int) date('Y');
        $years = range($currentYear, 2021);

        $data = collect($years)->map(function ($year) {
            return Cache::remember("apbd_summary_{$year}", 3600, function () use ($year) {
                try {
                    $response = Http::get("https://dashboard.padang.go.id/api/v1/apbd?tahun={$year}");
                    if ($response->successful()) {
                        $res = $response->json()['result'] ?? null;
                        if ($res) {
                            $items = $res['item'] ?? [];
                            $belanja = collect($items)->firstWhere('slug', 'belanja-daerah');
                            $pendapatan = collect($items)->firstWhere('slug', 'pendapatan-daerah');

                            if ($belanja && $pendapatan) {
                                return [
                                    'tahun' => $year,
                                    'pendapatan_target' => (float) ($pendapatan['anggaran'] ?? 0),
                                    'pendapatan_realisasi' => (float) ($pendapatan['realisasi'] ?? 0),
                                    'pendapatan_persen' => (float) ($pendapatan['persen'] ?? 0),
                                    'belanja_anggaran' => (float) ($belanja['anggaran'] ?? 0),
                                    'belanja_realisasi' => (float) ($belanja['realisasi'] ?? 0),
                                    'belanja_persen' => (float) ($belanja['persen'] ?? 0),
                                ];
                            }
                        }
                    }

                    return null;
                } catch (Exception $e) {
                    return null;
                }
            });
        })->filter()->sortBy('tahun')->values();

        return Inertia::render('AnalyticsPage', [
            'initialData' => $data,
        ]);
    }

    /**
     * Menampilkan rincian belanja daerah per SKPD.
     */
    public function belanjaDaerah(Request $request)
    {
        $tahun = (int) $request->input('tahun', date('Y'));

        $data = Cache::remember("belanja_daerah_skpd_{$tahun}_v2", 3600, function () use ($tahun) {
            try {
                // Gunakan URL API yang tepat (public summary report)
                $response = Http::get("http://103.141.74.143/api/public/summary-report?tahun={$tahun}");

                if ($response->successful()) {
                    $rawData = $response->json();
                    $items = collect($rawData['data'] ?? [])->map(function ($item) {
                        return [
                            'kd_unit' => $item['kd_unit'] ?? '',
                            'nama_opd' => $item['nama_opd'] ?? 'Unknown',
                            'pagu' => (float) ($item['pagu'] ?? 0),
                            'realisasi' => (float) ($item['realisasi'] ?? 0),
                            'sisa' => (float) ($item['pagu'] ?? 0) - (float) ($item['realisasi'] ?? 0),
                            'persentase_anggaran' => (float) ($item['persentase_anggaran'] ?? 0),
                        ];
                    });

                    $total_pagu = $items->sum('pagu');
                    $total_realisasi = $items->sum('realisasi');

                    return [
                        'tahun' => $tahun,
                        'total_pagu' => $total_pagu,
                        'total_realisasi' => $total_realisasi,
                        'total_sisa' => $total_pagu - $total_realisasi,
                        'total_persentase' => $total_pagu > 0 ? round(($total_realisasi / $total_pagu) * 100, 2) : 0,
                        'data' => $items->sortByDesc('realisasi')->values()->all(),
                    ];
                }

                return null;
            } catch (Exception $e) {
                return null;
            }
        });

        return Inertia::render('BelanjaDaerahPage', [
            'initialTahun' => $tahun,
            'initialData' => $data,
        ]);
    }

    /**
     * Menampilkan rincian pendapatan daerah per SKPD.
     */
    public function pendapatanDaerah(Request $request)
    {
        $tahun = (int) $request->input('tahun', date('Y'));

        $data = Cache::remember("pendapatan_daerah_skpd_summary_v3_{$tahun}", 3600, function () use ($tahun) {
            try {
                $response = Http::get("http://103.141.74.143/api/public/summary-report?tahun={$tahun}");

                if ($response->successful()) {
                    $rawData = $response->json();
                    $items = collect($rawData['data'] ?? [])
                        ->map(function ($item) {
                            $pagu = (float) ($item['pagu_pad'] ?? 0);
                            $realisasi = (float) ($item['realisasi_pad'] ?? 0);
                            $percent = $pagu > 0 ? round(($realisasi / $pagu) * 100, 2) : 0;

                            return [
                                'kd_unit' => $item['kd_unit'] ?? '',
                                'nama_opd' => $item['nama_opd'] ?? 'Unknown',
                                'pagu_pad' => $pagu,
                                'realisasi_pad' => $realisasi,
                                'sisa_pad' => $pagu - $realisasi,
                                'persentase_pad' => $percent,
                                'persentase_anggaran' => $percent,
                            ];
                        })
                        ->filter(fn ($item) => $item['pagu_pad'] > 1);

                    $total_pagu = $items->sum('pagu_pad');
                    $total_realisasi = $items->sum('realisasi_pad');

                    return [
                        'tahun' => $tahun,
                        'total_pagu_pads' => $total_pagu,
                        'total_realisasi_pad' => $total_realisasi,
                        'total_sisa_pad' => $total_pagu - $total_realisasi,
                        'total_persentase_pad' => $total_pagu > 0 ? round(($total_realisasi / $total_pagu) * 100, 2) : 0,
                        'data' => $items->sortByDesc('realisasi_pad')->values()->all(),
                    ];
                }

                return null;
            } catch (Exception $e) {
                return null;
            }
        });

        $realisasiDetail = Cache::remember("realisasi_pendapatan_detail_{$tahun}", 3600, function () use ($tahun) {
            try {
                $response = Http::get("https://dashboard.padang.go.id/api/v1/realisasi-pendapatan/{$tahun}");

                return $response->successful() ? $response->json() : null;
            } catch (Exception $e) {
                return null;
            }
        });

        return Inertia::render('PendapatanDaerahPage', [
            'initialTahun' => $tahun,
            'initialData' => $data,
            'initialRealisasiDetail' => $realisasiDetail,
        ]);
    }
}
