<?php

declare(strict_types=1);

use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\OpdDetailController;
use App\Http\Controllers\DynamicMenuController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\KebencanaanController;
use App\Http\Controllers\LandingPageRenderer;
use App\Http\Controllers\NewsDetailRenderer;
use App\Http\Controllers\NewsPageRenderer;
use App\Http\Controllers\PbjInaprocController;
use App\Http\Controllers\ProgulController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageRenderer::class)->name('landing-page');
Route::get('/berita', NewsPageRenderer::class)->name('news');
Route::get('/berita/detail', NewsDetailRenderer::class)->name('news.detail');

// Halaman demo komponen (hapus setelah development selesai)
Route::inertia('/table-demo', 'TableDemo')->name('table.demo');

// Dashboard statistik publik
Route::get('/dashboard', [DashboardController::class, 'show'])->name('dashboard');

// Route::inertia('/dashboard', 'DashboardPage')->name('dashboard');
Route::inertia('/dashboard/analitik', 'AnalyticsPage')->name('analitik');
Route::inertia('/dashboard/belanja', 'BelanjaDaerahPage')->name('belanja-daerah');
Route::inertia('/dashboard/pendapatan', 'PendapatanDaerahPage')->name('pendapatan-daerah');

// Pengadaan Barang & Jasa (PBJ)
Route::inertia('/dashboard/pbj', 'Pbj/PbjListPage')->name('pbj.list');
Route::inertia('/dashboard/pbj/detail', 'Pbj/PbjShowPage')->name('pbj.show');
Route::get('/satker', [PbjInaprocController::class, 'satker'])->name('api.pbj.satker');

Route::prefix('api/pbj-inaproc')->group(function () {
    Route::get('/catalog', [PbjInaprocController::class, 'catalog'])->name('api.pbj.catalog');
    Route::get('/tender', [PbjInaprocController::class, 'tender'])->name('api.pbj.tender');
    Route::get('/non-tender', [PbjInaprocController::class, 'nonTender'])->name('api.pbj.nontender');
    Route::get('/summary', [PbjInaprocController::class, 'summary'])->name('api.pbj.summary');
});

// Program Unggulan (Progul)
Route::get('/progul', [ProgulController::class, 'index'])->name('progul');
Route::get('/progul/{id}', [ProgulController::class, 'show'])->name('progul.detail');
Route::get('/progul/activasi/{id}', fn ($id) => inertia('Progul/KinerjaDetailPage', ['id' => (int) $id]))->name('progul.activasi');

// PK WAKO
Route::inertia('/pk-wako', 'PkWako/PkWakoPage')->name('pk-wako');

// Kebencanaan
Route::get('/kebencanaan', [KebencanaanController::class, 'index'])->name('kebencanaan');

Route::get('/dashboard/{type}/{slug}', [OpdDetailController::class, 'show'])->name('dashboard.opd.detail');

Route::group([
    'controller' => InquiryController::class,
    'prefix' => 'contact-us',
    'as' => 'contact.',
], function (): void {
    Route::get('/', 'create')->name('form');
    Route::post('/', 'store')->name('submit');
});

// CATCH-ALL ROUTE untuk Menu Dinamis (Placeholder)
Route::get('/{any}', [DynamicMenuController::class, 'show'])->where('any', '.*');
