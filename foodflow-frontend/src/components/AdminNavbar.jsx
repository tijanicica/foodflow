import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const commonLinkClasses = "py-2 transition-colors duration-200";
const activeLinkClasses = "font-semibold text-brand-primary border-b-2 border-brand-primary";
const inactiveLinkClasses = "text-gray-600 hover:text-brand-primary";

export function AdminNavbar() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    return (
        <header className="bg-brand-background-light border-b border-brand-accent/30 shadow-sm">
            <nav className="container mx-auto px-6 flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-brand-primary italic">FoodFlow Admin</h1>
                <div className="flex items-center gap-8 text-sm">
                    {/* Placeholder linkovi za buduće stranice */}
                    <NavLink to="/admin/analytics" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Analytics</NavLink>
                    <NavLink to="/admin/agent-performance" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Agent Performance</NavLink>
                    
                    {/* ISPRAVAN LINK ZA MANAGER MANAGEMENT */}
                    <NavLink to="/admin/managers" className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Manager Management</NavLink>
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-brand-primary font-medium">Logout</button>
            </nav>
        </header>
    );
}