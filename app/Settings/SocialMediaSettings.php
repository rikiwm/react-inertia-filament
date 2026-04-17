<?php

declare(strict_types=1);

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Menyimpan pengaturan tautan media sosial organisasi.
 *
 * Setiap properti merepresentasikan username atau ID pada platform
 * media sosial yang bersangkutan. Nilai null berarti platform tersebut
 * tidak dikonfigurasi dan tidak akan ditampilkan di frontend.
 */
final class SocialMediaSettings extends Settings
{
    public ?string $linkedin;

    public ?string $whatsapp;

    public ?string $x;

    public ?string $facebook;

    public ?string $instagram;

    public ?string $tiktok;

    public ?string $medium;

    public ?string $youtube;

    public ?string $github;

    /**
     * Mengembalikan nama grup pengaturan di database.
     *
     * Semua properti pada kelas ini disimpan dalam tabel `settings`
     * di bawah grup 'social-media' agar terpisah dari pengaturan situs lainnya.
     */
    public static function group(): string
    {
        return 'social-media';
    }
}
