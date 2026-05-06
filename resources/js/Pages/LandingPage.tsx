import { SharedData } from "@/Types/types";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { usePage, Link } from "@inertiajs/react";
import { ReactNode } from "react";
import { motion } from "motion/react";
import { FeedbackForm } from "@/shared";
import {
    Activity,
    ShoppingCart,
    TrendingUp,
    PackageSearch,
    Star,
    AlertTriangle,
    ClipboardCheck,
    Newspaper,
    Zap,
    ChevronLeft,
    Info
} from "lucide-react";

const shortcuts = [
    {
        title: "Dashboard APBD",
        description: "Ringkasan Eksekutif Keuangan & Pembangunan",
        icon: Activity,
        href: "/dashboard",
        gradient: "from-blue-500 to-cyan-400"
    },
    {
        title: "Belanja Daerah",
        description: "Realisasi Belanja OPD & Kegiatan",
        icon: ShoppingCart,
        href: "/dashboard/belanja",
        gradient: "from-teal-500 to-emerald-400"
    },
    {
        title: "Pendapatan Daerah",
        description: "Target & Realisasi Pendapatan Daerah",
        icon: TrendingUp,
        href: "/dashboard/pendapatan",
        gradient: "from-amber-500 to-orange-400"
    },
    {
        title: "Pengadaan Barang/Jasa",
        description: "Informasi Paket & Progres Lelang",
        icon: PackageSearch,
        href: "/dashboard/pbj",
        gradient: "from-purple-500 to-pink-400"
    },
    {
        title: "Program Unggulan",
        description: "Capaian Program Unggulan Wali Kota",
        icon: Star,
        href: "/progul",
        gradient: "from-yellow-400 to-amber-500"
    },
    {
        title: "Perjanjian Kinerja",
        description: "Evaluasi Perjanjian Kinerja Daerah",
        icon: ClipboardCheck,
        href: "/pk-wako",
        gradient: "from-indigo-500 to-blue-400"
    },
    {
        title: "Kebencanaan",
        description: "Informasi Data Kebencanaan & Mitigasi",
        icon: AlertTriangle,
        href: "/kebencanaan",
        gradient: "from-red-500 to-rose-400"
    },
    {
        title: "Berita & Publikasi",
        description: "Informasi Terkini Seputar Pembangunan",
        icon: Newspaper,
        href: "/berita",
        gradient: "from-slate-500 to-gray-400"
    }
];

const LandingPage = () => {
    const { siteSettings } = usePage<SharedData>().props;
    const appName = import.meta.env.VITE_APP_NAME || "Padang Digital";

    return (
        <div className="min-h-screen selection:bg-teal-500/30 font-sans relative overflow-hidden">
            {/* ── Background Grid ────────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10808012_2px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-teal-500/5 blur-[120px] rounded-full opacity-50" />
            </div>

            {/* ── Hero Section ────────────────────────────────────────────────── */}
            <section className="relative pt-32 md:pt-48 md:pb-20 container max-w-7xl mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-center mx-auto lg:pb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-[8px] lg:text-xs font-medium uppercase tracking-widest mb-2 animate-bounce">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        PEMBANGUNAN Kota Padang
                    </div>

                    <h1 className="text-5xl md:text-9xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.5] mb-4">
                        {siteSettings.name || appName}
                        <span className="text-teal-500">.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-6 font-medium leading-relaxed">
                        Platform integrasi data pembangunan, keuangan, dan layanan publik Kota Padang yang  <span className="text-teal-500"> modern & transparan.</span>
                    </p>
                </motion.div>

            </section>

            {/* ── Shortcut Menu Section ────────────────────────────────────────── */}
            <section className="container max-w-5xl mx-auto px-4 pb-24 relative z-10 lg:pt-8 pt-18">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                >
                    <div className="text-start mb-1 opacity-75">
                        <h2 className="lg:text-xl font-light tracking-tight text-teal-400 dark:text-white">

                            <span className="text-teal-500 flex items-center gap-4">
                                <TrendingUp size={20} strokeWidth={1.5} />
                                Akses Cepat</span>
                        </h2>
                        <p className="ms-4 text-[10px] lg:text-md mb-2 text-neutral-500 dark:text-neutral-400 max-w-3xl ">
                            Pilih menu di bawah ini untuk mengakses informasi.
                        </p>
                    </div>

                    <div className="flex overflow-x-auto snap-x snap-mandatory rounded-xl scrollbar-hide -mx-2 px-4 gap-3 py-3 md:grid md:grid-cols-4 lg:grid-cols-4 md:overflow-visible md:gap-2 md:px-0 md:mx-0">
                        {shortcuts.map((shortcut, index) => (
                            <Link
                                href={shortcut.href}
                                key={index}
                                className="flex-shrink-0 w-[180px] md:w-auto snap-start group relative bg-neutral-100/80 dark:bg-neutral-900/60 backdrop-blur-xl border border-teal-50 dark:border-white/5 p-3 lg:p-6 rounded-xl lg:rounded-xl hover:bg-teal-100/10 dark:hover:bg-neutral-800 transition-all lg:shadow-xs hover:shadow-none hover:-translate-y-1  overflow-hidden flex flex-col items-center"
                            >
                                <div className={`mb-3 lg:mb-5 inline-flex p-2 lg:p-4 rounded-lg lg:rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 group-hover:scale-110 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-all duration-300`}>
                                    <shortcut.icon size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-sm lg:text-lg font-semibold lg:font-semibold lg:text-teal-950 text-neutral-800 dark:text-white mb-2">
                                    {shortcut.title}
                                </h3>
                                <p className="text-[10px] lg:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                                    {shortcut.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </motion.div>
                <div className="block md:hidden  flex items-center  gap-1 text-[6px] lg:text-xs text-neutral-400 dark:text-neutral-700 max-w-3xl text-start ">
                    <Info size={8} strokeWidth={2} /><i> Geser kekiri untuk mengakses informasi lainnya.</i>
                </div>
            </section>

            {/* ── Footer Feature Section ────────────────────────────────────────── */}
            <section className="container max-w-6xl mx-auto lg:px-6 px-4 pb-40 relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="p-1 pt-20"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6 leading-tight">
                                Transformasi Digital <br />
                                <span className="text-teal-500">Membangun Kota Kita.</span>
                            </h2>
                            <p className="text-md lg:text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-10 leading-relaxed">
                                Kami berkomitmen untuk menyajikan data yang akurat, terbuka, dan dapat dipertanggungjawabkan untuk seluruh masyarakat Kota Padang.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <span className="font-semibold text-sm uppercase tracking-widest text-neutral-400">Transparansi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="font-semibold text-sm uppercase tracking-widest text-neutral-400">Akuntabilitas</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-sm uppercase tracking-widest text-neutral-400">Inovasi</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-teal-500/10 rounded-[3rem] blur-2xl group-hover:bg-teal-500/20 transition-all" />
                            <div className="relative bg-neutral-900 rounded-xl p-6 md:p-16 text-white shadow-2xl overflow-hidden">
                                <h4 className="text-3xl font-semibold mb-6 relative z-10">Layanan Aspirasi</h4>
                                <p className="text-neutral-400 lg:text-lg text-sm mb-10 relative z-10 leading-relaxed">
                                    Punya saran atau pertanyaan mengenai data pembangunan? Tim kami siap membantu Anda memberikan informasi terbaik.
                                </p>
                                <a href="#" target="_blank" className="relative z-10 px-8 py-2 mb-8  bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all">
                                    Hubungi Kami
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

LandingPage.layout = (page: ReactNode) => <FrontWrapper title={undefined}>{page}</FrontWrapper>;

export default LandingPage;
