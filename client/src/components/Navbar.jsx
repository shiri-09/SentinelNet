import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, Phone, BookOpen, Settings, MapPin } from 'lucide-react';

const Navbar = () => {
    const links = [
        { to: '/', icon: <Home size={22} />, label: 'Home' },
        { to: '/alerts', icon: <Bell size={22} />, label: 'Alerts' },
        { to: '/map', icon: <MapPin size={22} />, label: 'Map' },
        { to: '/services', icon: <Phone size={22} />, label: 'Services' },
        { to: '/admin', icon: <Settings size={22} />, label: 'Admin' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-6 py-3 flex justify-between items-center z-50">
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-red-500' : 'text-slate-400 hover:text-white'
                        }`
                    }
                >
                    {link.icon}
                    <span className="text-[10px] font-medium uppercase tracking-wider">{link.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default Navbar;
