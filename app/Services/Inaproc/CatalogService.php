<?php

declare(strict_types=1);

namespace App\Services\Inaproc;

final class CatalogService extends BaseInaprocService
{
    protected function getEndpoint(): string
    {
        return 'ekatalog/paket-e-purchasing';
    }

    protected function normalizeItem(array $item, int $tahun): array
    {
        // Berdasarkan instruksi user: "SAMAKAN RETURN ITEM DENGAN RESPONSE DARI API!"
        // Kita mengembalikan response as-is (tanpa manipulasi mapping paksa) namun menambahkan marker tipe transaksi 
        // dan memastikan ada identifier konsisten.
        $item['jenis_transaksi'] = 'CATALOG';
        return $item;
    }
}
