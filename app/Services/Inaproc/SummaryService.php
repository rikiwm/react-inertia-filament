<?php

declare(strict_types=1);

namespace App\Services\Inaproc;

use Illuminate\Support\Facades\Cache;

final class SummaryService
{
    /**
     * Compile statistical summary from all 3 data sources per year.
     */
    public function getSummary(int $tahun): array
    {
        $kodeKlpd = 'D471';
        $summary = [
            'total_paket' => 0,
            'total_nilai' => 0,
            'kategori' => [
                'CATALOG' => ['count' => 0, 'nilai' => 0],
                'TENDER' => ['count' => 0, 'nilai' => 0],
                'NON-TENDER' => ['count' => 0, 'nilai' => 0],
            ],
            'top_penyedia' => [],
        ];

        $categories = ['CATALOG', 'TENDER', 'NON-TENDER'];
        $penyediaCounts = [];

        foreach ($categories as $kategori) {
            $cacheKey = "inaproc_{$kategori}_{$tahun}_{$kodeKlpd}";
            $data = Cache::get($cacheKey, []);

            foreach ($data as $item) {
                // Adjust field mapping based on kategori because we now return raw data
                if ($kategori === 'CATALOG') {
                    $nilai = (float) ($item['total'] ?? ($item['total'] ?? ($item['total'] ?? 0)));
                } else {
                    $nilai = (float) ($item['nilai_kontrak'] ?? ($item['nilai_negosiasi'] ?? ($item['pagu'] ?? 0)));
                }

                $summary['total_paket']++;
                $summary['total_nilai'] += $nilai;

                $summary['kategori'][$kategori]['count']++;
                $summary['kategori'][$kategori]['nilai'] += $nilai;

                $namaPenyedia = $item['nama_penyedia'] ?? 'Unknown';
                if (! empty($namaPenyedia) && $namaPenyedia !== 'Unknown') {
                    if (! isset($penyediaCounts[$namaPenyedia])) {
                        $penyediaCounts[$namaPenyedia] = [
                            'nama' => $namaPenyedia,
                            'count' => 0,
                            'nilai' => 0,
                        ];
                    }
                    $penyediaCounts[$namaPenyedia]['count']++;
                    $penyediaCounts[$namaPenyedia]['nilai'] += $nilai;
                }
            }
        }

        // Sort penyedia by count and take top 5
        usort($penyediaCounts, fn ($a, $b) => $b['count'] <=> $a['count']);
        $summary['top_penyedia'] = array_slice($penyediaCounts, 0, 5);

        return $summary;
    }
}
