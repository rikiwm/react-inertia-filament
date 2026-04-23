<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\Inaproc\CatalogService;
use App\Services\Inaproc\TenderService;
use App\Services\Inaproc\NonTenderService;

class SyncInaprocData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inaproc:sync {--tahun= : Tahun anggaran spesifik untuk disinkronisasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Melakukan sinkronisasi background data INAPROC ke dalam sistem lokal.';

    /**
     * Execute the console command.
     */
    public function handle(
        CatalogService $catalogService,
        TenderService $tenderService,
        NonTenderService $nonTenderService
    ) {
        $tahunOption = $this->option('tahun');
        
        // JIKA VARIABEL TAHUN NULL MAKA, LOOPING TAHUN SEKARANG - 2 TAHUN TERAKHIR !
        if ($tahunOption) {
            $yearsToSync = [(int) $tahunOption];
        } else {
            $currentYear = (int) date('Y');
            $yearsToSync = [$currentYear, $currentYear - 1, $currentYear - 2];
        }

        $kodeKlpd = 'D471';
        
        $services = [
            'CATALOG' => $catalogService,
            'TENDER' => $tenderService,
            'NON-TENDER' => $nonTenderService,
        ];

        foreach ($yearsToSync as $tahun) {
            $this->info("Memulai sinkronisasi data Inaproc tahun {$tahun}...");

            foreach ($services as $kategori => $service) {
                $this->info("Menarik data {$kategori} {$tahun}...");
                $data = $service->fetchAll($tahun);
                
                $cacheKey = "inaproc_{$kategori}_{$tahun}_{$kodeKlpd}";
                // Cache selama 24 jam
                Cache::put($cacheKey, $data, 24 * 60 * 60);
                
                $this->line("-> Berhasil mensinkronisasi " . count($data) . " baris {$kategori}");
            }
        }

        $this->info('Sinkronisasi Inaproc selesai!');
        Log::info("inaproc:sync Command executed for year {$tahun} successfully.");
    }
}
