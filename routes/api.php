<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RealisasiProgramController;
use App\Http\Controllers\Api\RealisasiPendapatanController;
use App\Http\Controllers\Api\DashboardApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/realisasi-program/{slug}/{tahun}', [RealisasiProgramController::class, 'getRealisasiProgram']);
Route::get('/realisasi-pendapatan/{tahun}', [RealisasiPendapatanController::class, 'getRealisasiPendapatan']);

Route::get('/apbd', [DashboardApiController::class, 'getApbd']);
Route::get('/list-pendapatan-skpd/{tahun}', [DashboardApiController::class, 'getListPendapatanSkpd']);
Route::get('/pbj', [DashboardApiController::class, 'getPbj']);
Route::get('/summary-report', [DashboardApiController::class, 'getSummaryReport']);
Route::get('/progul', [DashboardApiController::class, 'getProgul']);
Route::get('/news/search', [DashboardApiController::class, 'getNews']);
