import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/Lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

const Breadcrumb = () => {
    const { url } = usePage();

    // Jangan tampilkan breadcrumb di halaman landing/home
    if (url === "/" || url === "") {
        return null;
    }

    // Pecah URL menjadi segmen
    const pathSegments = url.split("?")[0].split("/").filter((segment) => segment !== "");

    // Map segmen ke label yang lebih manusiawi
    const segmentMap: Record<string, string> = {
        dashboard: "Dashboard",
        "opd-detail": "Detail OPD",
        "belanja-daerah": "Belanja Daerah",
        "pendapatan-daerah": "Pendapatan Daerah",
        "berita": "Berita",
        "kebencanaan": "Kebencanaan",
        "pk-wako": "PK Wako",
        "pbj": "PBJ",
        "statistik": "Statistik",
        "regulasi": "Regulasi",
        "rencana-terbit": "Rencana Terbit",
        "contact": "Kontak",
        "progul": "Program Unggulan",
        "kinerja": "Kinerja",
        "activasi": "Aktivasi",
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Beranda", href: "/" },
        ...pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;

            let label = segmentMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

            // Handle UUID atau ID numeric
            if (/^[0-9a-fA-F-]{8,}$/.test(segment) || /^\d+$/.test(segment)) {
                label = "Detail";
            }

            return {
                label,
                href: isLast ? undefined : href,
                active: isLast,
            };
        }),
    ];

    return (
        <nav aria-label="Breadcrumb" className="w-full lg:pt-20 pt-16 pb-1">
            <div className="mx-auto max-w-screen-2xl px-4 lg:px-1">
                <ol className="flex flex-wrap items-center gap-2 text-xs lg:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {breadcrumbs.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />}

                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-1.5 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-400 group"
                                >
                                    {index === 0 && <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />}
                                    <span className="hover:underline underline-offset-4">{item.label}</span>
                                </Link>
                            ) : (
                                <span className={cn(
                                    "flex items-center gap-1.5",
                                    item.active && "font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md"
                                )}>
                                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
};

export default Breadcrumb;
