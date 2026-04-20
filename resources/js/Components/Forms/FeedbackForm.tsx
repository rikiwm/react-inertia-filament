/**
 * @file Components/Forms/FeedbackForm.tsx
 *
 * Formulir umpan balik kecil yang mengirimkan pesan ke endpoint eksternal FLIRT Kit.
 *
 * Sengaja menggunakan fetch langsung (bukan Inertia form) karena tujuannya
 * adalah endpoint API eksternal, bukan route Laravel internal.
 */

import Button from "@/Components/Inputs/Button";
import Input from "@/Components/Inputs/Input";
import { useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

/** Union type untuk status pengiriman form. */
type ResponseStatus = "not-initiated" | "loading" | "success" | "error";

/**
 * Komponen formulir umpan balik untuk pengembang yang baru meng-install FLIRT Kit.
 *
 * Mengirimkan pesan singkat ke endpoint API eksternal. State form dikelola
 * menggunakan `useForm` dari Inertia untuk konsistensi, meskipun pengiriman
 * dilakukan via native `fetch`. Setelah berhasil, pesan direset ke nilai default
 * dan notifikasi toast sukses ditampilkan.
 *
 * @note Formulir ini menggunakan pola fetch manual alih-alih `router.post()`
 *       karena endpoint tujuan adalah API eksternal (bukan route Inertia internal).
 *       Untuk form ke route Laravel sendiri, gunakan Inertia Form seperti di ContactForm.
 */
const FeedbackForm = () => {
    /** URL endpoint API eksternal untuk menerima umpan balik FLIRT Kit. */
    const feedbackEndpoint = "";

    const { errors, data, setData, setError } = useForm({
        message: "Hey! I installed PDG Kit.",
    });

    /**
     * Status pengiriman form saat ini.
     * Mengontrol tampilan dan animasi komponen Button.
     */
    const [status, setStatus] = useState<ResponseStatus>("not-initiated");

    /**
     * Menangani pengiriman formulir umpan balik ke API eksternal.
     *
     * Alur:
     * 1. Mencegah navigasi halaman default form HTML.
     * 2. Mengirim data JSON ke endpoint eksternal via fetch.
     * 3. Jika berhasil: tampilkan toast sukses, reset pesan, ubah status.
     * 4. Jika gagal: ubah status ke error, tampilkan pesan error.
     *
     * @param event - Event submit dari form HTML
     */
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await fetch(feedbackEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(() => {
                toast.success("Thank you for your feedback!");
                setData("message", "Hey! I installed FLIRT Kit.");
                setStatus("success");
                setTimeout(() => {
                    setStatus("not-initiated");
                }, 2500);
                setError("message", "");
            })
            .catch((error) => {
                setStatus("error");
                setError("message", error.message);
            });
    };

    return (
        <form className="mt-6 flex w-full max-w-xl flex-col gap-2" onSubmit={handleSubmit}>
            <Input
                type="text"
                name="message"
                label="Show some love "
                value={data.message}
                onChange={(e) => setData("message", e.target.value)}
                errorMessage={errors.message}
                autoFocus
                helperText="Feedbacks are appreciated."
            />
            <Button
                loading={status === "loading"}
                className="w-1/2 mx-auto bg-teal-400 hover:bg-teal-500 dark:bg-teal-400 dark:hover:bg-teal-500"
                isSuccess={status === "success"}
                isError={status === "error"}
                type="submit"
                onClick={() => setStatus("loading")}
            >
                Submit
            </Button>
        </form>
    );
};

export default FeedbackForm;
