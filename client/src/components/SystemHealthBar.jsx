import React, { useState, useEffect } from 'react';
import { Shield, Wifi, MapPin, Battery, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * System Health Bar Component
 * Shows real-time system status with animated indicators
 */
const SystemHealthBar = ({ battery, isOnline = true, gpsActive = true }) => {
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const healthItems = [
        {
            icon: <Wifi size={14} />,
            label: 'Network',
            status: isOnline ? 'Online' : 'Offline',
            color: isOnline ? 'text-emerald-500' : 'text-red-500'
        },
        {
            icon: <MapPin size={14} />,
            label: 'GPS',
            status: gpsActive ? 'Active' : 'Inactive',
            color: gpsActive ? 'text-emerald-500' : 'text-yellow-500'
        },
        {
            icon: <Battery size={14} />,
            label: 'Power',
            status: `${battery?.level || 100}%`,
            color: (battery?.level || 100) > 20 ? 'text-emerald-500' : 'text-red-500'
        },
        {
            icon: <Shield size={14} />,
            label: 'Shield',
            status: 'Armed',
            color: 'text-emerald-500'
        }
    ];

    const overallHealth = healthItems.filter(item => item.color === 'text-emerald-500').length;
    const healthPercent = (overallHealth / healthItems.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-3 overflow-hidden relative"
        >
            {/* Scanning animation overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.1) ${scanProgress}%, transparent ${scanProgress + 5}%)`,
                }}
            />

            <div className="flex items-center justify-between relative z-10">
                {/* Health indicator */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Activity size={16} className="text-red-500" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        System Health
                    </span>
                </div>

                {/* Status items */}
                <div className="flex items-center gap-4">
                    {healthItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                            <span className={item.color}>{item.icon}</span>
                            <span className={`text-[10px] font-bold ${item.color}`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Health progress bar */}
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-red-500 via-emerald-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${healthPercent}%` }}
                    transition={{ duration: 1 }}
                />
            </div>
        </motion.div>
    );
};

export default SystemHealthBar;
