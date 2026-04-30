<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DashboardApiController extends Controller
{
    private function proxyGet($url, $timeout = 30)
    {
        try {
            $response = Http::timeout($timeout)->get($url);

            if ($response->successful()) {
                return response()->json($response->json(), $response->status());
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dari server',
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

    public function getApbd(Request $request)
    {
        $tahun = $request->query('tahun');
        return $this->proxyGet("https://dashboard.padang.go.id/api/v1/apbd?tahun={$tahun}");
    }

    public function getListPendapatanSkpd($tahun)
    {
        return $this->proxyGet("https://dashboard.padang.go.id/api/v1/list-pendapatan-skpd/{$tahun}");
    }

    public function getPbj(Request $request)
    {
        $tahun = $request->query('tahun');
        return $this->proxyGet("https://dashboard.padang.go.id/api/v1/pbj?tahun={$tahun}");
    }

    public function getSummaryReport()
    {
        return $this->proxyGet("http://103.141.74.143/api/public/summary-report");
    }

    public function getProgul()
    {
        return $this->proxyGet("http://103.141.74.143/api/progul");
    }

    public function getNews(Request $request)
    {
        $query = http_build_query($request->all());
        return $this->proxyGet("https://gnews.io/api/v4/search?{$query}");
    }
}
