<?php

declare(strict_types=1);

use App\Http\Controllers\InquiryController;
use App\Http\Controllers\LandingPageRenderer;
use App\Http\Controllers\NewsDetailRenderer;
use App\Http\Controllers\NewsPageRenderer;
use App\Http\Controllers\Dashboard\OpdDetailController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageRenderer::class)->name('landing-page');
Route::get('/berita', NewsPageRenderer::class)->name('news');
Route::get('/berita/detail', NewsDetailRenderer::class)->name('news.detail');

// Halaman demo komponen (hapus setelah development selesai)
Route::inertia('/table-demo', 'TableDemo')->name('table.demo');

// Dashboard statistik publik
Route::inertia('/dashboard', 'DashboardPage')->name('dashboard');
Route::inertia('/dashboard/belanja-daerah', 'BelanjaDaerahPage')->name('belanja-daerah');
Route::inertia('/dashboard/pendapatan-daerah', 'PendapatanDaerahPage')->name('pendapatan-daerah');
Route::get('/dashboard/{type}/{slug}', [OpdDetailController::class, 'show'])->name('dashboard.opd.detail');

Route::group([
    'controller' => InquiryController::class,
    'prefix' => 'contact-us',
    'as' => 'contact.',
], function (): void {
    Route::get('/', 'create')->name('form');
    Route::post('/', 'store')->name('submit');
});
