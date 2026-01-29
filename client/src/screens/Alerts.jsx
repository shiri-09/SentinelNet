import React, { useState } from 'react';
import { useAppContext } from '../hooks/AppContext';
import { AlertTriangle, MapPin, Clock, XCircle, Bell, Shield, Flame, Droplets, Wind, Skull, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Alerts = () => {
    const { activeAlerts, dismissAlert } = useAppContext();
    const [expandedAlert, setExpandedAlert] = useState(null);

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'HIGH': return 'severity-high';
            case 'MEDIUM': return 'severity-medium';
            case 'LOW': return 'severity-low';
            default: return 'bg-slate-500/20';
        }
    };

    const getSeverityBorder = (severity) => {
        switch (severity) {
            case 'HIGH': return 'border-red-500';
            case 'MEDIUM': return 'border-orange-500';
            case 'LOW': return 'border-emerald-500';
            default: return 'border-slate-500';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'Fire': return <Flame className="text-orange-500" size={28} />;
            case 'Flood': return <Droplets className="text-blue-500" size={28} />;
            case 'Earthquake': return <Wind className="text-emerald-500" size={28} />;
            case 'Toxic Gas Leak': return <Skull className="text-purple-500" size={28} />;
            default: return <AlertTriangle className="text-red-500" size={28} />;
        }
    };

    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="p-6 pb-24 space-y-6 max-w-md mx-auto min-h-screen">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                        <Bell className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                            Live <span className="text-gradient">Alerts</span>
                        </h1>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                            Real-time Disaster Intelligence
                        </p>
                    </div>
                </div>
            </header>

            {/* Alert Counter */}
            <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${activeAlerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-white font-bold">
                        {activeAlerts.length > 0 ? `${activeAlerts.length} Active Alert${activeAlerts.length > 1 ? 's' : ''}` : 'All Clear'}
                    </span>
                </div>
                {activeAlerts.length > 0 && (
                    <span className="text-xs text-slate-400">
                        Tap to expand
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {activeAlerts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 glass rounded-3xl card-hover"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 glow-emerald"
                            >
                                <Shield className="text-emerald-500" size={40} />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white italic uppercase">Zone Secure</h2>
                            <p className="text-slate-400 text-sm mt-2">No active incidents in your area</p>
                            <div className="mt-6 flex justify-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full">
                                    ✓ GPS Active
                                </span>
                                <span className="bg-emerald-500/20 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full">
                                    ✓ Monitoring
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        activeAlerts.map((alert, index) => (
                            <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                transition={{ delay: index * 0.1 }}
                                className={`glass rounded-3xl overflow-hidden border-l-4 ${getSeverityBorder(alert.severity)} card-hover`}
                            >
                                {/* Alert Header - Always Visible */}
                                <div
                                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                                    className="p-5 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-slate-700/50 rounded-2xl">
                                                {getAlertIcon(alert.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getSeverityStyle(alert.severity)} text-white`}>
                                                        {alert.severity}
                                                    </span>
                                                    <span className="text-slate-400 text-xs">
                                                        {formatTimeAgo(alert.timestamp)}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-white italic uppercase">{alert.type}</h3>
                                                <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                                                    <MapPin size={12} />
                                                    {alert.zone.name || 'Your Area'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: expandedAlert === alert.id ? 180 : 0 }}
                                                className="text-slate-400"
                                            >
                                                <ChevronDown size={20} />
                                            </motion.div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedAlert === alert.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 space-y-4">
                                                {/* Time Details */}
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        <span>Triggered: {new Date(alert.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>

                                                {/* Instructions */}
                                                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
                                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <AlertTriangle size={12} />
                                                        Immediate Action Required
                                                    </h4>
                                                    <p className="text-sm text-white leading-relaxed font-medium">
                                                        {alert.instructions}
                                                    </p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button className="bg-blue-500/20 text-blue-400 py-3 rounded-xl text-xs font-bold uppercase hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
                                                        <MapPin size={14} />
                                                        View on Map
                                                    </button>
                                                    <button
                                                        onClick={() => dismissAlert(alert.id)}
                                                        className="bg-slate-700/50 text-slate-300 py-3 rounded-xl text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                                                    >
                                                        Dismiss Alert
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Alerts;
