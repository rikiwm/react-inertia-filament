/**
 * @file Components/ShadCN/FloatingDock.tsx
 *
 * Komponen dock ikon floating yang terinspirasi dari macOS Dock.
 *
 * Versi desktop menampilkan efek magnifikasi ikon saat hover berdasarkan
 * jarak kursor dari setiap item. Versi mobile menampilkan menu yang bisa
 * dibuka/tutup dengan tombol toggle.
 */

import { AnimatePresence, MotionValue, motion, useMotionValue, useSpring, useTransform } from "motion/react";

import { cn } from "@/Lib/Utils";
import { FloatingDockItem } from "@/Types/Types";
import { Link, XIcon } from "lucide-react";
import { useRef, useState } from "react";

/** Props untuk komponen IconContainer yang menyertakan posisi mouse. */
interface IconContainerProps extends FloatingDockItem {
    mouseX: MotionValue;
}

/**
 * Komponen dock utama yang merender versi desktop dan mobile secara bersamaan.
 *
 * Menggunakan CSS media query (via class Tailwind) untuk menampilkan
 * hanya satu versi sesuai ukuran layar:
 * - Desktop (md ke atas): `FloatingDockDesktop` dengan efek magnifikasi
 * - Mobile (di bawah md): `FloatingDockMobile` dengan menu toggle
 *
 * @param items            - Daftar item dock (judul, ikon, tautan)
 * @param desktopClassName - Class tambahan khusus untuk tampilan desktop
 * @param mobileClassName  - Class tambahan khusus untuk tampilan mobile
 */
export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
}: {
    items: FloatingDockItem[];
    desktopClassName?: string;
    mobileClassName?: string;
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

/**
 * Varian mobile dari floating dock dengan animasi buka/tutup.
 *
 * Menampilkan tombol pemicu di bagian bawah. Saat dibuka, item-item muncul
 * ke atas dengan animasi stagger (jeda bertingkat) menggunakan AnimatePresence.
 * Saat ditutup, item menghilang dengan urutan stagger terbalik.
 *
 * @param items     - Daftar item dock yang akan ditampilkan
 * @param className - Class tambahan untuk wrapper div
 */
const FloatingDockMobile = ({ items, className }: { items: FloatingDockItem[]; className?: string }) => {
    /**
     * State buka/tutup untuk menu dock mobile.
     * `true` = menu terbuka dan item-item terlihat.
     */
    const [open, setOpen] = useState(false);

    return (
        <div className={cn("relative block md:hidden", className)}>
            <AnimatePresence>
                {open && (
                    <motion.div layoutId="nav" className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2">
                        {items.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: 10,
                                        transition: {
                                            delay: idx * 0.05,
                                        },
                                    }}
                                    transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                                >
                                    <a
                                        target="_blank"
                                        href={item.href}
                                        key={item.title}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
                                    >
                                        <Icon />
                                    </a>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tombol toggle: menampilkan ikon Link (tutup) atau X (buka) */}
            <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800">
                {open ? (
                    <XIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                ) : (
                    <Link className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                )}
            </button>
        </div>
    );
};

/**
 * Varian desktop dari floating dock dengan efek magnifikasi berbasis posisi mouse.
 *
 * Melacak posisi X kursor menggunakan `useMotionValue` dan membagikannya
 * ke setiap `IconContainer` sebagai props. Ketika mouse meninggalkan dock,
 * nilai diset ke Infinity agar semua ikon kembali ke ukuran normal.
 *
 * @param items     - Daftar item dock yang akan ditampilkan
 * @param className - Class tambahan untuk wrapper motion.div
 */
const FloatingDockDesktop = ({ items, className }: { items: FloatingDockItem[]; className?: string }) => {
    /**
     * Nilai gerak X posisi kursor. Awalnya Infinity agar tidak ada ikon
     * yang diperbesar sebelum mouse masuk ke area dock.
     */
    const mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn("mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900", className)}
        >
            {items.map((item) => (
                <IconContainer mouseX={mouseX} key={item.title} {...item} />
            ))}
        </motion.div>
    );
};

/**
 * Kontainer ikon individual dengan efek magnifikasi berbasis jarak kursor.
 *
 * Menghitung jarak antara posisi kursor dan titik tengah ikon menggunakan
 * `getBoundingClientRect`. Jarak ini digunakan untuk menginterpolasi
 * ukuran ikon dan containernya dengan spring animation yang mulus.
 *
 * Rentang magnifikasi:
 * - Jarak 150px dari tengah: ukuran normal (40px)
 * - Tepat di tengah: ukuran maksimal (80px)
 *
 * @param mouseX - MotionValue posisi X kursor dari parent desktop dock
 * @param title  - Judul tooltip yang muncul saat hover
 * @param icon   - Komponen ikon React yang akan dirender
 * @param href   - URL tujuan tautan
 */
const IconContainer = ({ mouseX, title, icon: Icon, href }: IconContainerProps) => {
    /** Referensi ke elemen div untuk mengambil posisi dan ukurannya. */
    const ref = useRef<HTMLDivElement>(null);

    /**
     * Menghitung jarak antara posisi mouse X dan titik tengah ikon.
     * Nilai positif = mouse di kanan ikon, negatif = di kiri.
     */
    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

        return val - bounds.x - bounds.width / 2;
    });

    /* Interpolasi ukuran container berdasarkan jarak: [jauh, tengah, jauh] → [kecil, besar, kecil] */
    const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    /* Interpolasi ukuran ikon (lebih kecil dari container untuk mempertahankan padding) */
    const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
    const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

    /* Spring animation untuk ukuran container — terasa lebih fisik dan alami */
    const width = useSpring(widthTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    const height = useSpring(heightTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    /* Spring animation untuk ukuran ikon */
    const widthIcon = useSpring(widthTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    const heightIcon = useSpring(heightTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    /** State untuk menampilkan tooltip saat mouse berada di atas ikon. */
    const [hovered, setHovered] = useState(false);

    return (
        <a href={href} target="_blank">
            <motion.div
                ref={ref}
                style={{ width, height }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="relative flex aspect-square items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
            >
                {/* Tooltip nama platform, muncul saat hover dengan animasi */}
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 2, x: "-50%" }}
                            className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-neutral-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ikon dengan ukuran yang dianimasikan oleh spring */}
                <motion.div
                    style={{ width: widthIcon, height: heightIcon }}
                    className="flex items-center justify-center text-neutral-600 dark:text-neutral-200"
                >
                    <Icon />
                </motion.div>
            </motion.div>
        </a>
    );
};
