<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\InquiryStoreRequest;
use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Mengelola alur pesan masuk (Inquiry) dari pengunjung publik.
 * Bertanggung jawab untuk menampilkan form kontak dan menyimpan pesan yang dikirimkan.
 */
final class InquiryController extends Controller
{
    /**
     * Menampilkan halaman formulir kontak.
     *
     * Merender komponen Inertia `ContactForm` yang berisi form
     * untuk pengunjung mengirimkan pertanyaan atau pesan.
     */
    public function create(): Response
    {
        return Inertia::render('ContactForm');
    }

    /**
     * Menyimpan pesan masuk baru dari formulir kontak.
     *
     * Menerima data yang sudah divalidasi melalui InquiryStoreRequest,
     * menggabungkan dengan metadata server (IP address dan user agent),
     * lalu menyimpan ke database. Setelah berhasil, mengarahkan kembali
     * ke halaman form dengan flash data 'success'.
     *
     * @param  InquiryStoreRequest  $request  Data form yang sudah divalidasi
     */
    public function store(InquiryStoreRequest $request): RedirectResponse
    {
        Inquiry::query()->create($this->buildPayload($request));

        return to_route('contact.form')->with('success', true);
    }

    /**
     * Menggabungkan data form yang sudah divalidasi dengan metadata server.
     *
     * Mengambil IP address dan user agent dari request HTTP untuk
     * keperluan pencatatan dan keamanan, kemudian menggabungkannya
     * dengan data yang dikirimkan oleh pengguna.
     *
     * @param  InquiryStoreRequest  $request  Request yang berisi data tervalidasi
     * @return array<string, mixed>           Array gabungan data form + metadata server
     */
    private function buildPayload(InquiryStoreRequest $request): array
    {
        return array_merge($request->validated(), [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}


