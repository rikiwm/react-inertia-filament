<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PbjService extends ApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('INAPROC_BASE_URL');
    }

    /**
     * Ambil & Rekap Data E-Catalog
     */
    public function getEcatalogSummary(?string $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        // Memanggil API dengan parameter $tahun dan Wajib Auth (true)
        $response = $this->fetchApi($this->baseUrl.'/e-catalog', ['tahun' => $tahun], true);
        $data = collect($response['data'] ?? []);

        return [
            'tahun' => $tahun,
            'total_transaksi' => $data->count(),
            'total_nilai_transaksi' => $data->sum('nilai_transaksi'),
            'transaksi_hari_ini' => $data->where('tanggal', now()->format('Y-m-d'))->count(),
        ];
    }

    public function getRawTenderSelesaiNilai(?int $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return Cache::remember("raw_tender_selesai_nilai_{$tahun}", 12600, function () use ($tahun) {
            $allData = [];
            $nextCursor = null;
            $hasMore = true;

            do {
                $params = [
                    'kode_klpd' => 'D471',
                    'tahun' => $tahun,
                    'limit' => 1000,
                ];
                if ($nextCursor) {
                    $params['cursor'] = $nextCursor;
                }
                $response = $this->fetchApi($this->baseUrl.'/tender/tender-selesai-nilai', $params, true);
                $data = $response['data'] ?? [];
                $allData = array_merge($allData, $data);

                $hasMore = $response['meta']['has_more'] ?? false;
                $nextCursor = $response['meta']['cursor'] ?? null;
            } while ($hasMore && $nextCursor);

            return $allData;
        });
    }

    public function getListTender(?int $tahun = null)
    {
        return $this->getRawTenderSelesaiNilai($tahun);
    }

    public function getTenderSummary(?string $tahun = null)
    {
        $data = collect($this->getRawTenderSelesaiNilai($tahun));

        return [
            'tahun' => $tahun,
            'total_paket' => $data->count(),
        ];
    }

    public function getRawNonTenderSelesai(?int $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return Cache::remember("raw_nontender_selesai_{$tahun}", 12600, function () use ($tahun) {
            $allData = [];
            $nextCursor = null;
            $hasMore = true;

            while ($hasMore) {
                $response = Http::withToken(env('INAPROC_API_TOKEN'))
                    ->get($this->baseUrl.'tender/non-tender-selesai', [
                        'kode_klpd' => 'D471',
                        'tahun' => $tahun,
                        'limit' => 1000,
                        'cursor' => $nextCursor,
                    ]);

                if ($response->failed()) {
                    break;
                }
                $body = $response->json();
                $allData = array_merge($allData, $body['data'] ?? []);

                $nextCursor = $body['meta']['cursor'] ?? null;
                $hasMore = ($body['meta']['has_more'] ?? false) && $nextCursor;
            }

            return $allData;
        });
    }

    public function getNonTenderSummary(?string $tahun = null)
    {
        $data = collect($this->getRawNonTenderSelesai($tahun));

        return [
            'tahun' => $tahun,
            'total_paket' => $data->count(),
            'total_nilai_pagu' => $data->sum('pagu_paket'),
            'paket_selesai' => $data->where('status', 'Selesai')->count(),
        ];
    }

    public function getRawPaketEPurchasing(?int $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return Cache::remember("raw_purchasing_{$tahun}", 12600, function () use ($tahun) {
            $allData = [];
            $nextCursor = null;
            $hasMore = true;

            while ($hasMore) {
                $response = Http::withToken(env('INAPROC_API_TOKEN'))
                    ->get($this->baseUrl.'ekatalog/paket-e-purchasing', [
                        'kode_klpd' => 'D471',
                        'tahun' => $tahun,
                        'limit' => 1000,
                        'cursor' => $nextCursor,
                    ]);

                if ($response->failed()) {
                    break;
                }
                $body = $response->json();
                $allData = array_merge($allData, $body['data'] ?? []);

                $nextCursor = $body['meta']['cursor'] ?? null;
                $hasMore = ($body['meta']['has_more'] ?? false) && $nextCursor;
            }

            return $allData;
        });
    }

    public function getPurchasing($tahun = 2026)
    {
        $data = $this->getRawPaketEPurchasing($tahun);
        $data = collect($data)->whereIn('status', ['COMPLETED','ON_ADDENDUM','ON_PROCESS','PAYMENT_OUTSIDE_SYSTEM'])->toArray();
        // dd($data);
        $totalCount = count($data);
        $rekapStatus = [];
        $totalHarga = 0;

        foreach ($data as $item) {
            $status = $item['status'] ?? 'N/A';
            $rekapStatus[$status] = ($rekapStatus[$status] ?? 0) + 1;
            $totalHarga += (int) ($item['total'] ?? 0);
        }

        return [
            'name' => 'e-purchasing',
            'description' => 'Tarikan dari INAPROC',
            'total_paket' => $totalCount.' / Keseluruhan',
            'total_pagu' => $totalHarga,
            'total_belum' => '-',
            'total_proses' => '-',
            'total_berlangsung' => '-',
            'total_selesai' => '-',
            'rekap' => $rekapStatus,
        ];
    }

    public function getRawTenderPengumuman(?int $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return Cache::remember("raw_tender_pengumuman_{$tahun}", 12600, function () use ($tahun) {
            $allData = [];
            $nextCursor = null;
            $hasMore = true;

            while ($hasMore) {
                $response = Http::withToken(env('INAPROC_API_TOKEN'))
                    ->get($this->baseUrl.'tender/pengumuman', [
                        'kode_klpd' => 'D471',
                        'tahun' => $tahun,
                        'limit' => 1000,
                        'cursor' => $nextCursor,
                    ]);

                if ($response->failed()) {
                    break;
                }
                $body = $response->json();
                $allData = array_merge($allData, $body['data'] ?? []);

                $nextCursor = $body['meta']['cursor'] ?? null;
                $hasMore = ($body['meta']['has_more'] ?? false) && $nextCursor;
            }

            return $allData;
        });
    }

    public function getTender($tahun = 2026)
    {
        $data = $this->getRawTenderPengumuman($tahun);
        $totalCount = count($data);
        $rekapStatus = [];
        $totalHarga = 0;

        foreach ($data as $item) {
            $status = $item['status_tender'] ?? 'N/A';
            $rekapStatus[$status] = ($rekapStatus[$status] ?? 0) + 1;
            $totalHarga += (int) ($item['pagu'] ?? 0);
        }

        return [
            'name' => 'tender',
            'description' => 'Tarikan dari INAPROC',
            'total_paket' => $totalCount.' / Keseluruhan',
            'total_pagu' => $totalHarga,
            'total_belum' => '-',
            'total_proses' => '-',
            'total_berlangsung' => '-',
            'total_selesai' => '-',
            'rekap' => $rekapStatus,
        ];
    }

    public function getNonTender($tahun = 2026)
    {
        $data = $this->getRawNonTenderSelesai($tahun);
        $totalCount = count($data);
        $rekapStatus = [];
        $totalHarga = 0;

        foreach ($data as $item) {
            $status = $item['status_nontender'] ?? 'N/A';
            $rekapStatus[$status] = ($rekapStatus[$status] ?? 0) + 1;
            $totalHarga += (int) ($item['pagu'] ?? 0);
        }

        return [
            'name' => 'non-tender',
            'description' => 'Tarikan dari INAPROC',
            'total_paket' => $totalCount.' / Keseluruhan',
            'total_pagu' => $totalHarga,
            'total_belum' => '-',
            'total_proses' => '-',
            'total_berlangsung' => '-',
            'total_selesai' => '-',
            'rekap' => $rekapStatus,
        ];
    }
}
