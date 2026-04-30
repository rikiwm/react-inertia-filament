<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SikdService extends ApiService
{
    /**
     * Get Realisasi Belanja OPD based on slug
     *
     * @return array
     */
    public function getRealisasiOpd(string $slug, $keuanganService)
    {
        $formattedSlug = $this->normalizeSlug($slug);
        $cacheKey = 'show_realisasi_opd_'.Str::of($formattedSlug)->snake();

        $data = Cache::remember($cacheKey, 3600, function () use ($formattedSlug, $keuanganService) {
            $data = $keuanganService->getRawApbd(session('tahun') ?? date('Y'));
            $data = collect($data)->where('SKPD', $formattedSlug)->values();

            return $data;
        });

        $totalAnggaran = $data->sum('ANGGARAN');
        $totalRealisasi = $data->sum('REALISASI');
        $totalPersen = $totalAnggaran != 0 ? ($totalRealisasi / $totalAnggaran * 100) : 0;

        $groupedData = $data->groupBy('NMPRGRM')->map(function ($programGroup) {
            return $programGroup->groupBy('NMKEG')->map(function ($kegiatanGroup) {
                $anggaran = $kegiatanGroup->sum(function ($item) {
                    return (float) $item['ANGGARAN'];
                });
                $realisasi = $kegiatanGroup->sum(function ($item) {
                    return (float) $item['REALISASI'];
                });
                $persen = $anggaran != 0 ? ($realisasi / $anggaran * 100) : 0;

                return [
                    'total_anggaran' => $anggaran,
                    'total_realisasi' => $realisasi,
                    'persen' => $persen,
                    'pptk' => '',
                ];
            });
        });

        return [
            'data' => $groupedData->toArray(),
            'summary' => [
                'anggaran' => $totalAnggaran,
                'realisasi' => $totalRealisasi,
                'persen' => $totalPersen,
            ],
            'formatted_title' => $formattedSlug,
        ];
    }

    /**
     * Normalize slug to SKPD name
     */
    private function normalizeSlug(string $slug): string
    {
        $formatted = Str::of($slug)->headline()->upper();

        if (Str::startsWith($formatted, 'BAGIAN')) {
            return 'SEKRETARIAT DAERAH';
        }

        if ($formatted == 'RSUD DR RASIDIN') {
            return 'RSUD Dr. RASIDIN';
        }

        return (string) $formatted;
    }
}
