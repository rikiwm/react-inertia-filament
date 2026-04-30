<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class KeuanganService extends ApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        // URL utama API bisa Anda tempatkan di file .env
        $this->baseUrl = env('KEUANGAN_API_URL');
    }

    private function getFileName(string $prefix, ?string $tahun): string
    {
        $yearSuffix = $tahun ? Str::afterLast($tahun, '20') : date('y');
        $isCurrentOrFuture = $tahun >= date('Y');
        $ext = $isCurrentOrFuture ? '.php' : '_P.php';

        return "/{$prefix}{$yearSuffix}{$ext}";
    }

    public function getRawApbd(?string $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return Cache::remember('raw_apbd_'.$tahun, 12600, function () use ($tahun) {
            return $this->fetchApi($this->baseUrl.$this->getFileName('sikddata', $tahun));
        });
    }

    public function getRawPad(?string $tahun = null)
    {
        return Cache::remember('raw_pad_'.$tahun, 12600, function () use ($tahun) {
            return $this->fetchApi($this->baseUrl.$this->getFileName('pendapatan', $tahun));
        });
    }

    public function getRawHibah(?string $tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return Cache::remember('raw_hibah_'.$tahun, 12600, function () {
            return $this->fetchApi($this->baseUrl.'/sikdblj.php');
        });
    }

    public function getApbdSummary(?string $tahun = null)
    {
        $tahun = $tahun ?? date('Y');
        $data = collect($this->getRawApbd($tahun));
        $totalPagu = $data->sum('ANGGARAN');
        $totalRealisasi = $data->sum('REALISASI');
        $persentase = $totalPagu > 0 ? ($totalRealisasi / $totalPagu) * 100 : 0;

        return [
            'judul' => 'APBD',
            'tahun' => $tahun,
            'total_program' => $data->count(),
            'total_anggaran' => $totalPagu,
            'total_realisasi' => $totalRealisasi,
            'selisih' => number_format($totalPagu - $totalRealisasi, 0, ',', '.'),
            'persentase' => round($persentase, 2),
        ];
    }

    public function getPadSummary(?string $tahun = null)
    {
        $tahun = $tahun ?? date('Y');
        $data = collect($this->getRawPad($tahun));
        $totalPagu = $data->sum('ANGGARAN');
        $totalRealisasi = $data->sum('REALISASI');
        $persentase = $totalPagu > 0 ? ($totalRealisasi / $totalPagu) * 100 : 0;

        return [
            'judul' => 'PAD',
            'tahun' => $tahun,
            'total_pad' => $data->count(),
            'total_anggaran' => $totalPagu,
            'total_realisasi' => $totalRealisasi,
            'selisih' => number_format($totalPagu - $totalRealisasi, 0, '.', '.'),
            'persentase' => round($persentase, 2),
        ];
    }

    public function getHibahSummary(?string $tahun = null)
    {
        $tahun = $tahun ?? date('Y');
        $data = collect($this->getRawHibah($tahun));
        $totalPagu = $data->sum('ANGGARAN');
        $totalRealisasi = $data->sum('REALISASI');
        $persentase = $totalPagu > 0 ? ($totalRealisasi / $totalPagu) * 100 : 0;

        return [
            'judul' => 'Hibah',
            'tahun' => $tahun,
            'total_hibah' => $data->count(),
            'total_anggaran' => $totalPagu,
            'total_realisasi' => $totalRealisasi,
            'selisih' => number_format($totalPagu - $totalRealisasi, 0, '.', '.'),
            'persentase' => round($persentase, 2),
        ];
    }

    public function remapData($tahun)
    {
        $data = collect($this->getRawApbd($tahun));

        $res = $data->map(function ($item) {
            $kdSub = Str::limit($item['KDUNIT'], 5, $item['KDPRGRM']).Str::beforeLast($item['KDSUBKEG'], '.');

            return [
                'skpd' => $item['SKPD'],
                'kd_unit' => $item['KDUNIT'],
                'kd_urusan' => Str::limit($item['KDUNIT'], 4, ''),
                'kd_program' => Str::limit($item['KDUNIT'], 5, '').Str::beforeLast($item['KDPRGRM'], '.'),
                'kd_kegiatan' => Str::limit($item['KDUNIT'], 5, $item['KDPRGRM']).Str::beforeLast($item['NUKEG'], '.'),
                'kd_subkegiatan' => $kdSub,
                'anggaran' => $item['ANGGARAN'],
                'realisasi' => $item['REALISASI'],
                'date_event' => date('Y-m-d'),
            ];
        })->groupBy('skpd')->toArray();

        return $res;
    }

    public function aggregateData($data)
    {
        return $data;
    }
}
