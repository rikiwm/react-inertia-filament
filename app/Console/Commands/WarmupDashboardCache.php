<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\KeuanganService;
use App\Services\PbjService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class WarmupDashboardCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dashboard:warmup {--tahun=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up cache for dashboard api endpoints (Keuangan & PBJ/Inaproc)';

    /**
     * Execute the console command.
     */
    public function handle(KeuanganService $keuanganService, PbjService $pbjService)
    {
        $tahunOption = $this->option('tahun');
        
        // Pilih tahun yang akan dihangatkan
        $years = $tahunOption ? explode(',', $tahunOption) : [2024, 2025, 2026];

        $this->info('Starting Dashboard Cache Warmup for Years: '.implode(', ', $years));

        foreach ($years as $tahun) {
            $tahun = trim($tahun);
            $this->warn("\n===================================> YEAR: {$tahun}");

            // 1. Keuangan Service Cache Clear & Warmup
            $this->info('1/2. Warming up Keuangan API...');
            Cache::forget('raw_apbd_'.$tahun);
            Cache::forget('raw_pad_'.$tahun);
            Cache::forget('raw_hibah_'.$tahun);

            $keuanganService->getApbdSummary($tahun);
            $this->line('- APBD ✅');
            $keuanganService->getPadSummary($tahun);
            $this->line('- PAD ✅');
            $keuanganService->getHibahSummary($tahun);
            $this->line('- Hibah ✅');

            // 2. PBJ Service Cache Clear & Warmup
            $this->info('2/2. Warming up INAPROC / PBJ API...');
            Cache::forget('raw_tender_selesai_nilai_'.$tahun);
            Cache::forget('raw_nontender_selesai_'.$tahun);
            Cache::forget('raw_purchasing_'.$tahun);
            Cache::forget('raw_tender_pengumuman_'.$tahun);

            $pbjService->getPurchasing($tahun);
            $this->line('- E-Purchasing ✅');
            $pbjService->getTender($tahun);
            $this->line('- Tender ✅');
            $pbjService->getNonTender($tahun);
            $this->line('- Non-Tender ✅');
        }

        $this->info("\n✅ Dashboard Cache Warmup Completed Successfully for all target years!");

        return 0;
    }
}
