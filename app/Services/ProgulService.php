<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class ProgulService extends ApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = 'http://103.141.74.143/api';
    }

    /**
     * Ambil seluruh daftar Progul dari API.
     * Cache selama 1 jam (3600 detik).
     */
    public function getList(): array
    {
        return Cache::remember('progul_api_list', 36000, function () {
            $response = $this->fetchApi($this->baseUrl.'/progul');

            return $response['data'] ?? $response ?? [];
        });
    }

    public function getYear(): array
    {
        return Cache::remember('progul_api_year', 36000, function () {
            $response = $this->fetchApi($this->baseUrl.'/progul');

            return $response['years'] ?? $response ?? [];
        });
    }

    /**
     * Ambil detail satu Progul berdasarkan ID dari API.
     * Cache per-ID selama 1 jam (3600 detik).
     */
    public function getDetail(int|string $id): array
    {
        return Cache::remember("progul_api_detail_{$id}", 36000, function () use ($id) {
            $response = $this->fetchApi($this->baseUrl."/progul/{$id}");

            return $response['data'] ?? $response ?? [];
        });
    }

    /**
     * Invalidate cache list Progul.
     * Berguna saat ada update data.
     */
    public function clearListCache(): void
    {
        Cache::forget('progul_api_list');
    }

    /**
     * Invalidate cache detail Progul berdasarkan ID.
     */
    public function clearDetailCache(int|string $id): void
    {
        Cache::forget("progul_api_detail_{$id}");
    }
}
