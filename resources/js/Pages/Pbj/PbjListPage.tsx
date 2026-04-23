import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import {
    Search,
    Package,
    FilterX,
    LayoutGrid,
    Factory
} from 'lucide-react';
import { cn } from '@/Lib/Utils';
import PbjSummaryBlocks from './Components/PbjSummaryBlocks';
import CatalogTab from './Tabs/CatalogTab';
import TenderTab from './Tabs/TenderTab';
import NonTenderTab from './Tabs/NonTenderTab';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

type TabType = 'CATALOG' | 'TENDER' | 'NON-TENDER';

const PbjListPage = () => {
    const [tahun, setTahun] = useState(2026);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSatker, setSelectedSatker] = useState('all');
    const [activeTab, setActiveTab] = useState<TabType>('CATALOG');
    const [filterOptions, setFilterOptions] = useState<{ satkers: string[] }>({ satkers: [] });

    useEffect(() => {
        let isMounted = true;
        fetch('/satker')
            .then(res => res.json())
            .then((data: any[]) => {
                if (isMounted && Array.isArray(data)) {
                    const uniqueSatkers = Array.from(new Set(data.map(d => d.nama_satker))).filter(Boolean).sort();
                    setFilterOptions({ satkers: uniqueSatkers as string[] });
                }
            })
            .catch(err => console.error("Error fetching satkers:", err));

        return () => { isMounted = false; };
    }, []);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedSatker('all');
    };

    const isFilterActive = searchQuery !== '' || selectedSatker !== 'all';

    return (
        <>
            <Head title={`Daftar Paket Pengadaan ${tahun}`} />

            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-24 pb-20">
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 space-y-4">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">
                                    Pengadaan Barang & Jasa
                                </span>
                            </div>
                            <h1 className="text-3xl lg:text-3xl font-bold text-slate-900 dark:text-white uppercase">
                                Rincian Paket <span className="text-teal-600">Terintegrasi</span>
                            </h1>
                            <p className="text-slate-500 dark:text-neutral-400 px-1 text-sm max-w-2xl">
                                Data konsolidasi E-Katalog, Tender, dan Non-Tender Pemerintah Kota Padang.
                            </p>
                        </div>

                        {/* Year Selector */}
                        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-teal-200 dark:border-teal-800">
                            {AVAILABLE_YEARS.map((y) => (
                                <button
                                    key={y}
                                    id={`filter-tahun-${y}`}
                                    onClick={() => setTahun(y)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                        y === tahun
                                            ? "bg-teal-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/50"
                                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
                                    )}
                                    aria-pressed={y === tahun}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Blocks Integration */}
                    <PbjSummaryBlocks tahun={tahun} activeTab={activeTab} />

                    {/* Content Section */}
                    <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-full">

                        {/* Filters & Search Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-neutral-800 space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Main Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama paket, satker, atau penyedia..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border-none rounded-lg dark:border-teal-900 text-xs focus:ring-2 focus:ring-teal-500/20 transition-all dark:text-white"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Quick Reset */}
                                {isFilterActive && (
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center justify-center px-2 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium uppercase hover:bg-rose-100 transition-colors gap-1"
                                    >
                                        <FilterX className="w-4 h-3" />
                                        Hapus Filter
                                    </button>
                                )}
                            </div>

                            {/* Tab Filters */}
                            <div className="flex flex-wrap items-center gap-2 space-x-2">
                                <button
                                    onClick={() => setActiveTab('CATALOG')}
                                    className={cn("px-4 py-2.5 rounded-lg text-xs font-semibold transition-all", activeTab === 'CATALOG' ? "bg-teal-600 text-white shadow-md shadow-indigo-600/20" : "bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-200")}
                                >
                                    E-Katalog
                                </button>
                                <button
                                    onClick={() => setActiveTab('TENDER')}
                                    className={cn("px-4 py-2.5 rounded-lg text-xs font-semibold transition-all", activeTab === 'TENDER' ? "bg-yellow-600 text-white shadow-md shadow-yellow-600/20" : "bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-500 hover:text-yellow-600 hover:border-yellow-200")}
                                >
                                    Tender
                                </button>
                                <button
                                    onClick={() => setActiveTab('NON-TENDER')}
                                    className={cn("px-4 py-2.5 rounded-lg text-xs font-semibold transition-all", activeTab === 'NON-TENDER' ? "bg-rose-600 text-white shadow-md shadow-rose-600/20" : "bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-500 hover:text-rose-600 hover:border-rose-200")}
                                >
                                    Non-Tender
                                </button>
                                <div className="flex-1">
                                    <div className=" space-y-1.5">
                                        {/* <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Satuan Kerja (SKPD)</label> */}
                                        <div className="relative group">
                                            <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                            <select
                                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-teal-200 dark:border-teal-900 rounded-lg text-xs font-semibold text-slate-600 dark:text-neutral-300 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none transition-all"
                                                value={selectedSatker}
                                                onChange={(e) => setSelectedSatker(e.target.value)}
                                            >
                                                <option value="all">Semua Satker</option>
                                                {filterOptions.satkers.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Satker Filter */}

                    </div>

                    {/* Active Tab Rendering */}
                    <div className="flex-1 relative min-h-[300px] px-2">
                        {activeTab === 'CATALOG' && <CatalogTab tahun={tahun} searchQuery={searchQuery} selectedSatker={selectedSatker} />}
                        {activeTab === 'TENDER' && <TenderTab tahun={tahun} searchQuery={searchQuery} selectedSatker={selectedSatker} />}
                        {activeTab === 'NON-TENDER' && <NonTenderTab tahun={tahun} searchQuery={searchQuery} selectedSatker={selectedSatker} />}
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper components for Satker/Status labels in the table
const Building2 = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

PbjListPage.layout = (page: React.ReactNode) => <FrontWrapper>{page}</FrontWrapper>;

export default PbjListPage;
