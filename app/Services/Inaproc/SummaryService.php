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
                'CATALOG' => ['count' => 0, 'nilai' => 0, 'count_product' => 0, 'total_qty' => 0, 'status' => []],
                'TENDER' => ['count' => 0, 'nilai' => 0, 'hps' => 0, 'kontrak' => 0, 'efisiensi' => 0],
                'NON-TENDER' => ['count' => 0, 'nilai' => 0, 'hps' => 0, 'kontrak' => 0, 'efisiensi' => 0],
            ],
            'top_penyedia' => [],
        ];

        $categories = ['CATALOG', 'TENDER', 'NON-TENDER'];
        $penyediaCounts = [];
        $catalogByStatus = [];
        foreach ($categories as $kategori) {
            $cacheKey = "inaproc_{$kategori}_{$tahun}_{$kodeKlpd}";
            $data = Cache::get($cacheKey, []);
            $catalogByStatus = collect($data)->groupBy('status')->map(function ($item) {
                return [
                    'jumlah' => $item->count(),
                    'paket' => $item->sum('count_product'),
                    'kuantitas' => $item->sum('total_qty'),
                    'harga' => $item->sum('total'),
                ];
            })->toArray();
            foreach ($data as $item) {
                // Adjust field mapping based on kategori because we now return raw data
                if ($kategori === 'CATALOG') {
                    $nilai = (float) ($item['total'] ?? 0);
                    $countProduct = (int) ($item['count_product'] ?? 0);
                    $totalQty = (int) ($item['total_qty'] ?? 0);
                } else {
                    $nilai = (float) ($item['pagu'] ?? 0);
                    $hps = (float) ($item['hps'] ?? 0);
                    $nilai_kontrak = (float) ($item['nilai_kontrak'] ?? 0);
                    $efisiensi = (float) ($nilai - $nilai_kontrak);
                }

                $summary['total_paket']++;
                $summary['total_nilai'] += $nilai;

                $summary['kategori'][$kategori]['count']++;
                $summary['kategori'][$kategori]['nilai'] += $nilai;

                if ($kategori === 'CATALOG') {
                    $summary['kategori'][$kategori]['count_product'] += $countProduct;
                    $summary['kategori'][$kategori]['total_qty'] += $totalQty;
                    $summary['kategori'][$kategori]['status'] = $catalogByStatus;
                } else {
                    $summary['kategori'][$kategori]['hps'] += $hps;
                    $summary['kategori'][$kategori]['kontrak'] += $nilai_kontrak;
                    $summary['kategori'][$kategori]['efisiensi'] += $efisiensi;
                }

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
