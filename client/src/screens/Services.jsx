import React, { useState } from 'react';
import { Phone, Plus, X, User, Trash2, Users } from 'lucide-react';
import { useAppContext } from '../hooks/AppContext';
import { useContacts } from '../hooks/useContacts';
import { motion, AnimatePresence } from 'framer-motion';

const Services = () => {
    const { requestService } = useAppContext();
    const { contacts, addContact, removeContact, canAddMore, maxContacts } = useContacts();
    const [modal, setModal] = useState(null);
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [error, setError] = useState('');

    const services = [
        { name: 'Police', icon: '🚓', color: 'bg-blue-600', number: '112', type: 'Police' },
        { name: 'Ambulance', icon: '🚑', color: 'bg-red-600', number: '108', type: 'Ambulance' },
        { name: 'Fire', icon: '🚒', color: 'bg-orange-600', number: '101', type: 'Fire' },
    ];

    const handleCall = (service) => {
        setModal(service);
        requestService(service.name);
        setTimeout(() => {
            window.location.href = `tel:${service.number}`;
        }, 1500);
    };

    const handleAddContact = () => {
        setError('');

        if (!newContact.name.trim() || !newContact.phone.trim()) {
            setError('Please fill in both name and phone number');
            return;
        }

        const phoneRegex = /^[\d\s\-+()]{7,15}$/;
        if (!phoneRegex.test(newContact.phone)) {
            setError('Please enter a valid phone number');
            return;
        }

        const success = addContact(newContact.name, newContact.phone);
        if (success) {
            setNewContact({ name: '', phone: '' });
            setShowAddContact(false);
        } else {
            setError('Failed to add contact. Maximum 5 contacts allowed.');
        }
    };

    return (
        <div className="p-6 pb-24 space-y-6 max-w-md mx-auto min-h-screen">
            <header>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Emergency <span className="text-red-500">Services</span></h1>
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase italic">Mock / Demo Integration Only</p>
            </header>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 mb-4">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                    <span className="text-red-500 font-black">NOTE:</span> Services are user-initiated demo actions. No real dispatcher will be contacted during this simulation.
                </p>
            </div>

            {/* Emergency Services */}
            <div className="grid grid-cols-1 gap-4">
                {services.map((service) => (
                    <button
                        key={service.name}
                        onClick={() => handleCall(service)}
                        className={`flex items-center p-6 rounded-[2rem] gap-6 transition-all active:scale-95 ${service.color}`}
                    >
                        <span className="text-5xl">{service.icon}</span>
                        <div className="text-left">
                            <h2 className="text-2xl font-black text-white italic uppercase">{service.name}</h2>
                            <p className="text-white/70 font-mono font-bold tracking-widest">{service.number}</p>
                        </div>
                        <Phone className="ml-auto text-white" />
                    </button>
                ))}
            </div>

            {/* Emergency Contacts Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold uppercase text-sm flex items-center gap-2">
                        <Users size={16} className="text-red-500" />
                        Emergency Contacts
                        <span className="text-slate-500 text-xs">({contacts.length}/{maxContacts})</span>
                    </h2>
                </div>

                {/* Contact List */}
                <AnimatePresence mode="popLayout">
                    {contacts.map((contact) => (
                        <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="glass p-4 rounded-2xl flex items-center gap-4"
                        >
                            <div className="bg-emerald-500/20 p-3 rounded-xl">
                                <User className="text-emerald-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-sm">{contact.name}</h3>
                                <p className="text-slate-400 text-xs font-mono">{contact.phone}</p>
                            </div>
                            <button
                                onClick={() => removeContact(contact.id)}
                                className="p-2 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add Contact Button/Card */}
                {canAddMore ? (
                    <button
                        onClick={() => setShowAddContact(true)}
                        className="w-full glass p-6 rounded-3xl border-dashed border-2 border-white/10 text-center hover:border-red-500/30 transition-colors"
                    >
                        <Plus className="mx-auto text-slate-500 mb-2" />
                        <h3 className="text-slate-200 font-bold uppercase text-xs">Add Emergency Contact</h3>
                        <p className="text-[10px] text-slate-400 italic">Notified during HIGH/MEDIUM alerts</p>
                    </button>
                ) : (
                    <div className="glass p-4 rounded-2xl text-center border border-emerald-500/30">
                        <p className="text-emerald-500 text-xs font-bold uppercase">✓ Maximum Contacts Added</p>
                    </div>
                )}
            </div>

            {/* Calling Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <div className="text-center space-y-6">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={`${modal.color} w-32 h-32 rounded-full flex items-center justify-center mx-auto text-6xl shadow-[0_0_50px_rgba(255,255,255,0.2)]`}
                            >
                                {modal.icon}
                            </motion.div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic uppercase">Calling {modal.name}</h2>
                                <p className="text-slate-400 font-bold mt-2">Connecting to dispatcher {modal.number}...</p>
                            </div>
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] border border-red-500/50 p-2 rounded-lg">
                                Location Data: Synced to Server
                            </p>
                            <button
                                onClick={() => setModal(null)}
                                className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold uppercase text-sm border border-white/20"
                            >
                                Cancel Call
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Contact Modal */}
            <AnimatePresence>
                {showAddContact && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="glass p-8 rounded-3xl w-full max-w-sm space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black text-white italic uppercase">Add Contact</h2>
                                <button
                                    onClick={() => {
                                        setShowAddContact(false);
                                        setNewContact({ name: '', phone: '' });
                                        setError('');
                                    }}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                        placeholder="e.g. Mom, Dad, Friend"
                                        className="w-full bg-slate-800 border border-white/10 text-white rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        placeholder="e.g. +91 98765 43210"
                                        className="w-full bg-slate-800 border border-white/10 text-white rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-medium">{error}</p>
                                )}
                            </div>

                            <button
                                onClick={handleAddContact}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                <Plus size={20} />
                                SAVE CONTACT
                            </button>

                            <p className="text-[10px] text-slate-500 text-center italic">
                                This contact will be notified with your location during HIGH/MEDIUM severity alerts
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Services;
