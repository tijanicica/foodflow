// FAJL: src/components/NavbarDriver.jsx

import React, { useState, useEffect } from 'react'; // <-- 1. Uvezite useState i useEffect
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

// Stilovi ostaju isti
const commonLinkClasses = "flex items-center gap-2 py-2 px-1 transition-colors duration-300 font-semibold text-base";
const activeLinkClasses = "text-yellow-600 border-b-2 border-yellow-600";
const inactiveLinkClasses = "text-gray-600 hover:text-yellow-600";

export const NavbarDriver = () => {
    const navigate = useNavigate();

    // --- 2. DODAJEMO STATE ZA PRAĆENJE SKROLA ---
    // Inicijalno je 'false' jer smo na vrhu stranice
    const [isScrolled, setIsScrolled] = useState(false);

    // --- 3. DODAJEMO USEEFFECT ZA SLUŠANJE SKROL DOGAĐAJA ---
    useEffect(() => {
        const handleScroll = () => {
            // Ako je skrol pozicija veća od 20px, postavi isScrolled na 'true'
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        // Dodajemo "slušanje" na 'scroll' događaj
        window.addEventListener('scroll', handleScroll);

        // OBAVEZNO: Uklanjamo "slušanje" kada se komponenta uništi
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Prazan niz osigurava da se ovo izvrši samo jednom (na mount/unmount)


    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true });
    };

    return (
        // --- 4. AŽURIRAMO className DA BUDE DINAMIČAN ---
        <header 
            className={`
                shadow-md sticky top-0 z-[1001] transition-all duration-300
                ${isScrolled ? 'bg-white/65 backdrop-blur-lg' : 'bg-white/90 backdrop-blur-md'}
            `}
        >
            <nav className="container mx-auto px-4 md:px-6 flex justify-between items-center h-20">
                {/* Ostatak koda je potpuno isti */}
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-800 italic">
                        FoodFlow
                    </h1>
                    <span className="ml-3 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Driver
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-12">
                    <NavLink
                        to="/driver"
                        end
                        className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                        to="/driver/profile"
                        className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        <User size={18} />
                        <span>My Profile</span>
                    </NavLink>
                </div>
                 
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-base font-bold text-gray-800 py-2 px-5 rounded-full hover:bg-yellow-500 hover:text-white transition-all duration-300 shadow-sm border border-transparent hover:border-yellow-600"
                >
                    <LogOut size={18} /> 
                    <span>Logout</span>
                </button>
            </nav>
        </header>
    );
};