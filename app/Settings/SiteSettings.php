<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

final class SiteSettings extends Settings
{
    public ?string $name;

    public ?string $description;

    public ?string $logo;

    public ?string $favicon;

    public ?string $og_image;

    public ?string $header_scripts;

    public ?string $footer_scripts;

    /**
     * Mengembalikan nama grup pengaturan di database.
     *
     * Semua properti pada kelas ini disimpan dalam tabel `settings`
     * di bawah grup 'site', memungkinkan pengambilan batch yang efisien.
     */
    public static function group(): string
    {
        return 'site';
    }
}
