<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Override;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Mendaftarkan layanan-layanan aplikasi ke service container.
     *
     * Tempat binding interface ke implementasi konkret atau mendaftarkan
     * singleton. Saat ini kosong karena belum ada binding kustom.
     */
    #[Override]
    public function register(): void
    {
        //
    }

    /**
     * Melakukan konfigurasi awal setelah semua layanan terdaftar.
     *
     * - `Model::unguard()` — menonaktifkan mass assignment protection (dikelola lewat Filament).
     * - `Model::preventLazyLoading()` — memunculkan error jika ada N+1 query di lingkungan non-produksi.
     * - `JsonResource::withoutWrapping()` — menghapus key 'data' pembungkus pada respons JSON API.
     * - `URL::forceScheme('https')` — memaksa semua URL menggunakan HTTPS di lingkungan produksi.
     */
    public function boot(): void
    {
        Model::unguard();
        Model::preventLazyLoading(! app()->isProduction());

        JsonResource::withoutWrapping();
        if (app()->isProduction()) {
            URL::forceScheme('https');
        }
    }
}
