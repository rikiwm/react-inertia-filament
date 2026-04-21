<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DynamicMenuController extends Controller
{
    /**
     * Menampilkan halaman placeholder untuk menu yang belum diimplementasikan.
     */
    public function show(Request $request, $any = null)
    {
        // Bersihkan path
        $path = $any ? '/' . $any : $request->getPathInfo();
        
        // Generate title sederhana dari slug (misal: "produk-hukum" menjadi "Produk Hukum")
        $slug = last(explode('/', $path));
        $title = Str::title(str_replace('-', ' ', $slug));

        return Inertia::render('Shared/DynamicMenuPage', [
            'title' => $title,
            'path' => $path,
        ]);
    }
}
