<?php

declare(strict_types=1);

namespace App\Services\Inaproc;

final class TenderPengumumanService extends BaseInaprocService
{
    protected function getEndpoint(): string
    {
        return 'tender/pengumuman';
    }

    protected function normalizeItem(array $item, int $tahun): array
    {
        // Berdasarkan instruksi user: "SAMAKAN RETURN ITEM DENGAN RESPONSE DARI API!"
        // Kita mengembalikan response as-is (tanpa manipulasi mapping paksa) namun menambahkan marker tipe transaksi.
        $item['jenis_transaksi'] = 'TENDER-PENGUMUMAN';

        return $item;
    }
}
