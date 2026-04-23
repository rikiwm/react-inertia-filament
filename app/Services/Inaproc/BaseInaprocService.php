<?php

declare(strict_types=1);

namespace App\Services\Inaproc;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class BaseInaprocService
{
    protected string $baseUrl;
    protected string $token;
    protected string $kodeKlpd = 'D471';
    protected int $limit = 50; 

    public function __construct()
    {
        $this->baseUrl = env('INAPROC_BASE_URL', 'https://data.inaproc.dev/api/v1/');
        $this->token = env('INAPROC_API_TOKEN', '');
    }

    abstract protected function getEndpoint(): string;
    abstract protected function normalizeItem(array $item, int $tahun): array;

    /**
     * Fetch all data using cursor pagination.
     */
    public function fetchAll(int $tahun): array
    {
        if (!$this->token) {
            Log::error("INAPROC API Token is missing.");
            return [];
        }

        $allData = [];
        $cursor = null;
        $hasMore = true;

        $url = rtrim($this->baseUrl, '/') . '/' . ltrim($this->getEndpoint(), '/');

        while ($hasMore) {
            $params = [
                'tahun' => $tahun,
                'kode_klpd' => $this->kodeKlpd,
                'limit' => $this->limit,
            ];

            if ($cursor) {
                $params['cursor'] = $cursor;
            }

            try {
                $response = Http::withToken($this->token)->get($url, $params);

                if (!$response->successful()) {
                    Log::error("INAPROC Fetch Error [{$url}]: " . $response->body());
                    break;
                }

                $json = $response->json();
                
                // Jika tipe response tidak standard, fallback ke json('data')
                $dataBlock = $json['data'] ?? [];
                
                foreach ($dataBlock as $item) {
                    $allData[] = $this->normalizeItem($item, $tahun);
                }

                $meta = $json['meta'] ?? [];
                $hasMore = $meta['has_more'] ?? false;
                $cursor = $meta['cursor'] ?? null;

                // Failsafe to prevent infinite loops if API is buggy
                if (!$cursor) {
                    $hasMore = false;
                }

            } catch (\Exception $e) {
                Log::error("INAPROC Fetch Exception [{$url}]: " . $e->getMessage());
                break;
            }
        }

        return $allData;
    }
}
