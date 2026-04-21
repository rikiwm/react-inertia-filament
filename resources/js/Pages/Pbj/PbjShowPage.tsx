import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { Package, ChevronLeft, Building2, Factory, Calendar, Info, ArrowRight } from 'lucide-react';

const PbjShowPage = () => {
    return (
        <>
            <Head title="Rincian Paket Pengadaan" />

            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-24 pb-20">
                <div className="max-w-screen-xl mx-auto px-4 lg:px-8 space-y-8">
                    
                    {/* Breadcrumbs */}
                    <Link 
                        href="/dashboard/pbj"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-[0.2em]"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Kembali ke Daftar
                    </Link>

                    {/* Header Placeholder */}
                    <div className="bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-slate-200 dark:border-neutral-800 p-8 lg:p-12 shadow-sm text-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-neutral-900 flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <Info className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase mb-4">
                            Halaman <span className="text-slate-300">Rincian Paket</span>
                        </h1>
                        <p className="text-slate-500 dark:text-neutral-400 max-w-lg mx-auto">
                            Halaman ini dalam tahap pengembangan untuk menampilkan rincian mendalam per order, termasuk histori pengiriman dan rincian produk secara spesifik.
                        </p>
                    </div>

                    {/* Static Visual Sections (Placeholder) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40 grayscale pointer-events-none select-none">
                        <div className="bg-white dark:bg-neutral-950 rounded-[2rem] border border-slate-200 dark:border-neutral-800 p-8 shadow-sm h-64 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Informasi Satker</p>
                                <div className="h-4 bg-slate-100 dark:bg-neutral-800 rounded-full w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-100 dark:bg-neutral-800 rounded-full w-1/2"></div>
                            </div>
                            <div className="w-full h-1 bg-slate-50 dark:bg-neutral-900 rounded-full"></div>
                        </div>
                        <div className="bg-white dark:bg-neutral-950 rounded-[2rem] border border-slate-200 dark:border-neutral-800 p-8 shadow-sm h-64 flex flex-col justify-between">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Penyedia & Kontrak</p>
                                <div className="h-4 bg-slate-100 dark:bg-neutral-800 rounded-full w-1/2 mb-2"></div>
                                <div className="h-4 bg-slate-100 dark:bg-neutral-800 rounded-full w-2/3"></div>
                            </div>
                            <div className="w-full h-1 bg-slate-50 dark:bg-neutral-900 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

PbjShowPage.layout = (page: React.ReactNode) => <FrontWrapper>{page}</FrontWrapper>;

export default PbjShowPage;
