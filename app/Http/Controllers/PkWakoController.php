<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;

final class PkWakoController extends Controller
{
    /**
     * Display the PK WAKO page.
     */
    public function index()
    {
        $data = [
            [
                'id' => 1,
                'sasaran' => "Peningkatan kualitas pendidikan",
                'indikator' => "Rata-rata lama sekolah",
                'target' => "11,64",
                'capaian' => "-",
                'skpd' => "Dinas Pendidikan dan Kebudayaan"
            ],
            [
                'id' => 2,
                'sasaran' => "Peningkatan kualitas pendidikan",
                'indikator' => "Harapan Lama Sekolah",
                'target' => "16,58",
                'capaian' => "-",
                'skpd' => "Dinas Pendidikan dan Kebudayaan"
            ],
            [
                'id' => 3,
                'sasaran' => "Peningkatan derajat kesehatan masyarakat",
                'indikator' => "Angka harapan hidup",
                'target' => "75,28",
                'capaian' => "-",
                'skpd' => "Dinas Kesehatan"
            ],
            [
                'id' => 4,
                'sasaran' => "Peningkatan derajat kesehatan masyarakat",
                'indikator' => "Prevalensi Stunting",
                'target' => "12",
                'capaian' => "-",
                'skpd' => "Dinas Kesehatan, DP3AP2KB, DPRKPP, Diperingan"
            ],
            [
                'id' => 5,
                'sasaran' => "Peningkatan daya beli",
                'indikator' => "Pengeluaran per kapita",
                'target' => "15375",
                'capaian' => "-",
                'skpd' => "Dinas Perdagangan"
            ],
            [
                'id' => 6,
                'sasaran' => "Peningkatan kesetaraan gender",
                'indikator' => "Indeks Pembangunan Gender (IPG)",
                'target' => "94,36",
                'capaian' => "-",
                'skpd' => "DP3AP2KB"
            ],
            [
                'id' => 7,
                'sasaran' => "Peningkatan kesejahteraan masyarakat",
                'indikator' => "Laju pertumbuhan PDRB per kapita (ADHB) persen",
                'target' => "7,79",
                'capaian' => "-",
                'skpd' => "Bappeda, Dinas Perdagangan, Dinas Pertanian"
            ],
            [
                'id' => 8,
                'sasaran' => "Peningkatan kesejahteraan masyarakat",
                'indikator' => "Laju pertumbuhan PDRB per kapita (ADHK)",
                'target' => "3,76",
                'capaian' => "-",
                'skpd' => "Bappeda, Dinas Perdagangan, Dinas Pertanian"
            ],
            [
                'id' => 9,
                'sasaran' => "Pemerataan ekonomi",
                'indikator' => "PDRB per kapita (ADHB) Rp (juta)",
                'target' => "87,57",
                'capaian' => "-",
                'skpd' => "Bappeda, Perdagangan"
            ],
            [
                'id' => 10,
                'sasaran' => "Pemerataan ekonomi",
                'indikator' => "PDRB per kapita (ADHK) Rp (juta)",
                'target' => "53,421",
                'capaian' => "-",
                'skpd' => "Bappeda, Perdagangan"
            ],
            [
                'id' => 11,
                'sasaran' => "Peningkatan produktivitas ekonomi daerah",
                'indikator' => "PDRB ADHB (miliar)",
                'target' => "95072,75",
                'capaian' => "-",
                'skpd' => "Bappeda, Perdagangan, Pariwisata, Dinas Perikanan dan Pangan, DPMPTSP"
            ],
            [
                'id' => 12,
                'sasaran' => "Peningkatan produktivitas ekonomi daerah",
                'indikator' => "PDRB ADHK (miliar)",
                'target' => "52017,3",
                'capaian' => "-",
                'skpd' => "Bappeda, Perdagangan, Pariwisata, Dinas Perikanan dan Pangan, DPMPTSP"
            ],
            [
                'id' => 13,
                'sasaran' => "Peningkatan kinerja pengelolaan pemerintah daerah",
                'indikator' => "Nilai AKIP",
                'target' => "80,01",
                'capaian' => "-",
                'skpd' => "Inspektorat, Bappeda, Bagian Organisasi"
            ],
            [
                'id' => 14,
                'sasaran' => "Penyelenggaraan tata kelola SPBE terintegrasi",
                'indikator' => "Indeks SPBE",
                'target' => "4",
                'capaian' => "-",
                'skpd' => "Diskominfo"
            ],
            [
                'id' => 15,
                'sasaran' => "Penyelenggaraan manajemen keuangan daerah yang berkualitas",
                'indikator' => "Opini BPK",
                'target' => "WTP",
                'capaian' => "-",
                'skpd' => "BPKAD, Inspektorat"
            ],
            [
                'id' => 16,
                'sasaran' => "Penyelenggaraan manajemen keuangan daerah yang berkualitas",
                'indikator' => "Derajat Desentralisasi",
                'target' => "34,31",
                'capaian' => "-",
                'skpd' => "Bapenda"
            ],
            [
                'id' => 17,
                'sasaran' => "Penurunan kesenjangan sosial",
                'indikator' => "Gini Ratio",
                'target' => "0,341",
                'capaian' => "-",
                'skpd' => "Dinas Sosial, Bappeda"
            ],
            [
                'id' => 18,
                'sasaran' => "Peningkatan pemajuan dan pelestarian kebudayaan",
                'indikator' => "Indeks Pemajuan Kebudayaan",
                'target' => "80,9",
                'capaian' => "-",
                'skpd' => "Dinas Pendidikan dan Kebudayaan"
            ],
            [
                'id' => 19,
                'sasaran' => "Peningkatan kapasitas infrastruktur berkelanjutan",
                'indikator' => "Indeks Infrastruktur Berkelanjutan",
                'target' => "66,12",
                'capaian' => "-",
                'skpd' => "Bappeda, DPUPR, Dinas Perkim, Dishub, DLH"
            ],
            [
                'id' => 20,
                'sasaran' => "Terwujudnya peningkatan pemanfaatan ruang sesuai dengan RTRW",
                'indikator' => "Persentase peningkatan pemanfaatan ruang sesuai dengan RTRW",
                'target' => "23,14",
                'capaian' => "-",
                'skpd' => "Dinas PUPR, Dinas Pertanahan"
            ],
            [
                'id' => 21,
                'sasaran' => "Peningkatan kualitas lingkungan hidup",
                'indikator' => "Indeks Kualitas Lingkungan Hidup",
                'target' => "77,22",
                'capaian' => "-",
                'skpd' => "Dinas Lingkungan Hidup"
            ],
            [
                'id' => 22,
                'sasaran' => "Peningkatan ketahanan bencana",
                'indikator' => "Indeks Resiko Bencana",
                'target' => "179,03",
                'capaian' => "-",
                'skpd' => "BPBD, Damkar"
            ]
        ];

        return Inertia::render('PkWako/PkWakoPage', [
            'initialData' => $data,
        ]);
    }
}
