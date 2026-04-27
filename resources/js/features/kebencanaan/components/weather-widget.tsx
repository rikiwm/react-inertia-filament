import React from 'react';
import { Cloud, Droplets, Thermometer, Wind, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { cn } from '@/Lib/utils';

interface WeatherWidgetProps {
    data: any;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data }) => {
    if (!data) return <div className="p-6 bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 h-full flex items-center justify-center">Loading weather...</div>;

    const current = data.current;
    const hourly = data.hourly;

    const getWeatherIcon = (code: number, className = "w-12 h-12") => {
        if (code === 0) return <Sun className={cn(className, "text-amber-400")} />;
        if (code >= 1 && code <= 3) return <Cloud className={cn(className, "text-teal-400")} />;
        if (code >= 51 && code <= 67) return <CloudRain className={cn(className, "text-blue-400")} />;
        if (code >= 95) return <CloudLightning className={cn(className, "text-lime-400")} />;
        return <Cloud className={cn(className, "text-teal-400")} />;
    };

    return (
        <div className={cn(
            "p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg relative overflow-hidden",
            "bg-white dark:bg-neutral-900"
        )}>
            {/* Top Section */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Cuaca Saat Ini</h3>
                    <p className="text-2xl font-bold text-neutral-800 dark:text-white uppercase tracking-tighter">Kota Padang</p>
                </div>
                <div className="p-3 text-teal-600 dark:text-teal-500 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                    {getWeatherIcon(current.weather_code, "w-8 h-8")}
                </div>
            </div>

            {/* Main Temp */}
            <div className="flex items-end gap-3 mb-10">
                <span className="text-6xl font-bold text-neutral-900 dark:text-white tracking-tighter">{Math.round(current.temperature_2m)}°</span>
                <div className="mb-3">
                    <span className="text-2xl font-bold text-neutral-400 uppercase">Celsius</span>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                    <Thermometer className="w-5 h-5 text-rose-500" />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Terasa</p>
                        <p className="text-sm font-bold text-neutral-800 dark:text-white">{Math.round(current.apparent_temperature)}°C</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                    <Wind className="w-5 h-5 text-teal-500" />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Angin</p>
                        <p className="text-sm font-bold text-neutral-800 dark:text-white">{current.wind_speed_10m} km/h</p>
                    </div>
                </div>
            </div>

            {/* Hourly Forecast (Next 5 hours) */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border-1 border-neutral-200 dark:border-neutral-800">
                <p className="text-[10px] font-bold text-teal-950 uppercase tracking-widest mb-4">Prakiraan 5 Jam Kedepan</p>
                <div className="flex justify-between items-center px-1">
                    {hourly.time.slice(1, 6).map((time: string, idx: number) => (
                        <div key={time} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-400">
                                {new Date(time).getHours()}:00
                            </span>
                            {getWeatherIcon(hourly.weather_code[idx + 1], "w-6 h-6")}
                            <span className="text-xs font-bold text-neutral-800 dark:text-white">
                                {Math.round(hourly.temperature_2m[idx + 1])}°
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
