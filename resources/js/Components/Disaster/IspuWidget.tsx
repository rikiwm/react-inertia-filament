import React from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/Lib/Utils';

interface IspuWidgetProps {
    data: any;
}

const IspuWidget: React.FC<IspuWidgetProps> = ({ data }) => {
    if (!data || !data.status_stasiun || data.status_stasiun.length === 0) {
        return (
            <div className="p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 h-[600px] flex items-center justify-center text-neutral-500 italic shadow-xl">
                Data ISPU tidak tersedia
            </div>
        );
    }

    const stasiun = data.status_stasiun[0];
    const kategori = stasiun.kategori;

    const pollutants = [
        { label: 'PM10', key: 'pm10_24_max', sub: '10' },
        { label: 'PM2.5', key: 'pm25_24_max', sub: '2.5' },
        { label: 'SO2', key: 'so2_24_max', sub: '2' },
        { label: 'CO', key: 'co_24_max', sub: '' },
        { label: 'O3', key: 'o3_24_max', sub: '3' },
        { label: 'NO2', key: 'no2_24_max', sub: '2' },
        { label: 'HC', key: 'hc_24_max', sub: '' },
    ];

    const getStatusColor = (value: number) => {
        if (value > 300) return '#000000'; // Berbahaya
        if (value > 200) return '#FF0000'; // Sangat Tidak Sehat
        if (value > 100) return '#FFFF00'; // Tidak Sehat
        if (value > 50) return '#0066CC';  // Sedang
        return '#00CC00';                 // Baik
    };

    const getStatusTextColor = (value: number) => {
        if (value > 100 && value <= 200) return '#000000'; // Black text for yellow bg
        return '#FFFFFF';
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-800 dark:text-white">
                        Indeks Standar Pencemar Udara
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Data source: Kementerian Lingkungan Hidup dan Kehutanan
                    </p>
                </div>
                <button className="p-2 bg-blue-400/20 text-blue-500 rounded-xl hover:bg-blue-400/30 transition-colors group relative">
                    <RotateCcw className="w-6 h-6" />
                    <span className="absolute -bottom-10 right-0 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        Refresh Air Quality Data
                    </span>
                </button>
            </div>

            {/* Banner Pesan */}
            <div
                className="w-full p-6 rounded-2xl mb-8 flex items-center justify-center text-center shadow-lg transform transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: kategori.color }}
            >
                <p className="text-xl font-bold leading-tight" style={{ color: kategori.color_text === 'white' ? '#FFFFFF' : '#000000' }}>
                    {kategori.keterangan}
                </p>
            </div>

            {/* Main Content: Categories + Chart */}
            <div className="flex flex-col md:flex-row gap-8 items-stretch mb-12">
                {/* Vertical Categories List */}
                <div className="flex flex-col gap-1 w-full md:w-48">
                    {[
                        { label: 'BERBAHAYA', color: '#000000' },
                        { label: 'SANGAT TIDAK SEHAT', color: '#FF0000' },
                        { label: 'TIDAK SEHAT', color: '#FFFF00', textColor: '#000000' },
                        { label: 'SEDANG', color: '#0066CC' },
                        { label: 'BAIK', color: '#00CC00' },
                    ].map((cat) => (
                        <div
                            key={cat.label}
                            className={cn(
                                "py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center text-center transition-all",
                                kategori.nilai === cat.label ? "ring-4 ring-offset-2 ring-neutral-200 dark:ring-neutral-700 scale-105" : "opacity-90"
                            )}
                            style={{ backgroundColor: cat.color, color: cat.textColor || '#FFFFFF' }}
                        >
                            {cat.label}
                        </div>
                    ))}
                    <div className="text-center mt-4 font-black text-neutral-500 uppercase tracking-widest text-sm">
                        Kategori
                    </div>
                </div>

                {/* Pollutant Bars */}
                <div className="flex-1 grid grid-cols-7 gap-2 items-end h-[300px] pt-10">
                    {pollutants.map((pollutant) => {
                        const val = parseInt(stasiun[pollutant.key]) || 0;
                        const heightPercent = Math.min((val / 350) * 100, 100); // Scale relative to 350 max

                        return (
                            <div key={pollutant.label} className="flex flex-col items-center h-full group">
                                <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-xl relative overflow-hidden flex flex-col justify-end border border-neutral-200 dark:border-neutral-800">
                                    <div
                                        className="w-full transition-all duration-1000 ease-out relative"
                                        style={{
                                            height: `${heightPercent}%`,
                                            backgroundColor: getStatusColor(val)
                                        }}
                                    >
                                        <div className="absolute inset-x-0 -top-6 text-center text-xs font-black" style={{ color: getStatusColor(val) }}>
                                            {val}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-center">
                                    <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400 leading-none">
                                        {pollutant.label.substring(0, 2)}
                                        <sub className="text-[10px]">{pollutant.sub}</sub>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Legend */}
            <div>
                <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-sm mb-4">
                    Indeks Kualitas Udara
                </h3>
                <div className="grid grid-cols-5 rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800">
                    {[
                        { range: '≥ 300', label: 'BERBAHAYA', color: '#000000' },
                        { range: '201 - 300', label: 'SANGAT TIDAK SEHAT', color: '#FF0000' },
                        { range: '101 - 200', label: 'TIDAK SEHAT', color: '#FFFF00', textColor: '#000000' },
                        { range: '51 - 100', label: 'SEDANG', color: '#0066CC' },
                        { range: '0 - 50', label: 'BAIK', color: '#00CC00' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex flex-col items-center justify-center py-4 px-2 text-center"
                            style={{ backgroundColor: item.color, color: item.textColor || '#FFFFFF' }}
                        >
                            <span className="text-sm font-black mb-1">{item.range}</span>
                            <span className="text-[10px] font-bold leading-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IspuWidget;
