<?php

declare(strict_types=1);

use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\RealisasiProgramController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/realisasi-program/{slug}/{tahun}', [RealisasiProgramController::class, 'getRealisasiProgram']);
Route::get('/realisasi-pendapatan/{tahun}', [DashboardApiController::class, 'getRawDataPad']);

Route::get('/apbd', [DashboardApiController::class, 'getApbd']);
Route::get('/list-pendapatan-skpd/{tahun}', [DashboardApiController::class, 'getListPendapatanSkpd']);
Route::get('/pbj', [DashboardApiController::class, 'getPbj']);
Route::get('/summary-report', [DashboardApiController::class, 'getSummaryReport']);
Route::get('/progul', [DashboardApiController::class, 'getProgul']);
Route::get('/news/search', [DashboardApiController::class, 'getNews']);

Route::get('/raw-data-apbd-pad/{tahun}', [DashboardApiController::class, 'getRawDataApbdPad']);
Route::get('/raw-data-pad/{tahun}', [DashboardApiController::class, 'getRawDataPad']);

Route::prefix('pbj-inaproc')->group(function () {
    Route::get('/', [App\Http\Controllers\PbjInaprocController::class, 'all'])->name('api.pbj.all');
    Route::get('/catalog', [App\Http\Controllers\PbjInaprocController::class, 'catalog'])->name('api.pbj.catalog');
    Route::get('/tender', [App\Http\Controllers\PbjInaprocController::class, 'tender'])->name('api.pbj.tender');
    Route::get('/non-tender', [App\Http\Controllers\PbjInaprocController::class, 'nonTender'])->name('api.pbj.nontender');
    Route::get('/summary', [App\Http\Controllers\PbjInaprocController::class, 'summary'])->name('api.pbj.summary');
});
