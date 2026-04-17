/**
 * @file Components/Inputs/Button.tsx
 *
 * Tombol aksi dengan animasi status loading, sukses, dan error menggunakan Framer Motion.
 *
 * Siklus animasi:
 * - Klik → animasi loader muncul
 * - `isSuccess=true` → loader hilang, ikon centang muncul lalu hilang otomatis
 * - `isError=true` → loader hilang, ikon silang muncul lalu hilang otomatis
 */

"use client";

import { cn } from "@/Lib/Utils";
import { ButtonProps } from "@/Types/Inputs";
import { motion, useAnimate } from "motion/react";
import React, { useEffect } from "react";

/**
 * Komponen tombol animasi utama.
 *
 * Mengekspos tiga state visual berbeda melalui props: loading, sukses, dan error.
 * Masing-masing mempunyai animasi masuk/keluar yang halus menggunakan Framer Motion.
 *
 * @param props.loading   - Jika true, animasi loader diaktifkan saat tombol diklik
 * @param props.isSuccess - Jika true, tampilkan animasi ikon centang (berhasil)
 * @param props.isError   - Jika true, tampilkan animasi ikon silang (gagal)
 * @param props.className - Class CSS tambahan untuk tombol
 * @param props.children  - Konten teks/elemen di dalam tombol
 * @param props.onClick   - Handler yang dipanggil setelah animasi loading dimulai
 */
const Button = (props: ButtonProps) => {
    const { className, children, isSuccess, loading, isError, onClick, ...buttonProps } = props;

    const [scope, animate] = useAnimate();

    /**
     * Memunculkan animasi ikon loader (berputar) dengan durasi 200ms.
     * Dipanggil saat tombol pertama kali diklik.
     */
    const animateLoading = async () => {
        await animate(
            ".loader",
            {
                width: "20px",
                scale: 1,
                display: "block",
            },
            {
                duration: 0.2,
            },
        );
    };

    /**
     * Mengganti loader dengan ikon centang lalu menyembunyikannya setelah 2 detik.
     * Dipanggil ketika `isSuccess` berubah menjadi `true`.
     */
    const animateSuccess = async () => {
        await animate(
            ".loader",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                duration: 0.2,
            },
        );
        await animate(
            ".check",
            {
                width: "20px",
                scale: 1,
                display: "block",
            },
            {
                duration: 0.2,
            },
        );

        await animate(
            ".check",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                delay: 2,
                duration: 0.2,
            },
        );
    };

    /**
     * Mengganti loader dengan ikon silang lalu menyembunyikannya setelah 2 detik.
     * Dipanggil ketika `isError` berubah menjadi `true`.
     */
    const animateError = async () => {
        await animate(
            ".loader",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                duration: 0.2,
            },
        );
        await animate(
            ".cross",
            {
                width: "20px",
                scale: 1,
                display: "block",
            },
            {
                duration: 0.2,
            },
        );

        await animate(
            ".cross",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                delay: 2,
                duration: 0.2,
            },
        );
    };

    /**
     * Handler klik yang memulai animasi loading terlebih dahulu,
     * baru kemudian memanggil `onClick` dari parent.
     *
     * @param event - Event klik tombol mouse
     */
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        await animateLoading();
        onClick?.(event);
    };

    /**
     * Efek samping: memicu animasi sukses atau error saat nilai props berubah.
     * Bergantung pada `isSuccess`, `isError`, dan `loading`.
     */
    useEffect(() => {
        if (isSuccess) {
            animateSuccess().then();
        } else if (isError) {
            animateError().then();
        }
    }, [isSuccess, isError, loading]);

    /**
     * Menentukan warna latar belakang tombol berdasarkan state saat ini.
     *
     * @param isError   - Apakah dalam state error
     * @param isSuccess - Apakah dalam state sukses
     * @returns String class Tailwind untuk warna latar dan ring hover
     */
    function getButtonColor(isError: boolean, isSuccess: boolean): string {
        if (isError) {
            return "bg-red-600 hover:ring-red-500";
        }

        if (isSuccess) {
            return "bg-green-600 hover:ring-green-500";
        }

        return "bg-neutral-600 hover:ring-neutral-500";
    }

    const buttonColor = getButtonColor(isError ?? false, isSuccess ?? false);

    return (
        <motion.button
            layout
            layoutId="button"
            ref={scope}
            className={cn(
                "ring-offset-white dark:ring-offset-black",
                "flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2",
                buttonColor,
                className,
            )}
            {...buttonProps}
            onClick={handleClick}
        >
            <motion.div layout className="flex items-center gap-2">
                <Loader />
                <CheckIcon />
                <CrossIcon />
                <motion.span layout>{children}</motion.span>
            </motion.div>
        </motion.button>
    );
};

/**
 * Ikon loader berputar yang muncul selama proses sedang berjalan.
 * Dimulai dengan lebar 0 dan tersembunyi — dimunculkan oleh `animateLoading`.
 */
const Loader = () => {
    return (
        <motion.svg
            animate={{
                rotate: [0, 360],
            }}
            initial={{
                scale: 0,
                width: 0,
                display: "none",
            }}
            style={{
                scale: 0.5,
                display: "none",
            }}
            transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "linear",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="loader text-white"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
        </motion.svg>
    );
};

/**
 * Ikon centang di dalam lingkaran yang ditampilkan saat operasi berhasil.
 * Dimunculkan oleh `animateSuccess` dan menghilang otomatis setelah 2 detik.
 */
const CheckIcon = () => {
    return (
        <motion.svg
            initial={{
                scale: 0,
                width: 0,
                display: "none",
            }}
            style={{
                scale: 0.5,
                display: "none",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check text-white"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M9 12l2 2l4 -4" />
        </motion.svg>
    );
};

/**
 * Ikon silang di dalam lingkaran yang ditampilkan saat operasi gagal.
 * Dimunculkan oleh `animateError` dan menghilang otomatis setelah 2 detik.
 */
const CrossIcon = () => {
    return (
        <motion.svg
            initial={{
                scale: 0,
                width: 0,
                display: "none",
            }}
            style={{
                scale: 0.5,
                display: "none",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cross text-white"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </motion.svg>
    );
};

export default Button;
