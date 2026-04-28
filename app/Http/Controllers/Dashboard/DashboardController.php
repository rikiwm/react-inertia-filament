<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controller untuk menampilkan detail OPD (Organisasi Perangkat Daerah).
 * Menangani data breakdown belanja atau pendapatan per SKPD.
 */
final class DashboardController extends Controller
{
    /**
     * Menampilkan halaman detail OPD berdasarkan type dan slug.
     *
     * @return \Inertia\Response
     */
    public function show(Request $request)
    {
        return Inertia::render('DashboardPage');
    }
}
