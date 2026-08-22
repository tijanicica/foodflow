// src/components/ManagerNavbar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Opciono: dodavanje ikonice za bolji izgled

// Ažurirani stilovi linkova koji se uklapaju u novu temu
const commonLinkClasses = "py-2 px-1 transition-colors duration-300 font-medium";
const activeLinkClasses = "text-pink-600 border-b-2 border-pink-500 font-bold";
const inactiveLinkClasses = "text-gray-500 hover:text-pink-500";

export function ManagerNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    return (
        // Bela pozadina sa mekom senkom za čist i elegantan izgled
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 md:px-6 flex justify-between items-center h-20">
                {/* Logo sa dodatkom "Manager" oznake */}
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-800 italic">
                        FoodFlow
                    </h1>
                    <span className="ml-3 bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        Manager
                    </span>
                </div>

                {/* Navigacioni linkovi sa ažuriranim stilovima */}
                <div className="hidden md:flex items-center gap-10 text-sm">
                    <NavLink
                        to="/manager/dashboard"
                        className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink to="/manager/orders" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Orders
                    </NavLink>
                    <NavLink to="/manager/menu" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Menu
                    </NavLink>
                    <NavLink to="/manager/deliveries" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Deliveries
                    </NavLink>
                    
                    {/* === DODAT NOVI LINK ZA LIVE TRACKING === */}
                    <NavLink to="/manager/live-tracking" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Live Tracking
                    </NavLink>
                    {/* ======================================= */}

                    <NavLink to="/manager/profile" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        My Profile
                    </NavLink>
                </div>
                 
                {/* Redizajnirano dugme za odjavu */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors duration-300"
                >
                    <LogOut size={16} /> 
                    <span>LogOut</span>
                </button>
            </nav>
        </header>
    );
}