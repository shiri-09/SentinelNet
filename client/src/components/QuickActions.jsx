import React from 'react';
import { MapPin, Navigation, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Quick Actions Component
 * Provides one-tap access to critical emergency functions
 */
const QuickActions = ({ onNavigateToMap, onNavigateToServices }) => {
    const actions = [
        {
            icon: <MapPin size={20} />,
            label: 'Live Map',
            color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
            onClick: onNavigateToMap
        },
        {
            icon: <Navigation size={20} />,
            label: 'Safe Zones',
            color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
            onClick: () => window.alert('Safe zones feature coming soon!')
        },
        {
            icon: <Shield size={20} />,
            label: 'Shelter',
            color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
            onClick: () => window.alert('Nearest shelter: 2.3km away')
        },
        {
            icon: <Clock size={20} />,
            label: 'History',
            color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
            onClick: () => window.alert('Alert history feature coming soon!')
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-4"
        >
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-2">
                {actions.map((action, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={action.onClick}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${action.color}`}
                    >
                        {action.icon}
                        <span className="text-[10px] font-bold uppercase">{action.label}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default QuickActions;
