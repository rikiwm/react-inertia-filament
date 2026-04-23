import React from 'react';
import { Cloud, Droplets, Thermometer, Wind, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { cn } from '@/Lib/Utils';

interface WeatherWidgetProps {
    data: any;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data }) => {
    if (!data) return <div className="p-6 bg-white/5 rounded-xl border border-teal-500/10 h-full flex items-center justify-center">Loading weather...</div>;

    const current = data.current;

    // Simple weather code mapping for icons
    const getWeatherIcon = (code: number) => {
        if (code === 0) return <Sun className="w-12 h-12 text-yellow-400" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-12 h-12 text-gray-400" />;
        if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-400" />;
        if (code >= 95) return <CloudLightning className="w-12 h-12 text-purple-400" />;
        return <Cloud className="w-12 h-12 text-teal-400" />;
    };

    return (
        <div className={cn(
            "p-6 rounded-2xl border border-teal-500/20 shadow-sm h-full",
            "bg-gradient-to-br from-teal-200/20 via-white/5 to-transparent backdrop-blur-sm"
        )}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-teal-400 mb-1">Cuaca Saat Ini</h3>
                    <p className="text-sm text-neutral-400">Kota Padang, Sumatera Barat</p>
                </div>
                {getWeatherIcon(current.weather_code)}
            </div>

            <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-bold text-teal-400">{Math.round(current.temperature_2m)}°</span>
                <span className="text-xl text-neutral-400 mb-1">C</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-200 border border-teal-200">
                    <Thermometer className="w-5 h-5 text-red-400" />
                    <div>
                        <p className="text-[10px] uppercase text-neutral-500">Terasa</p>
                        <p className="text-sm font-semibold text-teal-600">{Math.round(current.apparent_temperature)}°C</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <div>
                        <p className="text-[10px] uppercase text-neutral-500">Kelembaban</p>
                        <p className="text-sm font-semibold">{current.relative_humidity_2m}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <Wind className="w-5 h-5 text-teal-400" />
                    <div>
                        <p className="text-[10px] uppercase text-neutral-500">Angin</p>
                        <p className="text-sm font-semibold">{current.wind_speed_10m} km/h</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <CloudRain className="w-5 h-5 text-indigo-400" />
                    <div>
                        <p className="text-[10px] uppercase text-neutral-500">Hujan</p>
                        <p className="text-sm font-semibold">{current.precipitation} mm</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
