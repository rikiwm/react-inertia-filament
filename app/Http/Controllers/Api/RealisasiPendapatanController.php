<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RealisasiPendapatanController extends Controller
{
    public function getRealisasiPendapatan($tahun)
    {
        try {
            $response = Http::timeout(30)->get("https://dashboard.padang.go.id/api/v1/realisasi-pendapatan/{$tahun}");

            if ($response->successful()) {
                return response()->json($response->json(), $response->status());
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pendapatan dari server',
                'error' => $response->json() ?? $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghubungi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
