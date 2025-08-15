// src/components/ManagerNavbar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// Stilovi za aktivni i neaktivni link, da izbegnemo ponavljanje
const commonLinkClasses = "py-2 transition-colors duration-200";
const activeLinkClasses = "font-semibold text-brand-primary border-b-2 border-brand-primary";
const inactiveLinkClasses = "text-gray-600 hover:text-brand-primary";

export function ManagerNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Obriši token iz lokalne memorije
        localStorage.removeItem('jwtToken');
        // Preusmeri na login stranicu
        navigate('/login');
    };

    return (
        <header className="bg-brand-background-light border-b border-brand-accent/30 shadow-sm">
            <nav className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
                {/* Logo */}
                <h1 className="text-2xl font-bold text-brand-primary italic">
                    FoodFlow
                </h1>

                {/* Navigacioni linkovi */}
                <div className="flex items-center gap-8 text-sm">
                    <NavLink
                        to="/manager/dashboard"
                        className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        Dashboard
                    </NavLink>
                    {/* Placeholder linkovi - možete ih kasnije povezati sa pravim stranicama */}
                    <NavLink to="/manager/orders" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Orders
                    </NavLink>
                    <NavLink to="/manager/menu" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Menu
                    </NavLink>
                    <NavLink to="/manager/deliveries" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Deliveries
                    </NavLink>
                    <NavLink to="/manager/profile" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        My Profile
                    </NavLink>
                </div>
                 
                {/* Dugme za odjavu */}
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-brand-primary font-medium"
                >
                    LogOut
                </button>
            </nav>
        </header>
    );
}