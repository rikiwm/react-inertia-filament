import { SharedData } from "@/Types/types";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { usePage } from "@inertiajs/react";
import { ReactNode } from "react";
import { motion } from "motion/react";
import { FeedbackForm } from "@/shared";

const LandingPage = () => {
    const { siteSettings } = usePage<SharedData>().props;
    const appName = import.meta.env.VITE_APP_NAME || "Padang Digital";

    return (
        <div className="min-h-screen selection:bg-teal-500/30 font-sans relative overflow-hidden">
            {/* ── Background Grid ────────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-teal-500/5 blur-[120px] rounded-full opacity-50" />
            </div>

            {/* ── Hero Section ────────────────────────────────────────────────── */}
            <section className="relative pt-32 pb-16 md:pt-48 md:pb-20 container max-w-6xl mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-center mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-8 animate-bounce">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        DASHBOARD PEMBANGUNAN Kota Padang
                    </div>

                    <h1 className="text-6xl md:text-9xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[0.9] mb-8">
                        {siteSettings.name || appName}
                        <span className="text-teal-500">.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        {siteSettings.description || 'Portal data pembangunan Kota Padang'}
                    </p>
                </motion.div>
            </section>

            {/* ── Search/Feedback Section ────────────────────────────────────────── */}
            <section className="container max-w-4xl mx-auto px-4 pb-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-2 rounded-2xl "
                >
                    <FeedbackForm />
                </motion.div>
            </section>

            {/* ── Footer Feature Section ────────────────────────────────────────── */}
            <section className="container max-w-6xl mx-auto px-6 pb-40 relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="p-1 border-t border-neutral-200 dark:border-neutral-800 pt-20"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-8 leading-tight">
                                Transformasi Digital <br />
                                <span className="text-teal-500">Membangun Kota.</span>
                            </h2>
                            <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium mb-10 leading-relaxed">
                                Kami berkomitmen untuk menyajikan data yang akurat, dan terbuka untuk seluruh masyarakat Kota Padang.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <span className="font-bold text-sm uppercase tracking-widest text-neutral-400">Transparansi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="font-bold text-sm uppercase tracking-widest text-neutral-400">Akuntabilitas</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="font-bold text-sm uppercase tracking-widest text-neutral-400">Inovasi</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-teal-500/10 rounded-[3rem] blur-2xl group-hover:bg-teal-500/20 transition-all" />
                            <div className="relative bg-neutral-900 rounded-xl p-12 text-white shadow-2xl overflow-hidden">
                                <h4 className="text-3xl font-bold mb-6 relative z-10">Layanan Aspirasi</h4>
                                <p className="text-neutral-400 text-lg mb-10 relative z-10 leading-relaxed">
                                    Punya saran atau pertanyaan mengenai data pembangunan? Tim kami siap membantu Anda memberikan informasi terbaik.
                                </p>
                                <button className="relative z-10 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all">
                                    Hubungi Kami
                                </button>
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
