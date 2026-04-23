<?php

declare(strict_types=1);

namespace App\Services\Inaproc;

final class TenderService extends BaseInaprocService
{
    protected function getEndpoint(): string
    {
        return 'tender/tender-selesai-nilai';
    }

    protected function normalizeItem(array $item, int $tahun): array
    {
        // Berdasarkan instruksi user: "SAMAKAN RETURN ITEM DENGAN RESPONSE DARI API!"
        // Kita mengembalikan response as-is (tanpa manipulasi mapping paksa) namun menambahkan marker tipe transaksi.
        $item['jenis_transaksi'] = 'TENDER';
        return $item;
    }
}
