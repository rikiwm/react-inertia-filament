<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

/**
 * Controller untuk menampilkan detail OPD (Organisasi Perangkat Daerah).
 * Menangani data breakdown belanja atau pendapatan per SKPD.
 */
class OpdDetailController extends Controller
{
    /**
     * Menampilkan halaman detail OPD berdasarkan type dan slug.
     *
     * @param string $type Type data: 'belanja' atau 'pendapatan'
     * @param string $slug URL slug dari nama OPD
     * @param Request $request HTTP request object
     * @return \Inertia\Response
     */
    public function show(string $type, string $slug, Request $request)
    {
        // Validasi type parameter
        if (!in_array($type, ['belanja', 'pendapatan'])) {
            return back()->with('error', 'Type data tidak valid. Gunakan "belanja" atau "pendapatan".');
        }

        // Convert slug back to nama_opd
        // Contoh: "dinas-kesehatan" → "Dinas Kesehatan"
        $namaOpd = Str::title(str_replace('-', ' ', $slug));

        // Get tahun dari query parameter, default ke current year
        $tahun = $request->query('tahun', now()->year);

        // Validasi tahun
        if (!is_numeric($tahun) || $tahun < 2000 || $tahun > now()->year) {
            $tahun = now()->year;
        }

        return Inertia::render('Dashboard/OpdDetail', [
            'type' => $type,
            'slug' => $slug,
            'namaOpd' => $namaOpd,
            'tahun' => (int) $tahun,
        ]);
    }
}

