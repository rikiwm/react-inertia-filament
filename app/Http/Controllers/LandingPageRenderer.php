<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final class LandingPageRenderer extends Controller
{
    /**
     * Menampilkan halaman utama (landing page) aplikasi.
     *
     * Merender komponen Inertia 'LandingPage' sebagai respons terhadap
     * permintaan GET ke rute root ('/').
     */
    public function __invoke(): Response
    {
        return Inertia::render('LandingPage');
    }
}
