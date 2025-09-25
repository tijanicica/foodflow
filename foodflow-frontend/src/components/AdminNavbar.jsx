import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const commonLinkClasses = "py-2 transition-colors duration-200 text-sm font-medium";
const activeLinkClasses = "text-yellow-600 border-b-2 border-yellow-600";
const inactiveLinkClasses = "text-gray-600 hover:text-yellow-600";

export function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    return (
        <header className="bg-[#FFFBF5] border-b border-yellow-600/20 shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-6 flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-gray-800">
                    FoodFlow <span className="text-yellow-600 font-semibold">Admin</span>
                </h1>
                
                <div className="flex items-center gap-8">
                    {/* Linkovi sa nove slike */}
                    <NavLink to="/admin/dashboard" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/live-tracking" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Live Tracking
                    </NavLink>
                    <NavLink to="/admin/driver-performance" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Driver Performance
                    </NavLink>
                    
                    {/* === VRAĆEN OBAVEZNI LINK === */}
                    <NavLink to="/admin/managers" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        Manager Management
                    </NavLink>
                    {/* =========================== */}
                </div>
                
                <button 
                    onClick={handleLogout} 
                    className={`${commonLinkClasses} ${inactiveLinkClasses} flex items-center gap-1.5`}
                >
                    <LogOut size={14} />
                    LogOut
                </button>
            </nav>
        </header>
    );
}