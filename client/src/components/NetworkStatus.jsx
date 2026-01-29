import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, Server, Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Network Status Component
 * Shows real-time connection status and sync information
 */
const NetworkStatus = () => {
    const [status, setStatus] = useState({
        isOnline: navigator.onLine,
        latency: 45,
        lastSync: new Date(),
        serverStatus: 'operational'
    });

    useEffect(() => {
        // Monitor online/offline status
        const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
        const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Simulate latency updates
        const interval = setInterval(() => {
            setStatus(prev => ({
                ...prev,
                latency: Math.floor(Math.random() * 80) + 20,
                lastSync: new Date()
            }));
        }, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const getLatencyColor = () => {
        if (status.latency < 50) return 'text-emerald-500';
        if (status.latency < 100) return 'text-yellow-500';
        return 'text-red-500';
    };

    const formatTimeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-4 card-hover"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-red-500" />
                    Network Status
                </h3>
                <div className={`flex items-center gap-2 ${status.isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                    {status.isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span className="text-xs font-bold uppercase">
                        {status.isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {/* Latency */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Server size={14} />
                        <span className="text-xs">Latency</span>
                    </div>
                    <span className={`text-sm font-bold ${getLatencyColor()}`}>
                        {status.latency}ms
                    </span>
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-xs">Last Sync</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {formatTimeSince(status.lastSync)}
                    </span>
                </div>

                {/* Server Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Shield size={14} />
                        <span className="text-xs">Server</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full status-online" />
                        Operational
                    </span>
                </div>
            </div>

            {/* Connection Quality Bar */}
            <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Connection Quality</span>
                    <span className={getLatencyColor()}>
                        {status.latency < 50 ? 'Excellent' : status.latency < 100 ? 'Good' : 'Poor'}
                    </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${status.latency < 50 ? 'bg-emerald-500' :
                                status.latency < 100 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(10, 100 - status.latency)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default NetworkStatus;
