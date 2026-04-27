<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Controller untuk menampilkan detail OPD (Organisasi Perangkat Daerah).
 * Menangani data breakdown belanja atau pendapatan per SKPD.
 */
final class OpdDetailController extends Controller
{
    /**
     * Menampilkan halaman detail OPD berdasarkan type dan slug.
     *
     * @param  string  $type  Type data: 'belanja' atau 'pendapatan'
     * @param  string  $slug  URL slug dari nama OPD
     * @param  Request  $request  HTTP request object
     * @return \Inertia\Response
     */
    public function show(string $type, string $slug, Request $request)
    {
        // Validasi type parameter
        if (! in_array($type, ['belanja', 'pendapatan'])) {
            return back()->with('error', 'Type data tidak valid. Gunakan "belanja" atau "pendapatan".');
        }

        // Convert slug back to nama_opd
        $namaOpd = Str::title(str_replace('-', ' ', $slug));

        // Get tahun dari query parameter, default ke current year
        $tahun = (int) $request->query('tahun', now()->year);

        // Validasi tahun
        if ($tahun < 2000 || $tahun > now()->year) {
            $tahun = now()->year;
        }

        // 1. Fetch Summary Data (Matching what fetchOpdDetail does)
        $opdDetail = $this->getOpdDetail($type, $namaOpd, $tahun);

        // 2. Fetch Type-Specific Data
        $extraData = [];
        if ($type === 'belanja') {
            $extraData['realisasiProgram'] = $this->getRealisasiProgram($slug, $tahun);
            $extraData['opdPbj'] = $this->getOpdPbj($namaOpd, $tahun);
        } else {
            $extraData['pendapatanDetail'] = $this->getPendapatanDetail($namaOpd, $tahun);
        }

        return Inertia::render('Dashboard/OpdDetail', array_merge([
            'type' => $type,
            'slug' => $slug,
            'namaOpd' => $namaOpd,
            'tahun' => $tahun,
            'initialOpdDetail' => $opdDetail,
        ], $extraData));
    }

    private function getOpdDetail(string $type, string $namaOpd, int $tahun)
    {
        $cacheKey = "opd_detail_v2_{$type}_{$namaOpd}_{$tahun}";
        return Cache::remember($cacheKey, 3600, function () use ($type, $namaOpd, $tahun) {
            $baseUrl = 'http://103.141.74.143';
            $endpoint = "{$baseUrl}/api/public/summary-report?tahun={$tahun}";

            $response = Http::withoutVerifying()->get($endpoint);
            if (! $response->successful()) {
                return null;
            }

            $json = $response->json();
            $data = $json['data'] ?? [];

            $opdData = collect($data)->first(function ($item) use ($namaOpd) {
                return strtolower($item['nama_opd'] ?? '') === strtolower($namaOpd);
            });

            if (! $opdData) {
                return null;
            }

            if ($type === 'belanja') {
                return array_merge($opdData, [
                    'pagu' => (float) ($opdData['pagu'] ?? 0),
                    'realisasi' => (float) ($opdData['realisasi'] ?? 0),
                    'sisa' => (float) (($opdData['pagu'] ?? 0) - ($opdData['realisasi'] ?? 0)),
                    'persentase_anggaran' => (float) ($opdData['persentase_anggaran'] ?? 0),
                    'total_pagu' => (float) ($json['total_pagu'] ?? 0),
                    'total_realisasi' => (float) ($json['total_realisasi'] ?? 0),
                    'total_sisa' => (float) (($json['total_pagu'] ?? 0) - ($json['total_realisasi'] ?? 0)),
                    'total_persentase' => (float) ($json['total_persentase'] ?? 0),
                ]);
            } else {
                return array_merge($opdData, [
                    'pagu_pad' => (float) ($opdData['pagu_pad'] ?? 0),
                    'realisasi_pad' => (float) ($opdData['realisasi_pad'] ?? 0),
                    'sisa_pad' => (float) (($opdData['pagu_pad'] ?? 0) - ($opdData['realisasi_pad'] ?? 0)),
                    'persentase_pad' => (float) ($opdData['persentase'] ?? 0),
                    'total_pagu_pad' => (float) ($json['total_pagu_pads'] ?? 0),
                    'total_realisasi_pad' => (float) ($json['total_realisasi_pad'] ?? 0),
                    'total_sisa_pad' => (float) ($json['total_sisa_pad'] ?? 0),
                    'total_persentase_pad' => (float) ($json['total_persentase_pad'] ?? 0),
                ]);
            }
        });
    }

    private function getRealisasiProgram(string $slug, int $tahun)
    {
        $cacheKey = "realisasi_program_{$slug}_{$tahun}";
        return Cache::remember($cacheKey, 3600, function () use ($slug, $tahun) {
            $baseUrl = 'http://103.141.74.143';
            $response = Http::withoutVerifying()->get("{$baseUrl}/api/belanja-daerah-skpd-realisasi", [
                'tahun' => $tahun,
                'skpd' => $slug,
            ]);

            return $response->successful() ? $response->json() : null;
        });
    }

    private function getPendapatanDetail(string $namaOpd, int $tahun)
    {
        $cacheKey = "pendapatan_detail_{$namaOpd}_{$tahun}";
        return Cache::remember($cacheKey, 3600, function () use ($namaOpd, $tahun) {
            $baseUrl = 'http://103.141.74.143';
            $response = Http::withoutVerifying()->get("{$baseUrl}/api/pendapatan-daerah-rekening", [
                'tahun' => $tahun,
                'skpd' => $namaOpd,
            ]);

            return $response->successful() ? $response->json() : null;
        });
    }

    private function getOpdPbj(string $namaOpd, int $tahun)
    {
        $cacheKey = "opd_pbj_cached_{$namaOpd}_{$tahun}";
        return Cache::remember($cacheKey, 3600, function () use ($namaOpd, $tahun) {
            $kodeKlpd = 'D471';
            $categories = ['CATALOG', 'TENDER', 'NON-TENDER'];
            $result = [];

            foreach ($categories as $kategori) {
                $items = Cache::get("inaproc_{$kategori}_{$tahun}_{$kodeKlpd}", []);
                $filtered = collect($items)->filter(function ($item) use ($namaOpd) {
                    $satker = strtolower($item['nama_satker'] ?? '');
                    $opd = strtolower($namaOpd);
                    return $satker === $opd || str_contains($satker, $opd) || str_contains($opd, $satker);
                })->map(function ($item) use ($kategori) {
                    $item['jenis_transaksi'] = $kategori;
                    return $item;
                })->values()->all();

                $result = array_merge($result, $filtered);
            }

            return $result;
        });
    }
}
