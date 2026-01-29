import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Weather Widget Component
 * Simulates weather data for emergency preparedness context
 */
const WeatherWidget = () => {
    const [weather, setWeather] = useState({
        condition: 'Partly Cloudy',
        temp: 28,
        humidity: 65,
        windSpeed: 12,
        icon: 'cloud'
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate weather API call
        setTimeout(() => {
            const conditions = [
                { condition: 'Sunny', temp: 32, humidity: 45, windSpeed: 8, icon: 'sun' },
                { condition: 'Partly Cloudy', temp: 28, humidity: 55, windSpeed: 12, icon: 'cloud' },
                { condition: 'Rainy', temp: 24, humidity: 85, windSpeed: 20, icon: 'rain' },
                { condition: 'Windy', temp: 26, humidity: 50, windSpeed: 35, icon: 'wind' }
            ];
            setWeather(conditions[Math.floor(Math.random() * conditions.length)]);
            setLoading(false);
        }, 1000);

        // Update weather periodically
        const interval = setInterval(() => {
            setWeather(prev => ({
                ...prev,
                temp: prev.temp + (Math.random() > 0.5 ? 1 : -1),
                humidity: Math.max(30, Math.min(90, prev.humidity + (Math.random() > 0.5 ? 2 : -2))),
                windSpeed: Math.max(5, Math.min(40, prev.windSpeed + (Math.random() > 0.5 ? 3 : -3)))
            }));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = () => {
        switch (weather.icon) {
            case 'sun': return <Sun className="text-yellow-400" size={28} />;
            case 'rain': return <CloudRain className="text-blue-400" size={28} />;
            case 'wind': return <Wind className="text-slate-300" size={28} />;
            default: return <Cloud className="text-slate-300" size={28} />;
        }
    };

    const getWeatherWarning = () => {
        if (weather.windSpeed > 30) return { text: 'High Wind Warning', color: 'text-orange-500' };
        if (weather.humidity > 80) return { text: 'Heavy Rain Expected', color: 'text-blue-400' };
        if (weather.temp > 35) return { text: 'Heat Advisory', color: 'text-red-500' };
        return null;
    };

    const warning = getWeatherWarning();

    if (loading) {
        return (
            <div className="glass rounded-2xl p-4 card-hover">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-20 skeleton rounded" />
                        <div className="h-3 w-32 skeleton rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 card-hover"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700/50 rounded-xl">
                        {getWeatherIcon()}
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">{weather.condition}</p>
                        <p className="text-slate-400 text-xs">Current Conditions</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-white">{Math.round(weather.temp)}°</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                <div className="text-center">
                    <Thermometer size={16} className="mx-auto text-red-400 mb-1" />
                    <p className="text-xs text-slate-400">Feels Like</p>
                    <p className="text-sm font-bold text-white">{Math.round(weather.temp + 2)}°C</p>
                </div>
                <div className="text-center">
                    <Droplets size={16} className="mx-auto text-blue-400 mb-1" />
                    <p className="text-xs text-slate-400">Humidity</p>
                    <p className="text-sm font-bold text-white">{weather.humidity}%</p>
                </div>
                <div className="text-center">
                    <Wind size={16} className="mx-auto text-slate-300 mb-1" />
                    <p className="text-xs text-slate-400">Wind</p>
                    <p className="text-sm font-bold text-white">{weather.windSpeed} km/h</p>
                </div>
            </div>

            {warning && (
                <div className={`mt-3 pt-3 border-t border-white/10 text-center ${warning.color}`}>
                    <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
                        ⚠️ {warning.text}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default WeatherWidget;
